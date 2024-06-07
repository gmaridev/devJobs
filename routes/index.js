const express = require("express");
const router = express.Router();
const homeController = require("../controllers/homeController");
const vacantesController = require("../controllers/vacantesController");
const usuariosController = require("../controllers/usuariosController");
const authController = require("../controllers/authController");

module.exports = () => {
  router.get("/", homeController.mostrarTrabajos);

  //Crear vacantes
  router.get(
    "/vacantes/nueva",
    authController.verificarUsuario,
    vacantesController.formularioNuevaVacante
  );
  router.post(
    "/vacantes/nueva",
    authController.verificarUsuario,
    vacantesController.validarVacante,
    vacantesController.agregarVacante
  );

  //Mostrar vacante
  router.get("/vacantes/:url", vacantesController.mostrarVacante);

  //Editar vacante
  router.get(
    "/vacantes/editar/:url",
    authController.verificarUsuario,
    vacantesController.editarVacante
  );

  router.post(
    "/vacantes/editar/:url",
    authController.verificarUsuario,
    vacantesController.validarVacante,
    vacantesController.vacanteEditada
  );

  //Crear cuenta
  router.get("/crear-cuenta", usuariosController.fomrCrearCuenta);
  router.post(
    "/crear-cuenta",
    usuariosController.validarRegistro,
    usuariosController.crearCuenta
  );

  //cerrarSesion
  router.get(
    "/cerrar-sesion",
    authController.verificarUsuario,
    authController.cerrarSesion
  );

  //Reestablecer contraseña
  router.get('/reestablecer-password', authController.formReestablecerPassword)
  router.post('/reestablecer-password', authController.enviarToken)

  // Almacenar la nueva contraseña en la base de datos
  router.get('/reestablecer-password/:token',authController.reestablecerPassword);
  router.post('/reestablecer-password/:token',authController.guardarPassword)
  

  //Autenticar usuarios
  router.get("/iniciar-sesion", usuariosController.formIniciarSesion);
  router.post("/iniciar-sesion", authController.autenticarUsuario);

  //Panel de administración
  router.get(
    "/administracion",
    authController.verificarUsuario,
    authController.mostrarPanel
  );

  //Editar perfil
  router.get(
    "/editar-perfil",
    authController.verificarUsuario,
    usuariosController.formEditarPerfil
  );
  router.post(
    "/editar-perfil",
    authController.verificarUsuario,
    // usuariosController.validarPerfil,
    usuariosController.subirImagen,
    usuariosController.editarPerfil
  );

  //Eliminar vacantes
  router.delete("/vacantes/eliminar/:id", vacantesController.eliminarVacante);

  //Recibir mensajes de candidatos
  router.post('/vacantes/:url',
    vacantesController.subirCV,
    vacantesController.contactar
  );
  router.get('/candidatos/:id',
    authController.verificarUsuario,
    vacantesController.mostrarCandidatos
  )

  //Buscador de vacantes
  router.post('/buscador', vacantesController.buscarVacantes)

  return router;
};
