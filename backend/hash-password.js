// Optional local utility. Never hardcode an account password here.
const bcrypt = require('bcrypt');
if (!process.env.PASSWORD_TO_HASH) { console.error('Set PASSWORD_TO_HASH privately in your shell.'); process.exitCode = 1; } else { bcrypt.hash(process.env.PASSWORD_TO_HASH, 10).then(hash => console.log(hash)).catch(() => { process.exitCode = 1; }); }
