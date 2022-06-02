const express = require('express');
const router = express.Router();
const pool = require('../database');
const {isLoggedIn, isNotLoggedIn} = require ('../lib/auth');
const helpers = require('../lib/helpers')
const multer = require('multer');
const path = require('path');
const {uuid} = require('uuidv4');

const storage =  multer.diskStorage({
    destination: path.join(__dirname, '../public/uploads'),
    filename: (req,file,cb)=>{
        
        cb(null,uuid()+path.extname(file.originalname).toLocaleLowerCase());
    }
});

const uploadIMG = multer({
    storage,
    dest: path.join(__dirname, 'public/uploads'),
    limits: {fileSize: 2000000},
    fileFilter: (req,file,cb) =>{
        const filetypes = /jpeg|jpg|png|PNG|gif/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname));
        if(mimetype  && extname){
            return cb(null,true);
        }
        cb("Error: Archivo debe ser una imagen valida");
    }
}).single('foto')


router.get('/admin', async(req,res)=>{
    res.render('admin');
});

router.get('/prueba_nav', async(req,res)=>{
    res.render('prueba_nav');
});

router.get('/about', async(req,res)=>{
    res.render('about');
});

router.get('/notas:id_curso:id_materia', isLoggedIn, async(req,res)=>{
    const {id_materia, id_curso} = req.params;
    const notas =  await pool.query('select nota1, nota2, nota3, nota4, nota5, nota6, nota7, nota8, nota9, nota10, promedio1, promedio2, promedio_f, nota_80, examen, examen_20, estado, usuario.cedula, usuario.nombres, usuario.apellidos , cedula from listado_cursos, usuario where id_curso = ? and id_materia = ? and listado_cursos.id_user = usuario.id_user;',[id_curso,id_materia,req.user.id_user]);
    res.render('notas',{notas});
});

router.get('/agregarCursos',isLoggedIn, async(req,res)=>{
    res.render('addCursos')
});

router.get('/somos', async(req,res)=>{
    res.render('somos');
});

router.get('/', async(req,res)=>{
    res.render('historia');
});



router.get('/vision', async(req,res)=>{
    res.render('vision');
});

router.get('/principios', async(req,res)=>{
    res.render('principiosInstitucionales');
});

router.post('/agregarCursos',async(req,res)=>{
    const{ grado,paralelo, jornada, periodo }=req.body;
    const newCurso = {
        grado,
        paralelo,
        jornada,
        periodo
    };
    console.log(newCurso);
    await pool.query('INSERT INTO cursos set ?',[newCurso])
    req.flash('messages2','Curso agregado correctamente');
    res.redirect('/agregarCursos');
});

router.get('/verUsuarios',async(req,res)=>{
    const usuarios =  await pool.query('select * from usuario;');
    console.log(usuarios)
    res.render('listUsers',{usuarios})
});

//////////////////GESTION MATERIA
/*ingresar materia*/
router.get('/ingresarMateria',async(req,res)=>{
    res.render('ingresarMateria');
});

router.post('/ingresarMateriaP',async(req,res)=>{
    const{ n_materia }=req.body;
    const newMateria = {
        n_materia
    };
    console.log(newMateria);
    await pool.query('INSERT INTO materias set ?',[newMateria])
    req.flash('messages2','Curso agregado correctamente');
    res.redirect('/ingresarMateria');
});

//ver todas las materias Admin
router.get('/adminAllMaterias', async(req,res)=>{
    const materiasadmin =  await pool.query('Select profesores_materias.id_profesor_materia, profesores_materias.id_materia, profesores_materias.id_user, profesores_materias.id_curso, usuario.nombres, usuario.apellidos,materias.n_materia, cursos.grado, cursos.paralelo, cursos.periodo from profesores_materias, usuario, materias, cursos WHERE profesores_materias.id_materia = materias.id_materia and profesores_materias.id_user = usuario.id_user and profesores_materias.id_curso = cursos.id_curso ORDER BY profesores_materias.id_profesor_materia;');
    console.log(materiasadmin)
    res.render('adminEditarEliminarMateria',{materiasadmin})
})

//eliminar materia admin
router.get('/adminDestroyMateria:id_profesor_materia', async(req,res)=>{
    const {id_profesor_materia} = req.params;
    console.log(id_profesor_materia);
    
    if (req.user.tipo_user == 3){
        await pool.query('DELETE FROM profesores_materias WHERE id_profesor_materia = ?',[id_profesor_materia])
        res.redirect('/adminAllMaterias')
    }else{
        req.logOut();
        res.redirect('../signin');
    }
});

