import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { PortfolioGlass } from "@/components/sections/portfolio-glass";

/* 메인 페이지 = 섹션 블록을 위에서 아래로 쌓아 놓은 것.
   - 섹션 순서 바꾸기: 아래 줄의 순서를 바꾸면 됩니다.
   - 섹션 빼기: 해당 줄을 지우면 됩니다.
   - 새 섹션 추가: components/sections 에 파일을 만들고 여기에 한 줄 추가. */

// 관리자 페이지에서 내용을 바꾸면 최대 60초 안에 반영 (저장 즉시 반영도 되어 있음)
export const revalidate = 60;

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        {/* 유리 스타일 포트폴리오. 바로 전 모양으로 돌아가려면: PortfolioGlass 대신 Portfolio
            (components/sections/portfolio.tsx) 를 넣기 */}
        <PortfolioGlass />
      </main>
      <Footer />
    </>
  );
}
