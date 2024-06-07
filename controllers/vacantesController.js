//Importar el modelo Vacante
const mongoose  = require('mongoose')
const Vacante = mongoose.model('Vacante')
const multer = require('multer');
const shortid = require('shortid')
const {check, validationResult} = require('express-validator');
const { cerrarSesion } = require('./authController');
exports.formularioNuevaVacante = (req,res) => {
    res.render('nueva-vacante',{
        nombrePagina: 'Nueva vacante',
        tagline:'Llena el formulario y publica tu vacante',
        cerrarSesion:true,
        nombre: req.user.nombre,
        imagen:req.user.imagen,
    })
}

//Método Agregar Vacantes
exports.agregarVacante = async (req, res) => {
    //Mapear los campos
    const vacante = new Vacante(req.body)

    //Autor de la vacante
    vacante.autor = req.user._id;


    //Crear arreglo de Skills
    vacante.skills = req.body.skills.split(',')
   
    //Almacenarlo en la base de datos
    const  nuevaVacante = await vacante.save()

    //Redireccionar
    res.redirect(`/vacantes/${nuevaVacante.url}`)
}

//Mostrar una vacante
exports.mostrarVacante = async(req, res, next) => {
    //Pasar una vacante
    const vacante = await Vacante.findOne({url:req.params.url}).populate('autor').lean();
    if(!vacante) return next();

    res.render('vacante', {
        vacante,
        nombrePagina: vacante.titulo,
        cerrarSesion:true,
        nombre: req.user.nombre,
        imagen:req.user.imagen,
        
    })
}

exports.editarVacante = async (req, res, next) => {
    const vacante = await Vacante.findOne({url:req.params.url}).lean();

    if(!vacante) return next();

    res.render('editar-vacante', {
        vacante,
        cerrarSesion:true,
        nombrePagina: `Editar - ${vacante.titulo}`,
        
    })
}

exports.vacanteEditada = async (req, res) => {
    const vacanteActualizada = req.body;
    vacanteActualizada.skills = req.body.skills.split(',')

   //Petición a la URL
   const vacante = await Vacante.findOneAndUpdate({url:req.params.url},
    vacanteActualizada, {
        new:true,
        runValidators: true
    }
   ).lean()
   res.redirect(`/vacantes/${vacante.url}`)
}

//Validar los campos de las vacantes
exports.validarVacante = [
    check('titulo','Agrega un título a la vacante').notEmpty().escape(),
    check('empresa','Agregar una empresa').notEmpty().escape(),
    check('ubicacion','Agregar una ubicación').notEmpty().escape(),
    check('contrato','Seleccionar el tipo de contrato').notEmpty().escape(),
    check('skills','Agrega al menos una habilidad').notEmpty().escape(),
    
    (req, res, next) =>{
        const errores = validationResult(req);
        
        if(!errores.isEmpty()){
            //Si hay errores
            req.flash('error',errores.array().map(error => error.msg));
            res.render('nueva-vacante', {
                nombrePagina: 'Nueva vacante',
                tagline:'Llena el formulario y publica tu vacante',
                cerrarSesion:true,
                mensajes: req.flash(),

            });
            return
        }
        //Sin errores
        next();
    }
]

exports.eliminarVacante = async(req,res) =>{
    const { id } = req.params
    const vacante = await Vacante.findById(id)
    
    if(verificarAutor(vacante, req.user)){
        //Eliminar la vacante de la base de datos
        await Vacante.deleteOne({_id: id})
        res.status(200).send('Vacante eliminada correctamente')
    }else{
        res.status(403).send('Error')
    }
   
}

const verificarAutor = (vacante = {}, usuario = {}) =>{
    if(!vacante.autor.equals(usuario._id)){
        return false;
    }
    return true;
}

//Subir archivos en pdf
exports.subirCV = (req, res, next) => {
    upload(req, res, function (error) {
        if(error){
          //Si el error fue parte de Multer
          if (error instanceof multer.MulterError) {
            if(error.code === 'LIMIT_FILE_SIZE'){
              req.flash('error','El archivo es muy grande: Máximo 100kb');
            } else{
              req.flash('error',error.message)
            }
          } else{
            req.flash('error',error.message);
          }
          // if (error.hasOwnProperty('message')) {
          //   req.flash('error', error.message)
          // }
          res.redirect('back')
          return
        } else {
          return next();
        }
    
       
      });
} 
const configuracionMulter = {
    limits: {fileSize: 100000},
    storage: fileStorage = multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, __dirname + "../../public/uploads/cv");
      },
      filename: (req, file, cb) => {
        const extension = file.mimetype.split('/')[1];
        cb(null, `${shortid.generate()}.${extension}`);
      },
    }),
    fileFilter(req, file, cb) {
      if(file.mimetype === 'application/pdf'){
          //Callback ejecutado como true o false
          cb(null, true)
      } else {
          cb(new Error('Formato no válido'),false)
      }
    },
    
  };

const upload = multer(configuracionMulter).single('cv');

exports.contactar = async (req, res,next) => {
  const  vacante = await Vacante.findOne({url: req.params.url});

  if(!vacante) return next();

  //Todo bien, construir el nuevo objeto
  const nuevoCandidato = {
    nombre: req.body.nombre,
    email: req.body.email,
    cv: req.file.filename
  }

  //Almacenar la vacante
  vacante.candidatos.push(nuevoCandidato);
  await vacante.save();

  //Mensaje flash y redireccción
  req.flash('correcto','Se envió tu currículum correctamente')
  res.redirect('/')
}

exports.mostrarCandidatos = async (req,res,next) =>{
  const vacante = await Vacante.findById(req.params.id).lean();
  

  if(vacante.autor != req.user._id.toString()){
    return next();
  }
  if(!vacante) return next();
  res.render('candidatos', {
    nombrePagina: `Candidatos Vacante ${vacante.titulo} `,
    cerrarSesion: true,
    nombre:req.user.nombre,
    imagen:req.user.imagen,
    candidatos:vacante.candidatos 

  })
}

//Buscador de vacantes
exports.buscarVacantes = async(req, res) =>{
  if(req.body.q) {
    const vacantes = await Vacante.find({
      $text : {
        $search: req.body.q
      }
    }).lean();
    res.render('home',{
      nombrePagina:`Resultados para la búsqueda: ${req.body.q}`,
      barra:true,
      vacantes
    })
  } else {
    // manejar el caso cuando req.body.q es null
    console.log('El valor de búsqueda es null');
  }
}


   