//Metodo para saber si el user esta logeado
//Exportamos un objeto
//-- este metodo lo importamos en las rutas protegidas
module.exports = {
    //Para verificar en cada ruta si esta logeado
    isLoggedIn(req, res, next) {
        // el metodo isAuthenticated nos indica si existe la sesion del usuario es un metodo de req nos arroja true o false
        if (req.isAuthenticated()) {
            return next();
        }
        //si no esta logeado te manda a que lo hagas
        
        return res.redirect('/signin');
    },

    isNotLoggedIn(req, res, next) {
        // el metodo isAuthenticated nos indica si existe la sesion del usuario es un metodo de req nos arroja true o false
        if (!req.isAuthenticated()) {
            return next();
        }
        //si no esta logeado te manda a que lo hagas
        return res.redirect('/profile');
    }

};