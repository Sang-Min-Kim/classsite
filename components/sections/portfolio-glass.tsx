import {
  ArrowRight,
  BookOpen,
  Briefcase,
  CirclePlay,
  Download,
  GraduationCap,
  Mail,
  MapPin,
  Newspaper,
  Phone,
  Presentation,
  Sparkles,
  Star,
  User,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";

import { siteConfig } from "@/site.config";
import { Container } from "@/components/layout/container";
import { SectionHeader } from "@/components/layout/section-header";
import { Button } from "@/components/ui/button";

/* 시니어 AI 강사 포트폴리오 — Minimalism + Liquid Glass 스타일.
   - 위에서 아래로: ① 첫 화면(소개·사진·숫자) ② 학력과 경력 ③ 주요 활동 카드 ④ 강의 문의
   - 글자는 모두 site.config.ts 의 hero, stats, profile, career, highlights, quote, contact 에서 바꿉니다.
   - 유리 효과는 app/globals.css 의 glass, glass-strong 클래스입니다.
   - 예전 모양(portfolio.tsx)으로 돌아가려면 app/page.tsx 에서 바꿔 끼우면 됩니다. */

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
    <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-2xl bg-secondary text-highlight">
      <Icon className="size-6" strokeWidth={1.75} />
    </span>
  );
}

/** 학력·경력처럼 "기간 + 내용" 이 이어지는 목록 */
function Timeline({ items }: { items: { period: string; text: string }[] }) {
  return (
    <ol className="mt-6 space-y-5 border-l border-border pl-5">
      {items.map((item) => (
        <li key={item.period} className="relative">
          <span className="absolute -left-[1.6rem] top-2 size-2.5 rounded-full bg-highlight ring-4 ring-background" />
          <p className="text-sm font-medium text-highlight">{item.period}</p>
          <p className="mt-1 leading-relaxed text-muted-foreground">
            <RichText text={item.text} />
          </p>
        </li>
      ))}
    </ol>
  );
}

