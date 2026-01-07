// registro-cotidiano.js - Sistema de registro de trabajo cotidiano (50-65%)

class RegistroTrabajoCotidiano {
    constructor() {
        this.evaluaciones = this.cargarEvaluaciones();
        this.indicadoresSeleccionados = [];
        this.estudiantesGrupo = [];
        this.evaluacionActual = null;
    }
    
    /**
     * Carga estudiantes de un grupo específico
     * @param {string} grupoId - ID del grupo
     * @returns {Array} - Lista de estudiantes
     */
    cargarEstudiantesDeGrupo(grupoId) {
        const gestorGrupos = new GestorGrupos();
        const grupo = gestorGrupos.buscarGrupo(grupoId);
        
        if (!grupo) {
            console.error('Grupo no encontrado:', grupoId);
            return [];
        }
        
        // Obtener datos completos de cada estudiante
        const registro = new RegistroEvaluacionTecnologia();
        this.estudiantesGrupo = grupo.estudiantes
            .map(estId => registro.buscarEstudiante(estId))
            .filter(est => est !== undefined && est.activo !== false)
            .map(est => ({
                id: est.id,
                codigo: est.codigo,
                nombre: est.nombre,
                apellidos: est.apellidos,
                nombreCompleto: `${est.nombre} ${est.apellidos}`.trim(),
                evaluaciones: this.obtenerEvaluacionesPrevias(est.id),
                promedioTC: this.calcularPromedioTC(est.id)
            }));
        
        console.log(`📋 Cargados ${this.estudiantesGrupo.length} estudiantes del grupo ${grupo.codigo}`);
        return this.estudiantesGrupo;
    }
    
    /**
     * Carga indicadores disponibles para trabajo cotidiano
     * @param {string} ciclo - Ciclo educativo
     * @returns {Array} - Indicadores filtrados
     */
    cargarIndicadoresDisponibles(ciclo = null) {
        const gestorIndicadores = window.gestorIndicadores || new GestorIndicadoresPNFT();
        let indicadores = gestorIndicadores.indicadores;
        
        // Filtrar por ciclo si se especifica
        if (ciclo) {
            indicadores = indicadores.filter(ind => 
                ind.activo !== false && ind.ciclo === ciclo
            );
        }
        
        // Filtrar solo los que incluyen componente "cotidiano"
        indicadores = indicadores.filter(ind =>
            ind.componentes && ind.componentes.includes('cotidiano')
        );
        
        console.log(`🎯 ${indicadores.length} indicadores disponibles para trabajo cotidiano`);
        return indicadores;
    }
    
    /**
     * Crea una nueva evaluación de trabajo cotidiano
     * @param {Object} datos - Datos de la evaluación
     * @returns {Object} - Evaluación creada
     */
    crearEvaluacion(datos) {
        const evaluacion = {
            id: `EVAL-TC-${Date.now()}`,
            tipo: 'trabajo_cotidiano',
            fechaCreacion: new Date().toISOString(),
            fechaEvaluacion: datos.fecha || new Date().toISOString().split('T')[0],
            grupoId: datos.grupoId,
            ciclo: datos.ciclo,
            unidad: datos.unidad || '',
            tema: datos.tema || '',
            indicadores: datos.indicadores || [],
            observacionesGenerales: datos.observacionesGenerales || '',
            porcentajeTC: this.obtenerPorcentajeTC(datos.ciclo),
            evaluacionesEstudiantes: [],
            estado: 'borrador'
        };
        
        this.evaluacionActual = evaluacion;
        return evaluacion;
    }
    
    /**
     * Agrega evaluación de un estudiante a la evaluación actual
     * @param {Object} evaluacionEstudiante - Evaluación del estudiante
     */
    agregarEvaluacionEstudiante(evaluacionEstudiante) {
        if (!this.evaluacionActual) {
            throw new Error('No hay evaluación activa');
        }
        
        // Validar datos básicos
        if (!evaluacionEstudiante.estudianteId || !evaluacionEstudiante.calificaciones) {
            console.error('Datos incompletos para evaluación de estudiante:', evaluacionEstudiante);
            return;
        }
        
        // Calcular promedio
        const calificaciones = Object.values(evaluacionEstudiante.calificaciones);
        const suma = calificaciones.reduce((total, cal) => total + (cal.puntuacion || 0), 0);
        const promedio = calificaciones.length > 0 ? suma / calificaciones.length : 0;
        
        // Aplicar porcentaje de trabajo cotidiano
        const notaFinalTC = (promedio * this.evaluacionActual.porcentajeTC) / 100;
        
        const evaluacionCompleta = {
            ...evaluacionEstudiante,
            promedio,
            notaFinalTC: Math.round(notaFinalTC * 100) / 100,
            fechaRegistro: new Date().toISOString()
        };
        
        // Reemplazar si ya existe
        const index = this.evaluacionActual.evaluacionesEstudiantes.findIndex(
            e => e.estudianteId === evaluacionEstudiante.estudianteId
        );
        
        if (index >= 0) {
            this.evaluacionActual.evaluacionesEstudiantes[index] = evaluacionCompleta;
        } else {
            this.evaluacionActual.evaluacionesEstudiantes.push(evaluacionCompleta);
        }
        
        console.log(`✅ Evaluación registrada para estudiante ${evaluacionEstudiante.estudianteId}: ${notaFinalTC.toFixed(2)}%`);
    }
    
