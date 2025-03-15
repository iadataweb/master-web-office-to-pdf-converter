<!DOCTYPE html>
<html lang="es">
<head>
    <?php include('inc/head.php'); ?>
</head>
<body>

    <?php include('inc/header.php'); ?>

    <?php include('inc/aside.php'); ?>

    <main class="custom-main-archivo">
        <div class="custom-contenedor-archivo" id="custom-js-contenedor-archivo">

            <div class="custom-texto-centro">
                <span><i class="bx bx-plus-circle"></i></span>
                <span>Añadir archivos o soltar aquí</span>
            </div>

            <div class="custom-vista-archivos">
                <div class="row" id="custom-js-vista-archivos">
                </div>
            </div>

        </div>
    </main>
    
    <button type="button" class="btn btn-primary fixed-bottom d-lg-none m-3 custom-boton-herramienta" data-bs-toggle="modal" data-bs-target="#custom-js-modal-herramienta">
    Herramienta
    </button>

    <?php include('inc/modal.php'); ?>
    
    <?php include('inc/inputs.php'); ?>


    <?php include('inc/script.php'); ?>
    
</body>
</html>