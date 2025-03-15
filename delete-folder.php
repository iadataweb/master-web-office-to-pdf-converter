<?php

// Función para eliminar la carpeta física y sus archivos
function eliminarCarpeta($carpeta) {
    // Verificar si la carpeta existe
    if (is_dir($carpeta)) {
        // Abrir el directorio
        $directorio = opendir($carpeta);
        
        // Recorrer todos los elementos del directorio
        while ($elemento = readdir($directorio)) {
            // Ignorar los directorios especiales . y ..
            if ($elemento != '.' && $elemento != '..') {
                // Si el elemento es una carpeta, eliminarla recursivamente
                if (is_dir($carpeta . DIRECTORY_SEPARATOR . $elemento)) {
                    eliminarCarpeta($carpeta . DIRECTORY_SEPARATOR . $elemento);
                } else {
                    // Si el elemento es un archivo, eliminarlo
                    unlink($carpeta . DIRECTORY_SEPARATOR . $elemento);
                }
            }
        }
        
        // Cerrar el directorio
        closedir($directorio);
        
        // Eliminar la carpeta principal
        rmdir($carpeta);
    }
}

?>