// gestor-grupos-mep.js - Sistema completo de gestión de grupos MEP

class GestorGruposMEP {
    constructor() {
        this.grupos = this.cargarGrupos();
        this.calendario = this.cargarCalendario();
        this.periodosEvaluativos = this.definirPeriodosMEP();
    }
    
    // ========== DEFINICIÓN DE PERÍODOS MEP ==========
    
    definirPeriodosMEP() {
        const añoActual = new Date().getFullYear();
        
        return {
            "I Trimestre": {
                inicio: `${añoActual}-02-01`,
                fin: `${añoActual}-04-15`,
                semanas: 10,
                porcentaje: 33.3
            },
            "II Trimestre": {
                inicio: `${añoActual}-04-16`,
                fin: `${añoActual}-07-15`,
                semanas: 12,
                porcentaje: 33.3
            },
            "III Trimestre": {
                inicio: `${añoActual}-07-16`,
                fin: `${añoActual}-11-15`,
                semanas: 13,
                porcentaje: 33.4
            },
            "Total Anual": {
                inicio: `${añoActual}-02-01`,
                fin: `${añoActual}-11-15`,
                semanas: 35,
                porcentaje: 100
            }
        };
    }
    
    // ========== CREACIÓN DE GRUPOS ==========
    
    crearGrupoCompleto(datosGrupo) {
        // Validar ciclo
        const cicloValido = ['materno', 'ciclo1', 'ciclo2', 'ciclo3'].includes(datosGrupo.ciclo);
        if (!cicloValido) {
            throw new Error('Ciclo no válido. Use: materno, ciclo1, ciclo2, ciclo3');
        }
        
        // Generar ID único
        const grupoId = `GRP-${datosGrupo.ciclo}-${datosGrupo.codigo}-${Date.now()}`;
        
        // Crear estructura completa del grupo
        const grupo = {
            // Identificación
            id: grupoId,
            ciclo: datosGrupo.ciclo,
            codigo: datosGrupo.codigo,
            nombreCompleto: this.generarNombreGrupo(datosGrupo.ciclo, datosGrupo.codigo),
            institucion: datosGrupo.institucion || 'Centro Educativo MEP',
            
            // Información académica
            nivel: this.obtenerNivelPorCiclo(datosGrupo.ciclo),
            añoLectivo: datosGrupo.añoLectivo || new Date().getFullYear(),
            horario: datosGrupo.horario || {},
            aula: datosGrupo.aula || 'Taller de Tecnología',
            
            // Configuración de evaluación
            configEvaluacion: this.obtenerConfigEvaluacion(datosGrupo.ciclo),
            porcentajes: this.obtenerPorcentajesCiclo(datosGrupo.ciclo),
            
            // Estudiantes
            estudiantes: [],
            listaEstudiantes: [],
            maxEstudiantes: datosGrupo.maxEstudiantes || 35,
            
            // Calendario
            semanas: this.generarSemanasLectivas(),
            periodos: this.periodosEvaluativos,
            
            // Metadatos
            fechaCreacion: new Date().toISOString(),
            docente: datosGrupo.docente || 'Docente MEP',
            activo: true,
            estado: 'activo',
            
            // Estadísticas iniciales
            estadisticas: {
                totalEstudiantes: 0,
                hombres: 0,
                mujeres: 0,
                promedioGeneral: 0,
                asistenciaPromedio: 100,
                ultimaActualizacion: null
            }
        };
        
        this.grupos.push(grupo);
        this.guardarGrupos();
        
        console.log(`✅ Grupo creado: ${grupo.nombreCompleto}`);
        this.generarCalendarioGrupo(grupoId);
        
        return grupo;
    }
    
    // ========== GESTIÓN DE ESTUDIANTES ==========
    
