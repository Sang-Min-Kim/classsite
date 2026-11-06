import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ChevronLeft, ChevronRight, ExternalLink, Newspaper, Pencil, Plus } from "lucide-react";

import { siteConfig } from "@/site.config";
import { isAdmin } from "@/lib/admin-auth";
import { getAdminClient } from "@/lib/supabase-admin";
import { findHighlight, getHighlightEntries } from "@/lib/highlights";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { importDefaults } from "@/app/highlights/actions";
import { EntryForm } from "@/app/highlights/_components/entry-form";
import { EntryDeleteButton } from "@/app/highlights/_components/entry-delete-button";

/* 하이라이트 단추(저서, 대학 강의, 생성형 AI)를 누르면 열리는 자세한 내용 화면.
   - 주소: /highlights/books, /highlights/lectures, /highlights/ai
   - 기본 내용은 site.config.ts 의 highlights.items[].detail 에 있습니다.
   - 관리자로 로그인(/admin)한 뒤 이 화면에 오면 항목마다 수정·삭제, 묶음마다 추가 버튼이 보입니다.
     (저장은 Supabase 의 highlight_entries 표에 됩니다)
   - 항목이 PAGE_SIZE(20개)를 넘으면 아래에 쪽 번호가 생기고, 주소 뒤에 ?page=2 처럼 붙어 넘겨 봅니다. */

/** 한 쪽에 보여줄 항목 수 */
const PAGE_SIZE = 20;

export async function generateMetadata({ params }: PageProps<"/highlights/[slug]">): Promise<Metadata> {
  const item = findHighlight((await params).slug);
  return { title: item ? `${item.title} — ${siteConfig.name}` : siteConfig.title };
}

function AdminNotice({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-6 rounded-xl border border-highlight/40 bg-secondary p-4 text-sm leading-relaxed text-secondary-foreground">
      {children}
    </div>
  );
}

/** 화면 아래 쪽 번호: ‹ 1 2 3 › */
function Pagination({ slug, page, totalPages }: { slug: string; page: number; totalPages: number }) {
  const href = (n: number) => `/highlights/${slug}?page=${n}`;
  const arrowClass =
    "inline-flex size-11 items-center justify-center rounded-full border bg-card text-primary transition-colors hover:bg-secondary";

  return (
    <nav aria-label="쪽 번호" className="mt-10 flex flex-wrap items-center justify-center gap-2">
      {page > 1 ? (
        <Link href={href(page - 1)} aria-label="이전 쪽" className={arrowClass}>
          <ChevronLeft className="size-5" />
        </Link>
      ) : null}
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
        <Link
          key={n}
          href={href(n)}
          aria-current={n === page ? "page" : undefined}
          className={
            n === page
              ? "inline-flex size-11 items-center justify-center rounded-full bg-primary font-semibold text-primary-foreground"
              : "inline-flex size-11 items-center justify-center rounded-full border bg-card text-foreground transition-colors hover:bg-secondary"
          }
        >
          {n}
        </Link>
      ))}
      {page < totalPages ? (
        <Link href={href(page + 1)} aria-label="다음 쪽" className={arrowClass}>
          <ChevronRight className="size-5" />
        </Link>
      ) : null}
    </nav>
  );
}

