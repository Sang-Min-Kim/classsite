import {
  BookOpen,
  Briefcase,
  CirclePlay,
  GraduationCap,
  Mail,
  MapPin,
  Newspaper,
  Phone,
  Presentation,
  Quote,
  Sparkles,
  Star,
  User,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";

import { siteConfig } from "@/site.config";
import { getHeroTexts } from "@/lib/data";
import { Container } from "@/components/layout/container";

/* 포트폴리오(이력서) 형태의 첫 화면.
   - 왼쪽: 프로필(사진, 이름, 연락처)  /  오른쪽: 제목, 소개, 학력·기술·경력, 하이라이트, 인용문
   - 글자는 모두 site.config.ts 의 profile, career, highlights, quote 에서 바꿉니다.
   - 큰 제목·한 줄 소개·소개 문단은 관리자 페이지(/admin → 히어로 문구)에서도 바꿀 수 있습니다. */

const icons: Record<string, LucideIcon> = {
  user: User,
  mail: Mail,
  phone: Phone,
  youtube: CirclePlay,
  map: MapPin,
  book: BookOpen,
  presentation: Presentation,
  sparkles: Sparkles,
  newspaper: Newspaper,
};

/** "**굵게**" 는 굵은 글씨로, "[강조]" 는 파란 글씨로 바꿔 줍니다. */
function RichText({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*|\[[^\]]+\])/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong key={i} className="font-semibold text-foreground">
              {part.slice(2, -2)}
            </strong>
          );
        }
        if (part.startsWith("[") && part.endsWith("]")) {
          return (
            <span key={i} className="text-highlight">
              {part.slice(1, -1)}
            </span>
          );
        }
        return part;
      })}
    </>
  );
}

function IconBadge({ icon: Icon }: { icon: LucideIcon }) {
  return (
    <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-secondary text-primary">
      <Icon className="size-5" />
    </span>
  );
}

export async function Portfolio() {
  const { profile, career, highlights, quote } = siteConfig;
  const texts = await getHeroTexts();

  return (
    <section id="about" className="py-12 sm:py-16">
      <Container>
        <div className="grid gap-10 rounded-xl border bg-card p-6 shadow-sm sm:p-10 lg:grid-cols-[280px_1fr] lg:gap-12">
          {/* ───────── 왼쪽: 프로필 ───────── */}
          <aside id="contact" className="flex flex-col items-center text-center lg:border-r lg:pr-12">
            <p className="text-lg font-bold uppercase tracking-wide text-primary">{profile.label}</p>
            <span className="mt-2 h-0.5 w-10 bg-primary" />

            <div className="mt-8 flex size-48 items-center justify-center overflow-hidden rounded-full bg-secondary">
              {profile.photo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={profile.photo} alt={profile.name} className="size-full object-cover object-top" />
              ) : (
                <span className="text-6xl font-bold text-primary">{profile.name.slice(0, 1)}</span>
              )}
            </div>

            <h2 className="mt-6 text-4xl font-bold text-primary">{profile.name}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{profile.hanja}</p>
            <p className="mt-2 font-semibold text-primary">{profile.role}</p>

            <hr className="my-8 w-full" />

            <ul className="w-full space-y-5 text-left">
              {profile.details.map((d) => {
                const Icon = icons[d.icon] ?? User;
                return (
                  <li key={d.label} className="flex items-start gap-3">
                    <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <Icon className="size-5" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold">{d.label}</p>
                      {d.href ? (
                        <a
                          href={d.href}
                          className="break-all text-sm text-muted-foreground hover:text-highlight"
                          {...(d.href.startsWith("http") && { target: "_blank", rel: "noopener noreferrer" })}
                        >
                          {d.value}
                        </a>
                      ) : (
                        <p className="text-sm text-muted-foreground">{d.value}</p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </aside>

          {/* ───────── 오른쪽: 본문 ───────── */}
          <div className="min-w-0">
            <h1 className="border-l-4 border-highlight pl-4 text-5xl font-extrabold uppercase leading-none tracking-tight text-primary sm:text-6xl">
              {texts.hero_eyebrow}
            </h1>
            <p className="mt-6 text-xl font-bold leading-snug sm:text-2xl">
              <RichText text={texts.hero_title} />
            </p>
            <p className="mt-5 whitespace-pre-line leading-relaxed text-muted-foreground">
              {texts.hero_description}
            </p>

            {/* 학력 · 기술 · 경력 */}
            <div id="career" className="mt-10 grid gap-8 md:grid-cols-3 md:gap-0 md:divide-x">
              <div className="md:pr-6">
                <div className="flex items-center gap-3">
                  <IconBadge icon={GraduationCap} />
                  <h3 className="font-bold uppercase text-primary">{career.education.title}</h3>
                </div>
                <ul className="mt-4 space-y-3 text-sm">
                  {career.education.items.map((item) => (
                    <li key={item.period}>
                      <p className="text-muted-foreground">{item.period}</p>
                      <p className="text-muted-foreground"><RichText text={item.text} /></p>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="md:px-6">
                <div className="flex items-center gap-3">
                  <IconBadge icon={Star} />
                  <h3 className="font-bold uppercase text-primary">{career.skills.title}</h3>
                </div>
                <ul className="mt-4 grid grid-cols-2 gap-x-4 md:grid-cols-1 xl:grid-cols-2 gap-y-2 text-sm text-muted-foreground">
                  {career.skills.items.map((skill) => (
                    <li key={skill} className="flex items-center gap-2">
                      <span className="size-1 shrink-0 rounded-full bg-foreground" />
                      {skill}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="md:pl-6">
                <div className="flex items-center gap-3">
                  <IconBadge icon={Briefcase} />
                  <h3 className="font-bold uppercase text-primary">{career.experience.title}</h3>
                </div>
                <ul className="mt-4 space-y-3 text-sm">
                  {career.experience.items.map((item) => (
                    <li key={item.period}>
                      <p className="text-muted-foreground">{item.period}</p>
                      <p className="text-muted-foreground"><RichText text={item.text} /></p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* 하이라이트 */}
            <div id="highlights" className="mt-10 rounded-xl bg-muted p-5 sm:p-6">
              <h3 className="font-bold uppercase text-primary">{highlights.title}</h3>
              <div className="mt-5 grid gap-5 md:grid-cols-2">
                {highlights.items.map((item) => {
                  const Icon = icons[item.icon] ?? Sparkles;
                  return (
                    <article key={item.title} className="flex gap-4 md:flex-col">
                      <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-lg border bg-card text-primary md:h-28 md:w-full">
                        <Icon className="size-10" strokeWidth={1.5} />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-primary">{item.title}</h4>
                        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
                        {/* 단추: 마우스를 올리면 살짝 커지고, 누르면 자세한 내용 화면으로 이동 */}
                        <Link
                          href={`/highlights/${item.slug}`}
                          className="mt-3 inline-block rounded-full border border-highlight px-3 py-0.5 text-xs text-highlight transition-all duration-200 hover:scale-110 hover:bg-highlight hover:text-primary-foreground hover:shadow-md"
                        >
                          {item.tag}
                        </Link>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>

            {/* 인용문 */}
            <blockquote className="mt-8 flex items-start justify-center gap-3 text-center text-lg font-medium text-primary">
              <Quote className="size-5 shrink-0 rotate-180 fill-current" />
              <p>{quote}</p>
              <Quote className="size-5 shrink-0 fill-current" />
            </blockquote>
          </div>
        </div>
      </Container>
    </section>
  );
}
