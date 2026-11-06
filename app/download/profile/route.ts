import { siteConfig } from "@/site.config";
import { buildProfileHwpx } from "@/lib/hwpx/profile";

/* 주소 /download/profile 로 들어오면 프로필 한글 파일(.hwpx)을 만들어 내려받게 합니다.
   내용은 누를 때마다 지금 사이트 내용(site.config.ts + 관리자에서 저장한 항목)으로 새로 채웁니다. */

export const dynamic = "force-dynamic";

export async function GET() {
  const file = await buildProfileHwpx();
  const fileName = `${siteConfig.profile.name}-프로필.hwpx`;

  return new Response(new Uint8Array(file), {
    headers: {
      "Content-Type": "application/hwp+zip",
      // 한글 파일 이름이 깨지지 않게 두 가지 방식으로 이름을 알려 줌
      "Content-Disposition": `attachment; filename="profile.hwpx"; filename*=UTF-8''${encodeURIComponent(fileName)}`,
      "Cache-Control": "no-store",
    },
  });
}