export function PortfolioGlass() {
  const { hero, stats, profile, career, highlights, quote, contact } = siteConfig;
  const contactDetails = profile.details.filter((d) => d.icon !== "user");

  return (
    <>
      {/* ───────── ① 첫 화면 ───────── */}
      <section id="about" className="pt-8 pb-12 sm:pt-12 sm:pb-16">
        <Container>
          <div className="glass grid items-center gap-10 rounded-[2rem] p-6 sm:p-10 lg:grid-cols-[1fr_320px] lg:gap-14 lg:p-14">
            {/* 사진 (모바일에서는 위, 데스크톱에서는 오른쪽) */}
            <div className="mx-auto w-full max-w-[280px] lg:order-last lg:max-w-none">
              <div className="aspect-[4/5] overflow-hidden rounded-[1.75rem] border border-[var(--glass-border)] bg-secondary shadow-lg">
                {profile.photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={profile.photo} alt={profile.name} className="size-full object-cover object-top" />
                ) : (
                  <span className="flex size-full items-center justify-center text-7xl font-bold text-primary">
                    {profile.name.slice(0, 1)}
                  </span>
                )}
              </div>
            </div>

            <div className="min-w-0">
              <p className="glass-strong inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium text-highlight">
                <Sparkles className="size-4" />
                {hero.eyebrow}
              </p>
              <h1 className="mt-6 flex flex-wrap items-baseline gap-x-3 text-5xl font-bold tracking-tight sm:text-6xl">
                {profile.name}
                <span className="text-xl font-normal text-muted-foreground">{profile.hanja}</span>
              </h1>
              <p className="mt-3 text-lg font-medium text-muted-foreground">{profile.role}</p>
              <p className="mt-8 text-2xl font-semibold leading-snug tracking-tight sm:text-3xl">
                <RichText text={hero.title} />
              </p>
              <p className="mt-5 whitespace-pre-line text-lg leading-relaxed text-muted-foreground">
                {hero.description}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild size="lg">
                  <a href={hero.primaryCta.href}>
                    {hero.primaryCta.label}
                    <ArrowRight />
                  </a>
                </Button>
                <Button asChild size="lg" variant="outline" className="glass-strong">
                  <a href={hero.secondaryCta.href}>{hero.secondaryCta.label}</a>
                </Button>
              </div>
            </div>
          </div>

          {/* 숫자 3개 */}
          <ul className="mt-5 grid grid-cols-3 gap-3 sm:gap-4">
            {stats.map((stat) => (
              <li key={stat.label} className="glass rounded-3xl px-3 py-5 text-center sm:px-6 sm:py-7">
                <p className="text-2xl font-bold tracking-tight sm:text-4xl">{stat.value}</p>
                <p className="mt-2 text-sm text-muted-foreground sm:text-base">{stat.label}</p>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* ───────── ② 학력과 경력 ───────── */}
      <section id="career" className="py-12 sm:py-16">
        <Container>
          <SectionHeader eyebrow={career.eyebrow} title={career.heading} />
          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            <div className="glass rounded-3xl p-7">
              <div className="flex items-center gap-3">
                <IconBadge icon={GraduationCap} />
                <h3 className="text-xl font-semibold">{career.education.title}</h3>
              </div>
              <Timeline items={career.education.items} />
            </div>

            <div className="glass rounded-3xl p-7">
              <div className="flex items-center gap-3">
                <IconBadge icon={Briefcase} />
                <h3 className="text-xl font-semibold">{career.experience.title}</h3>
              </div>
              <Timeline items={career.experience.items} />
            </div>

            <div className="glass rounded-3xl p-7">
              <div className="flex items-center gap-3">
                <IconBadge icon={Star} />
                <h3 className="text-xl font-semibold">{career.skills.title}</h3>
              </div>
              <ul className="mt-6 flex flex-wrap gap-2">
                {career.skills.items.map((skill) => (
                  <li key={skill} className="glass-strong rounded-full px-4 py-2 text-sm font-medium">
                    {skill}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Container>
      </section>

      {/* ───────── ③ 주요 활동 (카드 전체를 누르면 자세히 보기) ───────── */}
      <section id="highlights" className="py-12 sm:py-16">
        <Container>
          <SectionHeader eyebrow={highlights.eyebrow} title={highlights.title} description={highlights.description} />
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {highlights.items.map((item) => {
              const Icon = icons[item.icon] ?? Sparkles;
              return (
                <Link
                  key={item.slug}
                  href={`/highlights/${item.slug}`}
                  className="glass group flex flex-col rounded-3xl p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                >
                  <span className="inline-flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                    <Icon className="size-7" strokeWidth={1.75} />
                  </span>
                  <h3 className="mt-6 text-xl font-semibold">{item.title}</h3>
                  <p className="mt-2 flex-1 leading-relaxed text-muted-foreground">{item.description}</p>
                  <span className="mt-6 inline-flex items-center gap-1.5 font-medium text-highlight">
                    {item.tag} 자세히 보기
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </Link>
              );
            })}
          </div>
        </Container>
      </section>

      {/* ───────── ④ 강의 문의 ───────── */}
      <section id="contact" className="py-12 sm:py-16">
        <Container>
          <div className="glass grid gap-10 rounded-[2rem] p-6 sm:p-10 lg:grid-cols-2 lg:gap-14 lg:p-14">
            <div>
              <SectionHeader eyebrow={contact.eyebrow} title={contact.title} description={contact.description} />
              <blockquote className="mt-8 border-l-2 border-highlight pl-5 text-xl font-medium leading-relaxed">
                “{quote}”
              </blockquote>
              {/* 프로필 한글 파일 내려받기 (app/download/profile/route.ts 가 만들어 줌) */}
              <Button asChild size="lg" className="mt-8">
                <a href={contact.download.href} download>
                  <Download />
                  {contact.download.label}
                </a>
              </Button>
            </div>

            <ul className="space-y-3">
              {contactDetails.map((d) => {
                const Icon = icons[d.icon] ?? User;
                const body = (
                  <>
                    <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-2xl bg-secondary text-highlight">
                      <Icon className="size-5" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm text-muted-foreground">{d.label}</span>
                      <span className="block break-all text-lg font-medium">{d.value}</span>
                    </span>
                  </>
                );
                return (
                  <li key={d.label}>
                    {d.href ? (
                      <a
                        href={d.href}
                        className="glass-strong flex items-center gap-4 rounded-2xl p-4 transition-transform hover:-translate-y-0.5"
                        {...(d.href.startsWith("http") && { target: "_blank", rel: "noopener noreferrer" })}
                      >
                        {body}
                      </a>
                    ) : (
                      <div className="glass-strong flex items-center gap-4 rounded-2xl p-4">{body}</div>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </Container>
      </section>
    </>
  );
}
