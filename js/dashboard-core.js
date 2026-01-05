// dashboard-core.js - Lógica principal del Dashboard TecnoPIA

// Variables globales
let datosPNFT = null;
let nivelSeleccionado = null;
let areaSeleccionada = null;
let saberesSeleccionados = [];
let planificacionActual = null;

// Datos de ejemplo del PNFT (se cargarán desde tu plantilla)
const PNFT_DATA = {
    "Materno/Transición": {
        areas: ["Apropiación tecnológica y Digital", "Programación y Algoritmos"],
        saberes: [
            {
                id: "mt-001",
                area: "Apropiación tecnológica y Digital",
                nombre: "Computadora",
                indicadores: ["Identificar qué es una computadora y algunas de sus características"],
                nivel: "Materno/Transición",
                modulo: 1
            },
            {
                id: "mt-002",
                area: "Programación y Algoritmos",
                nombre: "Entorno de programación iconográfico",
                indicadores: ["Reconocer el entorno de programación iconográfico"],
                nivel: "Materno/Transición",
                modulo: 1
            }
        ]
    },
    "1°-3° (Ciclo I)": {
        areas: ["Apropiación tecnológica y Digital", "Programación y Algoritmos", "Ciencia de datos e Inteligencia artificial"],
        saberes: [
            {
                id: "ciclo1-001",
                area: "Programación y Algoritmos",
                nombre: "Algoritmo",
                indicadores: ["Identificar un algoritmo en situaciones de la vida diaria"],
                nivel: "1°-3° (Ciclo I)",
                modulo: 1
            },
            {
                id: "ciclo1-002",
                area: "Apropiación tecnológica y Digital",
                nombre: "Herramientas de creación de contenido multimedia",
                indicadores: ["Utilizar herramientas de creación de contenido multimedia"],
                nivel: "1°-3° (Ciclo I)",
                modulo: 2
            }
        ]
    },
    "4°-6° (Ciclo II)": {
        areas: ["Apropiación tecnológica y Digital", "Programación y Algoritmos", "Computación física y Robótica", "Ciencia de datos e Inteligencia artificial"],
        saberes: [
            {
                id: "ciclo2-001",
                area: "Programación y Algoritmos",
                nombre: "Estructuras condicionales",
                indicadores: ["Utilizar estructuras condicionales simples y compuestas"],
                nivel: "4°-6° (Ciclo II)",
                modulo: 2
            },
            {
                id: "ciclo2-002",
                area: "Computación física y Robótica",
                nombre: "Robot",
                indicadores: ["Reconocer qué es un robot, sus componentes y algunos de sus usos"],
                nivel: "4°-6° (Ciclo II)",
                modulo: 2
            }
        ]
    },
    "7°-9° (Ciclo III)": {
        areas: ["Apropiación tecnológica y Digital", "Programación y Algoritmos", "Computación física y Robótica", "Ciencia de datos e Inteligencia artificial"],
        saberes: [
            {
                id: "ciclo3-001",
                area: "Programación y Algoritmos",
                nombre: "Procedimientos/funciones",
                indicadores: ["Aplicar procedimientos y/o funciones como estructura modular"],
                nivel: "7°-9° (Ciclo III)",
                modulo: 1
            },
            {
                id: "ciclo3-002",
                area: "Ciencia de datos e Inteligencia artificial",
                nombre: "Herramientas generativas",
                indicadores: ["Utilizar herramientas generativas basadas en inteligencia artificial"],
                nivel: "7°-9° (Ciclo III)",
                modulo: 2
            }
        ]
    }
};

// Función principal de inicialización
function inicializarDashboard() {
    console.log("Dashboard TecnoPIA inicializado");
    
    // Cargar datos del PNFT
    cargarDatosPNFT();
    
    // Configurar event listeners
    configurarEventListeners();
    
    // Cargar planificación guardada si existe
    cargarPlanificacionGuardada();
    
    // Actualizar contador de saberes
    actualizarContadorSaberes();
}

// Cargar datos del PNFT (aquí integrarías con tu base de datos real)
function cargarDatosPNFT() {
    console.log("Cargando datos del PNFT...");
    
    // En una implementación real, esto cargaría desde tu plantilla
    // Por ahora usamos datos de ejemplo
    datosPNFT = PNFT_DATA;
    
    // Mostrar mensaje de éxito
    mostrarNotificacion("Datos del PNFT cargados correctamente", "success");
}

