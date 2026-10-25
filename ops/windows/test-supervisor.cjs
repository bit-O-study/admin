const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),assert=require('node:assert/strict');
const {spawn}=require('node:child_process');
const root=fs.mkdtempSync(path.join(os.tmpdir(),'bito-deploy-test-'));
const port=24861,good='a'.repeat(40),bad='b'.repeat(40);
for(const folder of ['logs','config','data','releases'])fs.mkdirSync(path.join(root,folder));
fs.writeFileSync(path.join(root,'config.json'),JSON.stringify({name:'test',kind:'next',port}));
fs.writeFileSync(path.join(root,'config/runtime.env'),'');
for(const sha of [good,bad]){
 const dir=path.join(root,'releases',sha);fs.mkdirSync(dir);
 fs.writeFileSync(path.join(dir,'release.json'),JSON.stringify({project:'test',sha}));
 fs.writeFileSync(path.join(dir,'server.js'),sha===bad?'process.exit(1)':`require('node:fs').writeFileSync(${JSON.stringify(path.join(root,'fixture.pid'))},String(process.pid));require('node:http').createServer((q,s)=>s.end('good')).listen(Number(process.env.PORT),'127.0.0.1')`);
}
const supervisor=spawn(process.execPath,[path.join(__dirname,'supervisor.cjs'),root],{stdio:['ignore','pipe','pipe'],windowsHide:true});
supervisor.stdout.pipe(process.stdout);supervisor.stderr.pipe(process.stderr);
const pause=ms=>new Promise(r=>setTimeout(r,ms));
async function deploy(id,sha){fs.writeFileSync(path.join(root,'request.json'),JSON.stringify({id,sha}));for(let i=0;i<150;i++){await pause(200);try{const r=JSON.parse(fs.readFileSync(path.join(root,'result.json')));if(r.id===id)return r}catch{}}throw Error('Supervisor timeout')}
(async()=>{
 assert.equal((await deploy('good',good)).ok,true);
 assert.equal(await (await fetch('http://127.0.0.1:'+port)).text(),'good');
 const failed=await deploy('bad',bad);assert.equal(failed.ok,false);assert.equal(failed.error,'Application exited during startup');
 assert.equal(JSON.parse(fs.readFileSync(path.join(root,'current.json'))).sha,good);
 assert.equal(await (await fetch('http://127.0.0.1:'+port)).text(),'good');
 assert.equal((await deploy('traversal','../escape')).ok,false);
 assert.equal(await (await fetch('http://127.0.0.1:'+port)).text(),'good');
 console.log('PASS: promotion, failed-start rollback, traversal rejection, previous app availability');
})().catch(e=>{console.error(e.message);process.exitCode=1}).finally(()=>{supervisor.kill();try{process.kill(Number(fs.readFileSync(path.join(root,'fixture.pid'))))}catch{}});