export default async function HighlightPage({ params, searchParams }: PageProps<"/highlights/[slug]">) {
  const { slug } = await params;
  const item = findHighlight(slug);
  if (!item) notFound();

  const { entries, fromDb, error: dbError } = await getHighlightEntries(slug);
  const admin = await isAdmin();
  // 데이터베이스에 표가 없는 등 읽기에 실패하면 편집 버튼을 숨기고 안내를 보여줌
  const canSave = admin && Boolean(getAdminClient()) && !dbError;
  // 수정·삭제·추가 버튼을 보여줄지 (기본 항목이 없는 화면은 바로 편집 가능)
  const editing = canSave && (fromDb || entries.length === 0);
  const groups = item.detail.groups.map((g) => g.heading);

  // 쪽 나누기: 묶음 순서대로 줄 세운 뒤 20개씩 자름
  const ordered = groups.flatMap((heading) => entries.filter((e) => e.group_heading === heading));
  const totalPages = Math.max(1, Math.ceil(ordered.length / PAGE_SIZE));
  const requested = Number((await searchParams).page) || 1;
  const page = Math.min(Math.max(1, Math.floor(requested)), totalPages);
  const onThisPage = new Set(ordered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE));

  return (
    <main className="flex-1 py-12 sm:py-16">
      <Container className="max-w-4xl">
        <Link
          href="/#highlights"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
        >
          <ArrowLeft className="size-4" />
          포트폴리오로 돌아가기
        </Link>

        <div className="mt-6 rounded-xl border bg-card p-6 shadow-sm sm:p-10">
          <span className="inline-block rounded-full border border-highlight px-3 py-0.5 text-xs text-highlight">
            {item.tag}
          </span>
          <h1 className="mt-4 border-l-4 border-highlight pl-4 text-3xl font-extrabold text-primary sm:text-4xl">
            {item.title}
          </h1>
          <p className="mt-4 leading-relaxed text-muted-foreground">{item.detail.intro}</p>

          {/* 관리자 안내 (방문자에게는 보이지 않음) */}
          {admin && dbError ? (
            <AdminNotice>
              <b>관리자 편집 모드</b> — 데이터베이스에서 항목을 읽지 못해 아직 편집할 수 없습니다.
              <br />
              (이유: {dbError})
              <br />
              Supabase 대시보드 → SQL Editor 에서 <code>supabase/schema.sql</code> 의 내용을 전부
              붙여넣고 Run 을 누른 뒤, 이 화면을 새로고침하세요.
            </AdminNotice>
          ) : null}
          {admin && !canSave && !dbError ? (
            <AdminNotice>
              <b>관리자 편집 모드</b> — Supabase가 연결되지 않아 아직 수정할 수 없습니다. README.md 의
              「Supabase 연결하기」를 마치고 <code>supabase/schema.sql</code> 을 한 번 더 실행해 주세요.
            </AdminNotice>
          ) : null}
          {canSave && !editing ? (
            <AdminNotice>
              <p>
                <b>관리자 편집 모드</b> — 지금은 기본 내용(site.config.ts)이 보이는 중입니다. 아래 버튼을
                누르면 기본 내용을 데이터베이스로 옮기고, 항목마다 수정·삭제·추가를 할 수 있어요.
              </p>
              <form action={importDefaults} className="mt-3">
                <input type="hidden" name="slug" value={slug} />
                <Button type="submit" size="sm">
                  <Pencil />
                  편집 시작하기
                </Button>
              </form>
            </AdminNotice>
          ) : null}
          {editing ? (
            <AdminNotice>
              <b>관리자 편집 모드</b> — 항목의 「수정」을 눌러 고치고, 「삭제」로 지우고, 묶음 아래의
              「항목 추가」로 새 항목을 넣을 수 있어요.
            </AdminNotice>
          ) : null}

          {totalPages > 1 ? (
            <p className="mt-6 text-sm text-muted-foreground">
              전체 {ordered.length}개 · {page} / {totalPages}쪽
            </p>
          ) : null}

          {groups.map((heading) => {
            const allInGroup = entries.filter((e) => e.group_heading === heading);
            const groupEntries = allInGroup.filter((e) => onThisPage.has(e));
            const nextOrder = (allInGroup.at(-1)?.sort_order ?? 0) + 10;
            // 이 묶음의 항목이 모두 다른 쪽에 있으면 숨김 (관리자는 '항목 추가'를 위해 제목은 보여줌)
            if (groupEntries.length === 0 && allInGroup.length > 0 && !editing) return null;

            return (
              <section key={heading} className="mt-10">
                <h2 className="font-bold uppercase text-primary">{heading}</h2>
                {groupEntries.length > 0 ? (
                  <ul className="mt-4 divide-y rounded-xl bg-muted px-5">
                    {groupEntries.map((entry) => (
                      <li key={entry.id ?? entry.date + entry.title} className="py-5">
                        <div className="flex gap-5">
                          {entry.link_url ? (
                            /* 뉴스: 대표사진을 누르면 기사로 이동 */
                            <a
                              href={entry.link_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex aspect-video w-28 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-card text-primary shadow-sm transition-transform hover:scale-105 sm:w-48"
                            >
                              {entry.image_url ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={entry.image_url} alt={entry.title} className="size-full object-cover" />
                              ) : (
                                <Newspaper className="size-8" strokeWidth={1.5} />
                              )}
                            </a>
                          ) : entry.image_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={entry.image_url}
                              alt={entry.title}
                              className="h-36 w-auto shrink-0 rounded-md border bg-card object-contain shadow-sm sm:h-44"
                            />
                          ) : null}
                          <div className="min-w-0 flex-1 sm:flex sm:gap-6">
                            <p className="shrink-0 text-sm font-medium text-highlight sm:w-28">{entry.date}</p>
                            <div className="min-w-0 flex-1">
                              {entry.link_url ? (
                                <a
                                  href={entry.link_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="font-semibold text-foreground hover:text-highlight hover:underline"
                                >
                                  {entry.title}
                                  <ExternalLink className="ml-1 inline size-3.5 align-baseline" />
                                </a>
                              ) : (
                                <p className="font-semibold text-foreground">{entry.title}</p>
                              )}
                              {entry.note && (
                                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{entry.note}</p>
                              )}
                              {entry.place && (
                                <p className="mt-2 inline-block rounded-full bg-card px-2.5 py-0.5 text-xs text-primary">
                                  {entry.place}
                                </p>
                              )}
                            </div>
                          </div>
                          {editing && entry.id ? (
                            <EntryDeleteButton id={entry.id} slug={slug} imageUrl={entry.image_url} />
                          ) : null}
                        </div>
                        {editing && entry.id ? (
                          <details className="mt-3">
                            <summary className="cursor-pointer text-sm text-muted-foreground hover:text-primary">
                              수정
                            </summary>
                            <div className="mt-3 rounded-lg border bg-card p-4">
                              <EntryForm slug={slug} groups={groups} groupHeading={heading} entry={entry} />
                            </div>
                          </details>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                ) : allInGroup.length === 0 ? (
                  <p className="mt-4 rounded-xl bg-muted px-5 py-8 text-center text-sm text-muted-foreground">
                    아직 등록된 항목이 없습니다.
                  </p>
                ) : null}

                {editing ? (
                  <details className="mt-3 rounded-xl border p-4">
                    <summary className="flex cursor-pointer items-center gap-2 text-sm font-medium text-primary">
                      <Plus className="size-4" />
                      항목 추가
                    </summary>
                    <div className="mt-4">
                      <EntryForm slug={slug} groups={groups} groupHeading={heading} nextOrder={nextOrder} />
                    </div>
                  </details>
                ) : null}
              </section>
            );
          })}

          {totalPages > 1 ? <Pagination slug={slug} page={page} totalPages={totalPages} /> : null}
        </div>
      </Container>
    </main>
  );
}
