# Server control dashboard

`/admin/server` shows memory, uptime, operating system, Node/CPU information and project health from the **managed Windows host**, not the browser or admin web process. The existing admin session is required for every API request. The local agent accepts a server-held bearer token and binds only to `127.0.0.1:4199`. Do not proxy or expose this port publicly.

## Install

1. Deploy the admin application with the new page/API. Preserve its existing runtime environment.
2. On the target server, review and run `install-control-agent.ps1` as an administrator. It creates a separate startup scheduled task, `BitO-Server-Control`, protects its configuration/token with SYSTEM/Administrators ACLs, and appends `SERVER_CONTROL_URL` and `SERVER_CONTROL_TOKEN` to the existing restricted admin runtime file. Never copy the token into NEXT_PUBLIC variables. The task runs as SYSTEM to access the isolated project directories; its control operations are writing fixed `control.json` requests for the local inventory and invoking the fixed AST scheduled-task adapter.
3. Roll out `supervisor.cjs` using the existing controlled supervisor installer/restart procedure. Verify candidate hashes, pending deployments, release identity and HTTP health. **The agent installer deliberately does not replace or restart supervisors.** Existing project accounts retain their restricted execution privileges. Deploy/restart admin through its normal release flow to load the new runtime variables.
4. Open Server management from the admin menu. Confirm host/memory values, project health and a fresh supervisor connection before using controls. Test ON/OFF on an explicitly designated non-production fixture before any live service outage.

## Control semantics

- `control.json` persists the requested ON/OFF state. OFF survives a supervisor/server restart; the supervisor stays alive and does not revive the application. ON starts the current release.
- Deployment requests received while OFF stay queued. They are processed after ON; the deployment workflow may time out while the project remains OFF. Resume the project before deploying, or rerun that workflow after resuming.
- `control-result.json` acknowledges completion/failure. HTTP health is shown separately; accepted requests are not reported as successful starts. A stale/disconnected supervisor cannot accept new commands. Audit JSONL records actor, project, action, request ID and time before issuing a command. Supervisor results record completion; retain these files in server backups.
- Admin itself is protected from web shutdown to preserve the control channel. Use its normal server maintenance workflow. AST uses the fixed `control-ast.ps1` adapter for `AST-Paper-Trader`: it verifies the task identity and paper mode, refuses shutdown with a position, pauses new entries before stopping, and disables the scheduled task so its one-minute trigger cannot restart it. ON restores the task and the previous paused state. The adapter takes the same deployment mutex to avoid a deployment race. Unreleased projects cannot start. This does not stop GitHub Actions runners.
- Environment values, credentials, command lines and filesystem paths are never returned to the dashboard. The version is the deployed release SHA. Memory is total host physical memory usage, not a sum of application heaps.

## Validation

Run `node --test ops/windows/test-control-agent.cjs`, `node ops/windows/test-supervisor.cjs`, `node ops/windows/test-control-ast.cjs`, and `node ops/windows/test-deploy.cjs`. The deploy suite runs a temp-root copy of `deploy.ps1` and checks that redeploying the active SHA exits successfully without an activation request, while an existing inactive release is still rejected. The AST suite mocks all task and trading API operations. `node ops/windows/verify-server-ui.mjs` verifies the actual dashboard component with fixture API responses at desktop and mobile sizes. These use temporary fixture directories and a fixture HTTP process; they never stop a real project. The agent test covers authentication, browser/invalid commands, allowlist, audit, pending commands and stale supervision. The supervisor test includes the existing release regressions plus persistent OFF, deployment deferral and ON recovery.

## Deployment reporting

The agent reads the current server release and activation result separately from the latest GitHub Actions workflow run. Public workflows are queried without a stored GitHub credential and cached for up to ten minutes. Failed job and step names are shown with the run URL; raw logs and secrets are not fetched. Known supervisor errors are translated into specific activation reasons. Private/missing workflows, rate limits and network failures display unavailable, never success. The UI shows the GitHub check timestamp, attempted commit and actually deployed commit separately.

2026-10-26: the independent agent and updated shared supervisor were installed on the managed host. All seven shared supervisors were restarted sequentially with unchanged release records and health verification; AST was not restarted. The previous supervisor is backed up as `supervisor.backup-20261026132217.cjs`. The source supervisor SHA-256 is `92DB6DD2EC5EA0BF012BBA436FDAB416D434EF14B7601DB86DAFE25229222654`. UI release status must still be checked against the CI/CD run and server `current.json` for the deployed commit.
