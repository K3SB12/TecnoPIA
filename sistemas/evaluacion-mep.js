// sistemas/evaluacion-mep.js
document.addEventListener('DOMContentLoaded', function() {
    // Configurar fecha actual por defecto
    const fechaInput = document.getElementById('fechaEvaluacion');
    const hoy = new Date().toISOString().split('T')[0];
    fechaInput.value = hoy;
    
    // Cargar grupos disponibles
    cargarGrupos();
    
    // Configurar eventos de los tabs de áreas
    configurarTabsAreas();
    
    // Configurar botones de escala
    configurarBotonesEscala();
    
    // Configurar botones de control
    configurarBotonesControl();
    
    // Configurar eventos de cálculo
    document.getElementById('calcularEvaluacion').addEventListener('click', calcularEvaluacionCompleta);
    document.getElementById('generarInforme').addEventListener('click', generarInformePDF);
    
    // Configurar eventos de exportación
    document.getElementById('exportarEvaluacion').addEventListener('click', mostrarModalExportacion);
    
    // Configurar eventos del modal
    configurarModalExportacion();
});

function cargarGrupos() {
    const grupoSelect = document.getElementById('grupoSelect');
    const estudianteSelect = document.getElementById('estudianteSelect');
    
    // Limpiar opciones
    grupoSelect.innerHTML = '<option value="">Seleccionar grupo...</option>';
    estudianteSelect.innerHTML = '<option value="">Primero seleccione un grupo</option>';
    estudianteSelect.disabled = true;
    
    try {
        // Obtener grupos del localStorage o usar datos de ejemplo
        const gruposGuardados = localStorage.getItem('tecnoPIA_grupos');
        if (gruposGuardados) {
            const grupos = JSON.parse(gruposGuardados);
            
            grupos.forEach(grupo => {
                const option = document.createElement('option');
                option.value = grupo.id;
                option.textContent = `${grupo.nombre} (${grupo.nivel})`;
                grupoSelect.appendChild(option);
            });
            
            // Si hay grupos, agregar opción para crear nuevo
            if (grupos.length > 0) {
                const optionNuevo = document.createElement('option');
                optionNuevo.value = "nuevo";
                optionNuevo.textContent = "+ Crear nuevo grupo";
                grupoSelect.appendChild(optionNuevo);
            }
        } else {
            // Datos de ejemplo
            const gruposEjemplo = [
                { id: '1', nombre: '7-1', nivel: 'Séptimo', anno: '2024' },
                { id: '2', nombre: '8-2', nivel: 'Octavo', anno: '2024' },
                { id: '3', nombre: '9-3', nivel: 'Noveno', anno: '2024' }
            ];
            
            gruposEjemplo.forEach(grupo => {
                const option = document.createElement('option');
                option.value = grupo.id;
                option.textContent = `${grupo.nombre} (${grupo.nivel})`;
                grupoSelect.appendChild(option);
            });
        }
        
        // Configurar evento de cambio de grupo
        grupoSelect.addEventListener('change', function() {
            if (this.value === 'nuevo') {
                window.location.href = 'gestion-grupos.html';
                return;
            }
            
            if (this.value) {
                cargarEstudiantes(this.value);
                estudianteSelect.disabled = false;
            } else {
                estudianteSelect.innerHTML = '<option value="">Primero seleccione un grupo</option>';
                estudianteSelect.disabled = true;
            }
        });
        
    } catch (error) {
        console.error('Error cargando grupos:', error);
        mostrarNotificacion('Error al cargar los grupos', 'error');
    }
}