router.post('/addCursoAdmin', isLoggedIn, async(req,res)=>{
    const{ id_materia,id_user,id_curso }=req.body; 
    
    req.flash('messages2', 'Curso agregado correctamente');
    await pool.query(`INSERT INTO profesores_materias (id_profesor_materia, id_materia, id_user, id_curso)
    VALUES (NULL, ?, ?, ?)`,[id_materia,id_user,id_curso]);
    res.redirect("/profile");

})

//editar materia admin
router.get('/adminEditMateria:id_materia',isLoggedIn,async(req,res)=>{
    const {id_materia} = req.params;
    const materia = await pool.query('SELECT * from profesores_materias WHERE id_materia = ?;',[id_materia])
    //const webinar =  await pool.query('SELECT id_webinar,webinar.id_carrera,title,n_sesion,webinar.descripcion,fecha,img,webinar.id_expositor , carrera.n_carrera , expositores.nombre , expositores.apellido FROM webinar,carrera,expositores where webinar.id_carrera = carrera.id_carrera and webinar.id_expositor = expositores.id_expositor and id_webinar  = ?;',[id_webinar]);
    if (req.user.tipo_user == 3){
        console.log(materia)
        res.render('adminEditarMateria',{materia});
        //res.send(materia)
    }else{
        //res.render('links/editCursos',{webinar,expositores,carreras,webinar2:webinar[0]});
        req.logOut();
        res.redirect('../signin');
    }    
        
});

router.post('/adminEditarMateriaP',async(req,res)=>{
    const{ id_materia, n_materia }=req.body;
    const newMateria = {
        n_materia
    };
    req.flash('messages2', 'Materia editada correctamente');
    pool.query('UPDATE materias set ? where id_materia = ?', [newMateria,id_materia])
    res.redirect('/allMaterias')
});



//ver todas las materias
router.get('/allMaterias', async(req,res)=>{
    const materias =  await pool.query('select * from materias;');
    console.log(materias)
    res.render('todasMaterias',{materias})
})

//eliminar materia
router.get('/destroyMateria:id_materia', async(req,res)=>{
    const {id_materia} = req.params;
    console.log(id_materia);
    
    if (req.user.tipo_user == 3){
        await pool.query('DELETE FROM materias where id_materia = ?',[id_materia])
        res.redirect('/allMaterias')
    }else{
        req.logOut();
        res.redirect('../signin');
    }
});



//editar materia
router.get('/editMateria:id_materia',isLoggedIn,async(req,res)=>{
    const {id_materia} = req.params;
    const materia = await pool.query('SELECT * from materias WHERE id_materia = ?;',[id_materia])
    //const webinar =  await pool.query('SELECT id_webinar,webinar.id_carrera,title,n_sesion,webinar.descripcion,fecha,img,webinar.id_expositor , carrera.n_carrera , expositores.nombre , expositores.apellido FROM webinar,carrera,expositores where webinar.id_carrera = carrera.id_carrera and webinar.id_expositor = expositores.id_expositor and id_webinar  = ?;',[id_webinar]);
    if (req.user.tipo_user == 3){
        console.log(materia)
        res.render('editarMateria',{materia});
        //res.send(materia)
    }else{
        //res.render('links/editCursos',{webinar,expositores,carreras,webinar2:webinar[0]});
        req.logOut();
        res.redirect('../signin');
    }    
        
});

router.post('/editarMateriaP',async(req,res)=>{
    const{ id_materia, n_materia }=req.body;
    const newMateria = {
        n_materia
    };
    req.flash('messages2', 'Materia editada correctamente');
    pool.query('UPDATE materias set ? where id_materia = ?', [newMateria,id_materia])
    res.redirect('/allMaterias')
});

router.get('/admin/deleteUsers:id_user',isLoggedIn, async(req,res)=>{
    const{id_user} = req.params;
    await pool.query('DELETE FROM usuario where id_user = ?', [id_user]);
    req.flash('messages','Se elimino correctamente al usuario');
    res.redirect("/verUsuarios");
});


router.get('/proceso', async(req,res)=>{
    res.render('proceso');
});



//gestion notas

