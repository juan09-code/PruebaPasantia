//Aqui procesamos datos
//importamos el encriptador
const bcrypt = require('bcryptjs');
//Creamos el como vamos a llamar
const helpers = {};

// creamos le encriptador donde pasamos le texto plano como argumento
helpers.encryptPassword = async (password) => {
    //el argumento es el numero de veces que se ejecutara el algoritmo de hash(entre mas veces mas demora pero mas seguro)
    //en resumen generamos un patron
    const salt = await bcrypt.genSalt(10);
    //pasamos la contrasenia y el patron para que se cifre la contrasenia
    const hash =  await bcrypt.hash(password, salt);
    return hash;
};

//Metodo para logeo la funcion que creamos se llama matchPassword
//que vera si la contrasena coincide
//Comparamos la contrasena que ingresan con al almacenada en la BDD
// si es verdadero enviara un true caso contrario un false o el error
helpers.matchPassword = async (password, savedPassword) => {
    try {
        return await bcrypt.compare(password, savedPassword);
    } catch (e) {
        console.log(e);
    }
};

module.exports = helpers;