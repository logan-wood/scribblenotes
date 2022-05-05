const express = require('express');
const flash = require('connect-flash');
const session = require('express-session');
const dotenv = require('dotenv');
const fileUpload = require('express-fileupload');
const bodyParser = require('body-parser');
const passport = require('passport')

dotenv.config({ path: './.env'});

//import database 
const db = require('./db');

db.connect((err) => {
    if(err){
        throw err;
    }
    console.log('Connected');
});

//initiate express
const app = express();

//body-parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));

//to grab data from forms- parsing url encoded bodies as sent by html forms
app.use(express.urlencoded({ extended: false}));

//Values that we grab from form comes as JSON
app.use(express.json());

//Add routes
const mainRoutes = require('./routes/mainRoutes');
const user = require('./routes/user');
const admin = require('./routes/admin');

//Register View engine
app.set('view engine', 'ejs');

//Add sessions
app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: false
}));

//passport
require('./auth/passport')(passport)
app.use(passport.initialize());
app.use(passport.session());

app.use(flash());

// //static files
app.use(express.static('views'));

//use fileupload
app.use(fileUpload());

//Use routes
app.use(mainRoutes);
app.use('/user', user);
app.use('/admin', admin)

//listen for requests
const port = process.env.PORT || 3000
app.listen(port);
console.log("App listening on http://localhost:%d", port)

// 404
app.use((req, res) => {
    //res.send('<p>about</p>');
    res.status(404).render('404', { title: '404'});
});