//ver notas del primer parcial
router.get('/gestionNotasPrimerParcial:id_curso:id_materia', async(req,res)=>{
    const{id_curso,id_materia} = req.params;
    
    const notas = await pool.query('SELECT listado_cursos.id_user, listado_cursos.id_curso, listado_cursos.id_materia,usuario.apellidos, usuario.nombres, listado_cursos.nota1, listado_cursos.nota2, listado_cursos.nota3, listado_cursos.nota4, listado_cursos.nota5, listado_cursos.promedio1 FROM usuario,listado_cursos WHERE usuario.id_user = listado_cursos.id_user AND listado_cursos.id_curso = ? AND listado_cursos.id_materia = ? ORDER BY usuario.apellidos;' ,[id_curso,id_materia]);
    console.log(notas);
    //tipo usuario=2, es profesor
    if (req.user.tipo_user == 2){
        console.log(notas);
        res.render('gestionNotasPrimerParcial',{notas});
        //res.send(notas)
    }else{
        //res.render('links/editCursos',{webinar,expositores,carreras,webinar2:webinar[0]});
        req.logOut();
        res.redirect('../signin');
    }  
});

//ver notas del primer parcial para editar de un estudiante en particular
router.get('/editarNotaPrimerParcial:id_user:id_curso:id_materia', async(req,res)=>{
    const{id_user,id_curso,id_materia} = req.params;
    
    const notas = await pool.query(`SELECT listado_cursos.id_user, listado_cursos.id_curso, listado_cursos.id_materia, usuario.apellidos, usuario.nombres, listado_cursos.nota1, listado_cursos.nota2, listado_cursos.nota3, listado_cursos.nota4, listado_cursos.nota5
    FROM usuario,listado_cursos
    WHERE usuario.id_user = listado_cursos.id_user
    AND listado_cursos.id_curso = ?
    AND listado_cursos.id_materia = ? 
    AND listado_cursos.id_user = ? ;`,
    [id_curso,id_materia,id_user]);
   
    //console.log(notas);
    //tipo usuario=2, es profesor
    if (req.user.tipo_user == 2){
        //console.log(notas);
        res.render('editarNotaPrimerParcial',{notas});
        //res.send(notas);
    }else{
        //res.render('links/editCursos',{webinar,expositores,carreras,webinar2:webinar[0]});
        req.logOut();
        res.redirect('../signin');
    }  
});

router.post('/updateNotaP1',async(req,res)=>{
    const{ id_user, id_curso, id_materia,nota1,nota2,nota3,nota4,nota5}=req.body;
    
    req.flash('messages2', 'Nota editada correctamente');
    
    pool.query('CALL ingresarNotasPrimerParcial(?,?,?,?,?,?,?,?);', 
    [nota1,nota2,nota3,nota4,nota5,id_curso,id_materia,id_user]);
    
    res.redirect('/gestionNotasPrimerParcial'+id_curso+id_materia);
});

//ver notas del segundo parcial
router.get('/gestionNotasSegundoParcial:id_curso:id_materia', async(req,res)=>{
    const{id_curso,id_materia} = req.params;
    
    const notas = await pool.query('SELECT listado_cursos.id_user, listado_cursos.id_curso, listado_cursos.id_materia,usuario.apellidos, usuario.nombres, listado_cursos.nota6, listado_cursos.nota7, listado_cursos.nota8, listado_cursos.nota9, listado_cursos.nota10, listado_cursos.promedio2 FROM usuario,listado_cursos WHERE usuario.id_user = listado_cursos.id_user AND listado_cursos.id_curso = ? AND listado_cursos.id_materia = ? ORDER BY usuario.apellidos;' ,[id_curso,id_materia]);
    console.log(notas);
    //tipo usuario=2, es profesor
    if (req.user.tipo_user == 2){
        console.log(notas);
        res.render('gestionNotasSegundoParcial',{notas});
        //res.send(notas)
    }else{
        //res.render('links/editCursos',{webinar,expositores,carreras,webinar2:webinar[0]});
        req.logOut();
        res.redirect('../signin');
    }  
});

//ver notas del segundo parcial para editar de un estudiante en particular
router.get('/editarNotaSegundoParcial:id_user:id_curso:id_materia', async(req,res)=>{
    const{id_user,id_curso,id_materia} = req.params;
    
    const notas = await pool.query(`SELECT listado_cursos.id_user, listado_cursos.id_curso, listado_cursos.id_materia, usuario.apellidos, usuario.nombres, listado_cursos.nota6, listado_cursos.nota7, listado_cursos.nota8, listado_cursos.nota9, listado_cursos.nota10
    FROM usuario,listado_cursos
    WHERE usuario.id_user = listado_cursos.id_user
    AND listado_cursos.id_curso = ?
    AND listado_cursos.id_materia = ? 
    AND listado_cursos.id_user = ? ;`,
    [id_curso,id_materia,id_user]);
   
    //console.log(notas);
    //tipo usuario=2, es profesor
    if (req.user.tipo_user == 2){
        //console.log(notas);
        res.render('editarNotaSegundoParcial',{notas});
        //res.send(notas);
    }else{
        //res.render('links/editCursos',{webinar,expositores,carreras,webinar2:webinar[0]});
        req.logOut();
        res.redirect('../signin');
    }  
});


