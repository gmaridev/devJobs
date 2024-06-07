import axios from "axios";
import { ConnectionStates } from "mongoose";
import Swal from "sweetalert2";

document.addEventListener("DOMContentLoaded", () => {
  const skills = document.querySelector(".lista-conocimientos");

  //Limpiar los mensajes de alerta
  let alertas = document.querySelector(".alertas");

  if (alertas) {
    limpiarAlertas();
  }

  if (skills) {
    skills.addEventListener("click", agregarSkills);

    // Llamar a la función después del editar
    skillsSeleccionadas();
  }
  const vacantesListado = document.querySelector(".panel-administracion");

  if (vacantesListado) {
    vacantesListado.addEventListener("click", accionesListado);
  }
});
const skills = new Set();

const agregarSkills = (e) => {
  if (e.target.tagName === "LI") {
    if (e.target.classList.contains("activo")) {
      //Quitarlo del set y quitar la clase
      skills.delete(e.target.textContent);
      e.target.classList.remove("activo");
    } else {
      //Agregarlo al set y agregar la clase
      skills.add(e.target.textContent);
      e.target.classList.add("activo");
    }
  }
  const skillsArray = [...skills];
  document.querySelector("#skills").value = skillsArray;
};

const skillsSeleccionadas = () => {
  //Convertir en Array las opciones seleccionadas
  const seleccionadas = Array.from(
    document.querySelectorAll(".lista-conocimientos .activo")
  );

  seleccionadas.forEach((seleccionada) => {
    skills.add(seleccionada.textContent);
  });

  //inyectar la respuesta en el hidden
  const skillsArray = [...skills];
  document.querySelector("#skills").value = skillsArray;
};
const limpiarAlertas = () => {
  const alertas = document.querySelector(".alertas");
  const interval = setInterval(() => {
    if (alertas.children.length > 0) {
      alertas.removeChild(alertas.children[0]);
    } else if (alertas.children.length === 0) {
      alertas.parentElement.removeChild(alertas);
      clearInterval(interval);
    }
  }, 2000);
};

//Eliminar vacantes
const accionesListado = (e) => {
  e.preventDefault();
  //const eliminar = document.querySelector('#eliminar')

  //console.log(e.target);

  if (e.target.dataset.eliminar) {
    ////Enviar la petición

    Swal.fire({
      title: "¿Deseas eliminar la vacante?",
      text: "No se podrá recuperar la información eliminada",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.value) {
        const url = `${location.origin}/vacantes/eliminar/${e.target.dataset.eliminar}`;

        //Eliminar el registro
        axios.delete(url, { params: { url } }).then(function (respuesta) {
          if (respuesta.status === 200) {
            Swal.fire({
              title: "Eliminado",
              text:'La información de la vacante se eliminó correctamente',
              icon: "success",
            });

            e.target.parentElement.parentElement.parentElement.removeChild( e.target.parentElement.parentElement);
            
          }
        })
        .catch(() =>{
          Swal.fire({
            type:'error',
            title:'Error',
            text:'No se pudo eliminar la vacante'
          });
        })
      }
    });
  } else if(e.target.tagName === 'A'){
    
    window.location.href = e.target.href;
    //console.log("no estoy aqupí insecto");
  }
};
