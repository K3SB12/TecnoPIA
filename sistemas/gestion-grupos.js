// sistemas/gestion-grupos.js
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar la gestión de grupos
    inicializarGestionGrupos();
    
    // Cargar grupos existentes
    cargarGruposExistentes();
    
    // Configurar eventos
    configurarEventos();
    
    // Configurar modales
    configurarModales();
});

function inicializarGestionGrupos() {
    // Establecer fecha actual en inputs de fecha
    const fechaInputs = document.querySelectorAll('input[type="date"]');
    const hoy = new Date().toISOString().split('T')[0];
    fechaInputs.forEach(input => {
        if (!input.value) {
            input.value = hoy;
        }
    });
}

function cargarGruposExistentes() {
    const listaGrupos = document.getElementById('listaGrupos');
    
    try {
        const gruposGuardados = localStorage.getItem('tecnoPIA_grupos');
        if (gruposGuardados) {
            const grupos = JSON.parse(gruposGuardados);
            
            if (grupos.length > 0) {
                mostrarGrupos(grupos);
            } else {
                mostrarPlaceholderGrupos();
            }
        } else {
            mostrarPlaceholderGrupos();
        }
    } catch (error) {
        console.error('Error cargando grupos:', error);
        mostrarPlaceholderGrupos();
    }
}

function mostrarGrupos(grupos) {
    const listaGrupos = document.getElementById('listaGrupos');
    const buscarInput = document.getElementById('buscarGrupos');
    
    // Función para renderizar grupos
    function renderizarGrupos(gruposFiltrados) {
        listaGrupos.innerHTML = '';
        
        if (gruposFiltrados.length === 0) {
            listaGrupos.innerHTML = `
                <div class="grupo-placeholder">
                    <i class="fas fa-search fa-3x"></i>
                    <p>No se encontraron grupos con ese criterio</p>
                </div>
            `;
            return;
        }
        
        gruposFiltrados.forEach(grupo => {
            const grupoElement = document.createElement('div');
            grupoElement.className = 'grupo-card';
            grupoElement.dataset.id = grupo.id;
            
            // Calcular estadísticas del grupo
            const totalEstudiantes = grupo.estudiantes ? grupo.estudiantes.length : 0;
            const evaluados = grupo.evaluados || 0;
            const promedio = grupo.promedio || 0;
            
            grupoElement.innerHTML = `
                <div class="grupo-card-header">
                    <div class="grupo-icon">
                        <i class="fas fa-users"></i>
                    </div>
                    <div class="grupo-info">
                        <h4>${grupo.nombre}</h4>
                        <p>${grupo.nivel} - ${grupo.asignatura}</p>
                        <small>Año ${grupo.anno}</small>
                    </div>
                    <div class="grupo-actions">
                        <button class="btn-icon btn-seleccionar" title="Seleccionar grupo">
                            <i class="fas fa-check"></i>
                        </button>
                        <button class="btn-icon btn-editar" title="Editar grupo">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon btn-eliminar" title="Eliminar grupo">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="grupo-card-body">
                    <div class="grupo-stats-mini">
                        <div class="stat-mini">
                            <i class="fas fa-user-graduate"></i>
                            <span>${totalEstudiantes}</span>
                            <small>Estudiantes</small>
                        </div>
                        <div class="stat-mini">
                            <i class="fas fa-chart-line"></i>
                            <span>${promedio}%</span>
                            <small>Promedio</small>
                        </div>
                        <div class="stat-mini">
                            <i class="fas fa-clipboard-check"></i>
                            <span>${evaluados}</span>
                            <small>Evaluados</small>
                        </div>
                    </div>
                    <div class="grupo-horario">
                        <i class="fas fa-clock"></i>
                        <span>${grupo.horario || 'Horario no definido'}</span>
                    </div>
                </div>
            `;
            
            listaGrupos.appendChild(grupoElement);
        });
        
        // Configurar eventos de los botones de grupo
        configurarEventosGrupos();
    }
    
    // Renderizar todos los grupos inicialmente
    renderizarGrupos(grupos);
    
    // Configurar búsqueda
    buscarInput.addEventListener('input', function() {
        const termino = this.value.toLowerCase();
        const gruposFiltrados = grupos.filter(grupo => 
            grupo.nombre.toLowerCase().includes(termino) ||
            grupo.nivel.toLowerCase().includes(termino) ||
            grupo.asignatura.toLowerCase().includes(termino)
        );
        renderizarGrupos(gruposFiltrados);
    });
}

