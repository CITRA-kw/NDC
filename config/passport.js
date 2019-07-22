// ********************************************* //
// Passport authentication section
// ********************************************* //

// following this tutorial for passport https://blog.risingstack.com/node-hero-node-js-authentication-passport-js/
// Tutorial for Passport.js authentication in a Node.js Express application https://www.jokecamp.com/tutorial-passportjs-authentication-in-nodejs/
// Helps me understanding how to structure the passport in the express framework https://andrejgajdos.com/authenticating-users-in-single-page-applications-using-node-passport-react-and-redux/
// Building a NodeJS Web App Using PassportJS for Authentication https://dev.to/gm456742/building-a-nodejs-web-app-using-passportjs-for-authentication-3ge2
// A must read article to understand the flow of Passport http://toon.io/understanding-passportjs-authentication-flow/
// So far my best source: https://github.com/manjeshpv/node-express-passport-mysql/blob/master/config/passport.js



/*
TO DO for the services pages,
if user is not logged in then: 
if(!req.user.id)
    res.status(500).send(); // Maybe error number 403 is better?
*/

const LocalStrategy = require('passport-local').Strategy;
var bcrypt = require('bcrypt'); // npm install --save bcrypt-nodejs && npm uninstall --save bcrypt

// load up the user model
var mysql = require('mysql2');
var dbconfig = require('config').get('dbConfig');

var connection = mysql.createConnection({
    host: dbconfig.get('host'),
    user: dbconfig.get('username'),
    password: dbconfig.get('password'),
    database: dbconfig.get('dbname')
});

connection.connect();


module.exports = function (passport) {

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
    
    
    // Test user
    /*var user = {
        username: 'test-user',
        passwordHash: bcrypt.hashSync("aa", bcrypt.genSaltSync(10)),
        id: 1
    }
    passport.use(new LocalStrategy( 
        (username, password, done) => {
            console.log("** Authentication **");

            if (username == user.username) {            }
            
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
    ));*/

    
    passport.use(
        new LocalStrategy(
            function (username, password, done) { // callback with email and password from our form
                //password = bcrypt.hashSync(password, 10);
                connection.connect();
                connection.query("SELECT * FROM users WHERE username = ?", [username], function (err, rows) {
                    if (err)
                        return done(err);
                    if (!rows.length) {
                        console.log("** User not found!");
                        return done(null, false/*, req.flash('loginMessage', 'No user found.')*/); // req.flash is the way to set flashdata using connect-flash
                    }

                    // if the user is found but the password is wrong
                    if (!bcrypt.compare(password, rows[0].password)) {
                        console.log("** Wrong password!");
                        console.log(password);
                        console.log(rows[0].password);
                        return done(null, false/*, req.flash('loginMessage', 'Oops! Wrong password.')*/); // create the loginMessage and save it to session as flashdata
                    }
                    // all is well, return successful user
                    return done(null, rows[0]);
                });
            })
    );
    
    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        console.log("** Serializing user: " + user.username);
        done(null, user);
    });

    // used to deserialize the user
    passport.deserializeUser(function(user, done) {
        //console.log("** Deserializing user: " + JSON.stringify(user));
        connection.connect();
        connection.query("SELECT * FROM users WHERE id = ? ",[user['ID']], function(err, rows){
            //console.log(this.sql);
            //console.log(rows);
            if(err) 
                done(err, null);
            else 
                done(err, rows[0]);
        });
    });
}
