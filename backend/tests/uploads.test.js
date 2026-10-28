const {test}=require('node:test');
const assert=require('node:assert/strict');
const {PassThrough}=require('node:stream');
const fs=require('fs/promises');
const upload=require('../middleware/upload.middleware');
function attempt(filename, content) {
 const boundary='shamba-test-boundary';
 const bytes=Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="name"\r\n\r\nDemo guide\r\n--${boundary}\r\nContent-Disposition: form-data; name="description"\r\n\r\nA safe test guide\r\n--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="${filename}"\r\nContent-Type: application/pdf\r\n\r\n${content}\r\n--${boundary}--\r\n`);
 const req=new PassThrough();req.headers={'content-type':`multipart/form-data; boundary=${boundary}`,'content-length':String(bytes.length)};req.method='POST';
 return new Promise((resolve,reject)=>{const res={status(n){this.code=n;return this},json(data){resolve({code:this.code,data,req})}};upload.single('file')(req,res,err=>err?reject(err):resolve({code:200,req}));req.end(bytes);});
}
test('upload rejects spoofed PDF contents before writing to disk',async()=>{const result=await attempt('guide.pdf','<html>bad</html>');assert.equal(result.code,400);});
test('upload rejects executable extension even with PDF signature',async()=>{const result=await attempt('guide.html','%PDF-1.4 test');assert.equal(result.code,400);});
test('valid PDF receives generated name; filesystem writes are isolated stubs',async()=>{
 const original={mkdir:fs.mkdir,writeFile:fs.writeFile};let writes=0;fs.mkdir=async()=>{};fs.writeFile=async()=>{writes++;};
 try {const result=await attempt('guide.pdf','%PDF-1.4 test');assert.equal(result.code,200);assert.match(result.req.file.filename,/^[a-f0-9-]+\.pdf$/);assert.equal(writes,1);assert.equal(result.req.file.buffer,undefined);}finally{Object.assign(fs,original);}
});