function mostrarPlaceholderGrupos() {
    const listaGrupos = document.getElementById('listaGrupos');
    listaGrupos.innerHTML = `
        <div class="grupo-placeholder">
            <i class="fas fa-users fa-3x"></i>
            <p>No hay grupos creados aún</p>
            <button class="btn btn-primary" id="crearPrimerGrupo">
                <i class="fas fa-plus"></i> Crear primer grupo
            </button>
        </div>
    `;
    
    // Configurar evento del botón
    document.getElementById('crearPrimerGrupo').addEventListener('click', function() {
        document.getElementById('modalNuevoGrupo').style.display = 'block';
    });
}

function configurarEventos() {
    // Botón para nuevo grupo
    document.getElementById('nuevoGrupo').addEventListener('click', function() {
        document.getElementById('modalNuevoGrupo').style.display = 'block';
    });
    
    // Botón para importar estudiantes
    document.getElementById('importarEstudiantes').addEventListener('click', function() {
        document.getElementById('modalImportarCSV').style.display = 'block';
    });
    
    // Botón para exportar grupos
    document.getElementById('exportarGrupos').addEventListener('click', exportarDatosGrupos);
    
    // Configurar búsqueda de estudiantes
    const buscarEstudiantes = document.getElementById('buscarEstudiantes');
    buscarEstudiantes.addEventListener('input', function() {
        filtrarEstudiantes(this.value);
    });
}

function configurarModales() {
    // Configurar todos los modales
    const modales = document.querySelectorAll('.modal');
    
    modales.forEach(modal => {
        const closeButtons = modal.querySelectorAll('.modal-close');
        
        closeButtons.forEach(button => {
            button.addEventListener('click', function() {
                modal.style.display = 'none';
            });
        });
        
        // Cerrar al hacer clic fuera del contenido
        window.addEventListener('click', function(event) {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        });
    });
    
    // Configurar formulario de nuevo grupo
    const formNuevoGrupo = document.getElementById('formNuevoGrupo');
    formNuevoGrupo.addEventListener('submit', function(e) {
        e.preventDefault();
        crearNuevoGrupo();
    });
    
    // Configurar formulario de nuevo estudiante
    const formNuevoEstudiante = document.getElementById('formNuevoEstudiante');
    formNuevoEstudiante.addEventListener('submit', function(e) {
        e.preventDefault();
        agregarNuevoEstudiante();
    });
    
    // Configurar importación CSV
    configurarImportacionCSV();
}

function configurarEventosGrupos() {
    // Botones de selección
    const botonesSeleccionar = document.querySelectorAll('.btn-seleccionar');
    botonesSeleccionar.forEach(boton => {
        boton.addEventListener('click', function() {
            const grupoId = this.closest('.grupo-card').dataset.id;
            seleccionarGrupo(grupoId);
        });
    });
    
    // Botones de edición
    const botonesEditar = document.querySelectorAll('.btn-editar');
    botonesEditar.forEach(boton => {
        boton.addEventListener('click', function() {
            const grupoId = this.closest('.grupo-card').dataset.id;
            editarGrupo(grupoId);
        });
    });
    
    // Botones de eliminación
    const botonesEliminar = document.querySelectorAll('.btn-eliminar');
    botonesEliminar.forEach(boton => {
        boton.addEventListener('click', function() {
            const grupoId = this.closest('.grupo-card').dataset.id;
            eliminarGrupo(grupoId);
        });
    });
}

function crearNuevoGrupo() {
    const nombre = document.getElementById('nombreGrupo').value;
    const nivel = document.getElementById('nivelGrupo').value;
    const anno = document.getElementById('annoGrupo').value;
    const asignatura = document.getElementById('asignaturaGrupo').value;
    const horario = document.getElementById('horarioGrupo').value;
    const descripcion = document.getElementById('descripcionGrupo').value;
    
    // Validar datos
    if (!nombre || !nivel || !anno || !asignatura) {
        mostrarNotificacion('Por favor complete todos los campos obligatorios', 'error');
        return;
    }
    
    // Crear objeto grupo
    const nuevoGrupo = {
        id: Date.now().toString(),
        nombre: nombre,
        nivel: nivel,
        anno: anno,
        asignatura: asignatura,
        horario: horario,
        descripcion: descripcion,
        estudiantes: [],
        fechaCreacion: new Date().toISOString(),
        promedio: 0,
        evaluados: 0
    };
    
    // Guardar en localStorage
    try {
        const gruposGuardados = localStorage.getItem('tecnoPIA_grupos');
        let grupos = gruposGuardados ? JSON.parse(gruposGuardados) : [];
        
        // Verificar si ya existe un grupo con el mismo nombre
        const existeGrupo = grupos.some(grupo => grupo.nombre === nombre && grupo.anno === anno);
        if (existeGrupo) {
            mostrarNotificacion('Ya existe un grupo con ese nombre para este año', 'warning');
            return;
        }
        
        grupos.push(nuevoGrupo);
        localStorage.setItem('tecnoPIA_grupos', JSON.stringify(grupos));
        
        // Cerrar modal y limpiar formulario
        document.getElementById('modalNuevoGrupo').style.display = 'none';
        formNuevoGrupo.reset();
        
        // Actualizar lista de grupos
        cargarGruposExistentes();
        
        // Seleccionar el nuevo grupo automáticamente
        seleccionarGrupo(nuevoGrupo.id);
        
        mostrarNotificacion(`Grupo "${nombre}" creado exitosamente`, 'success');
        
    } catch (error) {
        console.error('Error creando grupo:', error);
        mostrarNotificacion('Error al crear el grupo', 'error');
    }
}

