// Passport, passport-local y express-session nos ayudan a la seguridad
// Metodos de autentificacion

//con la siguiente importacion elijo la autentificacion que quiero usar
const passport = require('passport');
//metodos para autenticarse con redes pero esta la usaremos con la misma bas de datos
const LocalStrategy = require('passport-local').Strategy
//solicitamos la conexcion al abase
const pool = require('../database')

const helpers = require('./helpers');

//Metodo para el login
passport.use('local.signin', new LocalStrategy({
    usernameField: 'cedula',
    passwordField: 'password',
    // no es necesario ya que no lo usaremos
    passReqToCallback: true
}, async (req, cedula, password, done) => {
    // console.log(req.body)
    // console.log(username)
    // console.log(password)
    // console.log(req.body);
    const rows = await pool.query('SELECT * FROM usuario WHERE cedula = ?', [cedula]);
    if (rows.length > 0) {
        const user = rows[0];
        //al igual que en helpers.js en la linea 20
        //pasamos al metodo la contrasena en texto plano que se ingreso y la que almacenamos de la base de datos
        const validPassword = await helpers.matchPassword(password, user.password)
        //console.log('Hola');
        //console.log(password,user.password);
        //console.log(validPassword);
        if (validPassword) {
            //Mandamos el mensaje emergente  que se mostrara despues del iniciop de sesion
            done(null, user, req.flash('messages2', 'Bienvenido ' + user.nombres));
            //En caso de no coincider la contrasena
            //mandamos null de ningun error, flase de que no hay usuario y mensaje
        } else {
            done(null, false, req.flash('messages', 'Contrasena invalida'));
            //---Luego de esto debemos ir a index.js para indicar que estos valores (message) existen
        }
        //en caso de no haber encontrado un usuario
    } else {
        return done(null, false, req.flash('messages', 'The Username does not exists.'));
    }
}));

//Metodo para Registrarse
// en use colocamos un nombre para la autenticacion, dentro de la instanciacion nueva LocalStrategy colocamos lo que vamos a recibir 
passport.use('local.signup', new LocalStrategy({
    //ponemos que recibimos y a traves de que campos recibimos en la vista signup
    usernameField: 'cedula',
    passwordField: 'password',
    //para recibir mas datos agregamos lo siguiente como el nombre ciudad etc
    //osea apra recibir el objeto request dentro de la funcion
    passReqToCallback: true
    // a continuacion ya acabado el objeto de configuracion luego de la coma va lo que va a hacer el suuario luego de autentificarse
    //esto lo seguimos con un callback es decir una funcion que se va a ejecutar despues del LocalStrategy
    // ponemos lo que recibimos y usamos y el done que nos da el pase que podemos continuar
}, async (req, cedula, password, done) => {
    //muestro por consola los datos
    console.log(req.body);
    const {
        nombres,
        apellidos,
        tipo_user,
        descripcion,
        foto = 'noFoto.jpg'
    } = req.body;
    const newUser = {
        //Js nos permite en lugar de poner a = a ponemos a,b,c pero importando c del req.body
        cedula,
        password,
        nombres,
        apellidos,
        descripcion,
        tipo_user,
        foto 
    };
    // antes de guardarlo lo ciframos
    newUser.password = await helpers.encryptPassword(password);
    //consulta a la base de datos
    const result = await pool.query('INSERT INTO usuario SET ?', [newUser])
    console.log(result);
    //le agregamos la propiedad de id al usuario para usarlo en la sesion
    newUser.id_user = result.insertId;
    //Retornamos el done para que continue la funcion de arriba
    // dentro del done retornamos null por ningun error y el usuario para almacenarlos en una sesion
    return done(null, newUser)
}));

//A continuacion usaremos el usuario que nos arroja de arriba para almacenarlos en la sesion
passport.serializeUser((user, done) => {
    done(null, user.id_user);
});
//metodo para deserializar el usuario guardado en la sesion
passport.deserializeUser(async (id_user, done) => {
    const rows = await pool.query('SELECT * FROM usuario WHERE id_user = ?', [id_user]);
    //Tomo el primer dato del arreglo porque ahi esta la informacion del usuario
    done(null, rows[0]);
});