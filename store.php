<?php
require_once('config/system.php');
require_once('connect.php');
require_once('delete-folder.php');
require_once('vendor/autoload.php');
use Ilovepdf\Ilovepdf;

$llavePublica = ILOVEAPI_PUBLIC_KEY;
$llavePrivada = ILOVEAPI_PRIVATE_KEY;

// Verifica si se han subido archivos correctamente
if (isset($_FILES['archivos']) && !empty($_FILES['archivos']['name'])) {

    // Definir la zona horaria
    date_default_timezone_set('America/Lima');

    // Definir tiempo límite (30 minutos)
    $tiempo_limite = date('Y-m-d H:i:s', strtotime('-30 minutes'));

    // Consulta para obtener las rutas de las carpetas a eliminar
    $sql = "SELECT ruta FROM carpeta WHERE tiempo < ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $tiempo_limite);
    $stmt->execute();
    $result = $stmt->get_result();
    // Elimina los archivos y carpetas físicas
    while ($row = $result->fetch_assoc()) {
        $carpetaEliminar = $row['ruta'];
        eliminarCarpeta($carpetaEliminar);
    }
    $stmt->close();

    // Eliminar registros antiguos
    $sql = "DELETE FROM carpeta WHERE tiempo < ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $tiempo_limite);
    $stmt->execute();
    $stmt->close();

    // Directorio donde se almacenarán los archivos
    $directorio = "documents";

    // Agrega más entropía para una mayor unicidad con true
    $prefijoCarpeta = "FILE";
    $prefijoEntrada = "ENTRY";
    $prefijoSalida = "OUTPUT";

    // Generar un nombre único basada en el tiempo actual
    $codigoCarpeta = uniqid($prefijoCarpeta,true);
    $codigoEntrada = uniqid($prefijoEntrada,true);
    $codigoSalida = uniqid($prefijoSalida,true);

    // Ruta temporal
    $rutaDestino = $directorio."/".$codigoCarpeta;
    $rutaEntrada = $rutaDestino."/".$codigoEntrada;
    $rutaSalida = $rutaDestino."/".$codigoSalida;

    // Crea la carpeta
    mkdir($rutaDestino);
    mkdir($rutaEntrada);
    mkdir($rutaSalida);

    // Obtener los archivos enviados a través de la solicitud POST
    $archivos = $_FILES['archivos'];
    
    $respuesta = array();

    try {

        //Registrar con marca de tiempo actual
        $sql = "INSERT INTO carpeta (ruta, tiempo) VALUES (?, NOW())";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("s", $rutaDestino);
        $stmt->execute();
        $stmt->close();

        // Iniciar el gestor de clases
        $ilovepdf = new Ilovepdf($llavePublica, $llavePrivada);

        // Obtener la herramienta de tareas
        $myTask = $ilovepdf->newTask('officepdf');

        // Itera sobre cada archivo recibido
        foreach($archivos['tmp_name'] as $key => $rutaTemporal) {  
            $nombreArchivo = basename($archivos['name'][$key]);
            $rutaArchivo = $rutaEntrada."/".$nombreArchivo;

            // Mueve el archivo del directorio temporal al destino final
            if(move_uploaded_file($rutaTemporal, $rutaArchivo)) {
                // Agregar el arvhivo movido a la tarea
                $myTask->addFile($rutaArchivo);
            }
        }

        // Ejecuta la tarea y obtén el tiempo de ejecución
        $time = $myTask->execute();

        // Iniciar descarga
        $myTask->download($rutaSalida);

        // Obtener la ruta del resultado
        $resultadoRuta = glob($rutaSalida . '/*');
    
        // Obtener el primer resultado
        $resultadoNombre = basename($resultadoRuta[0]);

        // Genera el enlace de descarga
        $enlaceDescarga = BASE_URL . $rutaSalida . "/" . $resultadoNombre;

        // Guarda el enlace de descarga en la respuesta
        $respuesta = array("mensaje" => "$enlaceDescarga");

        echo json_encode($respuesta);
        
    
    } catch (\Ilovepdf\Exceptions\StartException $e) {
        $errorMessage = "Se ha producido un error al iniciar: " . $e->getMessage();
        $errorMessage = json_encode($errorMessage, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        $respuesta = array("error" => $errorMessage);
        echo json_encode($respuesta);

    } catch (\Ilovepdf\Exceptions\AuthException $e) {
        $errorMessage = "Se ha producido un error en la autenticación: " . $e->getMessage();
        $errorMessage = json_encode($errorMessage, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        $respuesta = array("error" => $errorMessage);
        echo json_encode($respuesta);

    } catch (\Ilovepdf\Exceptions\UploadException $e) {
        $errorMessage = "Se ha producido un error al cargar: " . $e->getMessage();
        $errorMessage = json_encode($errorMessage, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        $respuesta = array("error" => $errorMessage);
        echo json_encode($respuesta);

    } catch (\Ilovepdf\Exceptions\ProcessException $e) {
        $errorMessage = "Se ha producido un error en el proceso: " . $e->getMessage();
        $errorMessage = json_encode($errorMessage, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        $respuesta = array("error" => $errorMessage);
        echo json_encode($respuesta);

    } catch (\Ilovepdf\Exceptions\DownloadException $e) {
        $errorMessage = "Se ha producido un error en el proceso: " . $e->getMessage();
        $errorMessage = json_encode($errorMessage, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        $respuesta = array("error" => $errorMessage);
        echo json_encode($respuesta);

    } catch (\Exception $e) {
        $errorMessage = "Ocurrió un error en el servidor. Por favor, inténtalo de nuevo más tarde.";
        $respuesta = array("error" => $errorMessage);
        echo json_encode($respuesta);
    }

} else {
    $respuesta = array("error" => "No se han subido ningún archivo para iniciar el proceso de conversión.");
    echo json_encode($respuesta);
}

?>
