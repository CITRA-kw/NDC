// ********************************************* //
// Passport authentication section
// ********************************************* //

// following this tutorial for passport https://blog.risingstack.com/node-hero-node-js-authentication-passport-js/
// Tutorial for Passport.js authentication in a Node.js Express application https://www.jokecamp.com/tutorial-passportjs-authentication-in-nodejs/
// Helps me understanding how to structure the passport in the express framework https://andrejgajdos.com/authenticating-users-in-single-page-applications-using-node-passport-react-and-redux/
// Building a NodeJS Web App Using PassportJS for Authentication https://dev.to/gm456742/building-a-nodejs-web-app-using-passportjs-for-authentication-3ge2
// A must read article to understand the flow of Passport http://toon.io/understanding-passportjs-authentication-flow/


/*
TO DO for the services pages,
if user is not logged in then: 
if(!req.user.id)
    res.status(500).send(); // Maybe error number 403 is better?
*/

const LocalStrategy = require('passport-local').Strategy;
var bcrypt = require('bcrypt-nodejs'); // npm install --save bcrypt-nodejs && npm uninstall --save bcrypt

module.exports = function (passport) {

    // Test user
    var user = {
        username: 'test-user',
        passwordHash: bcrypt.hashSync("aa", bcrypt.genSaltSync(10)),
        id: 1
    }

    /*
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
    */

    passport.use(new LocalStrategy(
        (username, password, done) => {
            console.log("** Authentication **");

            if (username == user.username) {
                
            }
            
            // User not found
            else if (!username) {
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

        }
    ));

    passport.serializeUser(function (user, done) {
        done(null, user.username);
    });

    passport.deserializeUser(function (id, done) {
        done(null, user.username);
        /*user.findById(id, function (err, user) {
            done(err, user);
        });*/
    });
}
