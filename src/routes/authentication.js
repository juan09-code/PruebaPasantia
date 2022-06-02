// Aqui vamos a poder agregar otras urls
// que es donde se van a mandar o rediriguir lso datos de formularios
const express = require('express');
const { Passport } = require('passport');
const router = express.Router();
//importamos
const passport = require('passport')
//importacion del metodo de auth.js para proteger rutas
const {isLoggedIn, isNotLoggedIn} = require ('../lib/auth');

// Ruta para rendizar el formulario de inicio de sesion
router.get('/signin',isNotLoggedIn, (req, res) => {
    res.render('auth/signin');
});

// Ruta para recivir los datos del formulario de inicio de sesion
router.post('/signin', (req, res, next) => {
    //proceso de autentificacion con el nombre y lo que hara como argumentos
    passport.authenticate('local.signin', {
        successRedirect: '/profile',
        failureRedirect: '/signin',
        failureFlash: true
    })(req, res, next);
});

// Ruta para rendizar el formulario de registro
router.get('/signup',isNotLoggedIn, (req, res) => {
    res.render('auth/signup');
});

// Ruta para recivir los datos del formulario de registro
router.post('/signup',isNotLoggedIn, passport.authenticate('local.signup', {
    //redireccionamos al usuario si aun no esta logeado a una vista (el metodo que hace esto esta en passport.js)
    successRedirect: '/profile',
    //si falla haremos lo siguiente
    failureRedirect: '/signup',
    failureFlash: true
}));

// Ruta para el perfil
//ponemos la funcion isLoggedIn que creamos en .lib/auth.js para que se ejecute antes
router.get('/profile', isLoggedIn, (req, res) => {
    // por lo tanto si isLoggedIn nos da true continua con este codigo, caso contrario redirecciona a signin como esta en el auth.js
    // es decir redirecciona al metodo de la linea 12 de este js
    res.render('profile');
});


//Para Cerrar sesion
router.get('/logout', (req, res) =>{
    req.logOut();
    res.redirect('/signin');
});

module.exports = router;