function seleccionarGrupo(grupoId) {
    // Obtener información del grupo
    const gruposGuardados = localStorage.getItem('tecnoPIA_grupos');
    if (!gruposGuardados) return;
    
    const grupos = JSON.parse(gruposGuardados);
    const grupoSeleccionado = grupos.find(g => g.id === grupoId);
    
    if (!grupoSeleccionado) return;
    
    // Actualizar información del grupo en la UI
    const grupoInfo = document.getElementById('grupoInfo');
    const nombreGrupo = document.getElementById('nombreGrupoSeleccionado');
    const totalEstudiantes = document.getElementById('totalEstudiantes');
    const promedioGrupo = document.getElementById('promedioGrupo');
    const evaluadosGrupo = document.getElementById('evaluadosGrupo');
    
    // Mostrar panel de información del grupo
    grupoInfo.style.display = 'block';
    
    // Actualizar datos
    nombreGrupo.textContent = `${grupoSeleccionado.nombre} - ${grupoSeleccionado.nivel}`;
    
    const estudiantes = grupoSeleccionado.estudiantes || [];
    totalEstudiantes.textContent = estudiantes.length;
    
    // Calcular promedio del grupo
    const promedio = calcularPromedioGrupo(grupoSeleccionado);
    promedioGrupo.textContent = `${promedio}%`;
    
    // Calcular estudiantes evaluados
    const evaluados = estudiantes.filter(e => e.evaluado).length;
    evaluadosGrupo.textContent = evaluados;
    
    // Habilitar búsqueda y botón para agregar estudiantes
    document.getElementById('buscarEstudiantes').disabled = false;
    document.getElementById('agregarEstudiante').disabled = false;
    
    // Habilitar acciones rápidas
    const accionesRapidas = document.querySelectorAll('.quick-action');
    accionesRapidas.forEach(accion => accion.disabled = false);
    
    // Mostrar estudiantes del grupo
    mostrarEstudiantesDelGrupo(grupoSeleccionado);
    
    // Mostrar estadísticas del grupo
    mostrarEstadisticasGrupo(grupoSeleccionado);
    
    // Resaltar grupo seleccionado en la lista
    const grupoCards = document.querySelectorAll('.grupo-card');
    grupoCards.forEach(card => {
        card.classList.remove('selected');
        if (card.dataset.id === grupoId) {
            card.classList.add('selected');
        }
    });
}

function calcularPromedioGrupo(grupo) {
    if (!grupo.estudiantes || grupo.estudiantes.length === 0) return 0;
    
    let totalPuntajes = 0;
    let estudiantesEvaluados = 0;
    
    grupo.estudiantes.forEach(estudiante => {
        if (estudiante.promedio) {
            totalPuntajes += estudiante.promedio;
            estudiantesEvaluados++;
        }
    });
    
    return estudiantesEvaluados > 0 ? Math.round(totalPuntajes / estudiantesEvaluados) : 0;
}

