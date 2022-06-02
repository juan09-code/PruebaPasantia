const express = require('express');
const morgan = require('morgan');
const exphbs = require('express-handlebars');
const path = require('path');
const helpers = require('handlebars-helpers')();
let nodemailer = require('nodemailer');

const session = require('express-session');
const validator = require('express-validator');
const passport = require('passport');
const flash = require('connect-flash');
const MySQLStore = require('express-mysql-session')(session);
const bodyParser = require('body-parser');
const { database } = require('./keys');
//pa el metodo pro
const Handlebars = require('handlebars')




const app = express();
require('./lib/passport')


app.set('port', process.env.PORT || 4000);
app.set('views', path.join(__dirname, 'views'));
app.engine('.hbs', exphbs({
    defaultLayout: 'main',
    layoutDir: path.join(app.get('views'), 'layouts'),
    partialsDir: path.join(app.get('views'), 'partials'),
    extname: '.hbs',
    helpers: require('./lib/handlebars')
}));
app.set('view engine', '.hbs');

// --------- inicio metodo pro
app.set('view engine', '.hbs')
Handlebars.registerHelper('ifeq', function (a, b, options) {
    if (a == b) { return options.fn(this); }
    return options.inverse(this);
});
// --------- fin metodo pro




// ---------- Middlewares aqui es donde hago que la app use lo que importo al inicio
app.use(session({
    secret: 'textocualquiera',
    //Para que no renueve la sesion
    resave: false,
    //para que no se vuelva a establecer la sesion
    saveUninitialized: false,
    //donde guardamos la sesion para no hacerlo en la memoria del servidor si no en la base de datos
    store: new MySQLStore(database)
}));
app.use(flash());


app.use(morgan('dev'));
app.use(express.urlencoded({ extended: false }));
app.use(express.json())




//static files
app.use(express.static(path.join(__dirname, 'public')));
app.use(passport.initialize());
//indicamos donde va a guardar los datos al passport
app.use(passport.session());


//variables globales

app.use((req, res, next) => {
    //llamamos el mensaje para que este disponible en todas las vistas
    app.locals.success = req.flash('success');
    //ya que indicamos que message tambien existe vamos a partials para agregar el mensaje en la vista en messages.hbs
    app.locals.message = req.flash('messages');
    app.locals.message2 = req.flash('messages2');
    //Variable para acceder al usuario
    app.locals.user = req.user;
    next();
});

//rutas
app.use(require('./routes'));
app.use(require('./routes/authentication'));
app.use('/links', require('./routes/links'));

//archivos publicos
app.use(express.static(path.join(__dirname, 'public')));

//encender nuestro servidor
app.listen(app.get('port'), () => {
    console.log('Server on port', app.get('port'));
});