function cargarEstudiantes(grupoId) {
    const estudianteSelect = document.getElementById('estudianteSelect');
    
    // Limpiar opciones
    estudianteSelect.innerHTML = '<option value="">Seleccionar estudiante...</option>';
    
    try {
        // Obtener estudiantes del grupo
        const gruposGuardados = localStorage.getItem('tecnoPIA_grupos');
        if (gruposGuardados) {
            const grupos = JSON.parse(gruposGuardados);
            const grupoSeleccionado = grupos.find(g => g.id === grupoId);
            
            if (grupoSeleccionado && grupoSeleccionado.estudiantes) {
                grupoSeleccionado.estudiantes.forEach(estudiante => {
                    const option = document.createElement('option');
                    option.value = estudiante.id;
                    option.textContent = `${estudiante.nombre} ${estudiante.apellidos}`;
                    estudianteSelect.appendChild(option);
                });
            }
        }
        
        // Si no hay estudiantes, usar datos de ejemplo
        if (estudianteSelect.options.length === 1) {
            const estudiantesEjemplo = [
                { id: '1', nombre: 'Ana', apellidos: 'García Pérez' },
                { id: '2', nombre: 'Carlos', apellidos: 'Rodríguez Sánchez' },
                { id: '3', nombre: 'María', apellidos: 'López Martínez' },
                { id: '4', nombre: 'José', apellidos: 'Fernández Gómez' }
            ];
            
            estudiantesEjemplo.forEach(estudiante => {
                const option = document.createElement('option');
                option.value = estudiante.id;
                option.textContent = `${estudiante.nombre} ${estudiante.apellidos}`;
                estudianteSelect.appendChild(option);
            });
        }
        
        // Agregar opción para agregar nuevo estudiante
        const optionNuevo = document.createElement('option');
        optionNuevo.value = "nuevo";
        optionNuevo.textContent = "+ Agregar nuevo estudiante";
        estudianteSelect.appendChild(optionNuevo);
        
        // Configurar evento de cambio de estudiante
        estudianteSelect.addEventListener('change', function() {
            if (this.value === 'nuevo') {
                window.location.href = 'gestion-grupos.html';
                return;
            }
            
            if (this.value) {
                // Cargar evaluación existente si la hay
                cargarEvaluacionExistente(this.value);
            }
        });
        
    } catch (error) {
        console.error('Error cargando estudiantes:', error);
        mostrarNotificacion('Error al cargar los estudiantes', 'error');
    }
}

function configurarTabsAreas() {
    const tabs = document.querySelectorAll('.area-tab');
    const containers = document.querySelectorAll('.area-container');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const area = this.getAttribute('data-area');
            
            // Remover activo de todos los tabs
            tabs.forEach(t => t.classList.remove('active'));
            containers.forEach(c => c.classList.remove('active'));
            
            // Activar tab seleccionado
            this.classList.add('active');
            
            // Mostrar contenedor correspondiente
            document.getElementById(`area-${area}`).classList.add('active');
        });
    });
    
    // Configurar botones expandir/colapsar
    document.getElementById('expandirTodo').addEventListener('click', function() {
        containers.forEach(c => c.classList.add('active'));
        tabs.forEach(t => t.classList.add('active'));
    });
    
    document.getElementById('colapsarTodo').addEventListener('click', function() {
        containers.forEach(c => c.classList.remove('active'));
        tabs.forEach(t => t.classList.remove('active'));
        
        // Solo dejar activo el primero
        tabs[0].classList.add('active');
        containers[0].classList.add('active');
    });
}

function configurarBotonesEscala() {
    const botonesEscala = document.querySelectorAll('.btn-escala');
    
    botonesEscala.forEach(boton => {
        boton.addEventListener('click', function() {
            const indicador = this.getAttribute('data-indicador');
            const valor = parseInt(this.getAttribute('data-value'));
            
            // Actualizar puntaje visual
            const puntajeElement = document.getElementById(`puntaje-${indicador}`);
            puntajeElement.textContent = valor;
            
            // Resaltar botón seleccionado
            const botonesIndicador = document.querySelectorAll(`[data-indicador="${indicador}"]`);
            botonesIndicador.forEach(b => b.classList.remove('selected'));
            this.classList.add('selected');
            
            // Actualizar visualización de escala
            const escalaItems = document.querySelectorAll(`[data-indicador="${indicador}"]`).closest('.indicador-item').querySelectorAll('.escala-item');
            escalaItems.forEach(item => {
                const itemValor = parseInt(item.getAttribute('data-value'));
                item.classList.remove('selected');
                if (valor >= itemValor) {
                    item.classList.add('selected');
                }
            });
            
            // Calcular área automáticamente
            calcularArea(indicador.split('-')[0]);
            
            // Mostrar notificación
            mostrarNotificacion(`Indicador ${indicador} evaluado con ${valor} puntos`, 'success');
        });
    });
}

