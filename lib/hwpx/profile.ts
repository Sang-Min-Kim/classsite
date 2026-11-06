import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";

import { siteConfig } from "@/site.config";
import { findHighlight, getHighlightEntries, type HighlightEntry } from "@/lib/highlights";
import { createZip } from "@/lib/hwpx/zip";

/* 프로필 한글 파일(.hwpx) 만들기
   - 양식: templates/profile-hwpx (김상민-프로필.hwp 를 한글에서 .hwpx 로 바꿔 풀어 놓은 것)
   - 양식의 표 칸에 지금 사이트 내용(site.config.ts + 관리자에서 저장한 항목)을 채워 넣습니다.
   - 항목 수가 양식과 다르면 표의 줄을 늘리거나 줄입니다.
   양식 표 모양:
     표1(1쪽) 0~5줄 프로필 · 7줄 학력 제목 · 8~10 학력 · 11 경력 제목 · 12~13 경력 · 14 강의 제목 · 15~16 강의
             17 저서 제목 · 18~19 저서(표지 사진) · 20 AI 위촉·강의 제목 · 21~22 위촉·강의 · 23 수강 안내 · 24 확인 문구
     표2(2쪽) 0 제목 · 1~17 AI 수강 과목 · 18 "다음장에 계속"
     표3(3쪽) 0~15 AI 수강 과목(이어서) · 16 빈 줄 */

const TEMPLATE_DIR = path.join(process.cwd(), "templates", "profile-hwpx");

/** hwpx 안의 파일 순서 (mimetype 이 반드시 맨 앞, 압축 없이) */
const PACKAGE_FILES = [
  "mimetype",
  "version.xml",
  "Contents/header.xml",
  "BinData/image1.jpg",
  "BinData/image2.bmp",
  "BinData/image3.bmp",
  "Contents/section0.xml",
  "Preview/PrvText.txt",
  "settings.xml",
  "META-INF/container.rdf",
  "Contents/content.hpf",
  "META-INF/container.xml",
  "META-INF/manifest.xml",
];

/* ---------- 표 XML 다루기 ---------- */

function escapeXml(text: string) {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/** "**굵게**", "[강조]" 같은 사이트용 표시를 빼고 글자만 */
function plain(text: string) {
  return text.replace(/\*\*([^*]+)\*\*/g, "$1").replace(/\[([^\]]+)\]/g, "$1");
}

/** "1983.03 – 1987.02" → ["1983.03 ~", "1987.02"] (양식처럼 두 줄로) */
function periodLines(period: string) {
  const [start, end] = period.split(/\s*[–~]\s*/);
  return end === undefined ? [period] : [`${start} ~`, ...(end ? [end] : [])];
}

const rowsOf = (tbl: string) => [...tbl.matchAll(/<hp:tr>[\s\S]*?<\/hp:tr>/g)].map((m) => m[0]);
const cellsOf = (tr: string) => [...tr.matchAll(/<hp:tc [\s\S]*?<\/hp:tc>/g)].map((m) => m[0]);
const colOf = (tc: string) => Number(tc.match(/colAddr="(\d+)"/)?.[1]);
const removePics = (xml: string) => xml.replace(/<hp:pic [\s\S]*?<\/hp:pic>/g, "");

/** 문단 하나에 글자를 넣음 (줄 배치 정보는 지워서 한글이 다시 계산하게 함) */
function paragraphWithText(p: string, text: string) {
  const clean = p
    .replace(/<hp:linesegarray>[\s\S]*?<\/hp:linesegarray>/g, "")
    .replace(/<hp:t>[\s\S]*?<\/hp:t>|<hp:t\/>/g, "");
  if (!text) return clean;
  const t = `<hp:t>${escapeXml(text)}</hp:t>`;
  const selfClosed = clean.match(/<hp:run [^>]*\/>/);
  if (selfClosed && !clean.includes("</hp:run>")) {
    return clean.replace(selfClosed[0], () => `${selfClosed[0].slice(0, -2)}>${t}</hp:run>`);
  }
  const last = clean.lastIndexOf("</hp:run>");
  return clean.slice(0, last) + t + clean.slice(last);
}

