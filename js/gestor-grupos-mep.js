// Gestor de Grupos MEP para TecnoPIA
class GestorGruposMEP {
    constructor() {
        this.grupos = JSON.parse(localStorage.getItem('tecnoPIA_grupos')) || [];
        this.ciclos = {
            ciclo1: { nombre: "Ciclo 1", grados: ["Materno", "Transición", "1°", "2°", "3°"] },
            ciclo2: { nombre: "Ciclo 2", grados: ["4°", "5°", "6°"] },
            ciclo3: { nombre: "Ciclo 3", grados: ["7°", "8°", "9°"] }
        };
        this.areasPNFT = [
            "Apropiación tecnológica y Digital",
            "Programación y Algoritmos", 
            "Computación física y Robótica",
            "Ciencia de datos e Inteligencia artificial"
        ];
        this.init();
    }

    init() {
        // Crear grupos demo si no existen
        if (this.grupos.length === 0) {
            this.crearGruposDemo();
        }
    }

    crearGruposDemo() {
        const gruposDemo = [
            {
                id: this.generarId(),
                nombre: "5°A Tecnología",
                grado: "5°",
                ciclo: "ciclo2",
                institucion: "Liceo de San José",
                docente: "Ana María Rodríguez",
                año: 2024,
                periodo: 1,
                estudiantes: this.generarEstudiantes(28, "5°A"),
                areas: this.areasPNFT,
                fechaCreacion: new Date().toISOString(),
                activo: true
            },
            {
                id: this.generarId(),
                nombre: "6°B Robótica",
                grado: "6°",
                ciclo: "ciclo2", 
                institucion: "Liceo de San José",
                docente: "Ana María Rodríguez",
                año: 2024,
                periodo: 1,
                estudiantes: this.generarEstudiantes(25, "6°B"),
                areas: ["Computación física y Robótica", "Programación y Algoritmos"],
                fechaCreacion: new Date().toISOString(),
                activo: true
            },
            {
                id: this.generarId(),
                nombre: "7°C Programación",
                grado: "7°",
                ciclo: "ciclo3",
                institucion: "Liceo de San José",
                docente: "Ana María Rodríguez",
                año: 2024,
                periodo: 1,
                estudiantes: this.generarEstudiantes(22, "7°C"),
                areas: ["Programación y Algoritmos", "Ciencia de datos e Inteligencia artificial"],
                fechaCreacion: new Date().toISOString(),
                activo: true
            }
        ];

        this.grupos = gruposDemo;
        this.guardar();
    }

    generarId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    generarEstudiantes(cantidad, grupo) {
        const estudiantes = [];
        const nombres = ["María", "José", "Ana", "Luis", "Carlos", "Sofía", "Diego", "Valeria", "Andrés", "Camila"];
        const apellidos = ["Rodríguez", "García", "Martínez", "Hernández", "López", "González", "Pérez", "Sánchez", "Ramírez", "Cruz"];

        for (let i = 1; i <= cantidad; i++) {
            const nombre = nombres[Math.floor(Math.random() * nombres.length)];
            const apellido1 = apellidos[Math.floor(Math.random() * apellidos.length)];
            const apellido2 = apellidos[Math.floor(Math.random() * apellidos.length)];
            
            estudiantes.push({
                id: `${grupo}-${i.toString().padStart(3, '0')}`,
                cedula: `1${Math.floor(1000000 + Math.random() * 9000000)}`,
                nombreCompleto: `${nombre} ${apellido1} ${apellido2}`,
                genero: Math.random() > 0.5 ? "F" : "M",
                fechaNacimiento: `200${Math.floor(7 + Math.random() * 3)}-${Math.floor(1 + Math.random() * 12).toString().padStart(2, '0')}-${Math.floor(1 + Math.random() * 28).toString().padStart(2, '0')}`,
                asistencia: {
                    total: 0,
                    presente: 0,
                    ausente: 0,
                    porcentaje: 0
                },
                evaluaciones: [],
                notas: {
                    trabajoCotidiano: 0,
                    tareas: 0,
                    pruebaEjecucion: 0,
                    proyecto: 0,
                    asistencia: 100,
                    notaFinal: 0
                },
                activo: true
            });
        }

        return estudiantes;
    }