function configurarBotonesControl() {
    // Guardar evaluación
    document.getElementById('guardarEvaluacion').addEventListener('click', guardarEvaluacion);
    
    // Exportar evaluación
    document.getElementById('exportarEvaluacion').addEventListener('click', mostrarModalExportacion);
}

function calcularArea(area) {
    // Obtener todos los indicadores del área
    const indicadores = document.querySelectorAll(`[data-indicador^="${area}-"]`);
    let total = 0;
    let contador = 0;
    
    indicadores.forEach(boton => {
        if (boton.classList.contains('selected')) {
            const valor = parseInt(boton.getAttribute('data-value'));
            total += valor;
            contador++;
        }
    });
    
    // Actualizar resumen del área
    const puntajeTotal = document.getElementById(`puntaje-${area}-total`);
    const progressBar = document.getElementById(`progress-${area}`);
    const nivelElement = document.getElementById(`nivel-${area}`);
    
    if (contador > 0) {
        const promedio = total / contador;
        const porcentaje = (total / (contador * 10)) * 100;
        
        puntajeTotal.textContent = `${total}/${contador * 10}`;
        progressBar.style.width = `${porcentaje}%`;
        
        // Determinar nivel
        let nivel = 'Insuficiente';
        let color = '#ff4757';
        
        if (promedio >= 7) {
            nivel = 'Excelente';
            color = '#2ed573';
        } else if (promedio >= 5) {
            nivel = 'Satisfactorio';
            color = '#1e90ff';
        } else if (promedio >= 3) {
            nivel = 'En Proceso';
            color = '#ffa502';
        }
        
        nivelElement.textContent = nivel;
        nivelElement.style.color = color;
        progressBar.style.backgroundColor = color;
    }
}

function calcularEvaluacionCompleta() {
    const areas = ['cognitivo', 'procedimental', 'actitudinal', 'socioemocional'];
    let puntajeTotalGlobal = 0;
    let indicadoresEvaluados = 0;
    
    areas.forEach(area => {
        const indicadores = document.querySelectorAll(`[data-indicador^="${area}-"]`);
        let areaTotal = 0;
        
        indicadores.forEach(boton => {
            if (boton.classList.contains('selected')) {
                const valor = parseInt(boton.getAttribute('data-value'));
                areaTotal += valor;
                indicadoresEvaluados++;
            }
        });
        
        puntajeTotalGlobal += areaTotal;
    });
    
    // Actualizar puntaje total global
    const puntajeTotalElement = document.getElementById('puntaje-total-global');
    const calificacionFinalElement = document.getElementById('calificacion-final');
    
    puntajeTotalElement.textContent = puntajeTotalGlobal;
    
    // Calcular calificación final
    let calificacion = 'No evaluado';
    let color = '#95a5a6';
    
    if (indicadoresEvaluados > 0) {
        const porcentaje = (puntajeTotalGlobal / (indicadoresEvaluados * 10)) * 100;
        
        if (porcentaje >= 90) {
            calificacion = 'Excelente (A)';
            color = '#2ed573';
        } else if (porcentaje >= 80) {
            calificacion = 'Muy Bueno (B)';
            color = '#7bed9f';
        } else if (porcentaje >= 70) {
            calificacion = 'Bueno (C)';
            color = '#1e90ff';
        } else if (porcentaje >= 60) {
            calificacion = 'Satisfactorio (D)';
            color = '#ffa502';
        } else {
            calificacion = 'Insuficiente (F)';
            color = '#ff4757';
        }
    }
    
    calificacionFinalElement.textContent = calificacion;
    calificacionFinalElement.style.color = color;
    
    // Generar recomendaciones automáticas
    generarRecomendacionesAutomaticas();
    
    // Mostrar notificación
    mostrarNotificacion(`Evaluación calculada: ${puntajeTotalGlobal} puntos totales`, 'success');
}

