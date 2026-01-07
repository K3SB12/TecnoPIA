// js/app-core.js - EL CEREBRO DE TECNOPIA
// Conecta todos tus módulos y da funcionalidad REAL al dashboard

class TecnoPIAApp {
    constructor() {
        this.docenteActual = null;
        this.grupos = [];
        this.estudiantes = [];
        this.evaluaciones = [];
        this.configMEP = {
            ciclo1: { tc: 65, tareas: 10, prueba: 15, asistencia: 10 },
            ciclo2: { tc: 60, tareas: 10, prueba: 20, asistencia: 10 },
            ciclo3: { tc: 50, tareas: 10, proyecto: 30, asistencia: 10 }
        };
        this.iniciar();
    }

    async iniciar() {
        console.log('[App] Iniciando núcleo de TecnoPIA...');
        await this.cargarDatosLocales();
        this.integrarModulos();
        this.mostrarEstadoEnConsola();
    }

    cargarDatosLocales() {
        // 1. CARGAR DATOS DEL DOCENTE (desde auth.js o localStorage)
        const docenteGuardado = localStorage.getItem('tecnoPIA_docente');
        if (docenteGuardado) {
            try {
                this.docenteActual = JSON.parse(docenteGuardado);
                console.log('[App] Docente cargado:', this.docenteActual.nombre);
            } catch (e) {
                console.warn('[App] No se pudo cargar docente, creando uno demo.');
                this.crearDocenteDemo();
            }
        } else {
            this.crearDocenteDemo();
        }

        // 2. CARGAR GRUPOS (desde gestor-grupos-mep.js o localStorage)
        const gruposGuardados = localStorage.getItem('tecnoPIA_grupos');
        this.grupos = gruposGuardados ? JSON.parse(gruposGuardados) : [];

        // 3. CARGAR ESTUDIANTES
        const estudiantesGuardados = localStorage.getItem('tecnoPIA_estudiantes');
        this.estudiantes = estudiantesGuardados ? JSON.parse(estudiantesGuardados) : [];

        // 4. CARGAR EVALUACIONES (desde registro-evaluacion.js)
        const evaluacionesGuardadas = localStorage.getItem('tecnoPIA_evaluaciones');
        this.evaluaciones = evaluacionesGuardadas ? JSON.parse(evaluacionesGuardadas) : [];

        console.log(`[App] Datos cargados: ${this.grupos.length} grupos, ${this.estudiantes.length} estudiantes.`);
    }

    crearDocenteDemo() {
        this.docenteActual = {
            id: 1,
            nombre: 'Docente Demo',
            email: 'demo@tecno.edu',
            escuela: 'Escuela Técnica Demo'
        };
        localStorage.setItem('tecnoPIA_docente', JSON.stringify(this.docenteActual));
    }

    integrarModulos() {
        console.log('[App] Integrando módulos...');
        // Este método prepara la conexión con tus otros archivos JS.
        // Por ahora, asegura que las funciones globales estén disponibles.
        window.TecnoPIA = this; // Hacemos la app globalmente accesible

        // Si existe un módulo de cálculo, lo integramos
        if (typeof window.calculadoraMEP !== 'undefined') {
            console.log('[App] Módulo de cálculo MEP encontrado.');
            this.calculadora = window.calculadoraMEP;
        }
    }

    mostrarEstadoEnConsola() {
        console.group('[App] Estado Actual');
        console.log('Docente:', this.docenteActual?.nombre);
        console.log('Grupos:', this.grupos);
        console.log('Estudiantes:', this.estudiantes.length);
        console.log('Evaluaciones:', this.evaluaciones.length);
        console.groupEnd();
    }

    // ==================== FUNCIONES PARA EL DASHBOARD ====================
    // Estas son las funciones que tu dashboard.html NECESITA para funcionar.

    obtenerEstadisticas() {
        const totalEstudiantes = this.estudiantes.length;
        const totalGrupos = this.grupos.length;

        // Calcular evaluaciones pendientes (simplificado)
        const evaluacionesPendientes = this.estudiantes.length * 2; // Ejemplo

        // Calcular asistencia promedio (simplificado)
        const asistenciaHoy = '92%'; // Ejemplo

        return {
            totalGrupos,
            totalEstudiantes,
            evaluacionesPendientes,
            asistenciaHoy,
            reportesListos: totalGrupos // Un reporte por grupo
        };
    }

    obtenerGruposActivos() {
        // Devuelve los grupos para mostrar en el dashboard
        return this.grupos.map(grupo => {
            const estudiantesEnGrupo = this.estudiantes.filter(e => e.grupoId === grupo.id);
            return {
                id: grupo.id,
                nombre: grupo.nombre,
                grado: grupo.grado,
                ciclo: grupo.ciclo || '1',
                cantidadEstudiantes: estudiantesEnGrupo.length
            };
        });
    }

    // ==================== FUNCIONES PARA GESTIÓN ====================

