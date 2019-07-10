const LocalStrategy = require('passport-local').Strategy;
var bcrypt = require('bcrypt-nodejs'); // npm install --save bcrypt-nodejs && npm uninstall --save bcrypt

module.exports = function (passport) {

    // Test user
    var user = {
        username: 'test-user',
        passwordHash: bcrypt.hashSync("aa", bcrypt.genSaltSync(10)),
        id: 1
    }


    passport.use(new LocalStrategy(
        (username, password, done) => {
            console.log("** Authentication **");
            findUser(username, (err, user) => {
                if (err) {
                    console.log("** Authenticate - Error... ");
                    return done(err)
                }

                // User not found
                if (!user) {
                    console.log("** Authenticate - username not found - user: " + username);
                    return done(null, false, {
                        message: 'No user found'
                    });
                }

                // Always use hashed passwords and fixed time comparison
                bcrypt.compare(password, user.passwordHash, (err, isValid) => {
                    if (err) {
                        return done(err)
                    }
                    if (!isValid) {
                        return done(null, false, {
                            message: 'Wrong password'
                        });
                    }
                    console.log("** Authenticate - Login success for user: " + username);
                    return done(null, user);
                })
            })
        }
    ));

    passport.serializeUser(function (user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function (id, done) {
        User.findById(id, function (err, user) {
            done(err, user);
        });
    });
}
