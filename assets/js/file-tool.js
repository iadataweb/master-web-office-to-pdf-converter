// Manejar el clic en el botón de añadir archivos tanto dentro del aside como dentro del modal
document.addEventListener('DOMContentLoaded', function () {

    // Encuentra el botón en aside
    var botonArchivoAside = document.querySelector('#custom-js-aside-herramienta .custom-js-btn-archivo');

    // Encuentra el botón en modal
    var botonArchivoModal = document.querySelector('#custom-js-modal-herramienta .custom-js-btn-archivo');

    // Encuentra el input de archivo
    var inputArchivo = document.querySelector('#custom-js-input-archivo');

    if (botonArchivoAside) {

        // Agrega el evento clic al botón dentro del aside
        botonArchivoAside.addEventListener('click', function () {
            // Simula el clic en el input de archivo dentro del aside
            inputArchivo.click();
        });
    }

    if (botonArchivoModal) {

        // Agrega el evento clic al botón dentro del modal
        botonArchivoModal.addEventListener('click', function () {
            // Simula el clic en el input de archivo dentro del modal
            inputArchivo.click();
        });

    }

});

