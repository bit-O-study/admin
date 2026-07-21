import "server-only";

/**
 * 이메일 발송(통합 admin 용, 경량). Resend REST 만 지원하고, 키 없으면 발송 생략.
 *   - RESEND_API_KEY 있으면 사용 (EMAIL_FROM 이 인증 도메인이어야 임의 수신자 발송 가능).
 *   - 없으면 skip (관리자 화면은 임시 비번을 직접 표시하므로 문제 없음).
 */
const RESEND_ENDPOINT = "https://api.resend.com/emails";

export type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

export type SendEmailResult =
  | { ok: true; skipped?: boolean }
  | { ok: false; error: string };

export async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
  if (/@example\.(com|org|net)$/i.test(input.to.trim())) {
    return { ok: true, skipped: true };
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return { ok: true, skipped: true };
  }

  const from = process.env.EMAIL_FROM || "onboarding@resend.dev";
  try {
    const res = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [input.to],
        subject: input.subject,
        html: input.html,
        ...(input.text ? { text: input.text } : {}),
      }),
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      return { ok: false, error: `Resend ${res.status}: ${detail.slice(0, 300)}` };
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "발송 실패" };
  }
}