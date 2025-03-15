// Obtener el botón de cambio de tema por su ID
const switchButton = document.getElementById('custom-interruptor');

// Función para cambiar el tema y almacenar la preferencia
function toggleTheme() {
    // Alternar la clase del cuerpo del documento para cambiar el tema
    document.body.classList.toggle('custom-fondo-oscuro');
    // Alternar la clase del botón de cambio de tema para reflejar el estado del tema
    switchButton.classList.toggle('active');

    // Guardar la preferencia de tema en localStorage
    // Verificar si el modo oscuro está activo
    const isDarkMode = document.body.classList.contains('custom-fondo-oscuro');
    // Guardar la preferencia de tema en localStorage como 'dark' si el modo oscuro está activo, de lo contrario, guardarla como 'light'
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
}
// Agregar un evento de clic al botón de cambio de tema y asociarlo con la función toggleTheme
// Agregar evento de clic al botón de cambio de tema
switchButton.addEventListener('click', toggleTheme);

// Aplicar el tema al cargar la página
// Esperar a que el contenido de la ventana se cargue completamente
window.addEventListener('DOMContentLoaded', () => {
    // Recuperar la preferencia de tema desde localStorage
    const theme = localStorage.getItem('theme');

    // Aplicar el tema si se encuentra en localStorage
    // Verificar si se recuperó una preferencia de tema desde localStorage
    if (theme === 'dark') {
        // Si la preferencia de tema es 'dark', agregar la clase 'custom-fondo-oscuro' al cuerpo del documento
        document.body.classList.add('custom-fondo-oscuro');
        // También agregar la clase 'active' al botón de cambio de tema para indicar que el modo oscuro está activo
        switchButton.classList.add('active');
    }
});
