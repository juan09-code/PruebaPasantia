const express = require('express');
const multer = require('multer');
const router = express.Router();
const path = require('path');
const {uuid} = require('uuidv4');

const {isLoggedIn, isNotLoggedIn} = require ('../lib/auth');

const helpers = require('../lib/helpers')






const storage =  multer.diskStorage({
    destination: path.join(__dirname, '../public/uploads'),
    filename: (req,file,cb)=>{
        
        cb(null,uuid()+path.extname(file.originalname).toLocaleLowerCase());
    }
});

const pool = require('../database');



router.post('/addUser',async (req, res)=>{
    tipo_user = 1;
    const{ nombres, apellidos, password,email}=req.body;
    const newUser = {
        nombres,
        apellidos,
        password,
        tipo_user,
        email
    };
    
    await pool.query('INSERT INTO usuario set ?',[newUser])
    res.send('received User');
});


const uploadIMG = multer({
    storage,
    dest: path.join(__dirname, 'public/uploads'),
    limits: {fileSize: 2000000},
    fileFilter: (req,file,cb) =>{
        const filetypes = /jpeg|jpg|png|gif/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname));
        if(mimetype  && extname){
            return cb(null,true);
        }
        cb("Error: Archivo debe ser una imagen valida");
    }
}).single('foto')




//Agregar Carrera
router.get('/addCarr',isLoggedIn,(req,res)=>{
    res.render('links/addCarrera');
});

router.post('/resCarrera',isLoggedIn,async (req, res)=>{
    const{ n_carrera, sede}=req.body;
    const newCarr = {
        n_carrera,
        sede
    };
    await pool.query('INSERT INTO carrera set ?',[newCarr])
    res.send('received Carrera');
});



//Ver 

router.get('/allcursos',isLoggedIn, async(req,res)=>{
const cursos =  await pool.query('select * from cursos');
    res.render('links/allcur',{cursos});
});

//Eliminar 

router.get('/deleteWeb/:id_webinar',isLoggedIn, async(req,res)=>{
    const {id_webinar} = req.params;
    
    if (req.user.tipo_user == 1){
        req.logOut();
        res.redirect('../signin');
    }else
        await pool.query('DELETE FROM webinar where id_webinar = ?',[id_webinar])
        res.redirect('/links/allwebinar')
});

router.get('/config', isLoggedIn, async(req,res)=>{
    const usuario =  await pool.query('select email,nombres,apellidos,password from usuario where id_user = ? ;',[req.user.id_user]);
    //usuario[0].password = await helpers.encryptPassword(usuario[0].password);
    //await helpers.matchPassword(password, user.password)
    console.log(usuario)
    res.render('links/config',{usuario2:usuario[0]})
})

router.post('/config', isLoggedIn, async(req,res)=>{
    const usuario =  await pool.query('select email,nombres,apellidos,password from usuario where id_user = ? ;',[req.user.id_user]);
    const {nombres,apellidos,oldpassword,newpassword} = req.body
    if(await helpers.matchPassword(oldpassword, usuario[0].password)){
        console.log("Son las mismas :)")
        newpassword2 = await helpers.encryptPassword(newpassword);
        console.log(newpassword2)
        const newDatos = {
            nombres,
            apellidos,
            password:newpassword2
        }
        console.log(newDatos)
        req.flash('messages2','Datos Actualizados correctamente');
        pool.query('UPDATE usuario set ? where id_user = ?', [newDatos,req.user.id_user])
    }
    else{
        req.flash('messages','Intente de nuevo, password incorrecto');
        console.log("No son las mismas :(")
    }

    
    res.redirect('/links/config')
})




router.post('/editUsers/:id_user', isLoggedIn, async(req,res)=>{
    const{id_user} = req.params;
    const {nombres,apellidos,tipo_user} = req.body
    const newDatos = {
        nombres,
        apellidos,
        tipo_user,
    }
    console.log(newDatos)
    req.flash('messages2', 'Usuario editado correctamente');
    pool.query('UPDATE usuario set ? where id_user = ?', [newDatos,id_user])
    res.redirect('/links/editUsers')
})

module.exports = router;