    /**
     * Guarda la evaluación actual en el sistema
     * @returns {Object} - Evaluación guardada
     */
    guardarEvaluacion() {
        if (!this.evaluacionActual) {
            throw new Error('No hay evaluación para guardar');
        }
        
        // Validar que tenga evaluaciones de estudiantes
        if (this.evaluacionActual.evaluacionesEstudiantes.length === 0) {
            throw new Error('La evaluación no contiene calificaciones de estudiantes');
        }
        
        // Cambiar estado a completado
        this.evaluacionActual.estado = 'completado';
        this.evaluacionActual.fechaCompletado = new Date().toISOString();
        
        // Calcular estadísticas
        this.calcularEstadisticasEvaluacion();
        
        // Guardar en el historial
        this.evaluaciones.push(this.evaluacionActual);
        this.guardarEvaluaciones();
        
        // Actualizar promedios de estudiantes
        this.actualizarPromediosEstudiantes();
        
        console.log(`💾 Evaluación guardada: ${this.evaluacionActual.id}`);
        console.log(`📊 ${this.evaluacionActual.evaluacionesEstudiantes.length} estudiantes evaluados`);
        
        return this.evaluacionActual;
    }
    
    /**
     * Calcula estadísticas de la evaluación actual
     */
    calcularEstadisticasEvaluacion() {
        if (!this.evaluacionActual) return;
        
        const evaluaciones = this.evaluacionActual.evaluacionesEstudiantes;
        
        if (evaluaciones.length === 0) {
            this.evaluacionActual.estadisticas = {
                totalEstudiantes: 0,
                promedioGeneral: 0,
                maximo: 0,
                minimo: 0,
                desviacion: 0
            };
            return;
        }
        
        const notas = evaluaciones.map(e => e.notaFinalTC);
        const suma = notas.reduce((total, nota) => total + nota, 0);
        const promedio = suma / notas.length;
        
        // Calcular desviación estándar
        const diferencias = notas.map(nota => Math.pow(nota - promedio, 2));
        const varianza = diferencias.reduce((total, diff) => total + diff, 0) / notas.length;
        const desviacion = Math.sqrt(varianza);
        
        this.evaluacionActual.estadisticas = {
            totalEstudiantes: evaluaciones.length,
            promedioGeneral: Math.round(promedio * 100) / 100,
            maximo: Math.max(...notas),
            minimo: Math.min(...notas),
            desviacion: Math.round(desviacion * 100) / 100,
            porcentajeAprobacion: this.calcularPorcentajeAprobacion(notas)
        };
    }
    
    /**
     * Calcula porcentaje de aprobación
     * @param {Array} notas - Lista de notas
     * @returns {number} - Porcentaje de aprobación
     */
    calcularPorcentajeAprobacion(notas) {
        if (notas.length === 0) return 0;
        
        const aprobados = notas.filter(nota => nota >= 70).length;
        return Math.round((aprobados / notas.length) * 100);
    }
    
    /**
     * Actualiza promedios de estudiantes
     */
    actualizarPromediosEstudiantes() {
        const registro = new RegistroEvaluacionTecnologia();
        
        this.evaluacionActual.evaluacionesEstudiantes.forEach(evalEst => {
            const estudiante = registro.buscarEstudiante(evalEst.estudianteId);
            
            if (estudiante) {
                // Agregar al historial de notas
                estudiante.historialNotas = estudiante.historialNotas || [];
                estudiante.historialNotas.push({
                    tipo: 'TC',
                    fecha: this.evaluacionActual.fechaEvaluacion,
                    evaluacionId: this.evaluacionActual.id,
                    nota: evalEst.notaFinalTC,
                    promedioIndicadores: evalEst.promedio
                });
                
                // Calcular nuevo promedio
                estudiante.promedioTC = this.calcularPromedioTC(estudiante.id);
                
                // Guardar cambios
                registro.guardarEstudiantes();
            }
        });
    }
    