function mostrarEstudiantesDelGrupo(grupo) {
    const listaEstudiantes = document.getElementById('listaEstudiantes');
    const estudiantes = grupo.estudiantes || [];
    
    if (estudiantes.length === 0) {
        listaEstudiantes.innerHTML = `
            <div class="estudiante-placeholder">
                <i class="fas fa-user-graduate fa-3x"></i>
                <p>Este grupo no tiene estudiantes aún</p>
                <button class="btn btn-primary" id="agregarPrimerEstudiante">
                    <i class="fas fa-user-plus"></i> Agregar primer estudiante
                </button>
            </div>
        `;
        
        // Configurar evento del botón
        document.getElementById('agregarPrimerEstudiante').addEventListener('click', function() {
            document.getElementById('modalNuevoEstudiante').style.display = 'block';
        });
        
        return;
    }
    
    // Crear tabla de estudiantes
    let html = `
        <div class="estudiantes-table">
            <div class="table-header">
                <div class="col-nombre">Nombre</div>
                <div class="col-cedula">Cédula</div>
                <div class="col-promedio">Promedio</div>
                <div class="col-estado">Estado</div>
                <div class="col-acciones">Acciones</div>
            </div>
            <div class="table-body">
    `;
    
    estudiantes.forEach((estudiante, index) => {
        const promedio = estudiante.promedio || 0;
        const evaluado = estudiante.evaluado || false;
        
        // Determinar color según promedio
        let colorPromedio = '#ff4757'; // Rojo para bajo
        if (promedio >= 70) colorPromedio = '#2ed573'; // Verde para bueno
        else if (promedio >= 50) colorPromedio = '#ffa502'; // Naranja para regular
        
        html += `
            <div class="table-row" data-id="${estudiante.id}">
                <div class="col-nombre">
                    <div class="estudiante-avatar">
                        <i class="fas fa-user-circle"></i>
                    </div>
                    <div class="estudiante-info">
                        <strong>${estudiante.nombre} ${estudiante.apellidos}</strong>
                        <small>${estudiante.correo || 'Sin correo'}</small>
                    </div>
                </div>
                <div class="col-cedula">${estudiante.cedula || 'No especificada'}</div>
                <div class="col-promedio">
                    <div class="promedio-badge" style="background-color: ${colorPromedio}">
                        ${promedio}%
                    </div>
                </div>
                <div class="col-estado">
                    <span class="estado-badge ${evaluado ? 'estado-activo' : 'estado-inactivo'}">
                        <i class="fas fa-${evaluado ? 'check-circle' : 'clock'}"></i>
                        ${evaluado ? 'Evaluado' : 'Pendiente'}
                    </span>
                </div>
                <div class="col-acciones">
                    <button class="btn-icon btn-evaluar" title="Evaluar estudiante">
                        <i class="fas fa-clipboard-check"></i>
                    </button>
                    <button class="btn-icon btn-editar-estudiante" title="Editar estudiante">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon btn-eliminar-estudiante" title="Eliminar estudiante">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    });
    
    html += `
            </div>
        </div>
    `;
    
    listaEstudiantes.innerHTML = html;
    
    // Configurar eventos de los botones de estudiantes
    configurarEventosEstudiantes(grupo.id);
}

function configurarEventosEstudiantes(grupoId) {
    // Botones para evaluar estudiante
    const botonesEvaluar = document.querySelectorAll('.btn-evaluar');
    botonesEvaluar.forEach(boton => {
        boton.addEventListener('click', function() {
            const estudianteId = this.closest('.table-row').dataset.id;
            evaluarEstudiante(grupoId, estudianteId);
        });
    });
    
    // Botones para editar estudiante
    const botonesEditar = document.querySelectorAll('.btn-editar-estudiante');
    botonesEditar.forEach(boton => {
        boton.addEventListener('click', function() {
            const estudianteId = this.closest('.table-row').dataset.id;
            editarEstudiante(grupoId, estudianteId);
        });
    });
    
    // Botones para eliminar estudiante
    const botonesEliminar = document.querySelectorAll('.btn-eliminar-estudiante');
    botonesEliminar.forEach(boton => {
        boton.addEventListener('click', function() {
            const estudianteId = this.closest('.table-row').dataset.id;
            eliminarEstudiante(grupoId, estudianteId);
        });
    });
}

function filtrarEstudiantes(termino) {
    const filas = document.querySelectorAll('.table-row');
    termino = termino.toLowerCase();
    
    filas.forEach(fila => {
        const nombre = fila.querySelector('.col-nombre').textContent.toLowerCase();
        const cedula = fila.querySelector('.col-cedula').textContent.toLowerCase();
        
        if (nombre.includes(termino) || cedula.includes(termino)) {
            fila.style.display = '';
        } else {
            fila.style.display = 'none';
        }
    });
}

function mostrarEstadisticasGrupo(grupo) {
    const estadisticasContainer = document.getElementById('estadisticasGrupo');
    const estudiantes = grupo.estudiantes || [];
    
    if (estudiantes.length === 0) {
        estadisticasContainer.innerHTML = `
            <div class="chart-placeholder">
                <i class="fas fa-chart-bar fa-3x"></i>
                <p>Agregue estudiantes para ver estadísticas</p>
            </div>
        `;
        return;
    }
    
    // Calcular distribución de calificaciones
    const distribucion = {
        excelente: 0,
        bueno: 0,
        regular: 0,
        insuficiente: 0
    };
    
    estudiantes.forEach(estudiante => {
        const promedio = estudiante.promedio || 0;
        
        if (promedio >= 90) distribucion.excelente++;
        else if (promedio >= 70) distribucion.bueno++;
        else if (promedio >= 50) distribucion.regular++;
        else distribucion.insuficiente++;
    });
    
    // Calcular porcentajes
    const total = estudiantes.length;
    const porcentajes = {
        excelente: Math.round((distribucion.excelente / total) * 100),
        bueno: Math.round((distribucion.bueno / total) * 100),
        regular: Math.round((distribucion.regular / total) * 100),
        insuficiente: Math.round((distribucion.insuficiente / total) * 100)
    };
    
    // Crear gráfico de barras simple
    let html = `
        <div class="stats-charts">
            <div class="chart-container">
                <h4>Distribución de Calificaciones</h4>
                <div class="bar-chart">
                    <div class="bar-item">
                        <div class="bar-label">Excelente (90-100%)</div>
                        <div class="bar-track">
                            <div class="bar-fill" style="width: ${porcentajes.excelente}%; background-color: #2ed573;"></div>
                        </div>
                        <div class="bar-value">${distribucion.excelente} (${porcentajes.excelente}%)</div>
                    </div>
                    <div class="bar-item">
                        <div class="bar-label">Bueno (70-89%)</div>
                        <div class="bar-track">
                            <div class="bar-fill" style="width: ${porcentajes.bueno}%; background-color: #1e90ff;"></div>
                        </div>
                        <div class="bar-value">${distribucion.bueno} (${porcentajes.bueno}%)</div>
                    </div>
                    <div class="bar-item">
                        <div class="bar-label">Regular (50-69%)</div>
                        <div class="bar-track">
                            <div class="bar-fill" style="width: ${porcentajes.regular}%; background-color: #ffa502;"></div>
                        </div>
                        <div class="bar-value">${distribucion.regular} (${porcentajes.regular}%)</div>
                    </div>
                    <div class="bar-item">
                        <div class="bar-label">Insuficiente (0-49%)</div>
                        <div class="bar-track">
                            <div class="bar-fill" style="width: ${porcentajes.insuficiente}%; background-color: #ff4757;"></div>
                        </div>
                        <div class="bar-value">${distribucion.insuficiente} (${porcentajes.insuficiente}%)</div>
                    </div>
                </div>
            </div>
            
            <div class="stats-summary">
                <div class="stat-summary-item">
                    <i class="fas fa-user-graduate" style="color: #2ed573;"></i>
                    <div>
                        <h5>${estudiantes.length}</h5>
                        <p>Total Estudiantes</p>
                    </div>
                </div>
                <div class="stat-summary-item">
                    <i class="fas fa-chart-line" style="color: #1e90ff;"></i>
                    <div>
                        <h5>${calcularPromedioGrupo(grupo)}%</h5>
                        <p>Promedio General</p>
                    </div>
                </div>
                <div class="stat-summary-item">
                    <i class="fas fa-check-circle" style="color: #ffa502;"></i>
                    <div>
                        <h5>${estudiantes.filter(e => e.evaluado).length}</h5>
                        <p>Estudiantes Evaluados</p>
                    </div>
                </div>
                <div class="stat-summary-item">
                    <i class="fas fa-clock" style="color: #ff4757;"></i>
                    <div>
                        <h5>${estudiantes.filter(e => !e.evaluado).length}</h5>
                        <p>Pendientes de Evaluar</p>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    estadisticasContainer.innerHTML = html;
}

function agregarNuevoEstudiante() {
    // Obtener grupo seleccionado
    const grupoSeleccionado = document.querySelector('.grupo-card.selected');
    if (!grupoSeleccionado) {
        mostrarNotificacion('Por favor seleccione un grupo primero', 'warning');
        return;
    }
    
    const grupoId = grupoSeleccionado.dataset.id;
    
    // Obtener datos del formulario
    const nombre = document.getElementById('nombreEstudiante').value;
    const apellidos = document.getElementById('apellidosEstudiante').value;
    const cedula = document.getElementById('cedulaEstudiante').value;
    const fechaNacimiento = document.getElementById('fechaNacimiento').value;
    const genero = document.getElementById('generoEstudiante').value;
    const telefono = document.getElementById('telefonoEstudiante').value;
    const correo = document.getElementById('correoEstudiante').value;
    const observaciones = document.getElementById('observacionesEstudiante').value;
    
    // Validar datos
    if (!nombre || !apellidos) {
        mostrarNotificacion('Por favor complete al menos el nombre y apellidos', 'error');
        return;
    }
    
    // Crear objeto estudiante
    const nuevoEstudiante = {
        id: Date.now().toString(),
        nombre: nombre,
        apellidos: apellidos,
        cedula: cedula,
        fechaNacimiento: fechaNacimiento,
        genero: genero,
        telefono: telefono,
        correo: correo,
        observaciones: observaciones,
        fechaRegistro: new Date().toISOString(),
        promedio: 0,
        evaluado: false
    };
    
    // Guardar en localStorage
    try {
        const gruposGuardados = localStorage.getItem('tecnoPIA_grupos');
        if (!gruposGuardados) return;
        
        const grupos = JSON.parse(gruposGuardados);
        const grupoIndex = grupos.findIndex(g => g.id === grupoId);
        
        if (grupoIndex === -1) {
            mostrarNotificacion('Grupo no encontrado', 'error');
            return;
        }
        
        // Verificar si ya existe un estudiante con la misma cédula
        if (cedula) {
            const existeEstudiante = grupos[grupoIndex].estudiantes.some(e => e.cedula === cedula);
            if (existeEstudiante) {
                mostrarNotificacion('Ya existe un estudiante con esta cédula en el grupo', 'warning');
                return;
            }
        }
        
        // Agregar estudiante al grupo
        if (!grupos[grupoIndex].estudiantes) {
            grupos[grupoIndex].estudiantes = [];
        }
        
        grupos[grupoIndex].estudiantes.push(nuevoEstudiante);
        
        // Actualizar localStorage
        localStorage.setItem('tecnoPIA_grupos', JSON.stringify(grupos));
        
        // Cerrar modal y limpiar formulario
        document.getElementById('modalNuevoEstudiante').style.display = 'none';
        document.getElementById('formNuevoEstudiante').reset();
        
        // Actualizar vista del grupo
        seleccionarGrupo(grupoId);
        
        mostrarNotificacion(`Estudiante "${nombre} ${apellidos}" agregado exitosamente`, 'success');
        
    } catch (error) {
        console.error('Error agregando estudiante:', error);
        mostrarNotificacion('Error al agregar el estudiante', 'error');
    }
}

function evaluarEstudiante(grupoId, estudianteId) {
    // Redirigir a la página de evaluación con los parámetros adecuados
    window.location.href = `evaluacion-mep.html?grupo=${grupoId}&estudiante=${estudianteId}`;
}

function editarGrupo(grupoId) {
    // Implementar edición de grupo
    mostrarNotificacion('Funcionalidad de edición de grupo en desarrollo', 'info');
}

function eliminarGrupo(grupoId) {
    if (!confirm('¿Está seguro de que desea eliminar este grupo? Esta acción no se puede deshacer.')) {
        return;
    }
    
    try {
        const gruposGuardados = localStorage.getItem('tecnoPIA_grupos');
        if (!gruposGuardados) return;
        
        const grupos = JSON.parse(gruposGuardados);
        const grupoIndex = grupos.findIndex(g => g.id === grupoId);
        
        if (grupoIndex === -1) return;
        
        // Eliminar grupo
        const grupoEliminado = grupos.splice(grupoIndex, 1)[0];
        
        // Actualizar localStorage
        localStorage.setItem('tecnoPIA_grupos', JSON.stringify(grupos));
        
        // Actualizar lista de grupos
        cargarGruposExistentes();
        
        // Limpiar vista de estudiantes y estadísticas
        document.getElementById('listaEstudiantes').innerHTML = `
            <div class="estudiante-placeholder">
                <i class="fas fa-user-graduate fa-3x"></i>
                <p>Seleccione un grupo para ver sus estudiantes</p>
            </div>
        `;
        
        document.getElementById('estadisticasGrupo').innerHTML = `
            <div class="chart-placeholder">
                <i class="fas fa-chart-bar fa-3x"></i>
                <p>Seleccione un grupo para ver estadísticas</p>
            </div>
        `;
        
        // Ocultar información del grupo
        document.getElementById('grupoInfo').style.display = 'none';
        
        // Deshabilitar controles
        document.getElementById('buscarEstudiantes').disabled = true;
        document.getElementById('agregarEstudiante').disabled = true;
        
        const accionesRapidas = document.querySelectorAll('.quick-action');
        accionesRapidas.forEach(accion => accion.disabled = true);
        
        mostrarNotificacion(`Grupo "${grupoEliminado.nombre}" eliminado exitosamente`, 'success');
        
    } catch (error) {
        console.error('Error eliminando grupo:', error);
        mostrarNotificacion('Error al eliminar el grupo', 'error');
    }
}

function editarEstudiante(grupoId, estudianteId) {
    // Implementar edición de estudiante
    mostrarNotificacion('Funcionalidad de edición de estudiante en desarrollo', 'info');
}

function eliminarEstudiante(grupoId, estudianteId) {
    if (!confirm('¿Está seguro de que desea eliminar este estudiante? Esta acción no se puede deshacer.')) {
        return;
    }
    
    try {
        const gruposGuardados = localStorage.getItem('tecnoPIA_grupos');
        if (!gruposGuardados) return;
        
        const grupos = JSON.parse(gruposGuardados);
        const grupoIndex = grupos.findIndex(g => g.id === grupoId);
        
        if (grupoIndex === -1) return;
        
        const estudiantes = grupos[grupoIndex].estudiantes;
        const estudianteIndex = estudiantes.findIndex(e => e.id === estudianteId);
        
        if (estudianteIndex === -1) return;
        
        // Eliminar estudiante
        const estudianteEliminado = estudiantes.splice(estudianteIndex, 1)[0];
        
        // Actualizar localStorage
        localStorage.setItem('tecnoPIA_grupos', JSON.stringify(grupos));
        
        // Actualizar vista del grupo
        seleccionarGrupo(grupoId);
        
        mostrarNotificacion(`Estudiante "${estudianteEliminado.nombre} ${estudianteEliminado.apellidos}" eliminado exitosamente`, 'success');
        
    } catch (error) {
        console.error('Error eliminando estudiante:', error);
        mostrarNotificacion('Error al eliminar el estudiante', 'error');
    }
}

function configurarImportacionCSV() {
    const dropArea = document.getElementById('dropArea');
    const fileInput = document.getElementById('fileInput');
    const browseButton = document.getElementById('browseFiles');
    const confirmarButton = document.getElementById('confirmarImportacion');
    const preview = document.getElementById('importPreview');
    const previewTable = document.getElementById('previewTable');
    
    let archivoCSV = null;
    let datosCSV = [];
    
    // Prevenir comportamientos por defecto para el área de drop
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, preventDefaults, false);
    });
    
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    // Resaltar área de drop
    ['dragenter', 'dragover'].forEach(eventName => {
        dropArea.addEventListener(eventName, highlight, false);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, unhighlight, false);
    });
    
    function highlight() {
        dropArea.classList.add('highlight');
    }
    
    function unhighlight() {
        dropArea.classList.remove('highlight');
    }
    
    // Manejar drop de archivos
    dropArea.addEventListener('drop', handleDrop, false);
    
    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        
        if (files.length > 0) {
            procesarArchivo(files[0]);
        }
    }
    
    // Manejar selección de archivos
    browseButton.addEventListener('click', function() {
        fileInput.click();
    });
    
    fileInput.addEventListener('change', function() {
        if (this.files.length > 0) {
            procesarArchivo(this.files[0]);
        }
    });
    
    function procesarArchivo(file) {
        // Verificar que sea un archivo CSV
        if (!file.name.toLowerCase().endsWith('.csv')) {
            mostrarNotificacion('Por favor seleccione un archivo CSV', 'error');
            return;
        }
        
        archivoCSV = file;
        
        // Leer el archivo CSV
        const reader = new FileReader();
        
        reader.onload = function(e) {
            const contenido = e.target.result;
            procesarContenidoCSV(contenido);
        };
        
        reader.onerror = function() {
            mostrarNotificacion('Error al leer el archivo', 'error');
        };
        
        reader.readAsText(file);
    }
    
    function procesarContenidoCSV(contenido) {
        try {
            // Parsear CSV
            const lineas = contenido.split('\n');
            if (lineas.length < 2) {
                mostrarNotificacion('El archivo CSV está vacío o tiene formato incorrecto', 'error');
                return;
            }
            
            // Obtener encabezados
            const encabezados = lineas[0].split(',').map(h => h.trim().toLowerCase());
            
            // Procesar datos
            datosCSV = [];
            
            for (let i = 1; i < Math.min(lineas.length, 11); i++) { // Mostrar máximo 10 filas en vista previa
                if (lineas[i].trim() === '') continue;
                
                const valores = lineas[i].split(',');
                const fila = {};
                
                encabezados.forEach((encabezado, index) => {
                    if (valores[index]) {
                        fila[encabezado] = valores[index].trim();
                    }
                });
                
                // Verificar que tenga al menos nombre y apellidos
                if (fila.nombre && fila.apellidos) {
                    datosCSV.push(fila);
                }
            }
            
            if (datosCSV.length === 0) {
                mostrarNotificacion('No se encontraron datos válidos en el archivo CSV', 'error');
                return;
            }
            
            // Mostrar vista previa
            mostrarVistaPreviaCSV(datosCSV, encabezados);
            
            // Habilitar botón de confirmación
            confirmarButton.disabled = false;
            
        } catch (error) {
            console.error('Error procesando CSV:', error);
            mostrarNotificacion('Error al procesar el archivo CSV', 'error');
        }
    }
    
    function mostrarVistaPreviaCSV(datos, encabezados) {
        // Crear encabezados de la tabla
        let html = '<tr>';
        encabezados.forEach(encabezado => {
            if (['nombre', 'apellidos', 'cedula', 'correo', 'telefono'].includes(encabezado)) {
                html += `<th>${encabezado.charAt(0).toUpperCase() + encabezado.slice(1)}</th>`;
            }
        });
        html += '</tr>';
        
        // Agregar filas de datos
        datos.forEach(fila => {
            html += '<tr>';
            encabezados.forEach(encabezado => {
                if (['nombre', 'apellidos', 'cedula', 'correo', 'telefono'].includes(encabezado)) {
                    html += `<td>${fila[encabezado] || ''}</td>`;
                }
            });
            html += '</tr>';
        });
        
        previewTable.innerHTML = html;
        preview.style.display = 'block';
    }
    
    // Confirmar importación
    confirmarButton.addEventListener('click', function() {
        if (!archivoCSV || datosCSV.length === 0) {
            mostrarNotificacion('No hay datos para importar', 'error');
            return;
        }
        
        // Obtener grupo seleccionado
        const grupoSeleccionado = document.querySelector('.grupo-card.selected');
        if (!grupoSeleccionado) {
            mostrarNotificacion('Por favor seleccione un grupo primero', 'warning');
            return;
        }
        
        const grupoId = grupoSeleccionado.dataset.id;
        importarEstudiantesCSV(grupoId, datosCSV);
    });
}