function generarRecomendacionesAutomaticas() {
    const recomendacionesContainer = document.getElementById('recomendacionesContainer');
    const areas = ['cognitivo', 'procedimental', 'actitudinal', 'socioemocional'];
    let recomendacionesHTML = '';
    
    areas.forEach(area => {
        const nivelElement = document.getElementById(`nivel-${area}`);
        const nivel = nivelElement.textContent;
        
        if (nivel !== 'No evaluado') {
            let recomendacion = '';
            let icono = '';
            
            switch(area) {
                case 'cognitivo':
                    icono = '🧠';
                    if (nivel === 'Insuficiente' || nivel === 'En Proceso') {
                        recomendacion = 'Reforzar conceptos básicos con ejercicios prácticos y tutorías individualizadas.';
                    } else if (nivel === 'Satisfactorio') {
                        recomendacion = 'Profundizar en aplicaciones avanzadas de los conceptos aprendidos.';
                    } else {
                        recomendacion = 'Desafiar con problemas complejos y proyectos de investigación.';
                    }
                    break;
                    
                case 'procedimental':
                    icono = '👐';
                    if (nivel === 'Insuficiente' || nivel === 'En Proceso') {
                        recomendacion = 'Practicar procedimientos paso a paso con supervisión constante.';
                    } else if (nivel === 'Satisfactorio') {
                        recomendacion = 'Fomentar aplicación independiente de procedimientos en nuevos contextos.';
                    } else {
                        recomendacion = 'Promover creación de nuevos procedimientos y optimización de existentes.';
                    }
                    break;
                    
                case 'actitudinal':
                    icono = '❤️';
                    if (nivel === 'Insuficiente' || nivel === 'En Proceso') {
                        recomendacion = 'Establecer metas conductuales claras y sistema de refuerzo positivo.';
                    } else if (nivel === 'Satisfactorio') {
                        recomendacion = 'Fomentar autonomía y responsabilidad en cumplimiento de compromisos.';
                    } else {
                        recomendacion = 'Reconocer como modelo positivo y asignar roles de liderazgo.';
                    }
                    break;
                    
                case 'socioemocional':
                    icono = '👥';
                    if (nivel === 'Insuficiente' || nivel === 'En Proceso') {
                        recomendacion = 'Trabajar habilidades sociales básicas y participación grupal guiada.';
                    } else if (nivel === 'Satisfactorio') {
                        recomendacion = 'Promover roles activos en trabajo colaborativo y resolución de conflictos.';
                    } else {
                        recomendacion = 'Fomentar liderazgo y mediación en dinámicas grupales.';
                    }
                    break;
            }
            
            recomendacionesHTML += `
                <div class="recomendacion-item">
                    <div class="recomendacion-icon">${icono}</div>
                    <div class="recomendacion-content">
                        <h6>${area.charAt(0).toUpperCase() + area.slice(1)}: ${nivel}</h6>
                        <p>${recomendacion}</p>
                    </div>
                </div>
            `;
        }
    });
    
    if (recomendacionesHTML) {
        recomendacionesContainer.innerHTML = recomendacionesHTML;
    } else {
        recomendacionesContainer.innerHTML = '<p class="placeholder-text">Seleccione puntuaciones para ver recomendaciones</p>';
    }
}