// Configurar todos los event listeners
function configurarEventListeners() {
    // Selector de nivel
    document.querySelectorAll('.nivel-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const nivel = this.getAttribute('data-nivel');
            seleccionarNivel(nivel);
        });
    });
    
    // Selector de áreas (se configuran dinámicamente)
    document.addEventListener('click', function(e) {
        if (e.target.closest('.area-btn')) {
            const areaBtn = e.target.closest('.area-btn');
            const areaId = areaBtn.getAttribute('data-area');
            seleccionarArea(areaId);
        }
        
        // Selección de saberes
        if (e.target.closest('.saber-card')) {
            const saberCard = e.target.closest('.saber-card');
            const saberId = saberCard.getAttribute('data-saber-id');
            toggleSeleccionSaber(saberId);
        }
        
        // Eliminar saber seleccionado
        if (e.target.closest('.remove-btn')) {
            const saberId = e.target.closest('.remove-btn').getAttribute('data-saber-id');
            eliminarSaberSeleccionado(saberId);
        }
    });
}

// Seleccionar nivel educativo
function seleccionarNivel(nivelKey) {
    const nivelMap = {
        'materno': 'Materno/Transición',
        'ciclo1': '1°-3° (Ciclo I)',
        'ciclo2': '4°-6° (Ciclo II)',
        'ciclo3': '7°-9° (Ciclo III)'
    };
    
    nivelSeleccionado = nivelMap[nivelKey];
    
    // Actualizar UI
    document.querySelectorAll('.nivel-btn').forEach(btn => {
        btn.classList.remove('active', 'bg-blue-900/30', 'border', 'border-blue-500');
    });
    
    const btnActivo = document.querySelector(`.nivel-btn[data-nivel="${nivelKey}"]`);
    if (btnActivo) {
        btnActivo.classList.add('active', 'bg-blue-900/30', 'border', 'border-blue-500');
    }
    
    // Actualizar texto del nivel seleccionado
    const nivelTexto = document.getElementById('nivel-texto');
    if (nivelTexto) {
        nivelTexto.textContent = nivelMap[nivelKey];
    }
    
    // Mostrar panel de nivel seleccionado
    const nivelPanel = document.getElementById('nivel-seleccionado');
    if (nivelPanel) {
        nivelPanel.classList.remove('hidden');
    }
    
    // Cargar áreas para este nivel
    cargarAreasParaNivel(nivelSeleccionado);
    
    // Mostrar notificación
    mostrarNotificacion(`Nivel seleccionado: ${nivelMap[nivelKey]}`, "info");
    
    console.log(`Nivel seleccionado: ${nivelSeleccionado}`);
}

// Cargar áreas de conocimiento para el nivel seleccionado
function cargarAreasParaNivel(nivel) {
    if (!datosPNFT || !datosPNFT[nivel]) {
        console.error(`No hay datos para el nivel: ${nivel}`);
        return;
    }
    
    const areas = datosPNFT[nivel].areas;
    const container = document.getElementById('selector-areas');
    
    if (!container) return;
    
    // Limpiar container
    container.innerHTML = '';
    
    // Mapeo de áreas a iconos y colores
    const areaConfig = {
        'Apropiación tecnológica y Digital': {
            icono: 'fa-laptop',
            color: 'blue',
            key: 'apropiacion'
        },
        'Programación y Algoritmos': {
            icono: 'fa-code',
            color: 'green',
            key: 'programacion'
        },
        'Computación física y Robótica': {
            icono: 'fa-robot',
            color: 'yellow',
            key: 'robotica'
        },
        'Ciencia de datos e Inteligencia artificial': {
            icono: 'fa-chart-bar',
            color: 'purple',
            key: 'datos'
        }
    };
    
    // Crear botones para cada área
    areas.forEach(areaNombre => {
        const config = areaConfig[areaNombre] || { icono: 'fa-cube', color: 'gray', key: 'otro' };
        
        const areaHTML = `
            <button class="area-btn p-4 glass-dark rounded-xl text-center hover:bg-${config.color}-900/30 transition"
                    data-area="${config.key}"
                    data-area-nombre="${areaNombre}">
                <i class="fas ${config.icono} text-2xl mb-2 text-${config.color}-400"></i>
                <p class="font-medium text-sm">${areaNombre}</p>
            </button>
        `;
        
        container.innerHTML += areaHTML;
    });
    
    // Agregar event listeners a los nuevos botones
    document.querySelectorAll('.area-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const areaKey = this.getAttribute('data-area');
            const areaNombre = this.getAttribute('data-area-nombre');
            seleccionarArea(areaKey, areaNombre);
        });
    });
}

