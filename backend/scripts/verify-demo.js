// Opt-in live checks. Uses demo accounts only; deletes only the post created by this run.
const fs=require('fs/promises');const path=require('path');const crypto=require('crypto');
async function main(){
 if(!process.argv.includes('--confirm-local'))throw new Error('Use --confirm-local to run controlled local demo checks.');
 const base='http://localhost:3001/api';const file=path.join(__dirname,'../.demo-credentials.json');const creds=JSON.parse(await fs.readFile(file,'utf8'));
 const results=[];
 async function request(label,endpoint,method='GET',body,token,expected=200){const r=await fetch(base+endpoint,{method,headers:{...(body?{'Content-Type':'application/json'}:{}),...(token?{Authorization:'Bearer '+token}:{})},body:body?JSON.stringify(body):undefined});const type=r.headers.get('content-type')||'';const data=type.includes('json')?await r.json():Buffer.from(await r.arrayBuffer());results.push({check:label,status:r.status,pass:r.status===expected});if(r.status!==expected)throw new Error(`${label}: expected ${expected}, got ${r.status}`);return data;}
 async function login(u){return (await request('participant login','/auth/login','POST',{email:u.email,password:u.password})).token;}
 const token=await login(creds.users[0]);const other=await login(creds.users[1]);
 if(!creds.verification){creds.verification={name:'Verification Demo',email:'verification@shambafusion.example.test',password:crypto.randomBytes(18).toString('base64url')};await fs.writeFile(file,JSON.stringify(creds,null,2)+'\n',{mode:0o600});}
 const attempted=await fetch(base+'/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(creds.verification)});
 if(attempted.status!==200)await request('registration forces participant role','/auth/register','POST',{...creds.verification,role:'admin'},null,201);
 const registered=await request('registered account login','/auth/login','POST',creds.verification);if(registered.user.role!=='participant')throw new Error('Registration role escalation');
 await request('guest post access denied','/posts','GET',null,null,401);
 await request('participant user management denied','/auth','GET',null,token,403);
 await request('participant metrics denied','/system/metrics','GET',null,token,403);
 await request('participant uploads denied','/resources','POST',{name:'Rejected demo'},token,403);
 const cats=await request('categories','/categories','GET',null,token);if(cats.length<6)throw new Error('Missing categories');
 const page1=await request('discussion page 1','/posts?page=1','GET',null,token);const page2=await request('discussion page 2','/posts?page=2','GET',null,token);if(page1.posts.length!==10||page2.posts.length<2)throw new Error('Pagination mismatch');
 const post=page1.posts[0];await request('shared post detail','/posts/'+post.post_id,'GET',null,token);
 const comments=await request('seeded comments','/comments/post/'+post.post_id,'GET',null,token);if(comments.length<2)throw new Error('Missing comments');
 if(post.like_count<1)throw new Error('Missing like counts');results.push({check:'seeded likes visible',pass:true});
 await request('like status','/posts/'+post.post_id+'/like-status','GET',null,token);
 const filtered=await request('category filtering','/categories/'+cats[0].category_id,'GET',null,token);if(!filtered.posts.length)throw new Error('Empty category');
 await request('notifications','/notifications','GET',null,token);
 const resources=await request('resource browsing','/resources');for(const r of resources){const bytes=await request('download '+r.resource_id,'/resources/'+r.resource_id+'/download','GET',null,token);if(!Buffer.isBuffer(bytes)||!bytes.toString().includes('FICTIONAL PORTFOLIO RESOURCE'))throw new Error('Resource content mismatch');}
 const created=await request('create controlled test post','/posts','POST',{title:'Temporary verification discussion',content:'Fictional automated check; removed after this run.',category_id:cats[0].category_id},token,201);const id=created.post_id;
 await request('nonowner edit denied','/posts/'+id,'PUT',{title:'Forbidden edit',content:'Should not save',category_id:cats[0].category_id},other,403);
 await request('nonowner delete denied','/posts/'+id,'DELETE',null,other,403);
 await request('owner edit','/posts/'+id,'PUT',{title:'Temporary verification discussion edited',content:'Edited check',category_id:cats[0].category_id},token);
 await request('create comment','/comments','POST',{post_id:id,comment:'Temporary verification reply'},token,201);
 await request('like own test post','/posts/'+id+'/like','PUT',null,token);
 await request('unlike own test post','/posts/'+id+'/unlike','PUT',null,token);
 await request('owner deletes newly created test post','/posts/'+id,'DELETE',null,token);
 await request('deleted test post is absent','/posts/'+id,'GET',null,token,404);
 console.log(JSON.stringify({passed:results.length,results},null,2));
 await fs.writeFile(path.join(__dirname,'../../docs/API_VERIFICATION.json'),JSON.stringify({date:'2026-10-28',results},null,2)+'\n');
}
main().catch(e=>{console.error('Live verification failed:',e.message);process.exitCode=1;});
