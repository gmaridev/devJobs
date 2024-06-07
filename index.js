const mongoose = require('mongoose');
require('./config/db.js');

const express = require('express');
const exphbs = require('express-handlebars');
const router = require('./routes');
const path = require('path');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const bodyParser = require('body-parser');
const flash = require('connect-flash');
const passport = require('./config/passport.js')
const createError = require('http-errors')
// const MongoStore = require('connect-mongo')(session);

require('dotenv').config({path:'variables.env'});

const app = express();

//Habilitar body-parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));




app.engine('handlebars', exphbs.engine({
    defaultLayout: 'layout',
    helpers: require('./helpers/handlebars')
}))
app.set('view engine','handlebars')

//static files
app.use(express.static(path.join(__dirname,'public')));

app.use(cookieParser());

app.use(session({
    secret: process.env.SECRET,
    key: process.env.KEY,
    resave: false,
    saveUninitialized: false,
    // store: new MongoStore({ mongooseConnection: mongoose.connection })
    store: MongoStore.create({ mongoUrl: process.env.DATABASE})
    
}));

//Inicializar passport
app.use(passport.initialize());
app.use(passport.session())

//Alertas y Flash Messages
app.use(flash());

//Crear middleware
app.use((req, res, next) =>{
    res.locals.mensajes = req.flash();
    next();
});

app.use('/',router());

//404 página no existente
app.use((req, res, next) =>{
    next(createError(404,'No Encontrado'))
})
//Administración de los errores
app.use((error, req, res, next)=>{
    res.locals.mensaje = error.message;
    const status = error.status || 500;
    res.locals.status = status;
    res.status(status);
    console.log(error.status);
    res.render('error');
})

app.listen(process.env.PUERTO);