    agregarEstudianteAGrupo(grupoId, datosEstudiante) {
        const grupo = this.obtenerGrupo(grupoId);
        if (!grupo) throw new Error('Grupo no encontrado');
        
        // Verificar límite
        if (grupo.estudiantes.length >= grupo.maxEstudiantes) {
            throw new Error(`Límite alcanzado: ${grupo.maxEstudiantes} estudiantes`);
        }
        
        // Crear ID único para el estudiante en este grupo
        const estudianteId = `EST-${grupoId}-${Date.now()}`;
        
        const estudiante = {
            id: estudianteId,
            grupoId: grupoId,
            cedula: datosEstudiante.cedula || '',
            codigoEstudiante: datosEstudiante.codigo || `E${String(grupo.estudiantes.length + 1).padStart(3, '0')}`,
            nombre: datosEstudiante.nombre,
            apellido1: datosEstudiante.apellido1,
            apellido2: datosEstudiante.apellido2 || '',
            nombreCompleto: `${datosEstudiante.nombre} ${datosEstudiante.apellido1} ${datosEstudiante.apellido2 || ''}`.trim(),
            genero: datosEstudiante.genero || 'no especificado',
            fechaNacimiento: datosEstudiante.fechaNacimiento,
            edad: this.calcularEdad(datosEstudiante.fechaNacimiento),
            correo: datosEstudiante.correo || '',
            telefono: datosEstudiante.telefono || '',
            necesidadesEspeciales: datosEstudiante.necesidadesEspeciales || false,
            observaciones: datosEstudiante.observaciones || '',
            
            // Estado académico
            activo: true,
            fechaIngreso: new Date().toISOString(),
            estado: 'activo',
            
            // Evaluación
            evaluaciones: {
                trabajoCotidiano: [],
                tareas: [],
                pruebasEjecucion: [],
                proyectos: [],
                asistencia: []
            },
            
            // Estadísticas
            estadisticas: {
                promedioTC: 0,
                promedioTA: 0,
                promedioPE: 0,
                promedioPT: 0,
                promedioAS: 100,
                notaFinal: 0,
                condicion: 'Sin evaluar',
                asistencia: {
                    total: 0,
                    presente: 0,
                    ausente: 0,
                    justificado: 0,
                    porcentaje: 100
                }
            },
            
            // Historial
            historialNotas: [],
            observacionesDocente: []
        };
        
        // Agregar al grupo
        grupo.estudiantes.push(estudianteId);
        grupo.listaEstudiantes.push(estudiante);
        
        // Actualizar estadísticas de género
        if (estudiante.genero === 'masculino') grupo.estadisticas.hombres++;
        if (estudiante.genero === 'femenino') grupo.estadisticas.mujeres++;
        
        grupo.estadisticas.totalEstudiantes = grupo.estudiantes.length;
        grupo.estadisticas.ultimaActualizacion = new Date().toISOString();
        
        this.guardarGrupos();
        
        // Inicializar registro de evaluación para el estudiante
        this.inicializarEvaluacionEstudiante(grupoId, estudianteId);
        
        console.log(`✅ Estudiante agregado: ${estudiante.nombreCompleto} al grupo ${grupo.codigo}`);
        return estudiante;
    }
    
    // ========== CALENDARIO Y SEMANAS ==========
    
    generarSemanasLectivas() {
        const semanas = [];
        const añoActual = new Date().getFullYear();
        
        // Aproximadamente 35 semanas lectivas en Costa Rica
        for (let i = 1; i <= 35; i++) {
            const fechaInicio = new Date(añoActual, 1, 1); // Febrero
            fechaInicio.setDate(fechaInicio.getDate() + (i - 1) * 7);
            
            const fechaFin = new Date(fechaInicio);
            fechaFin.setDate(fechaFin.getDate() + 6);
            
            const semana = {
                numero: i,
                fechaInicio: fechaInicio.toISOString().split('T')[0],
                fechaFin: fechaFin.toISOString().split('T')[0],
                trimestre: this.determinarTrimestre(i),
                estado: 'planificada',
                temas: [],
                actividades: [],
                evaluaciones: [],
                recursos: []
            };
            
            semanas.push(semana);
        }
        
        return semanas;
    }
    
