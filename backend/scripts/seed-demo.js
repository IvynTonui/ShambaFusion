// Additive seed for the verified local schema. Never migrates or overwrites rows.
const path = require('path');
const fs = require('fs/promises');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');
require('dotenv').config({path:path.join(__dirname,'../.env')});
const categories = ['Crop Farming','Livestock Farming','Irrigation and Water Management','Agricultural Technology','Agribusiness and Markets','Pest and Disease Management'];
const topics = [
 ['Planning a maize scouting routine before the rains',0,'Our fictional community plot is preparing for planting. How do you record early signs of leaf damage and decide when to consult an extension officer? We want a repeatable scouting routine rather than applying treatments without identifying the cause.','Walk the same route each week and record the date, crop stage and affected area. Clear photos help an extension officer assess changes.','Check several parts of the plot rather than only the roadside. Keep observations separate from a diagnosis.'],
 ['Building soil organic matter with locally available mulch',0,'We have a small vegetable plot and access to dry grass and compost. What practical steps help improve soil structure without bringing weed seeds into the beds? This is a fictional learning discussion.','Use well-finished compost and keep mulch away from stems. Compare a small trial bed before extending the approach.','A simple record of watering and soil condition can help you evaluate the trial. Local soil testing is useful before changing fertilizer inputs.'],
 ['A daily checklist for a small poultry flock',1,'Our demo poultry group wants a clear morning routine for water, feed and housing checks. What observations should a new keeper record, and when should they contact a qualified animal-health professional?','Record water intake, feed use and unusual behaviour. Clean drinkers and check ventilation every day.','Separate equipment for sick birds and seek qualified advice promptly when illness is suspected. Avoid guessing at medicines.'],
 ['Keeping livestock feed records through the dry season',1,'How can a small group keep an understandable feed inventory? We want to compare supplies, storage losses and purchasing dates using a notebook before trying an app.','Start with one unit of measurement and note every addition or use. Check stored feed for moisture and contamination.','Assign one person to review the notebook weekly. Ask a local livestock adviser about suitable feeding plans.'],
 ['Testing drip irrigation on two vegetable beds',2,'Before investing in a larger system, our fictional farm is comparing two beds. What should we measure to check whether the emitters distribute water evenly?','Collect output from emitters at different positions for the same time interval. Record any large differences and inspect for blockages.','Include filter cleaning and pressure checks in the trial. Use the equipment supplier guidance for installation.'],
 ['Planning rainwater storage for a community garden',2,'Our demo garden has a roof catchment and limited storage space. Which questions should we answer before selecting a tank, especially around maintenance and safe use?','Estimate catchment area and seasonal demand first. Include cleaning access, overflow and a secure cover in the plan.','Keep irrigation water planning separate from drinking-water safety. Follow local requirements and professional guidance for installation.'],
 ['Choosing an offline-friendly farm record tool',3,'Some members have intermittent mobile connectivity. What features matter most in a simple record tool for planting dates, expenses and harvest weights? We are comparing workflows rather than recommending a product.','Try a full week of records with connectivity disabled. Check whether data can be exported in a readable format.','Keep a paper backup during the trial and agree who owns the records. Avoid collecting unnecessary personal details.'],
 ['What can a low-cost soil-moisture sensor tell us?',3,'We are exploring a sensor as a learning aid on a fictional demonstration plot. How should we compare readings with field observations so we do not rely on a single number?','Record readings at consistent depths and times. Compare them with soil condition and recent irrigation.','Look for trends and check calibration instructions. A sensor should support local agronomic advice, not replace it.'],
 ['Comparing market prices without overlooking transport costs',4,'Our fictional growers group sees different prices at nearby markets. How can we compare the expected return after transport, packaging and unsold produce are included?','Use the same quantity and quality grade in each comparison. Write down all costs alongside the quoted price.','Record the date and source because prices change. Try a small shipment before assuming a higher headline price is better.'],
 ['Preparing a simple harvest cost worksheet',4,'We want a readable worksheet for a small vegetable harvest. Which costs should be recorded separately so a new group member can understand the margin calculation?','Separate inputs, labour, packaging and transport. Keep the quantities as well as the total amounts.','Clearly label estimates and actual payments. The worksheet is a planning aid, not a promise of profit.'],
 ['Identifying crop damage before choosing a treatment',5,'Leaves on our fictional learning plot show holes and discolouration. What information should we gather for an extension officer before deciding whether pests, disease or another cause is responsible?','Include photos of the whole plant and close-ups, planting date and recent weather. Do not identify a pest from one symptom alone.','Record how many plants are affected and where they occur. Use qualified local advice before considering any pesticide.'],
 ['Keeping an integrated pest-management observation log',5,'Our demo group wants to track field observations and follow-up actions through a growing season. What headings make a pest-management log useful for reviewing decisions later?','Include date, location, crop stage, observations, adviser recommendation and follow-up date. Record what changed after any action.','Keep product use records only when applicable and follow labels and local rules. Prevention and monitoring belong in the log too.']
];
async function main() {
 if (!process.argv.includes('--confirm-local')) throw new Error('Use --confirm-local after reviewing docs/DEMO_DATA.md.');
 if (!['localhost','127.0.0.1','::1'].includes(process.env.DB_HOST) || process.env.DB_NAME !== 'shamba_fusion') throw new Error('Refusing: expected local shamba_fusion database.');
 const credentialPath=path.join(__dirname,'../.demo-credentials.json');
 let credentials;
 try { credentials=JSON.parse(await fs.readFile(credentialPath,'utf8')); } catch(e) {
  if(e.code!=='ENOENT') throw e;
  credentials={fictional:true,users:['Amina Demo','Kiptoo Demo','Wanjiku Demo','Otieno Demo'].map((name,i)=>({name,email:`community${i+1}@shambafusion.example.test`,password:crypto.randomBytes(18).toString('base64url')}))};
  await fs.writeFile(credentialPath,JSON.stringify(credentials,null,2)+'\n',{flag:'wx',mode:0o600});
 }
 const db=await mysql.createConnection({host:process.env.DB_HOST,user:process.env.DB_USER,password:process.env.DB_PASSWORD,database:process.env.DB_NAME});
 let locked=false;
 try {
  const [[identity]]=await db.query('SELECT DATABASE() AS name'); if(identity.name!=='shamba_fusion') throw new Error('Database mismatch');
  const [[lock]]=await db.query("SELECT GET_LOCK('shambafusion-fictional-seed-v1',10) AS acquired"); if(lock.acquired!==1) throw new Error('Seed already running');locked=true;
  const [before]=await db.query('SELECT * FROM Users ORDER BY user_id');
  // Verify required columns before any INSERT. Database constraints validate FK relationships.
  const required={Users:['user_id','name','email','password','role'],Categories:['category_id','name','description'],Posts:['post_id','title','content','user_id','category_id','likes'],Comments:['comment_id','post_id','user_id','comment'],PostLikes:['post_id','user_id'],Resources:['resource_id','name','description','category_id','file_url','uploaded_by'],Notifications:['notification_id','user_id','type','message','related_id','is_read']};
  for(const [table,fields] of Object.entries(required)){const [columns]=await db.query('SHOW COLUMNS FROM ??',[table]);if(fields.some(f=>!columns.some(c=>c.Field===f)))throw new Error(`Unexpected schema: ${table}`);}
  await db.beginTransaction();
  async function findOrInsert(table,where,values,idColumn) {
   const keys=Object.keys(where);const [rows]=await db.query(`SELECT * FROM ?? WHERE ${keys.map(()=> '?? = ?').join(' AND ')}`,[table,...keys.flatMap(k=>[k,where[k]])]);
   if(rows.length) return {row:rows[0],inserted:false};
   const [result]=await db.query('INSERT INTO ?? SET ?',[table,values]);return {row:{...values,[idColumn]:result.insertId},inserted:true};
  }
  const users=[];
  for(const u of credentials.users){const found=await findOrInsert('Users',{email:u.email},{name:u.name,email:u.email,password:await bcrypt.hash(u.password,10),role:'participant'},'user_id');if(found.row.role!=='participant'||!await bcrypt.compare(u.password,found.row.password))throw new Error('Demo identity collision; existing account left unchanged.');users.push(found.row.user_id);}
  const cats=[];for(const name of categories){cats.push((await findOrInsert('Categories',{name},{name,description:'Fictional portfolio community category for agricultural knowledge sharing.'},'category_id')).row.category_id);}
  const posts=[];
  for(let i=0;i<topics.length;i++){
   const [title,cat,content,...replies]=topics[i];const author=users[i%users.length];const likers=users.filter(u=>u!==author).slice(0,1+i%3);
   const p=await findOrInsert('Posts',{title,user_id:author},{title,content:content+'\n\n[Fictional portfolio demonstration]',user_id:author,category_id:cats[cat],likes:likers.length},'post_id');posts.push(p.row.post_id);
   for(let j=0;j<replies.length;j++){const user_id=users[(i+j+1)%users.length];const comment=replies[j]+' [Demo reply]';await findOrInsert('Comments',{post_id:p.row.post_id,user_id,comment},{post_id:p.row.post_id,user_id,comment},'comment_id');}
   if(p.inserted) for(const user_id of likers) await findOrInsert('PostLikes',{post_id:p.row.post_id,user_id},{post_id:p.row.post_id,user_id},'unused');
  }
  const resourceDir=path.join(__dirname,'../uploads');await fs.mkdir(resourceDir,{recursive:true});
  for(const [index,label,body] of [[0,'Field observation worksheet','Date | Plot | Crop stage | Observation | Photo reference | Adviser follow-up\nRecord observations without assuming a diagnosis.'],[2,'Irrigation trial worksheet','Bed | Date | Watering duration | Emitter position | Collected volume | Maintenance notes\nCompare consistent measurements before expanding a trial.'],[4,'Harvest cost worksheet','Crop | Quantity | Input cost | Labour | Packaging | Transport | Sales | Unsold quantity\nLabel estimates separately from actual costs.']]){
   const filename=`fictional-demo-worksheet-${index}.txt`;const bytes=Buffer.from(`SHAMBA FUSION — FICTIONAL PORTFOLIO RESOURCE\n${label}\n\n${body}\n\nOriginal sample content, not professional agricultural or financial advice.\n`);
   const file=path.join(resourceDir,filename);try{await fs.writeFile(file,bytes,{flag:'wx'});}catch(e){if(e.code!=='EEXIST')throw e;if(!bytes.equals(await fs.readFile(file)))throw new Error('Existing demo resource differs; not overwritten.');}
   await findOrInsert('Resources',{name:label+' [Demo]',uploaded_by:users[0]},{name:label+' [Demo]',uploaded_by:users[0],description:'Fictional educational worksheet; downloadable plain-text file.',category_id:cats[index],file_url:'/uploads/'+filename},'resource_id');
  }
  for(let i=0;i<3;i++){const item={user_id:users[i],type:'comment',message:'A demo participant replied to your fictional discussion.',related_id:posts[i]};await findOrInsert('Notifications',item,{...item,is_read:0},'notification_id');}
  const [after]=await db.query('SELECT * FROM Users ORDER BY user_id');if(before.some(u=>JSON.stringify(u)!==JSON.stringify(after.find(a=>a.user_id===u.user_id))))throw new Error('Existing user preservation check failed');
  await db.commit();
  const counts={};for(const table of Object.keys(required)){const [[r]]=await db.query('SELECT COUNT(*) AS count FROM ??',[table]);counts[table]=r.count;}
  console.log(JSON.stringify({database:identity.name,counts,existingUsersUnchanged:true,credentialFile:'backend/.demo-credentials.json (private, ignored; passwords not printed)'}));
 } catch(e){await db.rollback();throw e;}finally{if(locked)await db.query("SELECT RELEASE_LOCK('shambafusion-fictional-seed-v1')");await db.end();}
}
main().catch(e=>{console.error('Seed failed; transaction rolled back:',e.code||e.message);process.exitCode=1;});
