// Declara un array vacío para almacenar los archivos seleccionados
let archivos = [];

/*--------------------------------------------------------------
# FUNCIÓN PARA MOSTRAR MINIATURAS
--------------------------------------------------------------*/
function mostrarMiniaturas() {
  // Obtiene el contenedor donde se mostrarán las miniaturas de los archivos
  const contenedor = document.getElementById('custom-js-vista-archivos');
  // Limpia el contenido existente en el contenedor
  contenedor.innerHTML = '';

  // Verifica si hay archivos en el array
  if (archivos.length === 0) {
    // Muestra un mensaje si no hay archivos
    mostrarTextoCentro();
  } else {
    // Oculta el mensaje si hay archivos
    ocultarTextoCentro();
    // Itera sobre cada archivo y genera su miniatura en HTML
    archivos.forEach(archivo => {
      const miniatura = `
        <div class="col-12 col-md-4 col-lg-4 col-xl-4 col-xxl-3 mb-3">
          <div class="custom-miniatura ${archivo.estado == 0 ? 'custom-alerta-no-existente' : ''}" data-id="archivo-${archivo.id}">
              <div class="row">
                  <div class="col-4 col-md-12">
                      <img src="assets/img/office/icon_${archivo.formato}.svg" alt="icono" class="img-fluid custom-icon">
                  </div>
                  <div class="col-8 col-md-12 align-self-center text-start text-md-center py-1">
                      <p class="card-text">${archivo.nombre}</p>
                  </div>
              </div>
              <button class="btn custom-eliminar-archivo" id="eliminar-${archivo.id}">
                  <span><i class="bx bx-trash"></i></span>
                  <span>Eliminar</span>
              </button>
          </div>
        </div>
      `;
      // Agrega la miniatura al contenedor
      contenedor.innerHTML += miniatura;
    });
  }

  // Obtener todos los elementos con la clase "eliminar-"
  var botonesEliminar = document.querySelectorAll('[id^="eliminar-"]');

  // Agregar evento de clic para cada botón "Eliminar"
  botonesEliminar.forEach(function (boton) {
    boton.addEventListener("click", function () {
      // Obtener el id del botón eliminado
      var id = parseInt(boton.id.split("-")[1]);
      // Encontrar el índice del archivo con el ID correspondiente
      var index = archivos.findIndex(archivo => archivo.id === id);
      if (index !== -1) {
        // Encuentra el índice del archivo con el ID correspondiente y lo elimina del array
        archivos.splice(index, 1);
        // Volver a mostrar las miniaturas
        mostrarMiniaturas();
      }
    });
  });
}

/*--------------------------------------------------------------
# MÉTODO PARA LIMPIAR TODOS
--------------------------------------------------------------*/

// Obtener todos los elementos con la clase "limpiar-btn"
var botonesLimpiar = document.querySelectorAll('.custom-js-btn-limpiar');

// Agregar evento de clic para cada botón "Limpiar"
botonesLimpiar.forEach(function (boton) {
  boton.addEventListener('click', function () {
    // Verificar si hay elementos para limpiar
    if (archivos.length > 0) {
      // Limpiar el array de archivos
      archivos = [];
      // Limpiar la vista previa
      mostrarMiniaturas();
    } else {
      // Si no hay elementos para limpiar, mostrar un mensaje o realizar alguna acción
      mostrarMensaje("error", "No hay elementos para limpiar.");
    }
  });
});

/*--------------------------------------------------------------
# MÉTODO PARA AGREGAR EVENTO CLIC
--------------------------------------------------------------*/

// Obtener todos los elementos con la clase "custom-js-btn-iniciar"
var botonesIniciar = document.querySelectorAll('.custom-js-btn-iniciar');

// Agregar evento de clic para cada botón "Iniciar"
botonesIniciar.forEach(function (boton) {
  boton.addEventListener('click', function () {
    almacenarArchivos();
  });
});