    generarCalendarioGrupo(grupoId) {
        const grupo = this.obtenerGrupo(grupoId);
        if (!grupo) return;
        
        const calendario = {
            grupoId: grupoId,
            añoLectivo: grupo.añoLectivo,
            semanas: grupo.semanas,
            eventosEspeciales: [
                {
                    nombre: "Inicio de lecciones",
                    fecha: `${grupo.añoLectivo}-02-01`,
                    tipo: "academico"
                },
                {
                    nombre: "Semana Santa",
                    fecha: this.calcularSemanaSanta(grupo.añoLectivo),
                    tipo: "feriado",
                    duracion: 7
                },
                {
                    nombre: "Evaluaciones I Trimestre",
                    fecha: `${grupo.añoLectivo}-04-10`,
                    tipo: "evaluacion"
                },
                {
                    nombre: "Vacaciones I Trimestre",
                    fecha: `${grupo.añoLectivo}-04-15`,
                    tipo: "vacaciones",
                    duracion: 7
                },
                {
                    nombre: "Evaluaciones II Trimestre",
                    fecha: `${grupo.añoLectivo}-07-10`,
                    tipo: "evaluacion"
                },
                {
                    nombre: "Vacaciones II Trimestre",
                    fecha: `${grupo.añoLectivo}-07-15`,
                    tipo: "vacaciones",
                    duracion: 15
                },
                {
                    nombre: "Evaluaciones III Trimestre",
                    fecha: `${grupo.añoLectivo}-11-10`,
                    tipo: "evaluacion"
                },
                {
                    nombre: "Fin de lecciones",
                    fecha: `${grupo.añoLectivo}-11-15`,
                    tipo: "academico"
                }
            ],
            fechasImportantes: []
        };
        
        this.calendario.push(calendario);
        this.guardarCalendario();
        
        return calendario;
    }
    
    // ========== EVALUACIÓN POR SEMANA ==========
    
    registrarEvaluacionSemanal(grupoId, semanaNum, tipoEvaluacion, datos) {
        const grupo = this.obtenerGrupo(grupoId);
        if (!grupo) throw new Error('Grupo no encontrado');
        
        const semana = grupo.semanas.find(s => s.numero === semanaNum);
        if (!semana) throw new Error('Semana no encontrada');
        
        const evaluacion = {
            id: `EVAL-${grupoId}-${semanaNum}-${Date.now()}`,
            tipo: tipoEvaluacion,
            fecha: new Date().toISOString(),
            semana: semanaNum,
            datos: datos,
            docente: grupo.docente,
            estado: 'registrada'
        };
        
        // Agregar a la semana
        semana.evaluaciones.push(evaluacion);
        
        // Actualizar estadísticas de estudiantes
        if (datos.estudiantes && Array.isArray(datos.estudiantes)) {
            datos.estudiantes.forEach(estudianteEval => {
                this.actualizarEstadisticaEstudiante(
                    grupoId, 
                    estudianteEval.estudianteId, 
                    tipoEvaluacion, 
                    estudianteEval
                );
            });
        }
        
        this.guardarGrupos();
        return evaluacion;
    }
    
    // ========== REPORTES Y ESTADÍSTICAS ==========
    