function importarEstudiantesCSV(grupoId, datos) {
    try {
        const gruposGuardados = localStorage.getItem('tecnoPIA_grupos');
        if (!gruposGuardados) return;
        
        const grupos = JSON.parse(gruposGuardados);
        const grupoIndex = grupos.findIndex(g => g.id === grupoId);
        
        if (grupoIndex === -1) {
            mostrarNotificacion('Grupo no encontrado', 'error');
            return;
        }
        
        // Crear estudiantes desde datos CSV
        const nuevosEstudiantes = datos.map(fila => {
            return {
                id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                nombre: fila.nombre || '',
                apellidos: fila.apellidos || '',
                cedula: fila.cedula || '',
                correo: fila.correo || '',
                telefono: fila.telefono || '',
                fechaRegistro: new Date().toISOString(),
                promedio: 0,
                evaluado: false
            };
        });
        
        // Agregar estudiantes al grupo
        if (!grupos[grupoIndex].estudiantes) {
            grupos[grupoIndex].estudiantes = [];
        }
        
        grupos[grupoIndex].estudiantes.push(...nuevosEstudiantes);
        
        // Actualizar localStorage
        localStorage.setItem('tecnoPIA_grupos', JSON.stringify(grupos));
        
        // Cerrar modal
        document.getElementById('modalImportarCSV').style.display = 'none';
        
        // Actualizar vista del grupo
        seleccionarGrupo(grupoId);
        
        mostrarNotificacion(`${nuevosEstudiantes.length} estudiantes importados exitosamente`, 'success');
        
    } catch (error) {
        console.error('Error importando estudiantes:', error);
        mostrarNotificacion('Error al importar estudiantes', 'error');
    }
}

