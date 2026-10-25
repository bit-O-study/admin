const http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const dir=path.resolve(process.argv[2]);
http.createServer((req,res)=>{
 if(req.url==='/health'){res.writeHead(200,{'Content-Type':'text/plain'});return res.end('ok')}
 if(req.url==='/'){res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','X-Content-Type-Options':'nosniff'});return res.end('<!doctype html><meta charset="utf-8"><title>Ticket extension</title><h1>Ticket extension</h1><p><a href="/ticket.zip">Download installation package</a></p><p>Extract the ZIP, open chrome://extensions, enable developer mode, and load the extracted folder.</p>')}
 if(req.url!=='/ticket.zip'){res.writeHead(404);return res.end()}
 res.writeHead(200,{'Content-Type':'application/zip','Content-Disposition':'attachment; filename="ticket.zip"'});
 fs.createReadStream(path.join(dir,'ticket.zip')).pipe(res);
}).listen(Number(process.env.PORT),'0.0.0.0');
