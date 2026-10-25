import { beforeEach, expect, test, vi } from 'vitest';
const mocks=vi.hoisted(()=>({admin:vi.fn(),db:vi.fn()}));
vi.mock('server-only',()=>({}));
vi.mock('react',()=>({cache:(fn:unknown)=>fn}));
vi.mock('../src/features/admin/admin',()=>({isAdminUser:mocks.admin}));
vi.mock('../src/lib/supabase/server',()=>({createSupabaseServerClient:mocks.db}));
import { getActionItems } from '../src/features/admin/action-items';
beforeEach(()=>{vi.clearAllMocks();mocks.admin.mockResolvedValue(true);});
test('요약은 반복 오류 횟수와 알려지지 않은 크론의 최근 상태까지 유지한다',async()=>{
 const rows:Record<string,unknown>={support_tickets:{count:2},post_reports:{count:3},app_events:{data:[{severity:'error',count:4},{severity:'info',count:99},{severity:'error',count:null}]},cron_runs:{data:[{name:'daily-reminders',status:'ok'},{name:'daily-reminders',status:'error'},{name:'custom-job',status:'error'}]}};
 mocks.db.mockResolvedValue({from:(name:string)=>{
   const builder = Object.assign(Promise.resolve(rows[name]), {
     select: () => builder, gte: () => builder, order: () => builder,
     limit: () => builder, is: () => builder, eq: () => builder,
   });
   return builder;
 }});
 const result=await getActionItems();expect(result).toMatchObject({supportUnread:2,reportsOpen:3,appErrors:5,cronIssues:3,appErrorDays:14});
});
test('관리자가 아니면 로그를 조회하지 않는다',async()=>{mocks.admin.mockResolvedValue(false);expect((await getActionItems()).appErrors).toBe(0);expect(mocks.db).not.toHaveBeenCalled();});