// Seleccionar área de conocimiento
function seleccionarArea(areaKey, areaNombre = null) {
    if (!nivelSeleccionado) {
        mostrarNotificacion("Primero selecciona un nivel educativo", "warning");
        return;
    }
    
    // Mapeo de keys a nombres completos
    const areaMap = {
        'apropiacion': 'Apropiación tecnológica y Digital',
        'programacion': 'Programación y Algoritmos',
        'robotica': 'Computación física y Robótica',
        'datos': 'Ciencia de datos e Inteligencia artificial'
    };
    
    areaSeleccionada = areaNombre || areaMap[areaKey] || areaKey;
    
    // Actualizar UI
    document.querySelectorAll('.area-btn').forEach(btn => {
        btn.classList.remove('active', 'border', 'border-blue-500');
    });
    
    const btnActivo = document.querySelector(`.area-btn[data-area="${areaKey}"]`);
    if (btnActivo) {
        btnActivo.classList.add('active', 'border', 'border-blue-500');
    }
    
    // Cargar saberes para esta área y nivel
    cargarSaberes(nivelSeleccionado, areaSeleccionada);
    
    // Mostrar notificación
    mostrarNotificacion(`Área seleccionada: ${areaSeleccionada}`, "info");
    
    console.log(`Área seleccionada: ${areaSeleccionada}`);
}

// Cargar saberes según nivel y área
function cargarSaberes(nivel, area) {
    if (!datosPNFT || !datosPNFT[nivel]) {
        console.error(`No hay datos para el nivel: ${nivel}`);
        return;
    }
    
    const container = document.getElementById('lista-saberes');
    if (!container) return;
    
    // Filtrar saberes por nivel y área
    const saberesFiltrados = datosPNFT[nivel].saberes.filter(
        saber => saber.area === area
    );
    
    // Mostrar mensaje si no hay saberes
    if (saberesFiltrados.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">
                    <i class="fas fa-inbox"></i>
                </div>
                <p class="text-gray-500">No hay saberes disponibles para esta combinación</p>
                <p class="text-sm text-gray-600 mt-2">Intenta con otra área o nivel</p>
            </div>
        `;
        return;
    }
    
    // Crear HTML para cada saber
    let saberesHTML = '';
    
    saberesFiltrados.forEach(saber => {
        const yaSeleccionado = saberesSeleccionados.some(s => s.id === saber.id);
        const claseSeleccionada = yaSeleccionado ? 'selected' : '';
        
        // Icono según área
        let icono = 'fa-cube';
        if (area.includes('Programación')) icono = 'fa-code';
        if (area.includes('Robótica')) icono = 'fa-robot';
        if (area.includes('Datos')) icono = 'fa-chart-bar';
        if (area.includes('Apropiación')) icono = 'fa-laptop';
        
        saberesHTML += `
            <div class="saber-card ${claseSeleccionada}" data-saber-id="${saber.id}">
                <div class="saber-header">
                    <div class="saber-icon">
                        <i class="fas ${icono} text-white"></i>
                    </div>
                    <div class="saber-info">
                        <div class="saber-title">${saber.nombre}</div>
                        <div class="saber-description">
                            ${saber.indicadores[0]}
                            ${saber.indicadores.length > 1 ? 
                                `<span class="text-xs text-blue-400 ml-2">+${saber.indicadores.length-1} más</span>` : ''}
                        </div>
                    </div>
                </div>
                <div class="saber-meta flex justify-between items-center mt-2">
                    <span class="text-xs text-gray-500">Módulo ${saber.modulo}</span>
                    <button class="text-xs px-2 py-1 rounded ${yaSeleccionado ? 
                        'bg-blue-900/50 text-blue-300' : 
                        'bg-gray-800 text-gray-400'}">
                        ${yaSeleccionado ? '✓ Seleccionado' : 'Seleccionar'}
                    </button>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = saberesHTML;
    
    // Agregar event listeners a los saberes
    document.querySelectorAll('.saber-card').forEach(card => {
        card.addEventListener('click', function() {
            const saberId = this.getAttribute('data-saber-id');
            toggleSeleccionSaber(saberId);
        });
    });
}