    /**
     * Obtiene evaluaciones previas de un estudiante
     * @param {string} estudianteId - ID del estudiante
     * @returns {Array} - Evaluaciones previas
     */
    obtenerEvaluacionesPrevias(estudianteId) {
        return this.evaluaciones
            .filter(eval => 
                eval.estado === 'completado' &&
                eval.evaluacionesEstudiantes.some(e => e.estudianteId === estudianteId)
            )
            .map(eval => {
                const evalEst = eval.evaluacionesEstudiantes.find(e => e.estudianteId === estudianteId);
                return {
                    fecha: eval.fechaEvaluacion,
                    nota: evalEst?.notaFinalTC || 0,
                    unidad: eval.unidad,
                    tema: eval.tema
                };
            });
    }
    
    /**
     * Calcula promedio de trabajo cotidiano de un estudiante
     * @param {string} estudianteId - ID del estudiante
     * @returns {number} - Promedio TC
     */
    calcularPromedioTC(estudianteId) {
        const evaluacionesEst = this.evaluaciones
            .filter(eval => 
                eval.estado === 'completado' &&
                eval.evaluacionesEstudiantes.some(e => e.estudianteId === estudianteId)
            )
            .map(eval => {
                const evalEst = eval.evaluacionesEstudiantes.find(e => e.estudianteId === estudianteId);
                return evalEst?.notaFinalTC || 0;
            });
        
        if (evaluacionesEst.length === 0) return 0;
        
        const suma = evaluacionesEst.reduce((total, nota) => total + nota, 0);
        return Math.round((suma / evaluacionesEst.length) * 100) / 100;
    }
    
    /**
     * Obtiene porcentaje de trabajo cotidiano según ciclo
     * @param {string} ciclo - Ciclo educativo
     * @returns {number} - Porcentaje TC
     */
    obtenerPorcentajeTC(ciclo) {
        const porcentajes = {
            'ciclo1': 65,
            'ciclo2': 60,
            'ciclo3': 50
        };
        return porcentajes[ciclo] || 60;
    }
    
    /**
     * Genera lista de cotejo para la evaluación actual
     * @returns {Object} - Lista de cotejo
     */
    generarListaCotejo() {
        if (!this.evaluacionActual) {
            throw new Error('No hay evaluación activa');
        }
        
        const lista = {
            id: `LC-${Date.now()}`,
            fechaGeneracion: new Date().toISOString(),
            evaluacionId: this.evaluacionActual.id,
            grupoId: this.evaluacionActual.grupoId,
            fechaEvaluacion: this.evaluacionActual.fechaEvaluacion,
            unidad: this.evaluacionActual.unidad,
            tema: this.evaluacionActual.tema,
            indicadores: this.evaluacionActual.indicadores.map(indId => {
                const gestorIndicadores = window.gestorIndicadores;
                const indicador = gestorIndicadores?.indicadores?.find(i => i.id === indId);
                return indicador ? {
                    codigo: indicador.codigo,
                    descripcion: indicador.descripcion,
                    escala: indicador.escala
                } : { id: indId };
            }),
            estudiantes: this.evaluacionActual.evaluacionesEstudiantes.map(evalEst => {
                const estudiante = this.estudiantesGrupo.find(e => e.id === evalEst.estudianteId);
                return {
                    estudianteId: evalEst.estudianteId,
                    nombre: estudiante?.nombreCompleto || evalEst.estudianteId,
                    calificaciones: evalEst.calificaciones,
                    observaciones: evalEst.observaciones || ''
                };
            })
        };
        
        console.log(`📋 Lista de cotejo generada: ${lista.id}`);
        return lista;
    }
    