/** 칸(셀) 하나의 글자를 lines 로 바꿈. 첫 문단의 글자 모양·사진은 그대로 둠 */
function setCellLines(tc: string, lines: string[]) {
  return tc.replace(/(<hp:subList[^>]*>)([\s\S]*?)(<\/hp:subList>)/, (_, open: string, inner: string, close: string) => {
    const paragraphs = [...inner.matchAll(/<hp:p [\s\S]*?<\/hp:p>/g)].map((m) => m[0]);
    const template = paragraphs.find((p) => p.includes("<hp:t")) ?? paragraphs[0];
    const [first = "", ...rest] = lines.length ? lines : [""];
    const body = [
      paragraphWithText(template, first),
      ...rest.map((line) => paragraphWithText(removePics(template), line)),
    ].join("");
    return open + body + close;
  });
}

/** 한 줄(행)의 칸들을 열 번호별로 채움. 예) { 0: ["날짜"], 1: ["제목", "설명"] } */
function fillRow(tr: string, values: Record<number, string[]>) {
  return cellsOf(tr).reduce((row, tc) => {
    const lines = values[colOf(tc)];
    // 바꿀 글자에 $ 가 있어도 안전하도록 함수로 바꿔 끼움
    return lines ? row.replace(tc, () => setCellLines(tc, lines)) : row;
  }, tr);
}

const rowHeight = (tr: string) => Number(tr.match(/<hp:cellSz width="\d+" height="(\d+)"\/>/)?.[1] ?? 0);

/** 표의 줄을 새 목록으로 바꾸고, 줄 번호·줄 수·표 높이를 맞춤 */
function replaceRows(tbl: string, oldRows: string[], newRows: string[], allowSplit = false) {
  const head = tbl.slice(0, tbl.indexOf("<hp:tr>"));
  const tail = tbl.slice(tbl.lastIndexOf("</hp:tr>") + "</hp:tr>".length);
  const delta = newRows.reduce((s, r) => s + rowHeight(r), 0) - oldRows.reduce((s, r) => s + rowHeight(r), 0);
  const newHead = head
    .replace(/rowCnt="\d+"/, `rowCnt="${newRows.length}"`)
    .replace(/(<hp:sz width="\d+" widthRelTo="\w+" height=")(\d+)"/, (_, a: string, h: string) => `${a}${Number(h) + delta}"`)
    .replace(/pageBreak="NONE"/, allowSplit ? 'pageBreak="CELL"' : 'pageBreak="NONE"');
  const numbered = newRows.map((tr, i) => tr.replace(/rowAddr="\d+"/g, `rowAddr="${i}"`));
  return newHead + numbered.join("") + tail;
}

/* ---------- 사이트 내용 모으기 ---------- */

function groupEntries(entries: HighlightEntry[], heading: string | undefined) {
  return entries.filter((e) => e.group_heading === heading);
}

async function loadData() {
  const { profile, career } = siteConfig;
  const detail = (icon: string) => profile.details.find((d) => d.icon === icon)?.value ?? "";

  const [lectures, books, ai] = await Promise.all(
    ["lectures", "books", "ai"].map(async (slug) => (await getHighlightEntries(slug)).entries),
  );
  const aiGroups = findHighlight("ai")?.detail.groups.map((g) => g.heading) ?? [];

  return {
    name: profile.name,
    hanja: profile.hanja,
    address: detail("map"),
    youtube: detail("youtube"),
    email: detail("mail"),
    education: career.education.items,
    experience: career.experience.items,
    lectures,
    books,
    aiLectures: groupEntries(ai, aiGroups[0]),
    aiCourses: groupEntries(ai, aiGroups[1]),
  };
}

/** 오늘 날짜를 "2026년 11월 6일" 모양으로 (한국 시간) */
function todayKorean() {
  const parts = new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "numeric",
    day: "numeric",
  }).formatToParts(new Date());
  const get = (type: string) => parts.find((p) => p.type === type)?.value;
  return `${get("year")}년 ${get("month")}월 ${get("day")}일`;
}

/* ---------- 양식 채우기 ---------- */

