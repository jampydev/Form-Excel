

document.addEventListener('DOMContentLoaded', function() {
    // Elementos del DOM
    const form = document.getElementById('myForm');
    const submitBtn = document.getElementById('submitBtn');
    const btnText = submitBtn.querySelector('.btn-text');
    const spinner = submitBtn.querySelector('.spinner');
    
    // URL de tu script de Apps Script (reemplázala con la tuya)
    const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyThiqPaMd82U3XZDdvvj9nIKgo4oORv8zzyOeXtVffi84D_GhfkN74N7Y8tebKGjMi/exec';

    // Función para mostrar u ocultar el spinner
    function toggleLoading(show) {
        if (show) {
            btnText.textContent = 'Enviando...';
            spinner.classList.remove('hidden');
            submitBtn.disabled = true;
        } else {
            btnText.textContent = 'Enviar';
            spinner.classList.add('hidden');
            submitBtn.disabled = false;
        }
    }

    // Función para mostrar modal de éxito
    function showSuccessModal(nombre) {
        const modal = document.getElementById('successModal');
        document.getElementById('userName').textContent = nombre.split(' ')[0];
        modal.style.display = 'flex';

        // Cerrar modal al hacer clic en el botón
        document.querySelector('.close-success').onclick = function() {
            modal.style.display = 'none';
            form.reset();
        };
    }

    // Función para mostrar modal de error
    function showErrorModal(message) {
        const modal = document.getElementById('validationModal');
        document.getElementById('modalMessage').textContent = message;
        modal.style.display = 'flex';

        // Cerrar modal
        document.querySelector('.close').onclick = function() {
            modal.style.display = 'none';
        };
    }

    // Función para validar los datos del formulario
    function validateForm(nombre, celular, cedula) {
        if (!nombre || nombre.split(' ').length < 2) {
            showErrorModal('Por favor ingresa nombre y apellido completos');
            return false;
        }

        if (!celular || celular.length !== 10 || !/^\d+$/.test(celular)) {
            showErrorModal('El celular debe tener 10 dígitos numéricos');
            return false;
        }

        if (!cedula || cedula.length < 6 || !/^\d+$/.test(cedula)) {
            showErrorModal('La cédula debe tener al menos 6 dígitos numéricos');
            return false;
        }

        return true;
    }

    // Función para enviar datos a Google Sheets
    async function sendToGoogleSheets(nombre, celular, cedula) {
        try {
            // Usamos FormData para enviar los datos
            const formData = new URLSearchParams();
            formData.append('nombre', nombre);
            formData.append('celular', celular);
            formData.append('cedula', cedula);

            // Enviamos los datos usando fetch
            const response = await fetch(SCRIPT_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: formData
            });

            // Verificamos si la respuesta es OK
            if (!response.ok) {
                throw new Error('Error en la respuesta del servidor');
            }

            // Intentamos parsear la respuesta JSON
            const result = await response.json();
            return result;

        } catch (error) {
            console.error('Error al enviar datos:', error);
            throw error;
        }
    }

    // Evento submit del formulario
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Mostrar estado de carga
        toggleLoading(true);

        // Obtener valores del formulario
        const nombre = document.getElementById('nombre').value.trim();
        const celular = document.getElementById('celular').value.trim();
        const cedula = document.getElementById('cedula').value.trim();

        // Validar los datos
        if (!validateForm(nombre, celular, cedula)) {
            toggleLoading(false);
            return;
        }

        try {
            // Enviar datos a Google Sheets
            const response = await sendToGoogleSheets(nombre, celular, cedula);
            
            // Verificar la respuesta
            if (response && response.result === "success") {
                showSuccessModal(nombre);
            } else {
                throw new Error(response?.message || 'Error desconocido al guardar los datos');
            }
        } catch (error) {
            showErrorModal('Error al enviar los datos: ' + error.message);
        } finally {
            // Ocultar estado de carga
            toggleLoading(false);
        }
    });

    // Cerrar modales al hacer clic fuera de ellos
    window.addEventListener('click', function(event) {
        if (event.target.id === 'validationModal') {
            document.getElementById('validationModal').style.display = 'none';
        }
        if (event.target.id === 'successModal') {
            document.getElementById('successModal').style.display = 'none';
        }
    });
});