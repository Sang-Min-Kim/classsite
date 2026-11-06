/* ==========================================================================
   ★ 사이트 내용 설정 파일
   --------------------------------------------------------------------------
   사이트에 보이는 글자(이름, 소개, 메뉴, 연락처 등)는 대부분 여기에 있습니다.
   따옴표 " " 안의 글자만 바꾸고 저장하면 화면에 바로 반영됩니다.
   (따옴표, 쉼표, 중괄호 { } 는 지우지 않도록 조심!)
   ========================================================================== */

import type { Item } from "@/lib/types";

export const siteConfig = {
  /* 브라우저 탭 제목과 검색 결과에 보이는 정보 */
  name: "김상민",
  title: "김상민 — 시니어 AI 강사 포트폴리오",
  description: "30년 대학 강단의 경험으로 누구나 쉽게 쓰는 AI를 가르치는 천안시 AI 전문강사 김상민의 포트폴리오입니다.",

  /* 상단 메뉴 (href 의 #이름 은 아래 섹션의 id 와 같아야 해당 위치로 이동) */
  nav: [
    { label: "소개", href: "#about" },
    { label: "이력", href: "#career" },
    { label: "주요 활동", href: "#highlights" },
    { label: "강의 문의", href: "#contact" },
  ],

  /* 상단 메뉴 오른쪽 '비밀 버튼' (누르면 새 탭에서 관리자 페이지가 열림) */
  secretButton: { label: "비밀 버튼", href: "/admin" },

  /* 첫 화면(히어로) */
  /* 포트폴리오 화면에서는 eyebrow = 큰 제목(PORTFOLIO), title = 한 줄 소개, description = 소개 문단.
     title 에서 [대괄호] 로 감싼 부분은 파란색으로 강조됩니다. */
  hero: {
    eyebrow: "AI Instructor",
    title: "30년 강단의 경험으로, [누구나 쉽게 쓰는 AI]를 가르칩니다.",
    description:
      "대학에서 30여 년간 전산학을 가르치고 정보화지원센터를 이끌었습니다.\n정년 은퇴 후에도 생성형 AI를 직접 배우며, 지금은 천안시 AI 전문강사로 활동합니다.\n어려운 기술을 쉬운 말로 풀어, 일상과 일터에서 바로 쓰는 AI를 전합니다.",
    primaryCta: { label: "주요 활동 보기", href: "#highlights" },
    secondaryCta: { label: "강의 문의하기", href: "#contact" },
  },

  /* 첫 화면 아래 숫자 3개 (value = 큰 숫자, label = 설명) */
  stats: [
    { value: "30년+", label: "대학 전산학 강의" },
    { value: "540시간", label: "소프트웨어 활용 강의" },
    { value: "16개", label: "최근 AI 교육 과정 수료" },
  ],

  /* 프로필 (사진, 이름, 연락처) */
  profile: {
    label: "About Me",
    name: "김상민",
    hanja: "金常敃",
    role: "천안시 AI 전문강사 · 이학박사 (전산통계)",
    /* 사진 파일을 public 폴더에 넣고 "/파일이름.jpg" 로 바꾸면 사진이 보입니다 */
    photo: "/profile.jpg",
    details: [
      { icon: "user", label: "이름", value: "김상민 (Kim Sangmin)" },
      { icon: "mail", label: "이메일", value: "smkimsm@gmail.com", href: "mailto:smkimsm@gmail.com" },
      { icon: "phone", label: "연락처", value: "010-1234-5678", href: "tel:010-1234-5678" },
      { icon: "youtube", label: "유튜브", value: "@hunhunhan-story", href: "https://www.youtube.com/@hunhunhan-story" },
      { icon: "map", label: "위치", value: "충남 천안시 서북구" },
    ],
  },

  /* 학력 · 기술 · 경력 3칸 */
  career: {
    eyebrow: "Career",
    heading: "학력과 경력",
    education: {
      title: "학력",
      items: [
        { period: "1983.03 – 1987.02", text: "동국대학교 **전자계산학과** 졸업 (공학사)" },
        { period: "1988.08 – 1991.02", text: "동국대학교 대학원 **컴퓨터공학과** (공학석사)" },
        { period: "1994.03 – 1997.08", text: "대구가톨릭대학교 대학원 **전산통계학과** (이학박사)" },
      ],
    },
    skills: {
      title: "다루는 도구",
      items: ["Python", "Excel", "ChatGPT", "Gemini · 젬스", "Claude Code", "Canva", "Kling · 힉스필드", "v0.app"],
    },
    experience: {
      title: "경력",
      items: [
        { period: "1992.03 – 2020.12", text: "김천대학교 **교수**, 정보화지원센터 센터장 역임, 학사정보화 제작" },
        { period: "2021.03 – 2025.08", text: "김천대학교 **특임교수**, 대구가톨릭대학교 외래교수 후 정년 은퇴" },
        { period: "2026.09 –", text: "**천안시 AI 전문강사** 위촉" },
      ],
    },
  },

  /* 주요 활동 카드 4개.
     tag 단추를 누르면 /highlights/slug 화면이 열리고, 그 화면의 내용은 detail 에서 바꿉니다. */
  highlights: {
    eyebrow: "Highlights",
    title: "주요 활동",
    description: "카드를 누르면 자세한 내용을 볼 수 있습니다.",
    items: [
      {
        slug: "books",
        icon: "book",
        title: "01. 대표 저서",
        description: "처음 코딩을 배우는 분을 위한 파이썬 입문서 『CODING BASICS PYTHON』 집필",
        tag: "저서",
        detail: {
          intro: "렉스미디어에서 펴낸 대표 저서입니다.",
          groups: [
            {
              heading: "최근 5년간의 대표 저서",
              entries: [
                {
                  date: "2022.02.10",
                  title: "CODING BASICS PYTHON",
                  note: "처음 배우는 파이썬 코딩 입문서",
                  place: "렉스미디어닷넷",
                  image: "/books/coding-basics-python.jpg",
                },
              ],
            },
          ],
        },
      },
      {
        slug: "lectures",
        icon: "presentation",
        title: "02. 540시간 강의",
        description: "Python 코딩·AI 보고서 제작 등 18개 강의 × 2시간 × 15주, 대학원 AI 활용 논문지도",
        tag: "대학 강의",
        detail: {
          intro: "30년 넘게 대학에서 전산학을 가르쳤고, 은퇴 전 4년간 540시간의 소프트웨어 활용 강의를 맡았습니다.",
          groups: [
            {
              heading: "강의 사항",
              entries: [
                {
                  date: "1992.03 – 2025.08",
                  title: "전산학 관련 과목 강의",
                  note: "대학원: 다년간 AI를 활용한 논문지도",
                  place: "김천대학교 · 대구가톨릭대학교",
                },
                {
                  date: "2021.03 – 2025.02",
                  title: "소프트웨어 활용",
                  note: "Python 코딩 강의와 AI를 활용한 보고서 제작 · 18개 강의 × 2시간 × 15주 = 540시간",
                  place: "은퇴 전 4년간",
                },
              ],
            },
          ],
        },
      },
      {
        slug: "ai",
        icon: "sparkles",
        title: "03. AI 강의 · 수강",
        description: "소상공인 대상 'AI 홍보콘텐츠 만들기' 강의, 천안시 스마트도시 AI 인재양성교육 다수 수강",
        tag: "생성형 AI",
        detail: {
          intro: "천안시 AI 전문강사로 위촉되어 강의하면서, 최신 생성형 AI 교육을 꾸준히 수강하고 있습니다.",
          groups: [
            {
              heading: "최근 AI 위촉 · 강의",
              entries: [
                { date: "2026.09.21", title: "천안시 AI 전문강사로 위촉", place: "천안시" },
                {
                  date: "2026.10.19",
                  title: "우리 가게 AI 홍보콘텐츠 만들기",
                  note: "월요일 14시, 4차시, 소상공인 대상, 백석스마트혁신센터",
                  place: "백석(AILUX)",
                },
              ],
            },
            {
              heading: "최근 AI 수강 과목",
              entries: [
                { date: "2026.08.19 – 27", title: "2026 천안시 스마트도시 AI 인재양성교육", note: "AI 활용! 나만의 크리에이티브 영상: 숏츠 제작, ChatGPT, 크링 활용", place: "현장3 (아토)" },
                { date: "2026.08.29 – 30", title: "2026 천안시 스마트도시 AI 인재양성교육", note: "AI 서비스 에이전트빌더 챗봇 제작(봉명성당 챗봇), 클로드 코드 활용", place: "기술13 (백석)" },
                { date: "2026.09.14 – 21", title: "2026 천안시 스마트도시 AI 인재양성교육", note: "AI 활용 영상 제작 심화, ChatGPT, 크링, 힉스필드", place: "현장12 (아토)" },
                { date: "2026.09.22", title: "2026 천안시 스마트도시 AI 인재양성교육", note: "AI 디자인 스튜디오, 천안형 디자인콘텐츠 홍보물 제작, 캔바 활용", place: "기술7 (아토)" },
                { date: "2026.10.01", title: "백제·독립의 고장 역사 AI 스토리텔링", note: "ChatGPT 활용, 이미지 제작, 스토리 제작", place: "모두의 AI라운지" },
                { date: "2026.10.01 – 22", title: "2026 천안시 스마트도시 AI 인재양성교육", note: "AI 활용 스토리텔링, 웹툰 제작, 튜닝플러스 활용", place: "현장9 (아토)" },
                { date: "2026.10.06 – (8주)", title: "AI로 만드는 인생 2막", note: "제미나이 젬스를 활용한 자신의 인생 돌아보기", place: "성정우체국" },
                { date: "2026.10.07", title: "2026 천안시 스마트도시 AI 인재양성교육", note: "이젠 누구나 영상 감독! 숏츠 제작(실전), ChatGPT, 크링, 힉스필드", place: "기술18 (아토)" },
                { date: "2026.10.16 – 11.06", title: "2026 천안시 스마트도시 AI 인재양성교육", note: "나만의 사이트 만들기: 코딩 실습, 프로파일 앱 구축", place: "현장10 (아토)" },
                { date: "2026.10.16", title: "생성형 AI 교육 실습형 과정", note: "AI로 끝내는 기획·보고·발표, ChatGPT 활용, 비즈니스모델 캔버스 제작", place: "모두의 AI라운지" },
                { date: "2026.10.19", title: "2026 천안시 스마트도시 AI 인재양성교육", note: "AI로 완성하는 나만의 인스타툰, 젠툰 활용, 크리에이터 활용", place: "기술19 (아토)" },
                { date: "2026.10.17 – 11.01", title: "2026 천안시 스마트도시 AI 인재양성교육", note: "AI 콘텐츠 강사 양성교육: 초급, 중급, 심화 강사양성과정", place: "아토플래닛" },
                { date: "2026.10.27 (오전)", title: "우리 아이 안전한 AI 친구", note: "제미나이, 구글 스튜디오(스토리북)로 동화 만들기", place: "모두의 AI라운지" },
                { date: "2026.10.27 (오후)", title: "생활이 똑똑해지는 생활 AI", note: "제미나이로 식단표 만들기", place: "모두의 AI라운지" },
                { date: "2026.10.28", title: "소상공인 매출 올리는 AI 마케팅", note: "제미나이로 리뷰 분석, 어사이드 브라우저, 노트북, 젬스 활용", place: "모두의 AI라운지" },
                { date: "2026.10.29", title: "AI로 끝내는 기획·보고 발표 (심화)", note: "비즈니스 시퀀스모델 제작 후 PRD 제작, v0.app으로 웹 제작, 그록봇", place: "모두의 AI라운지" },
              ],
            },
          ],
        },
      },
      {
        slug: "news",
        icon: "newspaper",
        title: "04. AI 관련 뉴스",
        description: "눈여겨본 AI 소식을 모아 둡니다. 뉴스 주소를 넣으면 대표사진과 제목이 자동으로 보여요.",
        tag: "AI 뉴스",
        detail: {
          intro: "강의와 공부에 참고한 AI 관련 뉴스입니다. 제목이나 사진을 누르면 기사로 이동합니다.",
          groups: [{ heading: "AI 관련 뉴스", entries: [] }],
        },
      },
    ],
  },

  /* 맨 아래 인용문 */
  quote: "AI를 누구나 쉽게 쓸 수 있도록, 배우고 나누는 강사가 되겠습니다.",

  /* 소개 섹션 */
  about: {
    eyebrow: "About",
    title: "소개",
    paragraphs: [
      "여기에 나 또는 우리 팀, 가게, 프로젝트에 대한 소개를 적습니다.",
      "두 번째 문단도 필요하면 이렇게 줄을 추가하면 됩니다.",
    ],
  },

  /* 기능(항목) 섹션의 제목 — 카드 목록 자체는 관리자 페이지(/admin)에서 관리 */
  features: {
    eyebrow: "Features",
    title: "기능",
    description: "관리자 페이지에서 카드를 추가·수정·삭제할 수 있는 영역입니다.",
  },

  /* 연락처 섹션 */
  contact: {
    eyebrow: "Contact",
    title: "강의 문의",
    description: "기관·단체 강의, 소상공인과 시니어를 위한 AI 교육 문의를 기다립니다.",
    email: "smkimsm@gmail.com",
    links: [{ label: "YouTube", href: "https://www.youtube.com/@hunhunhan-story" }],
  },

  /* 맨 아래(푸터) */
  footer: {
    copyright: "© 2026 김상민. All rights reserved.",
  },

  /* 관리자 페이지에서 관리할 섹션 목록.
     key  = 데이터베이스에 저장되는 이름(영문 소문자),
     label = 관리자 화면에 보이는 이름.
     예) 포트폴리오라면 { key: "works", label: "작업물" } 을 추가 */
  adminSections: [{ key: "features", label: "기능" }],
};

/* Supabase를 아직 연결하지 않았을 때 대신 보여줄 예시 카드.
   Supabase를 연결하면 이 내용 대신 관리자 페이지에서 등록한 카드가 보입니다. */
export const sampleItems: Item[] = [
  {
    id: "sample-1",
    section: "features",
    title: "첫 번째 기능",
    description: "카드 하나에 제목, 설명, 이미지, 링크를 넣을 수 있어요.",
    image_url: null,
    link_url: null,
    sort_order: 1,
    is_visible: true,
    created_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "sample-2",
    section: "features",
    title: "두 번째 기능",
    description: "관리자 페이지에서 순서를 바꾸거나 숨길 수도 있어요.",
    image_url: null,
    link_url: null,
    sort_order: 2,
    is_visible: true,
    created_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "sample-3",
    section: "features",
    title: "세 번째 기능",
    description: "포트폴리오라면 작업물, 가게라면 메뉴처럼 자유롭게 쓰세요.",
    image_url: null,
    link_url: null,
    sort_order: 3,
    is_visible: true,
    created_at: "2026-01-01T00:00:00Z",
  },
];
