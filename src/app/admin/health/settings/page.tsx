import { PageHeader } from "@/components/ui/kit";
import { getGroupMode } from "@/features/health/group-mode.server";
import { GroupModeManager } from "@/features/health/components/group-mode-manager";
import { getDepositInfo } from "@/features/health/billing/team-store";
import { DepositInfoManager } from "@/features/health/components/deposit-info-manager";
import { SettingsSection } from "@/features/health/components/settings-section";

export const dynamic = "force-dynamic";

/**
 * 헬쑤 › 설정 › 앱 설정 (2026-10-27 BOadmin 2.0).
 * 한 화면에 6개가 쌓여 있던 설정을 나눴다: 관리자는 전체 › 관리자로, 게시물 관리자·디버그는 › 권한으로.
 */
export default async function AppSettingsPage() {
  const [groupMode, deposit] = await Promise.all([getGroupMode(), getDepositInfo()]);
  return (
    <>
      <PageHeader title="앱 설정" description="헬쑤 앱 전체에 바로 적용되는 값입니다." />
      <div className="flex flex-col gap-10">
        <SettingsSection
          title="그룹탭 모드"
          description={<>그룹탭에 어떤 기능을 켤지 앱 전체에 대해 고릅니다. &quot;헬스장&quot;은 공유펫·랭킹 화면, &quot;오늘 운동 인증&quot;은 그룹원이 오늘 운동을 3초 움짤로 올리는 인증 피드입니다.</>}
        >
          <GroupModeManager mode={groupMode} />
        </SettingsSection>
        <SettingsSection
          title="입금 계좌 안내"
          description={<>팀 요금제(트레이너·헬스장)를 신청한 그룹장에게 보여 줄 계좌입니다. 계좌는 바뀌는 값이라 코드가 아니라 여기에 둡니다. 비워 두면 신청 화면에는 &quot;확인 후 연락드릴게요&quot;만 보입니다.</>}
        >
          <DepositInfoManager initial={deposit} />
        </SettingsSection>
      </div>
    </>
  );
}