    generarReporteGrupo(grupoId, periodo = 'Total Anual') {
        const grupo = this.obtenerGrupo(grupoId);
        if (!grupo) return null;
        
        const calculadora = new CalculadoraMEP();
        let estudiantesCompletos = [];
        
        // Calcular notas finales para cada estudiante
        grupo.listaEstudiantes.forEach(estudiante => {
            const notaFinal = this.calcularNotaFinalEstudiante(grupoId, estudiante.id, periodo);
            estudiantesCompletos.push({
                ...estudiante,
                evaluacion: notaFinal
            });
        });
        
        // Calcular estadísticas del grupo
        const estadisticas = this.calcularEstadisticasGrupo(estudiantesCompletos);
        
        const reporte = {
            grupo: {
                id: grupo.id,
                nombre: grupo.nombreCompleto,
                codigo: grupo.codigo,
                docente: grupo.docente,
                institucion: grupo.institucion,
                periodo: periodo,
                fechaGeneracion: new Date().toISOString()
            },
            resumen: {
                totalEstudiantes: grupo.estadisticas.totalEstudiantes,
                hombres: grupo.estadisticas.hombres,
                mujeres: grupo.estadisticas.mujeres,
                activos: estudiantesCompletos.filter(e => e.activo).length,
                inactivos: estudiantesCompletos.filter(e => !e.activo).length
            },
            evaluacion: {
                promedioGeneral: estadisticas.promedioGeneral,
                distribucionNotas: estadisticas.distribucionNotas,
                aprobados: estadisticas.aprobados,
                reprobados: estadisticas.reprobados,
                porcentajeAprobacion: estadisticas.porcentajeAprobacion
            },
            asistencia: {
                promedioGrupo: estadisticas.asistenciaPromedio,
                estudiantesConBajaAsistencia: estadisticas.bajaAsistencia
            },
            estudiantes: estudiantesCompletos.map(e => ({
                codigo: e.codigoEstudiante,
                nombre: e.nombreCompleto,
                notaFinal: e.evaluacion.notaFinal,
                condicion: e.evaluacion.condicion,
                asistencia: e.estadisticas.asistencia.porcentaje,
                observaciones: e.observaciones
            })),
            recomendaciones: this.generarRecomendacionesGrupo(estadisticas)
        };
        
        return reporte;
    }
    
    // ========== FUNCIONES AUXILIARES ==========
    
    obtenerPorcentajesCiclo(ciclo) {
        const porcentajes = {
            'materno': { TC: 100, descripcion: 'Evaluación formativa' },
            'ciclo1': { TC: 65, TA: 10, PE: 15, AS: 10 },
            'ciclo2': { TC: 60, TA: 10, PE: 20, AS: 10 },
            'ciclo3': { TC: 50, TA: 10, PT: 30, AS: 10 }
        };
        return porcentajes[ciclo] || porcentajes.ciclo1;
    }
    
    obtenerConfigEvaluacion(ciclo) {
        const configs = {
            'ciclo1': {
                componentes: ['TC', 'TA', 'PE', 'AS'],
                escala: 'Aprobado/Reprobado',
                notaMinima: 70
            },
            'ciclo2': {
                componentes: ['TC', 'TA', 'PE', 'AS'],
                escala: 'Aprobado/Reprobado',
                notaMinima: 70
            },
            'ciclo3': {
                componentes: ['TC', 'TA', 'PT', 'AS'],
                escala: 'Excelente/Bueno/Aprobado/Reprobado',
                notaMinima: 70,
                proyectoObligatorio: true
            },
            'materno': {
                componentes: ['Observación'],
                escala: 'Formativa',
                instrumentos: ['Lista de cotejo', 'Registro anecdótico']
            }
        };
        return configs[ciclo] || configs.ciclo1;
    }
    
    obtenerNivelPorCiclo(ciclo) {
        const niveles = {
            'materno': 'Materno/Transición',
            'ciclo1': '1°-3° Primaria',
            'ciclo2': '4°-6° Primaria',
            'ciclo3': '7°-9° Secundaria'
        };
        return niveles[ciclo];
    }
    
    generarNombreGrupo(ciclo, codigo) {
        return `${this.obtenerNivelPorCiclo(ciclo)} - Grupo ${codigo}`;
    }
    
