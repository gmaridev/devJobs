const mongoose = require("mongoose");
const Usuario = mongoose.model("Usuario");
const multer = require("multer");
const shortid = require('shortid');


exports.subirImagen = async (req, res, next) => {
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
      res.redirect('/administracion')
      return
    } else {
      return next();
    }

   
  });
};
const configuracionMulter = {
  limits: {fileSize: 100000},
  storage: fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, __dirname + "../../public/uploads/perfiles");
    },
    filename: (req, file, cb) => {
      const extension = file.mimetype.split('/')[1];
      cb(null, `${shortid.generate()}.${extension}`);
    },
  }),
  fileFilter(req, file, cb) {
    if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png'){
        //Callback ejecutado como true o false
        cb(null, true)
    } else {
        cb(new Error('Formato no válido'),false)
    }
  },
  
};
const upload = multer(configuracionMulter).single('imagen');
const { check, validationResult } = require("express-validator");
exports.fomrCrearCuenta = (req, res) => {
  res.render("crear-cuenta", {
    nombrePagina: "Crea tu cuenta en devJobs",
    tagline: "Comienza a publicar tus vacantes laborales gratis",
  });
};

//Opciones de multer

exports.validarRegistro = [
  check("nombre", "¡El nombre es obligatorio!").notEmpty().escape(),
  check("email", "El email debe ser válido")
    .isEmail()
    .escape()
    .normalizeEmail(),
  check("password", "El campo no puede ir vacío").notEmpty().escape(),
  check("confirmar-password", "Debes confirmar tu contraseña")
    .notEmpty()
    .escape(),
  check("confirmar-password").custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error("Las contraseñas no coinciden");
    }
    return true;
  }),
  (req, res, next) => {
    const errores = validationResult(req);

    if (!errores.isEmpty()) {
      //Si hay errores
      req.flash(
        "error",
        errores.array().map((error) => error.msg)
      );
      res.render("crear-cuenta", {
        nombrePagina: "Crea tu cuenta en devJobs",
        tagline: "Comienza a publicar tus vacantes laborales gratis",
        mensajes: req.flash(),
      });
      return;
    }
    //Sin errores
    next();
  },
];

exports.crearCuenta = async (req, res, next) => {
  const usuario = new Usuario(req.body);

  try {
    await usuario.save();
    res.redirect("/iniciar-sesion");
  } catch (error) {
    req.flash(
      "error",
      "El correo electrónico ya está en uso. Inténtalo con otro."
    );
    res.redirect("/crear-cuenta");
  }
};
//Iniciar sesión
exports.formIniciarSesion = (req, res) => {
  res.render("iniciar-sesion", {
    nombrePagina: "Iniciar sesión devJobs",
  });
};

exports.formEditarPerfil = async (req, res) => {
  const usuario = await Usuario.findById(req.user._id).lean();
  res.render("editar-perfil", {
    nombrePagina: "Editar perfil",
    cerrarSesion: true,
    nombre: req.user.nombre,
    imagen:req.user.imagen,
    usuario,
  });
};
exports.editarPerfil = async (req, res) => {
  //Se extraen los datos del usuario según el id de la persona logueada que desee editar su información
  const usuario = await Usuario.findById(req.user._id);

  //Editar los campos
  usuario.nombre = req.body.nombre;
  usuario.email = req.body.email;
  if (req.body.password) {
    usuario.password = req.body.password;
  }
  if(req.file){
    usuario.imagen = req.file.filename;
  }
  await usuario.save();

  //Alerta de "Se guardaron los cambios correctamente"
  req.flash("correcto", "Se guardaron los cambios correctamente");

  //redirigir
  res.redirect("/administracion");
};

exports.validarPerfil = [
  check("nombre", "El nombre no puede ir vacío").notEmpty().escape(),
  check("email", "Debes registrar un email").notEmpty().escape(),
  async (req, res, next) => {
    const usuario = await Usuario.findById(req.user._id);
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
      //Si hay errores
      req.flash(
        "error",
        errores.array().map((error) => error.msg)
      );
      res.render("editar-perfil", {
        nombrePagina: "Editar perfil",
        cerrarSesion: true,
        nombre: req.user.nombre,
        imagen:req.user.imagen,
        usuario,
        mensajes: req.flash(),
      });
      return;
    }
    //Sin errores
    next();
  },
];
