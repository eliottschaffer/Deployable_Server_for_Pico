const crypto = require('crypto');

//TODO
function genPassword(password) {
    var salt = crypto.randomBytes(32).toString('hex');
    var genHash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');

    return{
        salt: salt,
        hash: genHash
    };
}

function validPassword(password, user, cb){
     crypto.pbkdf2(password, user.salt, 310000, 32, 'sha256', (err, hashedPassword) => {
        if (err) { return cb(err); }
        if (!crypto.timingSafeEqual(Buffer.from(user.hashed_password, 'hex'), hashedPassword)) {
          return cb(null, false, { message: 'Incorrect username or password.' });
        }
        return cb(null, user);
      });
}


module.exports.validPassword = validPassword;
module.exports.genPassword = genPassword;