    calcularSemanaSanta(año) {
        // Algoritmo simplificado para calcular Semana Santa
        const a = año % 19;
        const b = Math.floor(año / 100);
        const c = año % 100;
        const d = Math.floor(b / 4);
        const e = b % 4;
        const f = Math.floor((b + 8) / 25);
        const g = Math.floor((b - f + 1) / 3);
        const h = (19 * a + b - d - g + 15) % 30;
        const i = Math.floor(c / 4);
        const k = c % 4;
        const l = (32 + 2 * e + 2 * i - h - k) % 7;
        const m = Math.floor((a + 11 * h + 22 * l) / 451);
        const mes = Math.floor((h + l - 7 * m + 114) / 31);
        const dia = ((h + l - 7 * m + 114) % 31) + 1;
        
        return `${año}-${mes.toString().padStart(2, '0')}-${dia.toString().padStart(2, '0')}`;
    }
    
    determinarTrimestre(semanaNum) {
        if (semanaNum <= 10) return 'I Trimestre';
        if (semanaNum <= 22) return 'II Trimestre';
        return 'III Trimestre';
    }
    
    calcularEdad(fechaNacimiento) {
        if (!fechaNacimiento) return null;
        const nacimiento = new Date(fechaNacimiento);
        const hoy = new Date();
        let edad = hoy.getFullYear() - nacimiento.getFullYear();
        const mes = hoy.getMonth() - nacimiento.getMonth();
        if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
            edad--;
        }
        return edad;
    }
    
    // ========== PERSISTENCIA ==========
    
    cargarGrupos() {
        try {
            const datos = localStorage.getItem('tecnoPIA_grupos_completos');
            return datos ? JSON.parse(datos) : [];
        } catch (error) {
            console.error('Error al cargar grupos:', error);
            return [];
        }
    }
    
    guardarGrupos() {
        try {
            localStorage.setItem('tecnoPIA_grupos_completos', JSON.stringify(this.grupos));
        } catch (error) {
            console.error('Error al guardar grupos:', error);
        }
    }
    
    cargarCalendario() {
        try {
            const datos = localStorage.getItem('tecnoPIA_calendario');
            return datos ? JSON.parse(datos) : [];
        } catch (error) {
            console.error('Error al cargar calendario:', error);
            return [];
        }
    }
    
    guardarCalendario() {
        try {
            localStorage.setItem('tecnoPIA_calendario', JSON.stringify(this.calendario));
        } catch (error) {
            console.error('Error al guardar calendario:', error);
        }
    }
    
    obtenerGrupo(grupoId) {
        return this.grupos.find(g => g.id === grupoId);
    }
    
    obtenerGruposPorDocente(docente) {
        return this.grupos.filter(g => 
            g.docente === docente && g.activo === true
        );
    }
    
    // ========== MÉTODOS PENDIENTES (se implementarán) ==========
    
    inicializarEvaluacionEstudiante(grupoId, estudianteId) {
        // Inicializar estructura de evaluación
        console.log(`Inicializando evaluación para estudiante ${estudianteId}`);
    }
    
    actualizarEstadisticaEstudiante(grupoId, estudianteId, tipoEvaluacion, datos) {
        // Actualizar estadísticas del estudiante
        console.log(`Actualizando estadísticas para ${estudianteId}, tipo: ${tipoEvaluacion}`);
    }
    
    calcularNotaFinalEstudiante(grupoId, estudianteId, periodo) {
        // Calcular nota final del estudiante
        return {
            notaFinal: 0,
            condicion: 'En proceso',
            desglose: {}
        };
    }
    
    calcularEstadisticasGrupo(estudiantes) {
        // Calcular estadísticas del grupo
        return {
            promedioGeneral: 0,
            distribucionNotas: {},
            aprobados: 0,
            reprobados: 0,
            porcentajeAprobacion: 0,
            asistenciaPromedio: 0,
            bajaAsistencia: 0
        };
    }
    
    generarRecomendacionesGrupo(estadisticas) {
        // Generar recomendaciones basadas en estadísticas
        return ['Continuar con el buen trabajo'];
    }
}

// Exportar para uso global
window.GestorGruposMEP = GestorGruposMEP;