    /**
     * Exporta evaluación actual a formato CSV
     * @returns {string} - Datos en formato CSV
     */
    exportarEvaluacionCSV() {
        if (!this.evaluacionActual) {
            throw new Error('No hay evaluación para exportar');
        }
        
        const gestorIndicadores = window.gestorIndicadores;
        const headers = ['Estudiante', 'Código'];
        
        // Agregar columnas para cada indicador
        this.evaluacionActual.indicadores.forEach(indId => {
            const indicador = gestorIndicadores?.indicadores?.find(i => i.id === indId);
            headers.push(indicador?.codigo || indId);
        });
        
        headers.push('Promedio', 'Nota TC', 'Observaciones');
        
        const filas = this.evaluacionActual.evaluacionesEstudiantes.map(evalEst => {
            const estudiante = this.estudiantesGrupo.find(e => e.id === evalEst.estudianteId);
            const fila = [
                estudiante?.nombreCompleto || evalEst.estudianteId,
                estudiante?.codigo || ''
            ];
            
            // Agregar calificaciones por indicador
            this.evaluacionActual.indicadores.forEach(indId => {
                const calificacion = evalEst.calificaciones?.[indId]?.puntuacion || '';
                fila.push(calificacion);
            });
            
            fila.push(evalEst.promedio || '');
            fila.push(evalEst.notaFinalTC || '');
            fila.push(`"${evalEst.observaciones || ''}"`);
            
            return fila;
        });
        
        // Agregar fila de promedios
        if (filas.length > 0) {
            const promedioFila = ['PROMEDIO', ''];
            
            for (let i = 0; i < this.evaluacionActual.indicadores.length; i++) {
                const sum = filas.reduce((total, fila) => {
                    const valor = parseFloat(fila[i + 2]) || 0;
                    return total + valor;
                }, 0);
                promedioFila.push(Math.round((sum / filas.length) * 100) / 100);
            }
            
            // Promedio general y nota TC
            const promedioGeneral = this.evaluacionActual.estadisticas?.promedioGeneral || 0;
            promedioFila.push(promedioGeneral);
            promedioFila.push(promedioGeneral);
            promedioFila.push('');
            
            filas.push(promedioFila);
        }
        
        const csv = [headers.join(','), ...filas.map(fila => fila.join(','))].join('\n');
        return csv;
    }
    
    /**
     * Carga el historial de evaluaciones de un grupo
     * @param {string} grupoId - ID del grupo
     * @returns {Array} - Historial de evaluaciones
     */
    cargarHistorialGrupo(grupoId) {
        return this.evaluaciones
            .filter(eval => 
                eval.grupoId === grupoId && 
                eval.estado === 'completado'
            )
            .sort((a, b) => new Date(b.fechaEvaluacion) - new Date(a.fechaEvaluacion))
            .slice(0, 10); // Últimas 10 evaluaciones
    }
    
    // ========== PERSISTENCIA ==========
    
    cargarEvaluaciones() {
        try {
            const datos = localStorage.getItem('tecnoPIA_evaluaciones_cotidiano');
            return datos ? JSON.parse(datos) : [];
        } catch (error) {
            console.error('Error al cargar evaluaciones:', error);
            return [];
        }
    }
    
    guardarEvaluaciones() {
        try {
            localStorage.setItem('tecnoPIA_evaluaciones_cotidiano', JSON.stringify(this.evaluaciones));
        } catch (error) {
            console.error('Error al guardar evaluaciones:', error);
        }
    }
    
    /**
     * Genera vista previa de reporte
     * @returns {Object} - Datos para reporte
     */
    generarVistaPreviaReporte() {
        if (!this.evaluacionActual) {
            throw new Error('No hay evaluación activa');
        }
        
        const gestorGrupos = new GestorGrupos();
        const grupo = gestorGrupos.buscarGrupo(this.evaluacionActual.grupoId);
        
        return {
            titulo: `Evaluación de Trabajo Cotidiano - ${grupo?.codigo || 'Grupo'}`,
            fecha: this.evaluacionActual.fechaEvaluacion,
            unidad: this.evaluacionActual.unidad,
            tema: this.evaluacionActual.tema,
            porcentajeTC: this.evaluacionActual.porcentajeTC,
            estadisticas: this.evaluacionActual.estadisticas,
            estudiantes: this.evaluacionActual.evaluacionesEstudiantes.map(evalEst => {
                const estudiante = this.estudiantesGrupo.find(e => e.id === evalEst.estudianteId);
                return {
                    nombre: estudiante?.nombreCompleto || evalEst.estudianteId,
                    codigo: estudiante?.codigo || '',
                    promedio: evalEst.promedio,
                    notaTC: evalEst.notaFinalTC,
                    observaciones: evalEst.observaciones || ''
                };
            }),
            indicadores: this.evaluacionActual.indicadores.map(indId => {
                const gestorIndicadores = window.gestorIndicadores;
                const indicador = gestorIndicadores?.indicadores?.find(i => i.id === indId);
                return indicador ? {
                    codigo: indicador.codigo,
                    descripcion: indicador.descripcion
                } : { id: indId };
            })
        };
    }
}

// Exportar para uso global
window.RegistroTrabajoCotidiano = RegistroTrabajoCotidiano;

// Inicialización automática
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ Sistema de Registro de Trabajo Cotidiano cargado');
    console.log('📊 Gestión completa del 50-65% de la evaluación MEP');
});
