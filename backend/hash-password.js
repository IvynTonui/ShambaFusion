const bcrypt = require('bcrypt');

// The password you want to hash
const password = "matchakarak";

// Generate the hash
bcrypt.genSalt(10, function(err, salt) {
    bcrypt.hash(password, salt, function(err, hash) {
        // This is your hashed password that you'll store in the database
        console.log("Hashed password:", hash);
    });
});