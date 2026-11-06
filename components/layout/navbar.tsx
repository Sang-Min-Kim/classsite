"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

import { siteConfig } from "@/site.config";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** 상단 메뉴. 메뉴 항목은 site.config.ts 의 nav 에서 바꿉니다. 모바일에서는 햄버거 버튼으로 열림.
    화면 위에 떠 있는 유리 알약 모양 (glass-strong 클래스는 app/globals.css 에 있음) */
export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 pt-3">
      <Container>
        <div className="glass-strong flex h-16 items-center justify-between rounded-full pr-3 pl-6">
          <Link href="/" className="text-lg font-semibold tracking-tight">
            {siteConfig.name}
          </Link>

          {/* 데스크톱 메뉴 */}
          <nav className="hidden items-center gap-8 md:flex">
            {siteConfig.nav.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-base text-muted-foreground transition-colors hover:text-foreground"
              >
                {item.label}
              </a>
            ))}
            {/* 비밀 버튼: 새 탭에서 관리자 페이지 열기 */}
            <Button asChild size="sm">
              <a
                href={siteConfig.secretButton.href}
                target="_blank"
                rel="noopener noreferrer"
              >
                {siteConfig.secretButton.label}
              </a>
            </Button>
          </nav>

          {/* 모바일 메뉴 버튼 */}
          <button
            type="button"
            className="inline-flex size-10 items-center justify-center rounded-full md:hidden"
            aria-label={open ? "메뉴 닫기" : "메뉴 열기"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </Container>

      {/* 모바일 메뉴 펼침 */}
      <nav className={cn("mt-2 md:hidden", open ? "block" : "hidden")}>
        <Container>
          <div className="glass-strong flex flex-col rounded-3xl px-6 py-2">
            {siteConfig.nav.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="py-3 text-base text-muted-foreground hover:text-foreground"
              >
                {item.label}
              </a>
            ))}
            <a
              href={siteConfig.secretButton.href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="py-3 text-base font-medium text-foreground"
            >
              {siteConfig.secretButton.label}
            </a>
          </div>
        </Container>
      </nav>
    </header>
  );
}