/*--------------------------------------------------------------
# FUNCIÓN ALMACENAR ARCHIVO
--------------------------------------------------------------*/
function almacenarArchivos() {
  if (archivos.length > 0) {
    // Mostrar la ventana modal de progreso de carga
    Swal.fire({
      icon: "warning",
      title: "¿Deseas iniciar el proceso de conversión?",
      html: `
        <div class="progress">
            <div class="progress-bar progress-bar-striped" id="progressBar" role="progressbar" style="width: 0%;" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"></div>
        </div>
      `,
      showCancelButton: true,
      showConfirmButton: true,
      focusConfirm: false,
      focusCancel: false,
      returnFocus: false,
      buttonsStyling: false,
      reverseButtons: true,
      cancelButtonText: 'No',
      confirmButtonText: 'Si',
      customClass: {
        popup: 'custom-swal-modal',
        title: 'custom-swal-title',
        confirmButton: 'custom-swal-button',
        cancelButton: 'custom-swal-button'
      },
      allowOutsideClick: false,
      preConfirm: () => {
        return new Promise((resolve, reject) => {
          verificarExistenciaLocal(archivos)
            .then(archivosParaEnviar => {
              // Crear objeto FormData para enviar archivos al servidor
              const formData = new FormData();
              archivosParaEnviar.forEach(archivo => {
                formData.append('archivos[]', archivo.file, archivo.nombre);
              });

              // Crear una nueva instancia de XMLHttpRequest
              const xhr = new XMLHttpRequest();

              // Configurar el evento de progreso
              xhr.upload.onprogress = function (event) {
                if (event.lengthComputable) {
                  // var percentComplete = (event.loaded / event.total) * 100;
                  var percentComplete = Math.round((event.loaded / event.total) * 100);
                  // Actualizar la barra de progreso
                  document.getElementById('progressBar').style.width = percentComplete + '%';
                  document.getElementById('progressBar').setAttribute('aria-valuenow', percentComplete);
                  document.getElementById('progressBar').textContent = percentComplete + '%';
                } 
              };

              // Configurar la respuesta a la solicitud
              xhr.onload = function () {
                if (xhr.status === 200) {
                  // La solicitud se completó correctamente
                  const respuestaServidor = JSON.parse(this.responseText);

                  // Verificar si hay un mensaje de éxito
                  if (respuestaServidor.mensaje) {
                    // Mostrar alerta
                    mostrarMensaje("success", "Proceso de conversión completado con éxito.");
                    // Iniciar la descarga del resultado
                    descargarResultado(respuestaServidor.mensaje);

                    // Limpiar el array
                    archivos = [];

                    // Limpiar las miniaturas
                    mostrarMiniaturas();

                    // Indicar la finalización exitosa
                    resolve();

                  } else if (respuestaServidor.error) {
                    // Si hay un error en objeto, rechazar la promesa
                    reject(respuestaServidor.error);
                  } else {
                    // Indicar el rechazo de una promesa
                    reject('Ocurrio un error del servidor inesperada.');
                  }

                  // Indicar la finalización exitosa
                  resolve();
                } else {
                  // Indicar el rechazo de una promesa
                  reject('Ocurrió un error en el proceso de conversión');
                }
              };

              // Configurar el manejo de errores
              xhr.onerror = function () {
                // Indicar el rechazo de una promesa
                reject('Error al realizar la solicitud.');
              };

              // Abrir y enviar la solicitud
              xhr.open('POST', 'store.php');
              xhr.send(formData);

            })
            .catch(error => {
              // Indicar el rechazo de una promesa
              reject(error);
            });
        });
      }

    }).then((result) => {
      // Este bloque se ejecuta después de que se completa el proceso de carga


    }).catch((error) => {
      // Si error es un array
      if (Array.isArray(error) && error.length > 0) {
        // Mostrar alerta con los nombres de los archivos que no existen localmente
        mostrarArchivosNoExistentes(error);
      } else if (typeof error === 'string') {
        // Si error es una cadena de texto
        mostrarMensaje("error", error);
      } else {
        // Si error es un desconocido
        mostrarMensaje("error", "Error desconocido.");
      }

    });

  } else {
    mostrarMensaje("error", "No hay ningún archivo para procesar.");
  }
}

/*--------------------------------------------------------------
# FUNCIÓN PARA VERIFICAR LA EXISTENCIA DEL ARCHIVO ORIGEN
--------------------------------------------------------------*/
function verificarExistenciaLocal(archivos) {
  return new Promise((resolve, reject) => {
    // Array para almacenar nombres de archivos que existen para enviar
    const archivosParaEnviar = [];
    // Array para almacenar nombres de archivos que no existen localmente
    const archivosNoExistentes = [];

    const promesas = archivos.map(archivo => {
      return new Promise((resolveArchivo, rejectArchivo) => {
        // Verificar la existencia local del archivo
        if (archivo.file && archivo.file.size > 0) {
          // Utilizar FileReader API
          // Verificación asíncrona y se resuelve si el archivo existe localmente
          const reader = new FileReader();
          reader.onload = function (event) {
            // El archivo se ha cargado correctamente, por lo que existe localmente
            archivosParaEnviar.push(archivo);
            resolveArchivo();
          };
          reader.onerror = function (event) {
            // Ocurrió un error al cargar el archivo, por lo que no existe localmente
            archivosNoExistentes.push(archivo.nombre);
            rejectArchivo(archivosNoExistentes);
          };
          // Leer el archivo como una URL de datos (data URL)
          reader.readAsDataURL(archivo.file);

        } else {
          archivosNoExistentes.push({ id: archivo.id, nombre: archivo.nombre });
          rejectArchivo(archivosNoExistentes);
        }
      });
    });

    Promise.all(promesas)
      .then(() => {
        resolve(archivosParaEnviar);
      })
      .catch(error => {
        reject(error);
      });
  });
}

