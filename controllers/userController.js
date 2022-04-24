const db = require('../db');
const bcrypt = require('bcryptjs');
const passport = require('passport-local');

exports.login = (req, res) => {
    try {
        const {email, password} = req.body;

        //get hashed password for compare
        db.query("SELECT password FROM users WHERE email = ?", email, function(error, result, fields) {
            if (error) throw error;
            
            const hashedPassword = result;
            
            if(email || password) {
                //compare emails
                db.query('SELECT * FROM users WHERE email = ?', email, function(error, results, fields) {
                    if (error) throw (error );
                    if (results.length > 0) {
                        //compare password
                        if (bcrypt.compare(password, hashedPassword.toString())) {
                        req.session.loggedin = true;
                        
                        

                        req.session.email = email;
                        res.redirect('/');
                        }
                    } else {
                        res.send('Incorrect Username or Password');
                    }
                    res.end();
                });
            } else {
                res.send('Please enter Username and Password');
                res.end();
            }
        });
    } catch (error) {
        console.log(error);
    }
}

exports.register = (req, res) => {
    console.log(req.body);
    
    const {username, email, password, password2} = req.body;
    let errors = [];


    db.query('SELECT email FROM users WHERE email = ?', [email], async (error, result) => {
        if(error){
            console.log(error);
        }

        if(result.length > 0){
            errors.push({ msg: 'This email is already in use'});
            res.render('register', {
                errors
            });  
        } else if(password !== password2){
            errors.push({ msg: 'Passwords do not match'});
            res.render('register', {
                errors
            }); 
        }

            //salt for hashed password
            const saltRounds = 10;

            bcrypt.genSalt(saltRounds, function(err, salt) {
                bcrypt.hash(password, salt, function(err, hash) {
                    db.query('INSERT INTO users set ?', {username: username, email: email, password: hash, }, (error, result) => {

                        if(error){
                            console.log(error);
                        } else {
                            console.log(result);
                            errors.push({ msg: 'Success!' });
                            res.render('register', {
                                errors
                            }); 
                        }
                    })
                });
            });
            });
        }


exports.getLoggedInUser = (req, res) => {
    //get user id where session id = session id
}

        

    