    // CRUD Operations
    crearGrupo(grupoData) {
        const nuevoGrupo = {
            id: this.generarId(),
            ...grupoData,
            estudiantes: grupoData.estudiantes || [],
            fechaCreacion: new Date().toISOString(),
            activo: true
        };

        this.grupos.push(nuevoGrupo);
        this.guardar();
        return nuevoGrupo;
    }

    obtenerGrupos() {
        return this.grupos.filter(grupo => grupo.activo);
    }

    obtenerGrupoPorId(id) {
        return this.grupos.find(grupo => grupo.id === id && grupo.activo);
    }

    actualizarGrupo(id, datosActualizados) {
        const indice = this.grupos.findIndex(grupo => grupo.id === id);
        if (indice !== -1) {
            this.grupos[indice] = { ...this.grupos[indice], ...datosActualizados };
            this.guardar();
            return true;
        }
        return false;
    }

    eliminarGrupo(id) {
        const indice = this.grupos.findIndex(grupo => grupo.id === id);
        if (indice !== -1) {
            this.grupos[indice].activo = false;
            this.guardar();
            return true;
        }
        return false;
    }

    // Estudiantes
    agregarEstudiante(grupoId, estudianteData) {
        const grupo = this.obtenerGrupoPorId(grupoId);
        if (grupo) {
            const nuevoEstudiante = {
                id: `${grupoId}-${(grupo.estudiantes.length + 1).toString().padStart(3, '0')}`,
                ...estudianteData,
                activo: true
            };
            grupo.estudiantes.push(nuevoEstudiante);
            this.guardar();
            return nuevoEstudiante;
        }
        return null;
    }

    actualizarEstudiante(grupoId, estudianteId, datosActualizados) {
        const grupo = this.obtenerGrupoPorId(grupoId);
        if (grupo) {
            const estudiante = grupo.estudiantes.find(e => e.id === estudianteId);
            if (estudiante) {
                Object.assign(estudiante, datosActualizados);
                this.guardar();
                return true;
            }
        }
        return false;
    }

    eliminarEstudiante(grupoId, estudianteId) {
        const grupo = this.obtenerGrupoPorId(grupoId);
        if (grupo) {
            const estudiante = grupo.estudiantes.find(e => e.id === estudianteId);
            if (estudiante) {
                estudiante.activo = false;
                this.guardar();
                return true;
            }
        }
        return false;
    }

    // Asistencia
    registrarAsistencia(grupoId, fecha, registro) {
        const grupo = this.obtenerGrupoPorId(grupoId);
        if (grupo) {
            grupo.estudiantes.forEach(estudiante => {
                const estado = registro[estudiante.id] || 'ausente';
                estudiante.asistencia.total++;
                if (estado === 'presente') {
                    estudiante.asistencia.presente++;
                } else {
                    estudiante.asistencia.ausente++;
                }
                estudiante.asistencia.porcentaje = estudiante.asistencia.total > 0 ? 
                    (estudiante.asistencia.presente / estudiante.asistencia.total) * 100 : 0;
            });
            this.guardar();
            return true;
        }
        return false;
    }

    // Export/Import
    exportarGrupos() {
        const data = {
            grupos: this.grupos,
            fechaExportacion: new Date().toISOString(),
            version: "1.0.0"
        };
        return JSON.stringify(data, null, 2);
    }