/*--------------------------------------------------------------
# FUNCIÓN PARA DESCARGAR
--------------------------------------------------------------*/
function descargarResultado(enlace) {
  // Crear un elemento <a> invisible
  var elemento = document.createElement('a');
  elemento.setAttribute('id', 'enlace-descarga-temporal');
  elemento.setAttribute('href', enlace);
  elemento.setAttribute('download', '');

  // Simular clic en el elemento para iniciar la descarga
  elemento.style.display = 'none';
  document.body.appendChild(elemento);
  elemento.click();

  // Limpiar el elemento después de la descarga
  document.body.removeChild(elemento);
}

/*--------------------------------------------------------------
# FUNCIÓN PARA MOSTRAR MENSAJE
--------------------------------------------------------------*/
function mostrarMensaje(tipo, mensaje) {
  // Mostrar un mensaje al usuario
  Swal.fire({
    icon: tipo,
    title: mensaje,
    showCancelButton: true,
    showConfirmButton: false,
    focusConfirm: false,
    focusCancel: false,
    returnFocus: false,
    buttonsStyling: false,
    cancelButtonText: 'Cerrar',
    customClass: {
      popup: 'custom-swal-modal',
      title: 'custom-swal-title',
      cancelButton: 'custom-swal-button'
    },
    allowOutsideClick: false
  });
}

/*--------------------------------------------------------------
# FUNCIÓN PARA MOSTRAR MENSAJE DEL ARCHIVO NO EXISTENTE
--------------------------------------------------------------*/
function mostrarArchivosNoExistentes(archivosNoExistentes) {

  let mensajeSingular = "No se pudo acceder el siguiente archivo, es posible que se haya movido, editado o borrado:";
  let mensajePlural = "No se pudo acceder los siguientes archivos, es posible que se haya movido, editado o borrado:";

  let titulo = archivosNoExistentes.length > 1 ? mensajePlural : mensajeSingular;

  let mensajeHTML = `<p class="lead text-start">${titulo}</p>`;
  mensajeHTML += '<ul class="list-group text-start">';
  archivosNoExistentes.forEach(archivo => {
    mensajeHTML += `<li class="list-group-item list-group-item-danger"><i class="bx bxs-x-circle"></i> ${archivo.nombre}</li>`;
  });
  mensajeHTML += '</ul>';

  // Resaltar visualmente los archivos no existentes
  archivosNoExistentes.forEach(archivo => {
    const elementoArchivo = document.querySelector(`[data-id="archivo-${archivo.id}"]`);
    if (elementoArchivo) {
      // Agregar la clase personalizada
      elementoArchivo.classList.add('custom-alerta-no-existente');
      actualizarEstadoArchivo(archivo.id, 0);
    }
  });

  Swal.fire({
    icon: "error",
    title: "Error",
    html: mensajeHTML,
    showCancelButton: true,
    showConfirmButton: false,
    focusConfirm: false,
    focusCancel: false,
    returnFocus: false,
    buttonsStyling: false,
    cancelButtonText: 'Cerrar',
    customClass: {
      popup: 'custom-swal-modal',
      title: 'custom-swal-title',
      htmlContainer: 'custom-swal-container',
      cancelButton: 'custom-swal-button'
    },
    allowOutsideClick: false
  });
}

/*--------------------------------------------------------------
# FUNCIÓN PARA ACTUALIZAR EL ESTADO DEL ARCHIVO
--------------------------------------------------------------*/
function actualizarEstadoArchivo(idArchivo, nuevoEstado) {
  // Buscar el archivo por su ID
  const archivoIndex = archivos.findIndex(archivo => archivo.id === idArchivo);

  // Verificar si se encontró el archivo
  if (archivoIndex !== -1) {
    // Actualizar el estado del archivo
    archivos[archivoIndex].estado = nuevoEstado;
  } else {
    console.error('El archivo con el ID especificado no fue encontrado.');
  }
}