function exportarDatosGrupos() {
    try {
        const gruposGuardados = localStorage.getItem('tecnoPIA_grupos');
        if (!gruposGuardados) {
            mostrarNotificacion('No hay datos para exportar', 'info');
            return;
        }
        
        const grupos = JSON.parse(gruposGuardados);
        
        // Crear contenido para exportación
        let contenido = 'Grupo,Nivel,Año,Asignatura,Estudiantes,Promedio\n';
        
        grupos.forEach(grupo => {
            const estudiantes = grupo.estudiantes ? grupo.estudiantes.length : 0;
            const promedio = grupo.promedio || 0;
            
            contenido += `"${grupo.nombre}","${grupo.nivel}","${grupo.anno}","${grupo.asignatura}",${estudiantes},${promedio}\n`;
        });
        
        // Crear archivo y descargar
        const blob = new Blob([contenido], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `grupos_tecnoPIA_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        mostrarNotificacion('Datos de grupos exportados exitosamente', 'success');
        
    } catch (error) {
        console.error('Error exportando datos:', error);
        mostrarNotificacion('Error al exportar datos', 'error');
    }
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
    
    // Estilos
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
    
    // Agregar animación si no existe
    if (!document.querySelector('style#notificacion-styles')) {
        const style = document.createElement('style');
        style.id = 'notificacion-styles';
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
    }
    
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