// Alternar selección de un saber
function toggleSeleccionSaber(saberId) {
    if (!nivelSeleccionado) {
        mostrarNotificacion("Primero selecciona un nivel", "warning");
        return;
    }
    
    // Buscar el saber en todos los niveles
    let saberEncontrado = null;
    for (const nivel in datosPNFT) {
        const saber = datosPNFT[nivel].saberes.find(s => s.id === saberId);
        if (saber) {
            saberEncontrado = saber;
            break;
        }
    }
    
    if (!saberEncontrado) {
        console.error(`Saber no encontrado: ${saberId}`);
        return;
    }
    
    // Verificar si ya está seleccionado
    const index = saberesSeleccionados.findIndex(s => s.id === saberId);
    
    if (index === -1) {
        // Agregar a la selección
        saberesSeleccionados.push(saberEncontrado);
        
        // Actualizar UI del card
        const card = document.querySelector(`.saber-card[data-saber-id="${saberId}"]`);
        if (card) {
            card.classList.add('selected');
            const btn = card.querySelector('button');
            if (btn) {
                btn.textContent = '✓ Seleccionado';
                btn.className = 'text-xs px-2 py-1 rounded bg-blue-900/50 text-blue-300';
            }
        }
        
        mostrarNotificacion(`Saber agregado: ${saberEncontrado.nombre}`, "success");
    } else {
        // Remover de la selección
        saberesSeleccionados.splice(index, 1);
        
        // Actualizar UI del card
        const card = document.querySelector(`.saber-card[data-saber-id="${saberId}"]`);
        if (card) {
            card.classList.remove('selected');
            const btn = card.querySelector('button');
            if (btn) {
                btn.textContent = 'Seleccionar';
                btn.className = 'text-xs px-2 py-1 rounded bg-gray-800 text-gray-400';
            }
        }
        
        mostrarNotificacion(`Saber removido: ${saberEncontrado.nombre}`, "info");
    }
    
    // Actualizar panel de saberes seleccionados
    actualizarPanelSaberesSeleccionados();
    
    // Actualizar contador
    actualizarContadorSaberes();
}

