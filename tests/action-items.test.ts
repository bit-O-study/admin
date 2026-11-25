import { beforeEach, expect, test, vi } from 'vitest';
const mocks=vi.hoisted(()=>({admin:vi.fn(),db:vi.fn()}));
vi.mock('server-only',()=>({}));
vi.mock('react',()=>({cache:(fn:unknown)=>fn}));
vi.mock('../src/features/admin/admin',()=>({isAdminUser:mocks.admin}));
vi.mock('../src/lib/supabase/server',()=>({createSupabaseServerClient:mocks.db}));
type QueryResult = { data?: unknown[] | null; count?: number | null; error?: { message: string } };
function query(result: () => QueryResult, onRange: (a: number, b: number) => void = () => {}) {
 const builder = {
  select: () => builder, gte: () => builder, order: () => builder,
  limit: () => builder, is: () => builder, eq: () => builder,
  range: (a: number, b: number) => { onRange(a, b); return builder; },
  then: <T = QueryResult, U = never>(resolve?: ((value: QueryResult) => T | PromiseLike<T>) | null, reject?: ((reason: unknown) => U | PromiseLike<U>) | null) => Promise.resolve(result()).then(resolve, reject),
 };
 return builder;
}
import { getActionItems } from '../src/features/admin/action-items';
beforeEach(()=>{vi.clearAllMocks();mocks.admin.mockResolvedValue(true);});
test('요약은 반복 오류 횟수와 알려지지 않은 크론의 최근 상태까지 유지한다',async()=>{
 const rows:Record<string,unknown>={support_tickets:{count:2},post_reports:{count:3},app_events:{data:[{severity:'error',count:4},{severity:'info',count:99},{severity:'error',count:null}]},cron_runs:{data:[{name:'daily-reminders',status:'ok'},{name:'daily-reminders',status:'error'},{name:'custom-job',status:'error'}]}};
 mocks.db.mockResolvedValue({from:(name:string)=>{
   const builder = Object.assign(Promise.resolve(rows[name]), {
     select: () => builder, gte: () => builder, order: () => builder,
     limit: () => builder, is: () => builder, eq: () => builder, range: () => builder,
   });
   return builder;
 }});
 const result=await getActionItems();expect(result).toMatchObject({supportUnread:2,reportsOpen:3,appErrors:5,cronIssues:3,appErrorDays:14});
});
test('관리자가 아니면 로그를 조회하지 않는다',async()=>{mocks.admin.mockResolvedValue(false);expect((await getActionItems()).appErrors).toBeNull();expect(mocks.db).not.toHaveBeenCalled();});

test('조회 실패는 0 이 아니라 null(대시보드 "—")',async()=>{
 const rows:Record<string,QueryResult>={support_tickets:{count:null,error:{message:"x"}},post_reports:{count:1},app_events:{data:null,error:{message:"boom"}},cron_runs:{data:[]}};
 mocks.db.mockResolvedValue({from:(name:string)=>query(()=>rows[name])});
 const result=await getActionItems();expect(result).toMatchObject({supportUnread:null,reportsOpen:1,appErrors:null,cronIssues:3});
});
test('앱 오류가 1000행을 넘어도 끝까지 센다',async()=>{
 const page=(n:number)=>Array.from({length:n},()=>({severity:'error',count:1}));
 const ranges:number[][]=[];
 mocks.db.mockResolvedValue({from:(name:string)=>{
 let r=[0,0];
 return query(()=>name==='app_events'?{data:r[0]===0?page(1000):page(250)}:name==='cron_runs'?{data:[]}:{count:0}, (a,b)=>{r=[a,b];if(name==='app_events')ranges.push(r);});
 }});
 const result=await getActionItems();expect(result.appErrors).toBe(1250);expect(ranges).toEqual([[0,999],[1000,1999]]);
});