function guardarEvaluacion() {
    const estudianteSelect = document.getElementById('estudianteSelect');
    const grupoSelect = document.getElementById('grupoSelect');
    
    if (!estudianteSelect.value || estudianteSelect.value === 'nuevo') {
        mostrarNotificacion('Por favor seleccione un estudiante', 'warning');
        return;
    }
    
    if (!grupoSelect.value) {
        mostrarNotificacion('Por favor seleccione un grupo', 'warning');
        return;
    }
    
    // Recopilar datos de evaluación
    const evaluacion = {
        id: Date.now(),
        fecha: document.getElementById('fechaEvaluacion').value,
        grupoId: grupoSelect.value,
        estudianteId: estudianteSelect.value,
        estudianteNombre: estudianteSelect.options[estudianteSelect.selectedIndex].text,
        asignatura: document.getElementById('asignaturaSelect').value,
        periodo: document.getElementById('periodoSelect').value,
        tipoEvaluacion: document.getElementById('tipoEvaluacion').value,
        observaciones: document.getElementById('observacionesGenerales').value,
        fechaGuardado: new Date().toISOString()
    };
    
    // Recopilar puntuaciones por indicador
    evaluacion.puntuaciones = {};
    const botonesSeleccionados = document.querySelectorAll('.btn-escala.selected');
    
    botonesSeleccionados.forEach(boton => {
        const indicador = boton.getAttribute('data-indicador');
        const valor = parseInt(boton.getAttribute('data-value'));
        evaluacion.puntuaciones[indicador] = valor;
    });
    
    // Guardar en localStorage
    try {
        const evaluacionesGuardadas = localStorage.getItem('tecnoPIA_evaluaciones');
        let evaluaciones = evaluacionesGuardadas ? JSON.parse(evaluacionesGuardadas) : [];
        
        // Verificar si ya existe evaluación para este estudiante en este periodo
        const indexExistente = evaluaciones.findIndex(e => 
            e.estudianteId === evaluacion.estudianteId && 
            e.periodo === evaluacion.periodo &&
            e.asignatura === evaluacion.asignatura
        );
        
        if (indexExistente !== -1) {
            evaluaciones[indexExistente] = evaluacion;
        } else {
            evaluaciones.push(evaluacion);
        }
        
        localStorage.setItem('tecnoPIA_evaluaciones', JSON.stringify(evaluaciones));
        
        mostrarNotificacion('Evaluación guardada exitosamente', 'success');
        
    } catch (error) {
        console.error('Error guardando evaluación:', error);
        mostrarNotificacion('Error al guardar la evaluación', 'error');
    }
}

function cargarEvaluacionExistente(estudianteId) {
    try {
        const evaluacionesGuardadas = localStorage.getItem('tecnoPIA_evaluaciones');
        if (!evaluacionesGuardadas) return;
        
        const evaluaciones = JSON.parse(evaluacionesGuardadas);
        const evaluacionReciente = evaluaciones.find(e => e.estudianteId === estudianteId);
        
        if (evaluacionReciente) {
            // Cargar datos de la evaluación
            document.getElementById('fechaEvaluacion').value = evaluacionReciente.fecha;
            document.getElementById('asignaturaSelect').value = evaluacionReciente.asignatura;
            document.getElementById('periodoSelect').value = evaluacionReciente.periodo;
            document.getElementById('tipoEvaluacion').value = evaluacionReciente.tipoEvaluacion;
            document.getElementById('observacionesGenerales').value = evaluacionReciente.observaciones || '';
            
            // Cargar puntuaciones
            if (evaluacionReciente.puntuaciones) {
                Object.keys(evaluacionReciente.puntuaciones).forEach(indicador => {
                    const valor = evaluacionReciente.puntuaciones[indicador];
                    const boton = document.querySelector(`[data-indicador="${indicador}"][data-value="${valor}"]`);
                    if (boton) {
                        boton.click();
                    }
                });
            }
            
            mostrarNotificacion('Evaluación anterior cargada', 'info');
        }
    } catch (error) {
        console.error('Error cargando evaluación existente:', error);
    }
}

