const {test} = require('node:test');
const assert = require('node:assert/strict');
const {requireAdmin} = require('../middleware/admin.middleware');
test('administrator gate denies guests and participants',()=>{
 for(const user of [undefined,{role:'participant'}]) {let status;requireAdmin({user},{status(n){status=n;return this},json(){}},()=>assert.fail('authorized'));assert.equal(status,403);}
});
test('administrator gate permits administrators',()=>{let passed=false;requireAdmin({user:{role:'admin'}},{},()=>passed=true);assert.equal(passed,true);});
const dbPath=require.resolve('../config/db.config');
require.cache[dbPath]={id:dbPath,filename:dbPath,loaded:true,exports:{query:async()=>[[{user_id:1,role:'participant'}]]}};
const jwt=require('jsonwebtoken');
const {authenticateToken}=require('../middleware/auth.middleware');
test('authentication rejects missing and invalid bearer tokens',async()=>{
 for(const authorization of [undefined,'Basic invalid','Bearer invalid']) {let status;await authenticateToken({headers:{authorization}},{status(n){status=n;return this},json(){}},()=>assert.fail('authorized'));assert.equal(status,401);}
});
test('authentication uses current database role rather than stale JWT role',async()=>{
 const old=process.env.JWT_SECRET;process.env.JWT_SECRET='isolated-test-secret';
 try {const req={headers:{authorization:'Bearer '+jwt.sign({userId:1,role:'admin'},process.env.JWT_SECRET)}};let passed=false;await authenticateToken(req,{status(){return this},json(){assert.fail('rejected')}},()=>passed=true);assert.equal(passed,true);assert.equal(req.user.role,'participant');} finally {if(old===undefined)delete process.env.JWT_SECRET;else process.env.JWT_SECRET=old;}
});