    importarGrupos(jsonData) {
        try {
            const data = JSON.parse(jsonData);
            if (data.grupos && Array.isArray(data.grupos)) {
                // Merge con grupos existentes
                data.grupos.forEach(grupo => {
                    if (!this.grupos.find(g => g.id === grupo.id)) {
                        this.grupos.push(grupo);
                    }
                });
                this.guardar();
                return { success: true, count: data.grupos.length };
            }
            return { success: false, error: "Formato inválido" };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // Statistics
    obtenerEstadisticas() {
        const gruposActivos = this.obtenerGrupos();
        let totalEstudiantes = 0;
        let totalAsistencia = 0;
        let gruposPorCiclo = { ciclo1: 0, ciclo2: 0, ciclo3: 0 };

        gruposActivos.forEach(grupo => {
            totalEstudiantes += grupo.estudiantes.length;
            
            // Calcular asistencia promedio del grupo
            let asistenciaGrupo = 0;
            grupo.estudiantes.forEach(est => {
                asistenciaGrupo += est.asistencia.porcentaje;
            });
            asistenciaGrupo = grupo.estudiantes.length > 0 ? asistenciaGrupo / grupo.estudiantes.length : 0;
            totalAsistencia += asistenciaGrupo;

            // Contar grupos por ciclo
            if (grupo.ciclo in gruposPorCiclo) {
                gruposPorCiclo[grupo.ciclo]++;
            }
        });

        return {
            totalGrupos: gruposActivos.length,
            totalEstudiantes: totalEstudiantes,
            asistenciaPromedio: gruposActivos.length > 0 ? totalAsistencia / gruposActivos.length : 0,
            gruposPorCiclo: gruposPorCiclo,
            gruposActivos: gruposActivos.map(g => ({
                id: g.id,
                nombre: g.nombre,
                grado: g.grado,
                estudiantes: g.estudiantes.length
            }))
        };
    }

    // Guardar en localStorage
    guardar() {
        localStorage.setItem('tecnoPIA_grupos', JSON.stringify(this.grupos));
        this.actualizarDashboard();
    }

    actualizarDashboard() {
        // Actualizar estadísticas en dashboard
        const stats = this.obtenerEstadisticas();
        const dashboardStats = {
            groups: stats.totalGrupos,
            students: stats.totalEstudiantes,
            evaluations: "0/0", // Se actualiza desde otro módulo
            attendance: Math.round(stats.asistenciaPromedio) + "%"
        };
        localStorage.setItem('dashboardStats', JSON.stringify(dashboardStats));
        
        // Actualizar lista de grupos
        const groupsForDashboard = stats.gruposActivos.map(g => ({
            id: g.id,
            name: g.nombre,
            grade: g.grado,
            cycle: this.ciclos[Object.keys(this.ciclos).find(key => g.grado.includes(key.replace('ciclo', '').replace('°', ''))) || 'ciclo2'],
            students: g.estudiantes,
            pending: 0,
            attendance: Math.round(stats.asistenciaPromedio)
        }));
        localStorage.setItem('groups', JSON.stringify(groupsForDashboard));
    }
}

// Inicializar gestor global
window.GestorGruposMEP = new GestorGruposMEP();

// Funciones para usar desde HTML
window.crearGrupo = function() {
    const nombre = prompt("Nombre del grupo:");
    const grado = prompt("Grado (ej: 5°):");
    const ciclo = prompt("Ciclo (ciclo1, ciclo2, ciclo3):");
    
    if (nombre && grado && ciclo) {
        const grupo = window.GestorGruposMEP.crearGrupo({
            nombre: nombre,
            grado: grado,
            ciclo: ciclo,
            institucion: "Liceo de San José",
            docente: "Ana María Rodríguez",
            año: new Date().getFullYear(),
            periodo: 1,
            areas: window.GestorGruposMEP.areasPNFT
        });
        
        alert(`Grupo "${grupo.nombre}" creado exitosamente con ID: ${grupo.id}`);
        return grupo;
    }
    return null;
};

window.verGrupos = function() {
    const grupos = window.GestorGruposMEP.obtenerGrupos();
    console.table(grupos.map(g => ({
        ID: g.id,
        Nombre: g.nombre,
        Grado: g.grado,
        Estudiantes: g.estudiantes.length,
        Ciclo: g.ciclo
    })));
    return grupos;
};

window.exportarDatos = function() {
    const data = window.GestorGruposMEP.exportarGrupos();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tecnoPIA-grupos-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    alert("Datos exportados exitosamente");
};
