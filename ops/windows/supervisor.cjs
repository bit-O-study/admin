// Run by a per-project non-administrator scheduled task. Never fetches Git.
const fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const {spawn,execFileSync}=require('node:child_process');
const {parseEnv}=require('node:util');
const root=path.resolve(process.argv[2]);
const config=JSON.parse(fs.readFileSync(path.join(root,'config.json'),'utf8').replace(/^\uFEFF/,''));
let child,active,closing=false;
const pause=ms=>new Promise(r=>setTimeout(r,ms));
function read(name){try{return JSON.parse(fs.readFileSync(path.join(root,name),'utf8').replace(/^\uFEFF/,''))}catch{return null}}
function write(name,data){const f=path.join(root,name);fs.writeFileSync(f+'.tmp',JSON.stringify(data));fs.renameSync(f+'.tmp',f)}
function release(sha){if(!/^[a-f0-9]{40}$/.test(sha))throw Error('Invalid release SHA');return path.join(root,'releases',sha)}
function log(message){console.log(new Date().toISOString(),message)}
async function stop(){if(child){const c=child;child=null;c.kill();for(let i=0;i<50&&(c.exitCode===null&&c.signalCode===null);i++)await pause(100);if((c.exitCode===null&&c.signalCode===null))throw Error('Previous process did not stop')}write('process.json',{})}
async function start(sha){
 const dir=release(sha),envFile=path.join(root,'config','runtime.env');
 const custom=fs.existsSync(envFile)?parseEnv(fs.readFileSync(envFile,'utf8')):{};
 if(config.kind!=='extension'&&!fs.existsSync(envFile))throw Error('Server runtime.env not configured');
 const env={...process.env,...custom,NODE_ENV:'production',PORT:String(config.port),HOSTNAME:'0.0.0.0',NODE_OPTIONS:'--max-old-space-size=768'};
 if(config.name==='accountBook')env.DATABASE_URL='file:'+path.join(root,'data','app.db').replaceAll('\\','/');
 const out=fs.openSync(path.join(root,'logs','runtime.log'),'a');
 child=spawn(process.execPath,[config.kind==='extension'?path.join(__dirname,'extension-server.cjs'):path.join(dir,'server.js'),...(config.kind==='extension'?[dir]:[])],{cwd:dir,env,stdio:['ignore',out,out],windowsHide:true});
 if(child.pid)write('process.json',{pid:child.pid,sha});
 fs.closeSync(out);
 child.on('error',e=>log('Process error: '+e.code));
 for(let i=0;i<60;i++){
  await pause(1000);
  if((child.exitCode!==null||child.signalCode!==null))throw Error('Application exited during startup');
  if(await health(config.port,config.healthPath||'/'))return;
 }
 throw Error('Application health check failed');
}
function health(port,url){return new Promise(resolve=>{const q=http.get({hostname:'127.0.0.1',port,path:url,timeout:3000},r=>{r.resume();resolve(r.statusCode>=200&&r.statusCode<400)});q.on('error',()=>resolve(false));q.on('timeout',()=>q.destroy())})}
async function apply(request){
 const previous=active;
 let activationStarted=false;
 try{
  const dir=release(request.sha);
  const manifest=JSON.parse(fs.readFileSync(path.join(dir,'release.json'),'utf8'));
  if(manifest.sha!==request.sha||manifest.project!==config.name)throw Error('Artifact identity mismatch');
  // Only initialize a new database. Existing financial data is never overwritten.
  if(config.name==='accountBook'&&!fs.existsSync(path.join(root,'data','app.db')))fs.copyFileSync(path.join(dir,'initial.db'),path.join(root,'data','app.db'),fs.constants.COPYFILE_EXCL);
  activationStarted=true;
  await stop();await start(request.sha);active=request.sha;
  write('current.json',{sha:active,previous,updatedAt:new Date().toISOString()});
  write('result.json',{id:request.id,sha:active,ok:true});log('Activated '+active);
 }catch(e){
  if(activationStarted){
   await stop().catch(()=>{});
   if(previous)await start(previous).catch(()=>log('Rollback startup failed'));
  }
  write('result.json',{id:request.id,sha:request.sha,ok:false,error:e.message});log('Deployment rejected: '+e.message);
 }
}
async function main(){
 // A supervisor crash must not leave an old child occupying the application's port.
 // Verify the recorded PID's command line before touching it (PIDs can be reused).
 const orphan=read('process.json');
 if(process.platform==='win32'&&Number.isInteger(orphan?.pid)&&/^[a-f0-9]{40}$/.test(orphan.sha)){
  const script=`$p=Get-CimInstance Win32_Process -Filter 'ProcessId = ${orphan.pid}'; if($p){$p.CommandLine}`;
  const command=execFileSync('powershell.exe',['-NoProfile','-EncodedCommand',Buffer.from(script,'utf16le').toString('base64')],{encoding:'utf8',windowsHide:true}).toLowerCase();
  const target=config.kind==='extension'?release(orphan.sha):path.join(release(orphan.sha),'server.js');
  if(command.includes(target.toLowerCase())){try{process.kill(orphan.pid)}catch{}await pause(1000)}
 }
 active=read('current.json')?.sha;
 if(active)await start(active).catch(e=>log(e.message));
 while(!closing){
  const req=read('request.json'),result=read('result.json');
  if(req&&req.id!==result?.id)await apply(req);
  else if(active&&(!child||(child.exitCode!==null||child.signalCode!==null))){await stop().catch(()=>{});await start(active).catch(e=>log(e.message));await pause(5000)}
  await pause(1000);
 }
}
process.on('SIGTERM',()=>{closing=true;stop().finally(()=>process.exit())});
main().catch(e=>{log(e.message);process.exitCode=1});