function buildSection(xml: string, data: Awaited<ReturnType<typeof loadData>>) {
  const tables = [...xml.matchAll(/<hp:tbl [\s\S]*?<\/hp:tbl>/g)].map((m) => m[0]);
  const [t1, t2, t3] = tables;

  /* 표1: 프로필 · 학력 · 경력 · 강의 · 저서 · AI 위촉·강의 */
  const r = rowsOf(t1);
  const bookRow = (title: string) => {
    // 양식에 같은 책이 있으면 그 줄(표지 사진 포함)을 쓰고, 없으면 사진 없는 줄을 씀
    const match = [r[18], r[19]].find((row) => row.replace(/\s/g, "").includes(title.replace(/\s/g, "")));
    return match ?? removePics(r[19]);
  };
  // 설명은 양식처럼 괄호로 감쌈 (이미 괄호로 시작하면 그대로)
  const entryLines = (e: HighlightEntry) => [
    e.title,
    ...(e.note ? [e.note.startsWith("(") ? e.note : `(${e.note})`] : []),
  ];

  const rows1 = [
    r[0],
    fillRow(r[1], { 4: [data.name] }),
    fillRow(r[2], { 4: [data.hanja] }),
    r[3],
    fillRow(r[4], { 1: [data.address] }),
    fillRow(r[5], { 1: [data.youtube, data.email] }),
    r[6],
    r[7],
    ...data.education.map((e) =>
      fillRow(r[8], { 0: periodLines(e.period), 1: [plain(e.text)], 8: [e.major ?? ""] }),
    ),
    r[11],
    ...data.experience.map((e) => fillRow(r[12], { 0: periodLines(e.period), 1: [plain(e.text)], 8: [""] })),
    r[14],
    ...data.lectures.map((e) => fillRow(r[15], { 0: periodLines(e.date), 1: entryLines(e), 8: [e.place ?? ""] })),
    r[17],
    ...data.books.map((e) => fillRow(bookRow(e.title), { 0: [e.date], 1: [` ${e.title}`], 8: [e.place ?? ""] })),
    r[20],
    ...data.aiLectures.map((e) => fillRow(r[22], { 0: [e.date], 1: entryLines(e), 8: [e.place ?? ""] })),
    r[23],
    r[24].replace(/\d{4}년 \d{1,2}월 \d{1,2}일/, () => todayKorean()),
  ];
  const newT1 = replaceRows(t1, r, rows1, rows1.length > r.length);

  /* 표2·표3: AI 수강 과목 (2쪽에 17줄, 3쪽에 16줄. 넘치면 3쪽에 줄을 더함) */
  const r2 = rowsOf(t2);
  const r3 = rowsOf(t3);
  const courses = data.aiCourses;
  const courseRow = (tr: string, e?: HighlightEntry) =>
    fillRow(tr, e ? { 0: periodLines(e.date), 1: entryLines(e), 2: [e.place ?? ""] } : { 0: [""], 1: [""], 2: [""] });

  const page2Slots = r2.slice(1, 18);
  const page3Slots = r3.slice(0, 16);
  while (page2Slots.length + page3Slots.length < courses.length) page3Slots.push(r3[15]);

  const rows2 = [
    r2[0],
    ...page2Slots.map((tr, i) => courseRow(tr, courses[i])),
    fillRow(r2[18], { 0: [courses.length > page2Slots.length ? "다음장에 계속" : ""] }),
  ];
  const rows3 = [
    ...page3Slots.map((tr, i) => courseRow(tr, courses[page2Slots.length + i])),
    r3[16],
  ];

  return xml
    .replace(t1, () => newT1)
    .replace(t2, () => replaceRows(t2, r2, rows2))
    .replace(t3, () => replaceRows(t3, r3, rows3, rows3.length > r3.length));
}

/** 한글 '미리보기' 글자 (파일 탐색기 미리보기 등에 쓰임) */
function previewText(section: string) {
  return rowsOf(section)
    .map((tr) =>
      cellsOf(tr)
        .map((tc) => `<${[...tc.matchAll(/<hp:t>([^<]*)<\/hp:t>/g)].map((m) => m[1]).join(" ")}>`)
        .join(""),
    )
    .join("\r\n");
}

/** 지금 사이트 내용으로 채운 프로필 한글 파일(.hwpx)을 만들어 돌려줍니다. */
export async function buildProfileHwpx(): Promise<Buffer> {
  const [data, files] = await Promise.all([
    loadData(),
    Promise.all(PACKAGE_FILES.map((name) => readFile(path.join(TEMPLATE_DIR, name)))),
  ]);

  const sectionIndex = PACKAGE_FILES.indexOf("Contents/section0.xml");
  const section = buildSection(files[sectionIndex].toString("utf8"), data);

  return createZip(
    PACKAGE_FILES.map((name, i) => {
      if (name === "Contents/section0.xml") return { name, data: Buffer.from(section, "utf8") };
      if (name === "Preview/PrvText.txt") return { name, data: Buffer.from(previewText(section), "utf8") };
      return { name, data: files[i], store: name === "mimetype" };
    }),
  );
}
