import { PageHeader } from "@/components/ui/kit";
import { getPostModerators } from "@/features/health/data";
import { DEBUG_FEATURES } from "@/features/health/debug-features";
import { getDebugAccounts, getDebugFeatureStates } from "@/features/health/debug-features.server";
import { DebugAccountsManager } from "@/features/health/components/debug-accounts-manager";
import { DebugFeaturesManager } from "@/features/health/components/debug-features-manager";
import { PostModeratorsManager } from "@/features/health/components/post-moderators-manager";
import { SettingsSection } from "@/features/health/components/settings-section";

export const dynamic = "force-dynamic";

/** 헬쑤 › 설정 › 권한 (2026-10-27 BOadmin 2.0) — 예전 관리자설정 화면에서 나눈 게시물 관리자·디버그. */
export default async function AccessSettingsPage() {
  const [moderators, debugAccounts, debugStates] = await Promise.all([getPostModerators(), getDebugAccounts(), getDebugFeatureStates()]);
  const debugFeatures = DEBUG_FEATURES.map((f) => ({ id: f.id, label: f.label, visibility: debugStates[f.id] ?? "debug" }));
  return (
    <>
      <PageHeader title="권한" description="게시물 관리자와 디버그 계정, 디버그 기능을 누구에게 보여 줄지 정합니다." />
      <div className="flex flex-col gap-10">
        <SettingsSection title="게시물 관리자" description="지정한 계정은 커뮤니티의 모든 게시물·댓글을 삭제하거나 수정할 수 있습니다. 관리자 계정은 기본으로 가능합니다.">
          <PostModeratorsManager moderators={moderators} />
        </SettingsSection>
        <SettingsSection title="디버그 계정" description="지정한 계정은 관리자가 아니어도 켜진 디버그 기능을 앱에서 볼 수 있습니다. 테스트폰 계정을 지정할 때 씁니다.">
          <DebugAccountsManager accounts={debugAccounts} />
        </SettingsSection>
        <SettingsSection title="디버그 기능" description="개발·진단용 기능을 기능별로 숨기거나, 디버그 계정에게만, 또는 전체에 공개합니다.">
          <DebugFeaturesManager features={debugFeatures} />
        </SettingsSection>
      </div>
    </>
  );
}
