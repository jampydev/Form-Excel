document.addEventListener('DOMContentLoaded', function() {
    // Elementos del DOM
    const form = document.getElementById('myForm');
    const submitBtn = document.getElementById('submitBtn');
    const btnText = submitBtn.querySelector('.btn-text');
    const spinner = submitBtn.querySelector('.spinner');
    
    // URL de tu script de Apps Script (DEBES REEMPLAZARLA)
    const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzX3cSsQMQRSML6YAuIr72lM-iWBDgG-_03FoaRLUSccnKELWfsb-LmrCFsASordBLq/exec';

    // Función para mostrar/ocultar carga
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

        document.querySelector('.close').onclick = function() {
            modal.style.display = 'none';
        };
    }

    // Función para validar el formulario
    function validateForm(nombre, celular, cedula) {
        if (!nombre || nombre.trim().split(' ').length < 2) {
            showErrorModal('Por favor ingresa nombre y apellido completos');
            return false;
        }

        if (!celular || !/^\d{10}$/.test(celular)) {
            showErrorModal('El celular debe tener 10 dígitos numéricos');
            return false;
        }

        if (!cedula || !/^\d{6,12}$/.test(cedula)) {
            showErrorModal('La cédula debe tener entre 6 y 12 dígitos');
            return false;
        }

        return true;
    }

    // Función para enviar datos a Google Sheets
    async function sendToGoogleSheets(nombre, celular, cedula) {
        try {
            // Crear objeto con los datos
            const formData = {
                nombre: nombre,
                celular: celular,
                cedula: cedula
            };

            // Enviar como JSON
            const response = await fetch(SCRIPT_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            // Procesar la respuesta
            if (response.ok) {
                return await response.json();
            } else {
                // Si hay un error en la respuesta
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Error al enviar los datos');
            }
            
        } catch (error) {
            console.error('Error al enviar:', error);
            throw new Error('No se pudo conectar con el servidor: ' + error.message);
        }
    }

    // Evento submit del formulario
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        toggleLoading(true);

        const nombre = document.getElementById('nombre').value.trim();
        const celular = document.getElementById('celular').value.trim();
        const cedula = document.getElementById('cedula').value.trim();

        if (!validateForm(nombre, celular, cedula)) {
            toggleLoading(false);
            return;
        }

        try {
            const result = await sendToGoogleSheets(nombre, celular, cedula);
            
            if (result && result.success) {
                showSuccessModal(nombre);
            } else {
                throw new Error(result?.message || 'Error al guardar los datos');
            }
        } catch (error) {
            showErrorModal(error.message);
        } finally {
            toggleLoading(false);
        }
    });

    // Cerrar modales al hacer clic fuera
    window.addEventListener('click', function(e) {
        if (e.target.id === 'validationModal' || e.target.id === 'successModal') {
            e.target.style.display = 'none';
        }
    });
});