/*--------------------------------------------------------------
# FUNCIÓN PARA MOSTRAR RESPUESTA SERVIDOR
--------------------------------------------------------------*/
function mostrarRespuestaServidor(respuestaServidor) {

  let successAlert = "list-group-item-success";
  let dangerAlert = "list-group-item-danger";

  let successIcon = "bx bxs-check-circle";
  let dangerIcon = "bx bxs-x-circle";

  let mensajeHTML = '<ul class="list-group text-start">';
  respuestaServidor.forEach(archivo => {
    let tipoRespuesta = archivo.hasOwnProperty("mensaje") ? "mensaje" : "error";
    let tipoAlerta = tipoRespuesta === "mensaje" ? successAlert : dangerAlert;
    let tipoIcono = tipoRespuesta === "mensaje" ? successIcon : dangerIcon;
    mensajeHTML += `<li class="list-group-item ${tipoAlerta}"><i class="${tipoIcono}"></i> ${archivo[tipoRespuesta]}</li>`;
  });
  mensajeHTML += '</ul>';

  Swal.fire({
    icon: "info",
    title: "Respuesta del servidor",
    html: mensajeHTML,
    showCancelButton: true,
    showConfirmButton: false,
    focusConfirm: false,
    focusCancel: false,
    returnFocus: false,
    buttonsStyling: false,
    cancelButtonText: 'Cerrar',
    customClass: {
      popup: 'custom-swal-modal',
      title: 'custom-swal-title',
      htmlContainer: 'custom-swal-container',
      cancelButton: 'custom-swal-button'
    },
    allowOutsideClick: false
  });
}

/*--------------------------------------------------------------
# FUNCIÓN PARA OCULTAR ELEMENTO CUSTOM-TEXTO-CENTRO
--------------------------------------------------------------*/
function ocultarTextoCentro() {
  var textoCentro = document.querySelector('.custom-texto-centro');
  if (textoCentro) {
    textoCentro.style.display = 'none';
  }
}

/*--------------------------------------------------------------
# FUNCIÓN PARA MOSTRAR ELEMENTO CUSTOM-TEXTO-CENTRO
--------------------------------------------------------------*/
function mostrarTextoCentro() {
  var textoCentro = document.querySelector('.custom-texto-centro');
  if (textoCentro) {
    textoCentro.style.display = 'block';
  }
}

/*--------------------------------------------------------------
# FUNCIÓN PARA MANEJAR ARCHIVOS
--------------------------------------------------------------*/

function manejarArchivos(agregarArchivos) {

  // Definir los tipos Office permitidos
  const tiposMIMEPermitidos = {
    'application/msword': 'doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
    'application/vnd.ms-powerpoint': 'ppt',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx',
    'application/vnd.ms-excel': 'xls',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx'
  };

  // Itera sobre cada archivo seleccionado y los agrega al array
  for (let i = 0; i < agregarArchivos.length; i++) {
    const archivo = agregarArchivos[i];
    if (archivo) {
      // Verificar el tipo de archivo permitido
      if (tiposMIMEPermitidos.hasOwnProperty(archivo.type)) {
        archivos.push({
          id: Date.now(), // Generar un ID único para cada archivo
          nombre: archivo.name,
          file: archivo,
          formato: tiposMIMEPermitidos[archivo.type],
          estado: 1
        });
      } else {
        // Mostrar un mensaje de error al usuario
        mostrarMensaje("error", "El archivo seleccionado no es un documento de office permitido.");
      }
    } else {
      // Mostrar un mensaje de error al usuario
      mostrarMensaje("error", "No se pudo cargar el archivo");
    }
  }

  // Actualizar la vista previa de las miniaturas
  mostrarMiniaturas();
}

/*--------------------------------------------------------------
# MÉTODO PARA CARGAR ARCHIVO
--------------------------------------------------------------*/

//Verificar la existencia del elemento
if (document.getElementById('custom-js-input-archivo')) {
  // Obtener el elemento de input file
  var inputArchivo = document.getElementById('custom-js-input-archivo');

  // Escuchar el evento 'change' en el elemento de input file
  inputArchivo.addEventListener('change', function (event) {
    const archivosSeleccionados = inputArchivo.files;
    manejarArchivos(archivosSeleccionados);
    inputArchivo.value = '';
  });
}

/*--------------------------------------------------------------
# MÉTODO PARA ARRASTRAR Y SOLTAR ARCHIVO
--------------------------------------------------------------*/

if (document.getElementById('custom-js-contenedor-archivo')) {
  // Obtener el elemento donde los usuarios pueden soltar archivo
  var areaSoltarArchivos = document.getElementById('custom-js-contenedor-archivo');

  // Agregar evento de soltar archivos al área
  areaSoltarArchivos.addEventListener('drop', function (event) {
    event.preventDefault();
    const archivosSoltados = event.dataTransfer.files;
    manejarArchivos(archivosSoltados);
  });

  areaSoltarArchivos.addEventListener('dragover', function (event) {
    event.preventDefault();
  });
}
