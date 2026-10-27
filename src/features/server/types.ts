export type ServerSnapshot = {
  relay?: { receivedAt: string; stale: boolean };
  checkedAt: string;
  memory: { total: number; free: number; used: number; percent: number };
  environment: { hostname: string; platform: string; release: string; architecture: string; node: string; cpu: string; cores: number; uptime: number };
  projects: { name: string; port: number; sha: string | null; pid: number | null; state: 'running' | 'stopped' | 'unhealthy' | 'not-deployed'; desired: 'on' | 'off'; pending: boolean; controlError: string | null; controllable: boolean; controlReason: string | null; deployment?: { local: { state: string; sha?: string | null; attemptedSha?: string | null; deployedAt?: string | null; reason?: string | null }; ci: { state: string; sha?: string | null; updatedAt?: string | null; checkedAt?: string; runUrl?: string; stage?: string | null; reason?: string | null } } }[];
};
