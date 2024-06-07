const passport = require('passport')
const mongoose  = require('mongoose')
const Vacante = mongoose.model('Vacante')
const Usuario = mongoose.model('Usuario')
const crypto = require('crypto');
const enviarEmail = require('../handlers/email');
exports.autenticarUsuario = passport.authenticate('local',{
    successRedirect: '/administracion',
    failureRedirect: '/iniciar-sesion',
    failureFlash: true,
    badRequestMessage: 'Ambos campos deben llenarse'
})

//Revisar si el usuario está autenticado o no
exports.verificarUsuario = (req, res, next) =>{
    if(req.isAuthenticated()){
        return next();
    } else {
        res.redirect('/iniciar-sesion')
    }
}

exports.mostrarPanel = async(req, res) =>{

    //Consultar el usuario autenticado
    const vacantes = await Vacante.find({autor: req.user._id}).lean();

    res.render('administracion',{
        nombrePagina: 'Dashboard',
        tagline: 'Crea y administra tus vacantes desde aquí',
        cerrarSesion:true,
        nombre: req.user.nombre,
        imagen:req.user.imagen,
        barra:true,
        vacantes,
       
    })
}

exports.cerrarSesion = (req, res) => {
    req.logout(() => {
        // Esta función se ejecutará después de cerrar la sesión
        return res.redirect('/iniciar-sesion');
    });
};
/**Formulario para reiniciar el password */
exports.formReestablecerPassword = (req, res) => {
    res.render('reestablecer-password', {
        nombrePagina: 'Reestablecer contraseña',
        tagline: 'Si ya tienes una cuenta  pero olvidaste tu contraseña, registre su email'
        }   
    )
}

exports.enviarToken = async (req, res) => {
    const usuario = await Usuario.findOne({email:req.body.email});

    if(!usuario){
        req.flash('error','No existe esa cuenta');
        res.redirect('/iniciar-sesion');
    }
    //El usuario existe: Generar token
    usuario.token = crypto.randomBytes(20).toString('hex');
    usuario.expired = Date.now() + 3600000;

    await usuario.save();
    const resetURL = `http://${req.headers.host}/reestablecer-password/${usuario.token}`;

    //ToDo: Enviar notificación por email
    await enviarEmail.enviar({
        usuario,
        subject: 'Password reset',
        resetURL,
        archivo:'reset'

    });

    req.flash('correcto','Revisa tu email para las indicaciones')
    res.redirect('/iniciar-sesion')
}
//Validar si el token es válido y el usuario existe

exports.reestablecerPassword = async (req, res) =>{
    const usuario = await Usuario.findOne({
        token: req.params.token,
        expired: {
            $gt: Date.now()
        }
    });
    if(!usuario){
        req.flash('error','El formulario ya no es válido. Intente de nuevo');
        return res.redirect('/reestablecer-password');
    }

    //Todo bien: Mostrar el formulario
    res.render('nuevo-password',{
        nombrePagina: 'Modifica tu contraseña'
    })
}
//Almacenar la nueva contraseña en la base de datos
exports.guardarPassword = async (req,res) =>{
    const usuario = await Usuario.findOne({
        token:req.params.token,
        expired:{
            $gt: Date.now()
        }
    });
    //Token inválido o no existe el usuario
    if(!usuario){
        req.flash('error','El formulario ya no es válido. Intente de nuevo');
        return res.redirect('/reestablecer-password');
    }
    //Asignar nueva contraseña al usuario
    usuario.password = req.body.password;
    usuario.token = undefined;
    usuario.expired = undefined;

    //Almacenar
    await usuario.save();

    //Redirigir
    req.flash('correcto','Contraseña modificada correctamente')
    res.redirect('/iniciar-sesion')
}