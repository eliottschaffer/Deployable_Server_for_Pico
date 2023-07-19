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
  let hashedPassword = crypto.pbkdf2Sync(password, user.salt, 10000, 64, 'sha512').toString('hex');
  
  if (!crypto.timingSafeEqual(Buffer.from(user.hashed_password, 'hex'), Buffer.from(hashedPassword, 'hex'))) {
    return cb(null, false, { message: 'Incorrect username or password.' });
  }
  return cb(null, user);
}


module.exports.validPassword = validPassword;
module.exports.genPassword = genPassword;