// Actualizar panel de saberes seleccionados
function actualizarPanelSaberesSeleccionados() {
    const container = document.getElementById('panel-saberes-seleccionados');
    if (!container) return;
    
    if (saberesSeleccionados.length === 0) {
        container.innerHTML = `
            <p class="text-gray-500 text-center py-6">
                <i class="fas fa-inbox text-2xl mb-2 block"></i>
                Los saberes que selecciones aparecerán aquí
            </p>
        `;
        return;
    }
    
    let saberesHTML = '';
    
    saberesSeleccionados.forEach((saber, index) => {
        // Icono según área
        let icono = 'fa-cube';
        if (saber.area.includes('Programación')) icono = 'fa-code';
        if (saber.area.includes('Robótica')) icono = 'fa-robot';
        if (saber.area.includes('Datos')) icono = 'fa-chart-bar';
        if (saber.area.includes('Apropiación')) icono = 'fa-laptop';
        
        saberesHTML += `
            <div class="selected-saber-item">
                <div class="saber-info">
                    <div class="flex items-center gap-2">
                        <div class="w-6 h-6 rounded bg-blue-900/50 flex items-center justify-center">
                            <i class="fas ${icono} text-xs text-blue-300"></i>
                        </div>
                        <div>
                            <div class="font-medium text-sm">${saber.nombre}</div>
                            <div class="text-xs text-gray-500">${saber.area}</div>
                        </div>
                    </div>
                </div>
                <div class="saber-actions">
                    <button class="remove-btn" data-saber-id="${saber.id}">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = saberesHTML;
}

// Eliminar saber seleccionado
function eliminarSaberSeleccionado(saberId) {
    const index = saberesSeleccionados.findIndex(s => s.id === saberId);
    
    if (index !== -1) {
        const saberRemovido = saberesSeleccionados[index];
        saberesSeleccionados.splice(index, 1);
        
        // Actualizar UI del card en la lista
        const card = document.querySelector(`.saber-card[data-saber-id="${saberId}"]`);
        if (card) {
            card.classList.remove('selected');
            const btn = card.querySelector('button');
            if (btn) {
                btn.textContent = 'Seleccionar';
                btn.className = 'text-xs px-2 py-1 rounded bg-gray-800 text-gray-400';
            }
        }
        
        // Actualizar panel
        actualizarPanelSaberesSeleccionados();
        
        // Actualizar contador
        actualizarContadorSaberes();
        
        mostrarNotificacion(`Saber removido: ${saberRemovido.nombre}`, "info");
    }
}

// Actualizar contador de saberes
function actualizarContadorSaberes() {
    const contador = document.getElementById('contador-saberes');
    if (contador) {
        contador.textContent = `${saberesSeleccionados.length} seleccionados`;
    }
}

// Limpiar toda la selección
function limpiarSeleccion() {
    if (saberesSeleccionados.length === 0) {
        mostrarNotificacion("No hay saberes seleccionados", "info");
        return;
    }
    
    if (confirm(`¿Estás seguro de que deseas limpiar los ${saberesSeleccionados.length} saberes seleccionados?`)) {
        // Limpiar selección de UI
        document.querySelectorAll('.saber-card.selected').forEach(card => {
            card.classList.remove('selected');
            const btn = card.querySelector('button');
            if (btn) {
                btn.textContent = 'Seleccionar';
                btn.className = 'text-xs px-2 py-1 rounded bg-gray-800 text-gray-400';
            }
        });
        
        // Limpiar array
        saberesSeleccionados = [];
        
        // Actualizar UI
        actualizarPanelSaberesSeleccionados();
        actualizarContadorSaberes();
        
        mostrarNotificacion("Selección limpiada correctamente", "success");
    }
}

// Guardar planificación
function guardarPlanificacion() {
    if (saberesSeleccionados.length === 0) {
        mostrarNotificacion("No hay saberes seleccionados para guardar", "warning");
        return;
    }
    
    if (!nivelSeleccionado) {
        mostrarNotificacion("Primero selecciona un nivel educativo", "warning");
        return;
    }
    
    // Crear objeto de planificación
    planificacionActual = {
        id: 'plan-' + Date.now(),
        fecha: new Date().toISOString(),
        nivel: nivelSeleccionado,
        area: areaSeleccionada || 'Varias áreas',
        saberes: saberesSeleccionados,
        metadata: {
            totalSaberes: saberesSeleccionados.length,
            areasCubiertas: [...new Set(saberesSeleccionados.map(s => s.area))]
        }
    };
    
    // Guardar en localStorage
    try {
        localStorage.setItem('tecnoPIA_planificacion', JSON.stringify(planificacionActual));
        localStorage.setItem('tecnoPIA_ultima_planificacion', new Date().toISOString());
        
        mostrarNotificacion(`Planificación guardada con ${saberesSeleccionados.length} saberes`, "success");
        
        // Ofrecer abrir la plantilla
        setTimeout(() => {
            if (confirm("¿Deseas abrir la plantilla de planeamiento con los saberes seleccionados?")) {
                abrirPlantillaPlaneamiento();
            }
        }, 1000);
        
    } catch (error) {
        console.error("Error al guardar planificación:", error);
        mostrarNotificacion("Error al guardar la planificación", "error");
    }
}

// Cargar planificación guardada
function cargarPlanificacionGuardada() {
    try {
        const planificacionGuardada = localStorage.getItem('tecnoPIA_planificacion');
        
        if (planificacionGuardada) {
            planificacionActual = JSON.parse(planificacionGuardada);
            
            // Mostrar notificación
            const fecha = new Date(planificacionActual.fecha).toLocaleDateString();
            mostrarNotificacion(`Planificación cargada (${fecha})`, "info");
            
            // Podrías implementar la carga completa aquí
            console.log("Planificación cargada:", planificacionActual);
        }
    } catch (error) {
        console.error("Error al cargar planificación:", error);
    }
}

// Abrir plantilla de planeamiento
function abrirPlantillaPlaneamiento() {
    if (saberesSeleccionados.length === 0) {
        mostrarNotificacion("Primero selecciona algunos saberes", "warning");
        return;
    }
    
    // Abrir en nueva pestaña
    window.open('https://k3sb12.github.io/Recurso-Plantilla-Planeamiento-/', '_blank');
    
    // Aquí podrías pasar los saberes seleccionados como parámetros
    // Por ejemplo usando URL parameters o localStorage
    try {
        // Guardar saberes para que la plantilla los pueda leer
        localStorage.setItem('tecnoPIA_saberes_seleccionados', JSON.stringify(saberesSeleccionados));
        localStorage.setItem('tecnoPIA_nivel_seleccionado', nivelSeleccionado);
        
        mostrarNotificacion("Plantilla abierta. Los saberes están listos para usar.", "success");
    } catch (error) {
        console.error("Error al preparar datos para plantilla:", error);
    }
}

// Funciones de las pestañas
function iniciarNuevaPlanificacion() {
    // Cambiar a pestaña de planificación
    document.getElementById('tab-planificar').click();
    
    // Limpiar selección existente
    if (saberesSeleccionados.length > 0) {
        if (confirm("Tienes saberes seleccionados. ¿Deseas empezar una nueva planificación?")) {
            limpiarSeleccion();
        }
    }
    
    mostrarNotificacion("Comienza seleccionando un nivel educativo", "info");
}

function cargarPlanificacionGuardada() {
    // Implementación para cargar desde almacenamiento
    mostrarNotificacion("Funcionalidad en desarrollo", "info");
}

function abrirEvaluacionRapida() {
    // Cambiar a pestaña de evaluación
    document.getElementById('tab-evaluar').click();
    
    mostrarNotificacion("Selecciona un sistema de evaluación", "info");
}

// Funciones de recursos
function generarRubrica() {
    if (saberesSeleccionados.length === 0) {
        mostrarNotificacion("Primero selecciona saberes para generar una rúbrica", "warning");
        return;
    }
    
    mostrarNotificacion("Generando rúbrica personalizada...", "info");
    
    // En una implementación completa, esto generaría un PDF o HTML
    setTimeout(() => {
        // Simulación de generación
        const rubricaHTML = `
            <h3>Rúbrica para: ${saberesSeleccionados.length} saberes</h3>
            <p>Esta funcionalidad generaría un documento PDF descargable con criterios específicos para los saberes seleccionados.</p>
        `;
        
        // Aquí podrías abrir un modal o nueva ventana con la rúbrica
        alert("Rúbrica generada. En la versión completa esto crearía un PDF descargable.");
    }, 1500);
}

function generarListaCotejo() {
    mostrarNotificacion("Funcionalidad en desarrollo", "info");
}

function buscarVideos(tema) {
    const temas = {
        'programacion': 'programación educación tecnología MEP',
        'robotica': 'robótica educativa mBot Scratch'
    };
    
    const query = temas[tema] || tema;
    const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
    
    window.open(url, '_blank');
    mostrarNotificacion(`Buscando videos de ${tema} en YouTube`, "info");
}

function descargarPlantilla(tipo) {
    mostrarNotificacion(`Descargando plantilla de ${tipo}...`, "info");
    
    // Simulación de descarga
    setTimeout(() => {
        alert(`Plantilla de ${tipo} descargada. En la versión completa esto descargaría un archivo real.`);
    }, 1000);
}

// Sistema de notificaciones
function mostrarNotificacion(mensaje, tipo = "info") {
    console.log(`[${tipo.toUpperCase()}] ${mensaje}`);
    
    // Crear elemento de notificación
    const notificacion = document.createElement('div');
    notificacion.className = `fixed top-24 right-6 z-50 px-6 py-3 rounded-lg shadow-lg transform translate-x-full transition-transform duration-300 ${getClaseNotificacion(tipo)}`;
    notificacion.innerHTML = `
        <div class="flex items-center">
            <i class="fas ${getIconoNotificacion(tipo)} mr-3"></i>
            <span>${mensaje}</span>
        </div>
    `;
    
    document.body.appendChild(notificacion);
    
    // Animar entrada
    setTimeout(() => {
        notificacion.classList.remove('translate-x-full');
        notificacion.classList.add('translate-x-0');
    }, 10);
    
    // Remover después de 4 segundos
    setTimeout(() => {
        notificacion.classList.remove('translate-x-0');
        notificacion.classList.add('translate-x-full');
        
        setTimeout(() => {
            if (notificacion.parentNode) {
                notificacion.parentNode.removeChild(notificacion);
            }
        }, 300);
    }, 4000);
}

function getClaseNotificacion(tipo) {
    const clases = {
        'success': 'bg-green-900/90 border border-green-700 text-green-100',
        'error': 'bg-red-900/90 border border-red-700 text-red-100',
        'warning': 'bg-yellow-900/90 border border-yellow-700 text-yellow-100',
        'info': 'bg-blue-900/90 border border-blue-700 text-blue-100'
    };
    return clases[tipo] || clases.info;
}

function getIconoNotificacion(tipo) {
    const iconos = {
        'success': 'fa-check-circle',
        'error': 'fa-exclamation-circle',
        'warning': 'fa-exclamation-triangle',
        'info': 'fa-info-circle'
    };
    return iconos[tipo] || iconos.info;
}

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inicializarDashboard);
} else {
    inicializarDashboard();
}

// Exportar funciones para uso global
window.TecnoPIADashboard = {
    inicializarDashboard,
    seleccionarNivel,
    seleccionarArea,
    guardarPlanificacion,
    limpiarSeleccion,
    abrirPlantillaPlaneamiento,
    generarRubrica,
    buscarVideos
};