function mostrarModalExportacion() {
    const modal = document.getElementById('modalExportacion');
    modal.style.display = 'block';
}

function configurarModalExportacion() {
    const modal = document.getElementById('modalExportacion');
    const closeBtn = modal.querySelector('.modal-close');
    const exportButtons = modal.querySelectorAll('.btn-export');
    
    // Cerrar modal
    closeBtn.addEventListener('click', function() {
        modal.style.display = 'none';
    });
    
    // Cerrar al hacer clic fuera del contenido
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
    
    // Configurar botones de exportación
    exportButtons.forEach(button => {
        button.addEventListener('click', function() {
            const format = this.getAttribute('data-format');
            exportarEvaluacion(format);
            modal.style.display = 'none';
        });
    });
}

function exportarEvaluacion(format) {
    const estudianteSelect = document.getElementById('estudianteSelect');
    
    if (!estudianteSelect.value || estudianteSelect.value === 'nuevo') {
        mostrarNotificacion('Por favor seleccione un estudiante', 'warning');
        return;
    }
    
    // Recopilar datos para exportación
    const datosExportacion = {
        estudiante: estudianteSelect.options[estudianteSelect.selectedIndex].text,
        fecha: document.getElementById('fechaEvaluacion').value,
        asignatura: document.getElementById('asignaturaSelect').options[document.getElementById('asignaturaSelect').selectedIndex].text,
        periodo: document.getElementById('periodoSelect').options[document.getElementById('periodoSelect').selectedIndex].text,
        tipoEvaluacion: document.getElementById('tipoEvaluacion').options[document.getElementById('tipoEvaluacion').selectedIndex].text,
        puntajeTotal: document.getElementById('puntaje-total-global').textContent,
        calificacion: document.getElementById('calificacion-final').textContent,
        observaciones: document.getElementById('observacionesGenerales').value,
        fechaExportacion: new Date().toLocaleString()
    };
    
    // Recopilar puntuaciones por área
    const areas = ['cognitivo', 'procedimental', 'actitudinal', 'socioemocional'];
    datosExportacion.areas = {};
    
    areas.forEach(area => {
        datosExportacion.areas[area] = {
            puntaje: document.getElementById(`puntaje-${area}-total`).textContent,
            nivel: document.getElementById(`nivel-${area}`).textContent
        };
    });
    
    // Generar contenido según formato
    let contenido = '';
    let filename = '';
    let mimeType = '';
    
    switch(format) {
        case 'pdf':
            // Simular generación de PDF
            contenido = generarContenidoPDF(datosExportacion);
            filename = `Evaluacion_MEP_${datosExportacion.estudiante}_${datosExportacion.fecha}.pdf`;
            mimeType = 'application/pdf';
            break;
            
        case 'excel':
            contenido = generarContenidoExcel(datosExportacion);
            filename = `Evaluacion_MEP_${datosExportacion.estudiante}_${datosExportacion.fecha}.xlsx`;
            mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
            break;
            
        case 'word':
            contenido = generarContenidoWord(datosExportacion);
            filename = `Evaluacion_MEP_${datosExportacion.estudiante}_${datosExportacion.fecha}.docx`;
            mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
            break;
    }
    
    // Simular descarga
    const blob = new Blob([contenido], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    mostrarNotificacion(`Evaluación exportada como ${format.toUpperCase()}`, 'success');
}

function generarContenidoPDF(datos) {
    // Contenido HTML para PDF
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Evaluación MEP - ${datos.estudiante}</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 40px; }
                .header { text-align: center; margin-bottom: 30px; }
                .header h1 { color: #2c3e50; }
                .info-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                .info-table td { padding: 8px; border: 1px solid #ddd; }
                .area-table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
                .area-table th { background-color: #f8f9fa; padding: 10px; text-align: left; }
                .observaciones { margin-top: 30px; padding: 15px; background-color: #f8f9fa; border-radius: 5px; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>EVALUACIÓN OFICIAL MEP</h1>
                <h2>Sistema de Evaluación de los Aprendizajes</h2>
            </div>
            
            <table class="info-table">
                <tr>
                    <td><strong>Estudiante:</strong></td>
                    <td>${datos.estudiante}</td>
                    <td><strong>Fecha:</strong></td>
                    <td>${datos.fecha}</td>
                </tr>
                <tr>
                    <td><strong>Asignatura:</strong></td>
                    <td>${datos.asignatura}</td>
                    <td><strong>Período:</strong></td>
                    <td>${datos.periodo}</td>
                </tr>
                <tr>
                    <td><strong>Tipo de evaluación:</strong></td>
                    <td>${datos.tipoEvaluacion}</td>
                    <td><strong>Calificación final:</strong></td>
                    <td>${datos.calificacion}</td>
                </tr>
            </table>
            
            <h3>Resultados por Área de Desempeño</h3>
            <table class="area-table">
                <tr>
                    <th>Área</th>
                    <th>Puntaje</th>
                    <th>Nivel de Desempeño</th>
                </tr>
                <tr>
                    <td>Cognitiva</td>
                    <td>${datos.areas.cognitivo.puntaje}</td>
                    <td>${datos.areas.cognitivo.nivel}</td>
                </tr>
                <tr>
                    <td>Procedimental</td>
                    <td>${datos.areas.procedimental.puntaje}</td>
                    <td>${datos.areas.procedimental.nivel}</td>
                </tr>
                <tr>
                    <td>Actitudinal</td>
                    <td>${datos.areas.actitudinal.puntaje}</td>
                    <td>${datos.areas.actitudinal.nivel}</td>
                </tr>
                <tr>
                    <td>Socioemocional</td>
                    <td>${datos.areas.socioemocional.puntaje}</td>
                    <td>${datos.areas.socioemocional.nivel}</td>
                </tr>
            </table>
            
            <div class="observaciones">
                <h4>Observaciones y Recomendaciones</h4>
                <p>${datos.observaciones || 'Sin observaciones registradas.'}</p>
            </div>
            
            <div style="margin-top: 50px; text-align: center; font-size: 12px; color: #7f8c8d;">
                <p>Documento generado automáticamente por TecnoPIA - Sistema de Evaluación MEP</p>
                <p>Fecha de exportación: ${datos.fechaExportacion}</p>
            </div>
        </body>
        </html>
    `;
}

function generarContenidoExcel(datos) {
    // Contenido CSV simplificado para Excel
    const filas = [
        ['EVALUACIÓN MEP - EXPORTACIÓN DE DATOS'],
        [''],
        ['Datos Generales'],
        ['Estudiante', datos.estudiante],
        ['Fecha de evaluación', datos.fecha],
        ['Asignatura', datos.asignatura],
        ['Período', datos.periodo],
        ['Tipo de evaluación', datos.tipoEvaluacion],
        ['Calificación final', datos.calificacion],
        ['Puntaje total', datos.puntajeTotal],
        [''],
        ['Resultados por Área'],
        ['Área', 'Puntaje', 'Nivel de Desempeño'],
        ['Cognitiva', datos.areas.cognitivo.puntaje, datos.areas.cognitivo.nivel],
        ['Procedimental', datos.areas.procedimental.puntaje, datos.areas.procedimental.nivel],
        ['Actitudinal', datos.areas.actitudinal.puntaje, datos.areas.actitudinal.nivel],
        ['Socioemocional', datos.areas.socioemocional.puntaje, datos.areas.socioemocional.nivel],
        [''],
        ['Observaciones'],
        [datos.observaciones || 'Sin observaciones registradas'],
        [''],
        ['Información de Exportación'],
        ['Fecha de exportación', datos.fechaExportacion],
        ['Sistema', 'TecnoPIA - Sistema de Evaluación MEP']
    ];
    
    return filas.map(fila => fila.join(',')).join('\n');
}

function generarContenidoWord(datos) {
    // Contenido XML simplificado para Word
    return `
        <?xml version="1.0" encoding="UTF-8" standalone="yes"?>
        <?mso-application progid="Word.Document"?>
        <w:wordDocument xmlns:w="http://schemas.microsoft.com/office/word/2003/wordml">
        <w:body>
            <w:p>
                <w:r>
                    <w:t>EVALUACIÓN OFICIAL MEP</w:t>
                </w:r>
            </w:p>
            <w:p>
                <w:r>
                    <w:t>Estudiante: ${datos.estudiante}</w:t>
                </w:r>
            </w:p>
            <w:p>
                <w:r>
                    <w:t>Fecha: ${datos.fecha}</w:t>
                </w:r>
            </w:p>
            <w:p>
                <w:r>
                    <w:t>Asignatura: ${datos.asignatura}</w:t>
                </w:r>
            </w:p>
            <w:p>
                <w:r>
                    <w:t>Período: ${datos.periodo}</w:t>
                </w:r>
            </w:p>
            <w:p>
                <w:r>
                    <w:t>Calificación final: ${datos.calificacion}</w:t>
                </w:r>
            </w:p>
            <w:p>
                <w:r>
                    <w:t>Observaciones: ${datos.observaciones || 'Sin observaciones registradas'}</w:t>
                </w:r>
            </w:p>
        </w:body>
        </w:wordDocument>
    `;
}

function generarInformePDF() {
    // Implementación simple de generación de informe
    const estudianteSelect = document.getElementById('estudianteSelect');
    
    if (!estudianteSelect.value || estudianteSelect.value === 'nuevo') {
        mostrarNotificacion('Por favor seleccione un estudiante', 'warning');
        return;
    }
    
    // Primero calcular la evaluación si no se ha hecho
    calcularEvaluacionCompleta();
    
    // Luego exportar como PDF
    exportarEvaluacion('pdf');
}

function mostrarNotificacion(mensaje, tipo = 'info') {
    // Crear elemento de notificación
    const notificacion = document.createElement('div');
    notificacion.className = `notificacion notificacion-${tipo}`;
    notificacion.innerHTML = `
        <div class="notificacion-icon">
            <i class="fas fa-${tipo === 'success' ? 'check-circle' : tipo === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        </div>
        <div class="notificacion-content">
            <p>${mensaje}</p>
        </div>
        <button class="notificacion-close">&times;</button>
    `;
    
    // Agregar estilos
    notificacion.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${tipo === 'success' ? '#2ed573' : tipo === 'error' ? '#ff4757' : '#1e90ff'};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        gap: 15px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 1000;
        animation: slideIn 0.3s ease-out;
        max-width: 400px;
    `;
    
    // Estilos para animación
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
        .notificacion-close {
            background: none;
            border: none;
            color: white;
            font-size: 20px;
            cursor: pointer;
            padding: 0;
            margin: 0;
        }
    `;
    document.head.appendChild(style);
    
    // Configurar botón de cerrar
    const closeBtn = notificacion.querySelector('.notificacion-close');
    closeBtn.addEventListener('click', function() {
        notificacion.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => {
            if (notificacion.parentNode) {
                notificacion.parentNode.removeChild(notificacion);
            }
        }, 300);
    });
    
    // Agregar al documento
    document.body.appendChild(notificacion);
    
    // Auto-remover después de 5 segundos
    setTimeout(() => {
        if (notificacion.parentNode) {
            notificacion.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => {
                if (notificacion.parentNode) {
                    notificacion.parentNode.removeChild(notificacion);
                }
            }, 300);
        }
    }, 5000);
}