router.post('/updateNotaP2',async(req,res)=>{
    const{ id_user, id_curso, id_materia,nota6,nota7,nota8,nota9,nota10}=req.body;
    
    req.flash('messages2', 'Nota editada correctamente');
    
    pool.query('CALL ingresarNotasSegundoParcial(?,?,?,?,?,?,?,?);', 
    [nota6,nota7,nota8,nota9,nota10,id_curso,id_materia,id_user]);
    
    res.redirect('/gestionNotasSegundoParcial'+id_curso+id_materia);
});


//nota examen
//ver 
router.get('/gestionNotaExamen:id_curso:id_materia', async(req,res)=>{
    const{id_curso,id_materia} = req.params;
    
    const notas = await pool.query(`SELECT listado_cursos.id_user, listado_cursos.id_curso, 
    listado_cursos.id_materia,usuario.apellidos, usuario.nombres, listado_cursos.examen, listado_cursos.promedio_f 
    FROM usuario,listado_cursos 
    WHERE usuario.id_user = listado_cursos.id_user AND listado_cursos.id_curso = ? 
    AND listado_cursos.id_materia = ? ORDER BY usuario.apellidos;` ,[id_curso,id_materia]);
    
    
    //console.log(notas);
    //tipo usuario=2, es profesor
    if (req.user.tipo_user == 2){
        console.log(notas);
        res.render('gestionNotaExamen',{notas});
        //res.send(notas)
    }else{
        //res.render('links/editCursos',{webinar,expositores,carreras,webinar2:webinar[0]});
        req.logOut();
        res.redirect('../signin');
    }  
});

router.get('/editarNotaExamen:id_user:id_curso:id_materia', async(req,res)=>{
    const{id_user,id_curso,id_materia} = req.params;
    
    const notas = await pool.query(`SELECT listado_cursos.id_user, listado_cursos.id_curso, listado_cursos.id_materia, usuario.apellidos, usuario.nombres, listado_cursos.examen
    FROM usuario,listado_cursos
    WHERE usuario.id_user = listado_cursos.id_user
    AND listado_cursos.id_curso = ?
    AND listado_cursos.id_materia = ? 
    AND listado_cursos.id_user = ? ;`,
    [id_curso,id_materia,id_user]);
   
    //console.log(notas);
    //tipo usuario=2, es profesor
    if (req.user.tipo_user == 2){
        //console.log(notas);
        res.render('editarNotaExamen',{notas});
        //res.send(notas);
    }else{
        //res.render('links/editCursos',{webinar,expositores,carreras,webinar2:webinar[0]});
        req.logOut();
        res.redirect('../signin');
    }  
});

router.post('/updateNotaExamen',async(req,res)=>{
    const{ id_user, id_curso, id_materia,examen}=req.body;
    
    req.flash('messages2', 'Nota editada correctamente');
    
    pool.query('CALL ingresarNotaExamen(?,?,?,?);', 
    [examen,id_curso,id_materia,id_user]);
    
    res.redirect('/gestionNotaExamen'+id_curso+id_materia);
});

router.get('/addCurso',isLoggedIn, async(req,res)=>{
    userData = await pool.query('SELECT * from usuario where id_user = ?',[req.user.id_user])
    materiasData = await pool.query('SELECT * from materias')
    cursosData = await pool.query('SELECT * from cursos')
    res.render("addCurso",{userData:userData[0],materiasData,cursosData});
})

router.post('/addCurso', isLoggedIn, async(req,res)=>{
    const{ id_materia,id_curso }=req.body;
    const newCurso = {
        id_materia,
        id_curso,
        id_user:req.user.id_user
    };
    console.log(newCurso);
    req.flash('messages2', 'Curso agregado correctamente');
    await pool.query('INSERT INTO profesores_materias set ?',[newCurso]);
    res.redirect("/allCurso");

})

//ADMIN

