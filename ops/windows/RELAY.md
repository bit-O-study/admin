# Cloud admin relay

Apply `server-control-relay.sql` to the HEALTH Supabase database before rollout. Tables use RLS with no browser policies; only service_role can read or write. Existing administrator session and same-origin API checks remain mandatory. Neither the local agent port nor its token is exposed to Vercel or the APK.

Both deployments need HEALTH_SUPABASE_URL and HEALTH_SUPABASE_SERVICE_ROLE_KEY (server environment only). Windows additionally retains SERVER_CONTROL_TOKEN and its loopback SERVER_CONTROL_URL. Vercel must have no SERVER_CONTROL_TOKEN. Optional SERVER_CONTROL_HOST_ID defaults to primary and must match on both deployments.

Windows Next instrumentation starts one worker per process. It publishes real local status then atomically claims one command every two seconds. Cloud GET reads snapshots; a snapshot older than 20 seconds remains visible but cannot be controlled. Enqueue validates freshness, target capabilities, existing pending requests, and prevents admin self-stop. Commands expire after 30 seconds. Permanent claims and SKIP LOCKED prevent duplicate delivery; a crash or timeout becomes uncertain after two minutes and is never automatically retried. Acceptance means the local agent received the request, not that the service has completed the transition. Later snapshots confirm actual process state.

No browser receives service credentials, command actors, or the relay token. Command history is service-only. Retain history according to the operator's audit retention policy (completed commands can be removed safely; never remove queued/claimed commands). Read-only smoke should check the Vercel authenticated API, snapshot timestamp, memory/project counts, and stale-control behavior. Do not toggle production projects for verification.

Validation: `npx vitest run tests/server-relay.test.ts tests/server-control-route.test.ts`, TypeScript, lint and production build. Test database separately with anon/authenticated permission denial, concurrent claim uniqueness, stale enqueue denial, command expiry and immutable claimed execution.
