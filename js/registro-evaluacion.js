// registro-evaluacion.js - Sistema de registro y seguimiento de evaluación

/**
 * SISTEMA DE REGISTRO DE EVALUACIÓN PARA FORMACIÓN TECNOLÓGICA
 * Registra trabajo cotidiano, tareas, proyectos y asistencia
 */

class RegistroEvaluacionTecnologia {
    constructor() {
        this.estudiantes = this.cargarEstudiantes();
        this.registros = this.cargarRegistros();
        this.grupos = this.cargarGrupos();
        this.configuracion = this.cargarConfiguracion();
    }
    
    // ========== GESTIÓN DE ESTUDIANTES ==========
    
    /**
     * Agrega un nuevo estudiante al sistema
     * @param {Object} datosEstudiante - Datos del estudiante
     * @returns {Object} - Estudiante creado
     */
    agregarEstudiante(datosEstudiante) {
        const estudiante = {
            id: `EST-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            fechaRegistro: new Date().toISOString(),
            activo: true,
            ...datosEstudiante,
            historialNotas: [],
            asistencia: {
                totalClases: 0,
                asistencias: 0,
                ausencias: 0,
                justificadas: 0,
                porcentaje: 100
            }
        };
        
        this.estudiantes.push(estudiante);
        this.guardarEstudiantes();
        
        console.log(`✅ Estudiante agregado: ${estudiante.nombre}`);
        return estudiante;
    }
    
    /**
     * Importa lista de estudiantes desde CSV/Excel
     * @param {string} datosCSV - Datos en formato CSV
     * @returns {Array} - Estudiantes importados
     */
    importarEstudiantes(datosCSV) {
        const lineas = datosCSV.split('\n');
        const estudiantesImportados = [];
        
        // Saltar encabezado (primera línea)
        for (let i = 1; i < lineas.length; i++) {
            if (lineas[i].trim() === '') continue;
            
            const columnas = lineas[i].split(',').map(col => col.replace(/"/g, '').trim());
            
            if (columnas.length >= 2) {
                const estudiante = this.agregarEstudiante({
                    codigo: columnas[0] || `AUTO-${i}`,
                    nombre: columnas[1],
                    apellidos: columnas[2] || '',
                    nivel: columnas[3] || 'No especificado',
                    grupo: columnas[4] || 'General',
                    correo: columnas[5] || '',
                    telefono: columnas[6] || '',
                    observaciones: columnas[7] || ''
                });
                
                estudiantesImportados.push(estudiante);
            }
        }
        
        return estudiantesImportados;
    }
    
    // ========== REGISTRO DE TRABAJO COTIDIANO (50-65%) ==========
    
    /**
     * Registra evaluación de trabajo cotidiano
     * @param {string} estudianteId - ID del estudiante
     * @param {Object} criterios - Criterios evaluados
     * @returns {Object} - Registro creado
     */
    registrarTrabajoCotidiano(estudianteId, criterios) {
        const estudiante = this.buscarEstudiante(estudianteId);
        if (!estudiante) {
            throw new Error(`Estudiante no encontrado: ${estudianteId}`);
        }
        
        const puntuacion = this.calcularPuntuacionTC(criterios);
        
        const registro = {
            id: `TC-${Date.now()}`,
            tipo: 'trabajo_cotidiano',
            estudianteId,
            estudianteNombre: estudiante.nombre,
            fecha: new Date().toISOString(),
            periodo: this.obtenerPeriodoActual(),
            criterios,
            puntuacionBruta: puntuacion,
            puntuacionFinal: puntuacion, // Para TC, la bruta es la final
            porcentajeAplicado: this.obtenerPorcentajeTC(estudiante.nivel),
            observaciones: criterios.observaciones || '',
            evidencias: criterios.evidencias || [],
            docente: this.configuracion.docenteActual || 'Docente'
        };
        
        this.registros.push(registro);
        
        // Actualizar historial del estudiante
        estudiante.historialNotas.push({
            tipo: 'TC',
            fecha: registro.fecha,
            puntuacion: puntuacion,
            registroId: registro.id
        });
        
        this.guardarRegistros();
        this.guardarEstudiantes();
        
        console.log(`📝 Trabajo cotidiano registrado para ${estudiante.nombre}: ${puntuacion}/100`);
        return registro;
    }
    
    /**
     * Calcula puntuación de trabajo cotidiano basado en criterios
     * @param {Object} criterios - Criterios evaluados
     * @returns {number} - Puntuación (0-100)
     */
    calcularPuntuacionTC(criterios) {
        let puntuacionTotal = 0;
        let criteriosEvaluados = 0;
        
        const criteriosBase = {
            participacion: { peso: 20, valor: criterios.participacion || 0 },
            colaboracion: { peso: 20, valor: criterios.colaboracion || 0 },
            aplicacionConceptos: { peso: 25, valor: criterios.aplicacionConceptos || 0 },
            manejoHerramientas: { peso: 25, valor: criterios.manejoHerramientas || 0 },
            creatividad: { peso: 10, valor: criterios.creatividad || 0 }
        };
        
        // Calcular puntuación ponderada
        for (const [criterio, datos] of Object.entries(criteriosBase)) {
            if (datos.valor > 0) {
                puntuacionTotal += (datos.valor * datos.peso) / 100;
                criteriosEvaluados++;
            }
        }
        
        // Si no hay criterios evaluados, retornar 0
        if (criteriosEvaluados === 0) {
            return 0;
        }
        
        // Ajustar si hay criterios adicionales
        if (criterios.adicionales) {
            criterios.adicionales.forEach(extra => {
                puntuacionTotal += extra.puntuacion || 0;
            });
        }
        
        // Asegurar que esté entre 0 y 100
        return Math.min(Math.max(Math.round(puntuacionTotal), 0), 100);
    }
    
    // ========== REGISTRO DE TAREAS (10%) ==========
    
    /**
     * Registra evaluación de tarea
     * @param {string} estudianteId - ID del estudiante
     * @param {Object} tarea - Datos de la tarea
     * @returns {Object} - Registro creado
     */
    registrarTarea(estudianteId, tarea) {
        const estudiante = this.buscarEstudiante(estudianteId);
        if (!estudiante) {
            throw new Error(`Estudiante no encontrado: ${estudianteId}`);
        }
        
        const registro = {
            id: `TA-${Date.now()}`,
            tipo: 'tarea',
            estudianteId,
            estudianteNombre: estudiante.nombre,
            fechaAsignacion: tarea.fechaAsignacion || new Date().toISOString(),
            fechaEntrega: tarea.fechaEntrega || new Date().toISOString(),
            fechaRegistro: new Date().toISOString(),
            tareaId: tarea.id || `TAREA-${Date.now()}`,
            titulo: tarea.titulo || 'Tarea sin título',
            descripcion: tarea.descripcion || '',
            puntuacionBruta: tarea.puntuacion || 0,
            puntuacionFinal: (tarea.puntuacion || 0) * 0.10, // 10% del total
            porcentajeAplicado: 10, // Siempre 10% en todos los ciclos
            entregado: tarea.entregado !== false,
            puntual: this.verificarPuntualidad(tarea.fechaEntrega),
            observaciones: tarea.observaciones || '',
            archivos: tarea.archivos || [],
            docente: this.configuracion.docenteActual || 'Docente'
        };
        
        this.registros.push(registro);
        
        // Actualizar historial del estudiante
        estudiante.historialNotas.push({
            tipo: 'TA',
            fecha: registro.fechaRegistro,
            puntuacion: tarea.puntuacion || 0,
            registroId: registro.id,
            tarea: tarea.titulo
        });
        
        this.guardarRegistros();
        this.guardarEstudiantes();
        
        console.log(`📝 Tarea registrada para ${estudiante.nombre}: ${tarea.puntuacion || 0}/100`);
        return registro;
    }
    
    // ========== REGISTRO DE PROYECTOS TECNOLÓGICOS (30% en III Ciclo) ==========
    
    /**
     * Registra evaluación de proyecto tecnológico
     * @param {string} estudianteId - ID del estudiante
     * @param {Object} proyecto - Datos del proyecto
     * @param {Object} rubrica - Rúbrica de evaluación
     * @returns {Object} - Registro creado
     */
    registrarProyectoTecnologico(estudianteId, proyecto, rubrica) {
        const estudiante = this.buscarEstudiante(estudianteId);
        if (!estudiante) {
            throw new Error(`Estudiante no encontrado: ${estudianteId}`);
        }
        
        const puntuacion = this.evaluarConRubrica(proyecto, rubrica);
        
        const registro = {
            id: `PT-${Date.now()}`,
            tipo: 'proyecto_tecnologico',
            estudianteId,
            estudianteNombre: estudiante.nombre,
            fechaInicio: proyecto.fechaInicio || new Date().toISOString(),
            fechaEntrega: proyecto.fechaEntrega || new Date().toISOString(),
            fechaEvaluacion: new Date().toISOString(),
            proyectoId: proyecto.id || `PROY-${Date.now()}`,
            titulo: proyecto.titulo || 'Proyecto tecnológico',
            descripcion: proyecto.descripcion || '',
            areaTecnologica: proyecto.area || 'General',
            nivelDificultad: proyecto.nivelDificultad || 'Medio',
            rubricaUtilizada: rubrica.id,
            criteriosEvaluados: rubrica.criterios,
            puntuacionBruta: puntuacion,
            puntuacionFinal: puntuacion * 0.30, // 30% del total en III Ciclo
            porcentajeAplicado: 30,
            presentado: proyecto.presentado !== false,
            evidencias: proyecto.evidencias || [],
            documentacion: proyecto.documentacion || [],
            observaciones: proyecto.observaciones || '',
            recomendaciones: proyecto.recomendaciones || '',
            docente: this.configuracion.docenteActual || 'Docente'
        };
        
        this.registros.push(registro);
        
        // Actualizar historial del estudiante
        estudiante.historialNotas.push({
            tipo: 'PT',
            fecha: registro.fechaEvaluacion,
            puntuacion: puntuacion,
            registroId: registro.id,
            proyecto: proyecto.titulo
        });
        
        this.guardarRegistros();
        this.guardarEstudiantes();
        
        console.log(`🚀 Proyecto tecnológico registrado para ${estudiante.nombre}: ${puntuacion}/100`);
        return registro;
    }
    
    /**
     * Evalúa un proyecto usando una rúbrica
     * @param {Object} proyecto - Proyecto a evaluar
     * @param {Object} rubrica - Rúbrica de evaluación
     * @returns {number} - Puntuación total
     */
    evaluarConRubrica(proyecto, rubrica) {
        if (!rubrica || !rubrica.criterios || !Array.isArray(rubrica.criterios)) {
            console.warn('Rúbrica no válida, usando evaluación básica');
            return proyecto.puntuacionEstimada || 70;
        }
        
        let puntuacionTotal = 0;
        let maximoPosible = 0;
        
        rubrica.criterios.forEach(criterio => {
            const nivel = proyecto.niveles?.[criterio.id] || criterio.nivelDefault || 'basico';
            const puntuacionCriterio = criterio.niveles?.[nivel]?.puntuacion || 0;
            
            puntuacionTotal += puntuacionCriterio * (criterio.peso || 1);
            maximoPosible += (criterio.peso || 1) * (criterio.puntuacionMaxima || 4);
        });
        
        // Calcular porcentaje
        const porcentaje = maximoPosible > 0 ? (puntuacionTotal / maximoPosible) * 100 : 0;
        
        return Math.min(Math.max(Math.round(porcentaje), 0), 100);
    }
    
    // ========== REGISTRO DE ASISTENCIA (10%) ==========
    
    /**
     * Registra asistencia de estudiantes
     * @param {string} fecha - Fecha de la clase
     * @param {Array} listaAsistencia - Lista de asistencias
     * @returns {Object} - Registro de asistencia
     */
    registrarAsistencia(fecha, listaAsistencia) {
        const registro = {
            id: `AS-${Date.now()}`,
            tipo: 'asistencia',
            fecha,
            fechaRegistro: new Date().toISOString(),
            totalEstudiantes: listaAsistencia.length,
            lista: listaAsistencia,
            docente: this.configuracion.docenteActual || 'Docente'
        };
        
        // Actualizar estadísticas de cada estudiante
        listaAsistencia.forEach(item => {
            const estudiante = this.buscarEstudiante(item.estudianteId);
            if (estudiante) {
                estudiante.asistencia.totalClases++;
                
                if (item.asistio) {
                    estudiante.asistencia.asistencias++;
                } else if (item.justificado) {
                    estudiante.asistencia.justificadas++;
                } else {
                    estudiante.asistencia.ausencias++;
                }
                
                // Calcular porcentaje actualizado
                estudiante.asistencia.porcentaje = estudiante.asistencia.totalClases > 0 ?
                    (estudiante.asistencia.asistencias / estudiante.asistencia.totalClases) * 100 : 100;
            }
        });
        
        this.registros.push(registro);
        this.guardarRegistros();
        this.guardarEstudiantes();
        
        console.log(`📅 Asistencia registrada para ${fecha}: ${listaAsistencia.length} estudiantes`);
        return registro;
    }
    
    /**
     * Calcula nota de asistencia para un estudiante
     * @param {string} estudianteId - ID del estudiante
     * @returns {number} - Nota de asistencia (0-100)
     */
    calcularNotaAsistencia(estudianteId) {
        const estudiante = this.buscarEstudiante(estudianteId);
        if (!estudiante) {
            return 0;
        }
        
        const porcentajeAsistencia = estudiante.asistencia.porcentaje;
        
        // Convertir porcentaje de asistencia a nota (0-100)
        // Ejemplo: 100% asistencia = 100 puntos, 75% asistencia = 75 puntos
        return Math.min(Math.max(Math.round(porcentajeAsistencia), 0), 100);
    }
    
    // ========== CÁLCULOS Y REPORTES ==========
    
    /**
     * Calcula nota final para un estudiante en un período
     * @param {string} estudianteId - ID del estudiante
     * @param {string} periodo - Período a evaluar
     * @param {string} ciclo - Ciclo educativo
     * @returns {Object} - Nota final y desglose
     */
    calcularNotaPeriodo(estudianteId, periodo, ciclo) {
        const estudiante = this.buscarEstudiante(estudianteId);
        if (!estudiante) {
            throw new Error(`Estudiante no encontrado: ${estudianteId}`);
        }
        
        // Filtrar registros del período
        const registrosPeriodo = this.registros.filter(reg => 
            reg.estudianteId === estudianteId && 
            reg.periodo === periodo
        );
        
        // Agrupar por tipo
        const tc = registrosPeriodo.filter(r => r.tipo === 'trabajo_cotidiano');
        const ta = registrosPeriodo.filter(r => r.tipo === 'tarea');
        const pt = registrosPeriodo.filter(r => r.tipo === 'proyecto_tecnologico');
        
        // Calcular promedios
        const promedioTC = tc.length > 0 ? 
            tc.reduce((sum, r) => sum + r.puntuacionBruta, 0) / tc.length : 0;
        
        const promedioTA = ta.length > 0 ? 
            ta.reduce((sum, r) => sum + r.puntuacionBruta, 0) / ta.length : 0;
        
        const promedioPT = pt.length > 0 ? 
            pt.reduce((sum, r) => sum + r.puntuacionBruta, 0) / pt.length : 0;
        
        const notaAS = this.calcularNotaAsistencia(estudianteId);
        
        // Usar la calculadora MEP
        const calculadora = new CalculadoraMEP();
        const puntuaciones = {
            TC: promedioTC,
            TA: promedioTA,
            PE: promedioTC, // Para ciclos 1-2, usar TC como PE
            PT: promedioPT,
            AS: notaAS
        };
        
        return calculadora.calcularNotaFinal(ciclo, puntuaciones);
    }
    
    /**
     * Genera reporte de progreso para un estudiante
     * @param {string} estudianteId - ID del estudiante
     * @returns {Object} - Reporte de progreso
     */
    generarReporteProgreso(estudianteId) {
        const estudiante = this.buscarEstudiante(estudianteId);
        if (!estudiante) {
            throw new Error(`Estudiante no encontrado: ${estudianteId}`);
        }
        
        const registrosEstudiante = this.registros.filter(r => r.estudianteId === estudianteId);
        
        return {
            estudiante: {
                id: estudiante.id,
                nombre: estudiante.nombre,
                nivel: estudiante.nivel,
                grupo: estudiante.grupo
            },
            estadisticas: {
                totalRegistros: registrosEstudiante.length,
                trabajoCotidiano: registrosEstudiante.filter(r => r.tipo === 'trabajo_cotidiano').length,
                tareas: registrosEstudiante.filter(r => r.tipo === 'tarea').length,
                proyectos: registrosEstudiante.filter(r => r.tipo === 'proyecto_tecnologico').length,
                asistencia: {
                    porcentaje: estudiante.asistencia.porcentaje,
                    asistencias: estudiante.asistencia.asistencias,
                    ausencias: estudiante.asistencia.ausencias,
                    justificadas: estudiante.asistencia.justificadas,
                    totalClases: estudiante.asistencia.totalClases
                }
            },
            tendencia: this.analizarTendencia(registrosEstudiante),
            fortalezas: this.identificarFortalezas(registrosEstudiante),
            areasMejora: this.identificarAreasMejora(registrosEstudiante),
            recomendaciones: this.generarRecomendaciones(registrosEstudiante)
        };
    }
    
    // ========== FUNCIONES AUXILIARES ==========
    
    buscarEstudiante(estudianteId) {
        return this.estudiantes.find(e => e.id === estudianteId);
    }
    
    obtenerPorcentajeTC(nivel) {
        const porcentajes = {
            '1°': 65, '2°': 65, '3°': 65,
            '4°': 60, '5°': 60, '6°': 60,
            '7°': 50, '8°': 50, '9°': 50
        };
        
        return porcentajes[nivel] || 60;
    }
    
    obtenerPeriodoActual() {
        const fecha = new Date();
        const año = fecha.getFullYear();
        const mes = fecha.getMonth() + 1;
        
        if (mes >= 1 && mes <= 4) return `I-${año}`;
        if (mes >= 5 && mes <= 8) return `II-${año}`;
        return `III-${año}`;
    }
    
    verificarPuntualidad(fechaEntrega) {
        if (!fechaEntrega) return true;
        
        const fechaLimite = new Date(fechaEntrega);
        const hoy = new Date();
        
        return hoy <= fechaLimite;
    }
    
    // ========== PERSISTENCIA ==========
    
    cargarEstudiantes() {
        try {
            const datos = localStorage.getItem('tecnoPIA_estudiantes');
            return datos ? JSON.parse(datos) : [];
        } catch (error) {
            console.error('Error al cargar estudiantes:', error);
            return [];
        }
    }
    
    guardarEstudiantes() {
        try {
            localStorage.setItem('tecnoPIA_estudiantes', JSON.stringify(this.estudiantes));
        } catch (error) {
            console.error('Error al guardar estudiantes:', error);
        }
    }
    
    cargarRegistros() {
        try {
            const datos = localStorage.getItem('tecnoPIA_registros');
            return datos ? JSON.parse(datos) : [];
        } catch (error) {
            console.error('Error al cargar registros:', error);
            return [];
        }
    }
    
    guardarRegistros() {
        try {
            localStorage.setItem('tecnoPIA_registros', JSON.stringify(this.registros));
        } catch (error) {
            console.error('Error al guardar registros:', error);
        }
    }
    
    cargarGrupos() {
        try {
            const datos = localStorage.getItem('tecnoPIA_grupos');
            return datos ? JSON.parse(datos) : [];
        } catch (error) {
            console.error('Error al cargar grupos:', error);
            return [];
        }
    }
    
    cargarConfiguracion() {
        try {
            const datos = localStorage.getItem('tecnoPIA_configuracion');
            return datos ? JSON.parse(datos) : {
                docenteActual: 'Docente MEP',
                institucion: 'Centro Educativo',
                añoLectivo: new Date().getFullYear()
            };
        } catch (error) {
            console.error('Error al cargar configuración:', error);
            return {
                docenteActual: 'Docente MEP',
                institucion: 'Centro Educativo',
                añoLectivo: new Date().getFullYear()
            };
        }
    }
    
    // ========== ANÁLISIS DE DATOS ==========
    
    analizarTendencia(registros) {
        if (registros.length < 2) {
            return 'Datos insuficientes';
        }
        
        const ultimosRegistros = registros
            .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
            .slice(0, 5);
        
        const puntuaciones = ultimosRegistros.map(r => r.puntuacionBruta || 0);
        const promedio = puntuaciones.reduce((a, b) => a + b, 0) / puntuaciones.length;
        
        if (puntuaciones.length < 2) {
            return 'Estable';
        }
        
        const primer = puntuaciones[0];
        const ultimo = puntuaciones[puntuaciones.length - 1];
        
        if (ultimo > primer + 10) return 'Mejorando significativamente';
        if (ultimo > primer + 5) return 'Mejorando';
        if (ultimo < primer - 10) return 'Disminuyendo significativamente';
        if (ultimo < primer - 5) return 'Disminuyendo';
        return 'Estable';
    }
    
    identificarFortalezas(registros) {
        const fortalezas = [];
        
        // Analizar tipos de evaluación con mejores resultados
        const porTipo = {};
        registros.forEach(reg => {
            if (!porTipo[reg.tipo]) {
                porTipo[reg.tipo] = { suma: 0, cantidad: 0 };
            }
            porTipo[reg.tipo].suma += reg.puntuacionBruta || 0;
            porTipo[reg.tipo].cantidad++;
        });
        
        for (const [tipo, datos] of Object.entries(porTipo)) {
            const promedio = datos.suma / datos.cantidad;
            if (promedio >= 80) {
                const nombreTipo = this.obtenerNombreTipo(tipo);
                fortalezas.push(`${nombreTipo} (${Math.round(promedio)}/100)`);
            }
        }
        
        return fortalezas.length > 0 ? fortalezas : ['Participación constante'];
    }
    
    identificarAreasMejora(registros) {
        const areasMejora = [];
        
        // Identificar evaluaciones bajas recientes
        const evaluacionesBajas = registros
            .filter(r => (r.puntuacionBruta || 0) < 70)
            .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
            .slice(0, 3);
        
        evaluacionesBajas.forEach(reg => {
            const nombreTipo = this.obtenerNombreTipo(reg.tipo);
            areasMejora.push(`${nombreTipo}: ${Math.round(reg.puntuacionBruta || 0)}/100`);
        });
        
        return areasMejora.length > 0 ? areasMejora : ['Mantener nivel actual'];
    }
    
    generarRecomendaciones(registros) {
        const recomendaciones = [];
        const promedioGeneral = registros.length > 0 ?
            registros.reduce((sum, r) => sum + (r.puntuacionBruta || 0), 0) / registros.length : 0;
        
        if (promedioGeneral < 70) {
            recomendaciones.push("Reforzar conceptos básicos y solicitar apoyo adicional");
        } else if (promedioGeneral < 80) {
            recomendaciones.push("Practicar habilidades específicas para alcanzar nivel avanzado");
        } else if (promedioGeneral < 90) {
            recomendaciones.push("Profundizar en áreas de interés y desarrollar proyectos creativos");
        } else {
            recomendaciones.push("Mantener excelente desempeño y explorar retos tecnológicos avanzados");
        }
        
        // Verificar asistencia
        const estudianteId = registros[0]?.estudianteId;
        if (estudianteId) {
            const estudiante = this.buscarEstudiante(estudianteId);
            if (estudiante && estudiante.asistencia.porcentaje < 85) {
                recomendaciones.push("Mejorar puntualidad y asistencia para optimizar aprendizaje");
            }
        }
        
        return recomendaciones;
    }
    
    obtenerNombreTipo(tipo) {
        const nombres = {
            'trabajo_cotidiano': 'Trabajo Cotidiano',
            'tarea': 'Tareas',
            'proyecto_tecnologico': 'Proyectos Tecnológicos',
            'asistencia': 'Asistencia'
        };
        
        return nombres[tipo] || tipo;
    }
}

// Exportar para uso global
window.RegistroEvaluacionTecnologia = RegistroEvaluacionTecnologia;

// Inicialización automática
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ Sistema de Registro de Evaluación cargado');
    console.log('📊 Gestión completa de trabajo cotidiano, tareas, proyectos y asistencia');
    console.log('🎯 Integrado con Calculadora MEP para cálculos oficiales');
});
