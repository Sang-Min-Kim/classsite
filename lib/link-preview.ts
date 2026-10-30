import "server-only";

/* 뉴스 주소(URL)를 넣으면 그 기사의 대표사진·제목·요약·날짜를 가져옵니다.
   대부분의 뉴스 사이트는 카카오톡·페이스북 미리보기용 정보(og:image 등)를 기사에 넣어 두므로 그걸 읽습니다. */

export type LinkPreview = {
  image: string | null;
  title: string | null;
  description: string | null;
  siteName: string | null;
  /** 2026.10.30 모양 */
  date: string | null;
};

const TIMEOUT_MS = 8000;

/** &amp; 같은 HTML 특수 글자를 원래 글자로 */
function decodeEntities(text: string) {
  return text
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .trim();
}

/** <meta property="og:image" content="..."> 처럼 생긴 태그에서 content 값을 찾기 */
function readMeta(html: string, names: string[]) {
  const tags = html.match(/<meta\s[^>]*>/gi) ?? [];
  for (const name of names) {
    for (const tag of tags) {
      const key = tag.match(/(?:property|name|itemprop)\s*=\s*["']([^"']+)["']/i)?.[1];
      if (key?.toLowerCase() !== name) continue;
      const content = tag.match(/content\s*=\s*(?:"([^"]*)"|'([^']*)')/i);
      const value = content?.[1] ?? content?.[2];
      if (value?.trim()) return decodeEntities(value);
    }
  }
  return null;
}

function formatDate(value: string | null) {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())}`;
}

/** 한국 뉴스 사이트 중 EUC-KR 로 된 곳도 글자가 깨지지 않게 읽기 */
async function readHtml(res: Response) {
  const buffer = await res.arrayBuffer();
  const head = new TextDecoder("utf-8").decode(buffer.slice(0, 4096));
  const charset =
    res.headers.get("content-type")?.match(/charset=([\w-]+)/i)?.[1] ??
    head.match(/<meta[^>]+charset=["']?([\w-]+)/i)?.[1] ??
    "utf-8";
  try {
    return new TextDecoder(charset.toLowerCase()).decode(buffer);
  } catch {
    return new TextDecoder("utf-8").decode(buffer);
  }
}

/** 주소가 http(s) 기사 주소인지 확인하고, 맞으면 정리된 주소를 돌려줍니다. */
export function normalizeUrl(input: string) {
  try {
    const url = new URL(input.trim());
    return url.protocol === "http:" || url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}

/** 기사 미리보기 정보를 가져옵니다. 실패하면 null. */
export async function fetchLinkPreview(url: string): Promise<LinkPreview | null> {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; PortfolioLinkPreview/1.0)",
        Accept: "text/html,application/xhtml+xml",
      },
      redirect: "follow",
      signal: AbortSignal.timeout(TIMEOUT_MS),
      cache: "no-store",
    });
    if (!res.ok || !res.headers.get("content-type")?.includes("html")) return null;

    const html = await readHtml(res);
    const image = readMeta(html, ["og:image", "og:image:url", "twitter:image", "twitter:image:src"]);
    const titleTag = html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1];

    return {
      image: image ? new URL(image, res.url || url).toString() : null,
      title: readMeta(html, ["og:title", "twitter:title"]) ?? (titleTag ? decodeEntities(titleTag) : null),
      description: readMeta(html, ["og:description", "description", "twitter:description"]),
      siteName: readMeta(html, ["og:site_name"]),
      date: formatDate(readMeta(html, ["article:published_time", "og:published_time", "pubdate", "datepublished"])),
    };
  } catch {
    return null;
  }
}
