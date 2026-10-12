"use client";
import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { retrySupportNotification, supportNotificationAction } from "./actions";
export function NotificationSettings({configured,connection}:{configured:boolean;connection:{state:string;enabled:boolean;push_enabled:boolean;kakao_id:string|null}|null}) {
  const router=useRouter();const [message,setMessage]=useState("");const [pending,start]=useTransition();const [enabled,setEnabled]=useState(connection?.enabled??true);const [push,setPush]=useState(connection?.push_enabled??false);
  function run(kind:"save"|"disconnect"|"test"|"dispatch"){start(async()=>{try{const r=await supportNotificationAction(kind,enabled,push);setMessage(r.error??"처리했어요. 아래 발송 내역을 확인해 주세요.");router.refresh();}catch{setMessage("처리하지 못했어요. 잠시 후 다시 시도해 주세요.");}});}
  return <section className="app-card space-y-4 p-5">
    <h2 className="font-bold">내 카카오톡 연결</h2><p>연결 상태: {connection?.state==="connected"?"연결됨":connection?.state==="needs_reconnect"?"재연결 필요":"연결 안 됨"}{connection?.kakao_id?` · 계정 …${connection.kakao_id.slice(-4)}`:""}</p>
    <p className="text-sm text-muted">나와의 채팅으로 전송해요. 무료 한도를 넘으면 대기하며 유료 문자로 전환하지 않아요. 휴대폰 알림음·배너는 기기에서 별도로 확인해 주세요.</p>
    {configured?<a href="/api/support/kakao/start" className="inline-block rounded-xl bg-yellow-300 px-4 py-3 font-semibold text-zinc-900">카카오 계정 연결</a>:<p role="status">카카오 REST 키·서버 암호화 키·사이트 URL·서버 관리자 키 설정이 필요해요. 문의 접수는 계속 사용할 수 있어요.</p>}
    <label className="flex gap-2"><input type="checkbox" checked={enabled} onChange={e=>setEnabled(e.target.checked)}/>카카오 문의 알림 받기</label>
    <label className="flex gap-2"><input type="checkbox" checked={push} onChange={e=>setPush(e.target.checked)}/>등록된 브라우저 기기로 새 문의 푸시 받기</label>
    <Link className="block text-sm underline" href="https://health-app-five-iota.vercel.app/settings/notifications">기기 푸시 등록·권한 설정</Link>
    <div className="flex flex-wrap gap-2">{([['save','설정 저장'],['test','테스트 보내기'],['dispatch','대기 알림 처리'],['disconnect','카카오 연결 해제']] as const).map(([kind,label])=><button type="button" className="rounded-xl border px-3 py-3 text-sm" key={kind} disabled={pending||((kind==="test")&&!configured)} onClick={()=>run(kind)}>{label}</button>)}</div>
    <p role="status" className="text-sm">{message}</p>
  </section>;
}


export function RetryNotification({id}:{id:string}) {
 const [confirmed,setConfirmed]=useState(false);const [pending,start]=useTransition();const [message,setMessage]=useState("");const router=useRouter();
 return <div className="mt-2 space-y-2"><label className="flex gap-2"><input type="checkbox" checked={confirmed} onChange={e=>setConfirmed(e.target.checked)}/>이미 전송된 경우 중복 수신할 수 있음을 확인했어요.</label><button type="button" disabled={!confirmed||pending} className="rounded border p-2 disabled:opacity-50" onClick={()=>start(async()=>{try{const result=await retrySupportNotification(id,confirmed);setMessage(result.error??'재전송 요청을 저장했어요.');router.refresh();}catch{setMessage('재전송 요청에 실패했어요.');}})}>이 알림 재전송</button><p role="status">{message}</p></div>;
}
