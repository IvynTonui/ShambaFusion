const {test}=require('node:test');
const assert=require('node:assert/strict');
const dbPath=require.resolve('../config/db.config');
let calls=[];let handler;
require.cache[dbPath]={id:dbPath,filename:dbPath,loaded:true,exports:{query:async(sql,args)=>{calls.push({sql,args});return handler(sql,args);}}};
const posts=require('../controllers/posts.controller');
const auth=require('../controllers/auth.controller');
const resources=require('../controllers/resources.controller');
function response(){return {statusCode:200,status(n){this.statusCode=n;return this},json(data){this.data=data;return this}};}
test('discussion creation returns an ID and binds ownership to authenticated account',async()=>{
 calls=[];handler=async sql=>sql.startsWith('SELECT')?[[{category_id:2}]]:[{insertId:7}];const res=response();await posts.createPost({body:{title:'Soil moisture',content:'How do you mulch?',category_id:2,user_id:999},user:{userId:1}},res);assert.equal(res.statusCode,201);assert.equal(res.data.post_id,7);assert.equal(calls[1].args[2],1);
});
test('discussion editing denies a different owner before UPDATE',async()=>{
 calls=[];handler=async()=>[[{user_id:2}]];const res=response();await posts.updatePost({params:{id:1},body:{title:'Changed',content:'Changed',category_id:2},user:{userId:1}},res);assert.equal(res.statusCode,403);assert.equal(calls.length,1);
});
test('discussion deletion denies a different participant',async()=>{
 calls=[];handler=async()=>[[{user_id:2}]];const res=response();await posts.deletePost({params:{id:1},user:{userId:1,role:'participant'}},res);assert.equal(res.statusCode,403);assert.equal(calls.length,1);
});
test('registration rejects weak passwords before querying database',async()=>{
 calls=[];const res=response();await auth.register({body:{name:'Demo',email:'demo@example.test',password:'short',role:'admin'}},res);assert.equal(res.statusCode,400);assert.equal(calls.length,0);
});
test('post detail returns joined post and missing posts return 404',async()=>{
 handler=async()=>[[{post_id:3,title:'Demo',author_name:'Farmer'}]];let res=response();await posts.getPostById({params:{id:3}},res);assert.equal(res.data.author_name,'Farmer');handler=async()=>[[]];res=response();await posts.getPostById({params:{id:999}},res);assert.equal(res.statusCode,404);
});
test('resource download returns 404 for missing file without throwing',async()=>{
 handler=async()=>[[{file_url:'/uploads/nonexistent-test-file.pdf'}]];const res=response();await resources.downloadResource({params:{id:1}},res);assert.equal(res.statusCode,404);
});