    guardarNuevoGrupo(datosGrupo) {
        const nuevoId = this.grupos.length > 0 ? Math.max(...this.grupos.map(g => g.id)) + 1 : 1;
        const grupo = {
            id: nuevoId,
            ...datosGrupo,
            docenteId: this.docenteActual.id,
            fechaCreacion: new Date().toISOString()
        };

        this.grupos.push(grupo);
        localStorage.setItem('tecnoPIA_grupos', JSON.stringify(this.grupos));
        console.log(`[App] Grupo guardado: ${grupo.nombre}`);
        return grupo;
    }

    // ==================== FUNCIONES PARA EVALUACIÓN MEP ====================

    calcularNotaFinal(estudianteId, ciclo) {
        // Esta función usaría tus módulos existentes (calculadora-mep.js, registro-evaluacion.js)
        console.log(`[App] Calculando nota para estudiante ${estudianteId}, ciclo ${ciclo}`);
        // Por ahora retorna un valor de ejemplo
        return {
            nota: 85.5,
            desempenio: 'Muy Bueno',
            componentes: {
                trabajoCotidiano: 80,
                tareas: 90,
                pruebaEjecucion: 85,
                asistencia: 95
            }
        };
    }
}

// ==================== INICIALIZACIÓN ====================
// Esta parte es CRUCIAL: se ejecuta al cargar la página y hace que todo esté disponible.

let App;

document.addEventListener('DOMContentLoaded', function() {
    console.log('[App] DOM cargado, iniciando aplicación...');
    App = new TecnoPIAApp();
    window.App = App; // Disponible globalmente

    // Si estamos en el dashboard, cargamos los datos automáticamente
    if (document.body.classList.contains('dashboard') || window.location.pathname.includes('dashboard')) {
        console.log('[App] Página de dashboard detectada, actualizando interfaz...');
        // Dar tiempo a que se cargue el HTML, luego actualizar
        setTimeout(() => {
            if (typeof window.actualizarDashboard === 'function') {
                window.actualizarDashboard();
            }
        }, 100);
    }
});

// ==================== FUNCIONES GLOBALES ====================
// Estas funciones pueden ser llamadas directamente desde el HTML (onclick="crearGrupo()")

window.crearGrupo = function(nombre, grado, ciclo) {
    if (!App) {
        alert('La aplicación no está lista aún. Recarga la página.');
        return;
    }
    const grupo = App.guardarNuevoGrupo({ nombre, grado, ciclo });
    alert(`Grupo "${grupo.nombre}" creado con ID: ${grupo.id}`);
    // Recargar la página para ver los cambios
    window.location.reload();
};

window.actualizarDashboard = function() {
    if (!App) return;
    const stats = App.obtenerEstadisticas();
    const grupos = App.obtenerGruposActivos();

    console.log('[App] Actualizando dashboard con:', stats, grupos);

    // 1. ACTUALIZAR TARJETAS DE ESTADÍSTICAS
    const actualizarElemento = (id, valor) => {
        const el = document.getElementById(id);
        if (el) el.textContent = valor;
    };

    actualizarElemento('total-grupos', stats.totalGrupos);
    actualizarElemento('total-estudiantes', stats.totalEstudiantes);
    actualizarElemento('evaluaciones-pendientes', stats.evaluacionesPendientes);
    actualizarElemento('asistencia-hoy', stats.asistenciaHoy);
    actualizarElemento('reportes-listos', stats.reportesListos);

    // 2. ACTUALIZAR LISTA DE GRUPOS
    const container = document.getElementById('grupos-activos-container');
    if (container) {
        if (grupos.length === 0) {
            container.innerHTML = `
                <div class="text-center py-8 text-gray-500">
                    <i class="fas fa-users text-4xl mb-4"></i>
                    <p>No hay grupos activos</p>
                    <p class="text-sm">Usa el botón "Nuevo Grupo" para comenzar</p>
                </div>`;
        } else {
            container.innerHTML = grupos.map(grupo => `
                <div class="grupo-card p-4 rounded-lg border mb-3">
                    <div class="flex justify-between items-start">
                        <div>
                            <h4 class="font-bold text-lg">${grupo.nombre}</h4>
                            <div class="flex items-center space-x-4 text-sm text-gray-600 mt-2">
                                <span><i class="fas fa-graduation-cap mr-1"></i> ${grupo.grado}</span>
                                <span><i class="fas fa-users mr-1"></i> ${grupo.cantidadEstudiantes} estudiantes</span>
                                <span><i class="fas fa-calendar mr-1"></i> Ciclo ${grupo.ciclo}</span>
                            </div>
                        </div>
                        <div class="flex space-x-2">
                            <button onclick="evaluarGrupo(${grupo.id})" class="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm">
                                <i class="fas fa-clipboard-check mr-1"></i> Evaluar
                            </button>
                        </div>
                    </div>
                </div>
            `).join('');
        }
    }
};

window.evaluarGrupo = function(grupoId) {
    alert(`Redirigiendo a evaluación del grupo ${grupoId}. En la versión final, esto abriría sistemas/evaluacion-mep.html`);
    // window.location.href = `sistemas/evaluacion-mep.html?grupo=${grupoId}`;
};