router.get('/adminCursos',isLoggedIn, async(req,res)=>{
    userData = await pool.query('SELECT * from usuario where tipo_user = 2 ')
    materiasData = await pool.query('SELECT * from materias')
    cursosData = await pool.query('SELECT * from cursos')
    res.render("adminAddCurso",{userData,materiasData,cursosData});
})

router.get('/allCurso',isLoggedIn, async(req,res)=>{
    cursosData = await pool.query('select profesores_materias.id_materia, profesores_materias.id_curso, grado, jornada, paralelo, periodo, n_materia, apellidos, nombres from cursos, materias, usuario, profesores_materias where cursos.id_curso = profesores_materias.id_curso AND usuario.id_user = profesores_materias.id_user and materias.id_materia = profesores_materias.id_materia and profesores_materias.id_user = ?',[req.user.id_user])
    res.render("CursosProfesor",{cursosData});
})


router.get('/settings', isLoggedIn, async(req,res)=>{
    const usuario =  await pool.query('select cedula,nombres,apellidos,password from usuario where id_user = ? ;',[req.user.id_user]);
    console.log(usuario)
    res.render('settings',{usuario2:usuario[0]})
})

router.post('/settings', isLoggedIn, async(req,res)=>{
    const usuario =  await pool.query('select cedula,nombres,apellidos,password from usuario where id_user = ? ;',[req.user.id_user]);
    const {nombres,apellidos,oldpassword,newpassword} = req.body
    if (await helpers.matchPassword(oldpassword, usuario[0].password)){
        if(newpassword){
            newpassword2 = await helpers.encryptPassword(newpassword);
            const newDatos = {
                nombres,
                apellidos,
                password:newpassword2
            }
            console.log(newDatos)
            req.flash('messages2','Datos y contraseña actualizados correctamente');
            pool.query('UPDATE usuario set ? where id_user = ?', [newDatos,req.user.id_user])
        }
        else{
            const newDatos = {
                nombres,
                apellidos
            }
            req.flash('messages2','Datos actualizados correctamente');
            pool.query('UPDATE usuario set ? where id_user = ?', [newDatos,req.user.id_user])
        }
    }
    else{
        req.flash('messages','Intente de nuevo, password actual incorrecto');
    }
    res.redirect('/settings')
})


router.get('/actualizarIMG', isLoggedIn, async(req,res)=>{
    const usuario =  await pool.query('select foto,nombres,apellidos from usuario where id_user = ? ;',[req.user.id_user]);
    res.render('actualizarIMG',{usuario2:usuario[0]})
})


router.post('/actualizarIMG',isLoggedIn,uploadIMG,async (req, res)=>{
    const foto = req.file.filename;
    const newIMG = {
        foto
    };
    await pool.query('UPDATE usuario set ? where id_user = ?',[newIMG,req.user.id_user])
    req.flash('messages2','Imagen actualizada correctamente');
    res.redirect('/actualizarIMG')
});


//gestion agregar alumno a materia
router.get('/agregarAlumnoMateria/:id_curso/:id_materia', isLoggedIn, async(req,res)=>{
    const{id_curso,id_materia} = req.params;
    //variables globales
    var hbs = require("handlebars");
    var myGlobal = {
    id_c: id_curso, 
    id_m: id_materia 
    };

    hbs.registerHelper('global', function(key){
    return myGlobal[key];
    });
    

    const alumnos = await pool.query(`SELECT DISTINCT usuario.id_user, usuario.cedula, usuario.nombres, usuario.apellidos
    FROM usuario, listado_cursos
    WHERE usuario.tipo_user=1 
    AND usuario.id_user NOT IN (SELECT listado_cursos.id_user
                                FROM listado_cursos
                                WHERE listado_cursos.id_curso=?
                                AND listado_cursos.id_materia=?);`,[id_curso,id_materia])
    if (req.user.tipo_user == 2){
        res.render('agregarAlumnoMateria',{alumnos});
    }else{
        req.logOut();
        res.redirect('../signin');
    }  
});


router.get('/agregarEstudiante/:id_curso/:id_materia/:id_user', isLoggedIn, async(req,res)=>{
    const{id_curso,id_materia,id_user} = req.params;
    if (req.user.tipo_user == 2){
        pool.query('CALL insertarCabeceraNotas(?,?,?);', 
        [id_curso,id_materia,id_user]);
        res.redirect('/agregarAlumnoMateria/'+id_curso+"/"+id_materia);        
    }else{
        req.logOut();
        res.redirect('../signin');
    }
    
    
});

