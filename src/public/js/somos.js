//variables
const perfil={
    src:["/images/Rectora.jpeg", "/images/secretaria.jpeg", "/images/inspector.jpeg"],
    titulo:["MSc. María del Carmen Calderón M.", "LCDA ELIANA JANINA ESPINOZA MOREJÓN", "LCDO PONCE TRUJILLO ROY ADRIÁN"],
    cargo:["MAGISTER EN EDUCACIÓN UNIVERSITARIA Y ADMINISTRACIÓN EDUCATIVA.", "DIPLOMADO EN NEURIPSICOPEDAGOGIA – INFANTIL", "LICENCIADO EN CIENCIAS DE LA EDUCACIÓN MENCIÓN INGLES"],
    descripcion:["LICENCIADA EN CIENCIAS DE LA EDUCACIÓN MENCIÓN INGLES Y FRANCESES ", "LICENCIADA EN CIENCIAS DE LA EDUCACIÓN MENCIÓN PRIMARIA","LICENCIADA EN CIENCIAS DE LA EDUCACIÓN "]
}

const redes_sociales={
    href:["#", "#", "#", "#"],
    class:["fa fa-facebook-square", "fa fa-twitter-square", "fa fa-google-plus-square", "fa fa-github-square"], 
    aria:["true", "true", "true", "true"]
}





function cargarPefil(){
    var texto="";
    for(var i=0; i<perfil.src.length; i++){
        texto+=`<section class="box">
        <img src="${perfil.src[i]}" width="180" alt="" class="box-img">
        <h1>${perfil.titulo[i]}</h1>
        <h2>${perfil.cargo[i]}</h2>
        <p>${perfil.descripcion[i]}</p>        
      </section>`;
    }
    return texto;
};

document.getElementById("prueba").innerHTML=cargarPefil();