const LocalStrategy = require('passport-local').Strategy;
const db = require('../db');
const bcrypt = require('bcryptjs');
const passport = require('passport')

module.exports = function(passport) {
    passport.use(new LocalStrategy( { usernameField: "email", passwordField: "password" }, function(email, password, done) {
        //find user
        db.query("SELECT * FROM users WHERE email = ?", [ email ], function(error, result) {
            if (error) { return done(err); }
            if (!result[0]) {
              console.log("user object doesn't exists") 
              return done(null, false);
             }
      
            //verify password
            const hashedPassword = result[0].password;
            if (!bcrypt.compareSync(password, hashedPassword.toString())) {
              console.log('incorrect password')
                return done(null, false);
            }
            
            return done(null, result[0]);
        });
    }));
};



passport.serializeUser(function(user, cb) {
  process.nextTick(function() {
      cb(null, { id: user.user_id, email: user.email, username: user.username, credits: user.credits, stripe_id: user.stripe_cust_id, subscription: user.subscription });
  });
});

passport.deserializeUser(function(user, cb) {
  process.nextTick(function() {
    return cb(null, user);
  });
});