router.post('/buscarAlumno',isLoggedIn,async(req,res)=>{
    const{txtApellidos,id_curso,id_materia}=req.body;
    var sql=`SELECT DISTINCT usuario.id_user, usuario.cedula, usuario.nombres, usuario.apellidos
    FROM usuario, listado_cursos
    WHERE usuario.tipo_user=1 
    AND usuario.id_user NOT IN (SELECT listado_cursos.id_user
                                FROM listado_cursos
                                WHERE listado_cursos.id_curso=`;
    sql=sql+id_curso+" AND listado_cursos.id_materia="+id_materia;
    sql+= ") AND (usuario.apellidos LIKE '"+ txtApellidos +"' OR ";
    sql+= "usuario.apellidos LIKE '"+ txtApellidos +" %' OR ";
    sql+= "usuario.apellidos LIKE '% "+ txtApellidos +" %' OR ";
    sql+= "usuario.apellidos LIKE '% "+ txtApellidos +"' )";
    
    //variables globales
    var hbs = require("handlebars");
    var myGlobal = {
    id_c: id_curso, 
    id_m: id_materia 
    };

    hbs.registerHelper('global', function(key){
    return myGlobal[key];
    });
    

    const alumnos = await pool.query(sql);
    if (req.user.tipo_user == 2){
        res.render('agregarAlumnoMateria',{alumnos});
    }else{
        req.logOut();
        res.redirect('../signin');
    }

});


router.post('/buscarAlumnoCedula', isLoggedIn,async(req,res)=>{


    const{txtCedula,id_curso,id_materia}=req.body;


    var sql=`SELECT DISTINCT usuario.id_user, usuario.cedula, usuario.nombres, usuario.apellidos
    FROM usuario, listado_cursos
    WHERE usuario.tipo_user=1 
    AND usuario.id_user NOT IN (SELECT listado_cursos.id_user
                                FROM listado_cursos
                                WHERE listado_cursos.id_curso=`;
    sql=sql+id_curso+" AND listado_cursos.id_materia="+id_materia;


    sql+= ") AND (usuario.cedula LIKE '"+ txtCedula +"' OR ";
    sql+= "usuario.cedula LIKE '"+ txtCedula +" %' OR ";
    sql+= "usuario.cedula LIKE '% "+ txtCedula +" %' OR ";
    sql+= "usuario.cedula LIKE '% "+ txtCedula +"' )";



    //variables globales
    var hbs = require("handlebars");
    var myGlobal = {
    id_c: id_curso, 
    id_m: id_materia 
    };

    hbs.registerHelper('global', function(key){
    return myGlobal[key];
    });


    const alumnos = await pool.query(sql);
    //console.log(notas);
    //tipo usuario=2, es profesor
    if (req.user.tipo_user == 2){
        res.render('agregarAlumnoMateria',{alumnos});
        //res.send(notas);
    }else{
        //res.render('links/editCursos',{webinar,expositores,carreras,webinar2:webinar[0]});
        req.logOut();
        res.redirect('../signin');
    }

});

router.get('/crearEstudiante', async(req,res)=>{
    res.render('crearEstudiante');
});

router.get('/crearUsuarios', async(req,res)=>{
    res.render('crearUsuarios');
});


router.post('/signupEstudiante', isLoggedIn, async(req,res)=>{
    const{ cedula,nombres,apellidos,password}=req.body;

    const newpassword2 = await helpers.encryptPassword(password);
    
    req.flash('messages2', 'Estudiante agregado');
    
    pool.query(`INSERT INTO usuario (id_user, cedula, nombres, apellidos, password, descripcion, tipo_user, foto) 
    VALUES (NULL, ?, ?, ?, ?, 'estudiante', '1', 'noFoto.jpg');`, 
    [cedula,nombres,apellidos,newpassword2]);
    
    res.redirect('/allCurso');

})

router.post('/signupUsuario', isLoggedIn, async(req,res)=>{
    const{ cedula,nombres,apellidos,password,descripcion,tipo_user}=req.body;

    const newpassword2 = await helpers.encryptPassword(password);
    
    req.flash('messages2', 'Usuario agregado');
    
    pool.query(`INSERT INTO usuario (id_user, cedula, nombres, apellidos, password, descripcion, tipo_user, foto) 
    VALUES (NULL, ?, ?, ?, ?, ?, ?, 'noFoto.jpg');`, 
    [cedula,nombres,apellidos,newpassword2,descripcion,tipo_user]);
    
    res.redirect('/profile');

})




module.exports = router;
