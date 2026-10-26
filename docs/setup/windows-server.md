# Windows server deployment

Status: in progress (2026-10-24).

GitHub Actions runs on pushes to main and manual dispatch from main. Tests and Windows builds run on GitHub-hosted runners; deployment uses the dedicated bito-admin runner. Never approve external PR workflows targeting this server.

Server folder: C:/services/Bit-O/admin. Port: 4101. The BitO-App-admin scheduled task runs the application under bito_admin, without administrator privileges. The Actions runner has a separate Windows service. Existing runners are preserved.

Runtime configuration belongs in config/runtime.env on the server, readable only by the project account and administrators. Do not commit or package environment files. Next public build values belong in the BUILD_PUBLIC_ENV repository variable as dotenv text; only NEXT_PUBLIC_* values may be included. Runtime-only secrets never enter the Actions artifact.

A release is checked by SHA and HTTP health before activation. Failed startup restores the previous release. current.json records the active and previous SHAs; logs/runtime.log records application output. Local databases remain under data/. A new accountBook database is initialized from CI-generated demo data only when no database exists.

SSH retains its LocalSubnet rule and additionally allows the Tailscale interface. Application access is limited to LAN/Tailscale. The admin console is not connected to the public tunnel.

Verification pending: first Actions build, deployment health, reboot recovery, external access. 

2026-10-25: local Node 24 validation passed 202 tests, ESLint, TypeScript and standalone production build. Runtime configuration was copied with user authorization into a restricted server file; only the two NEXT_PUBLIC_SUPABASE settings are provided to the hosted build. Existing service and Kakao callback origins remain unchanged. Admin console origin is http://100.97.115.109:4101. Authenticated integrations and external-client access require separate verification.

2026-10-26: release validation failures now leave the currently healthy process running. Rollback is attempted only after activation begins. The supervisor regression test covers promotion, failed-start rollback, invalid SHA rejection, mismatched project identity, and preservation of the healthy PID and HTTP response. The validated `.server-setup` and `ops/windows` script copies have matching SHA-256 hashes. This source change has not yet been installed into running Windows supervisor tasks; applying it requires a separate controlled supervisor restart.
