const multer = require('multer');
const path = require('path');
const fs = require('fs/promises');
const crypto = require('crypto');
const uploadDir = path.join(__dirname, '..', 'uploads');
const parser = multer({storage: multer.memoryStorage(), limits: {fileSize: 5*1024*1024, files: 1, fields: 3, parts: 4}});
module.exports = {single: (field) => (req,res,next) => parser.single(field)(req,res,async err => {
  if (err) return res.status(400).json({message: 'Upload rejected. Use a PDF, PNG or JPEG under 5 MB.'});
  if (!req.file) return res.status(400).json({message: 'File is required'});
  const {name,description} = req.body;
  if (typeof name !== 'string' || !name.trim() || name.length > 255 || typeof description !== 'string' || !description.trim() || description.length > 5000) return res.status(400).json({message:'Provide a name (up to 255 characters) and description (up to 5000 characters).'});
  const b = req.file.buffer;
  const ext = b.subarray(0,5).toString() === '%PDF-' ? '.pdf' : b.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])) ? '.png' : b[0] === 255 && b[1] === 216 && b[2] === 255 ? '.jpg' : null;
  if (!ext || ![ext, ...(ext === '.jpg' ? ['.jpeg'] : [])].includes(path.extname(req.file.originalname).toLowerCase())) return res.status(400).json({message:'File contents and extension must match a PDF, PNG or JPEG.'});
  try {
    await fs.mkdir(uploadDir,{recursive:true});
    req.file.filename = crypto.randomUUID()+ext;
    req.file.path = path.join(uploadDir,req.file.filename);
    await fs.writeFile(req.file.path,b,{flag:'wx'});
    delete req.file.buffer;
    next();
  } catch(error) { next(error); }
})};
