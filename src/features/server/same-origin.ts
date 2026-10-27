// Same-origin only: session cookies alone must never authorize a cross-site command.
export function isSameOriginJson(request: Request): boolean {
  let sameOrigin = false;
  try {
    const origin = new URL(request.headers.get('origin') || '');
    const internal = new URL(request.url);
    // Standalone Next.js can reconstruct request.url with its 0.0.0.0 bind host.
    // Host is the browser's actual destination; never trust forwarded-host here.
    const host = request.headers.get('host')?.toLowerCase() || internal.host;
    sameOrigin = origin.host === host && origin.protocol === internal.protocol && origin.origin === request.headers.get('origin');
  } catch { /* Missing or malformed origins are rejected. */ }
  return sameOrigin && !!request.headers.get('content-type')?.startsWith('application/json');
}
