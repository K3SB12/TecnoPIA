// js/registro-evaluacion.js
class RegistroEvaluacion {
    constructor() {
        this.evaluaciones = [];
        this.seguimientos = {};
        this.cargarDatos();
    }
    
    cargarDatos() {
        try {
            const evaluacionesGuardadas = localStorage.getItem('tecnoPIA_evaluaciones');
            if (evaluacionesGuardadas) {
                this.evaluaciones = JSON.parse(evaluacionesGuardadas);
            }
            
            const seguimientosGuardados = localStorage.getItem('tecnoPIA_seguimientos');
            if (seguimientosGuardados) {
                this.seguimientos = JSON.parse(seguimientosGuardados);
            }
        } catch (error) {
            console.error('Error cargando datos de evaluación:', error);
        }
    }
    
    guardarDatos() {
        try {
            localStorage.setItem('tecnoPIA_evaluaciones', JSON.stringify(this.evaluaciones));
            localStorage.setItem('tecnoPIA_seguimientos', JSON.stringify(this.seguimientos));
        } catch (error) {
            console.error('Error guardando datos de evaluación:', error);
        }
    }
    
    registrarEvaluacion(evaluacion) {
        const evaluacionCompleta = {
            id: Date.now(),
            fechaRegistro: new Date().toISOString(),
            ...evaluacion
        };
        
        // Calcular calificación automáticamente si hay puntuaciones
        if (evaluacion.puntuaciones) {
            evaluacionCompleta.calificacion = this.calcularCalificacion(evaluacion.puntuaciones);
            evaluacionCompleta.promedio = this.calcularPromedio(evaluacion.puntuaciones);
        }
        
        this.evaluaciones.push(evaluacionCompleta);
        this.guardarDatos();
        
        // Registrar actividad automática
        if (window.registroCotidiano) {
            window.registroCotidiano.registrarActividad({
                tipo: 'evaluacion',
                descripcion: `Evaluación ${evaluacion.tipoEvaluacion} registrada`,
                grupo: evaluacion.grupoId,
                estudiante: evaluacion.estudianteNombre,
                detalles: {
                    asignatura: evaluacion.asignatura,
                    periodo: evaluacion.periodo,
                    calificacion: evaluacionCompleta.calificacion,
                    promedio: evaluacionCompleta.promedio
                }
            });
        }
        
        return evaluacionCompleta;
    }
    
    calcularCalificacion(puntuaciones) {
        const valores = Object.values(puntuaciones);
        if (valores.length === 0) return 'No evaluado';
        
        const suma = valores.reduce((total, valor) => total + valor, 0);
        const promedio = suma / valores.length;
        
        if (promedio >= 9) return 'Excelente (A)';
        if (promedio >= 8) return 'Muy Bueno (B)';
        if (promedio >= 7) return 'Bueno (C)';
        if (promedio >= 6) return 'Satisfactorio (D)';
        return 'Insuficiente (F)';
    }
    
    calcularPromedio(puntuaciones) {
        const valores = Object.values(puntuaciones);
        if (valores.length === 0) return 0;
        
        const suma = valores.reduce((total, valor) => total + valor, 0);
        return Math.round((suma / valores.length) * 10); // Convertir a porcentaje
    }
    
    obtenerEvaluacionesEstudiante(estudianteId) {
        return this.evaluaciones.filter(e => e.estudianteId === estudianteId);
    }
    
    obtenerEvaluacionesGrupo(grupoId) {
        return this.evaluaciones.filter(e => e.grupoId === grupoId);
    }
    
    obtenerEvaluacionesPorPeriodo(periodo) {
        return this.evaluaciones.filter(e => e.periodo === periodo);
    }
    
    obtenerPromedioEstudiante(estudianteId) {
        const evaluacionesEstudiante = this.obtenerEvaluacionesEstudiante(estudianteId);
        if (evaluacionesEstudiante.length === 0) return 0;
        
        const sumaPromedios = evaluacionesEstudiante.reduce((total, eval) => total + (eval.promedio || 0), 0);
        return Math.round(sumaPromedios / evaluacionesEstudiante.length);
    }
    
    obtenerPromedioGrupo(grupoId) {
        const evaluacionesGrupo = this.obtenerEvaluacionesGrupo(grupoId);
        if (evaluacionesGrupo.length === 0) return 0;
        
        const sumaPromedios = evaluacionesGrupo.reduce((total, eval) => total + (eval.promedio || 0), 0);
        return Math.round(sumaPromedios / evaluacionesGrupo.length);
    }
    
    agregarSeguimiento(evaluacionId, seguimiento) {
        const seguimientoCompleto = {
            id: Date.now(),
            fecha: new Date().toISOString(),
            ...seguimiento
        };
        
        if (!this.seguimientos[evaluacionId]) {
            this.seguimientos[evaluacionId] = [];
        }
        
        this.seguimientos[evaluacionId].push(seguimientoCompleto);
        this.guardarDatos();
        
        return seguimientoCompleto;
    }
    
    obtenerSeguimientos(evaluacionId) {
        return this.seguimientos[evaluacionId] || [];
    }
    
    generarInformeEstudiante(estudianteId) {
        const evaluaciones = this.obtenerEvaluacionesEstudiante(estudianteId);
        const promedio = this.obtenerPromedioEstudiante(estudianteId);
        
        if (evaluaciones.length === 0) {
            return {
                estudianteId: estudianteId,
                mensaje: 'No hay evaluaciones registradas para este estudiante',
                promedio: 0,
                evaluaciones: []
            };
        }
        
        // Agrupar evaluaciones por período
        const evaluacionesPorPeriodo = {};
        evaluaciones.forEach(eval => {
            if (!evaluacionesPorPeriodo[eval.periodo]) {
                evaluacionesPorPeriodo[eval.periodo] = [];
            }
            evaluacionesPorPeriodo[eval.periodo].push(eval);
        });
        
        // Calcular promedio por área
        const areas = {
            cognitivo: { total: 0, count: 0 },
            procedimental: { total: 0, count: 0 },
            actitudinal: { total: 0, count: 0 },
            socioemocional: { total: 0, count: 0 }
        };
        
        evaluaciones.forEach(eval => {
            if (eval.puntuaciones) {
                Object.keys(eval.puntuaciones).forEach(key => {
                    const area = key.split('-')[0];
                    if (areas[area]) {
                        areas[area].total += eval.puntuaciones[key];
                        areas[area].count++;
                    }
                });
            }
        });
        
        const promediosAreas = {};
        Object.keys(areas).forEach(area => {
            promediosAreas[area] = areas[area].count > 0 
                ? Math.round((areas[area].total / areas[area].count) * 10) 
                : 0;
        });
        
        return {
            estudianteId: estudianteId,
            estudianteNombre: evaluaciones[0].estudianteNombre,
            totalEvaluaciones: evaluaciones.length,
            promedioGeneral: promedio,
            promediosAreas: promediosAreas,
            evaluacionesPorPeriodo: evaluacionesPorPeriodo,
            ultimaEvaluacion: evaluaciones[0],
            recomendaciones: this.generarRecomendacionesEstudiante(promediosAreas)
        };
    }
    
    generarRecomendacionesEstudiante(promediosAreas) {
        const recomendaciones = [];
        
        Object.keys(promediosAreas).forEach(area => {
            const promedio = promediosAreas[area];
            
            if (promedio < 60) {
                recomendaciones.push({
                    area: area,
                    nivel: 'Necesita mejora urgente',
                    recomendacion: this.obtenerRecomendacionPorArea(area, 'bajo')
                });
            } else if (promedio < 80) {
                recomendaciones.push({
                    area: area,
                    nivel: 'En proceso de desarrollo',
                    recomendacion: this.obtenerRecomendacionPorArea(area, 'medio')
                });
            } else {
                recomendaciones.push({
                    area: area,
                    nivel: 'Desarrollo satisfactorio',
                    recomendacion: this.obtenerRecomendacionPorArea(area, 'alto')
                });
            }
        });
        
        return recomendaciones;
    }
    
    obtenerRecomendacionPorArea(area, nivel) {
        const recomendaciones = {
            cognitivo: {
                bajo: 'Reforzar conceptos básicos con ejercicios prácticos y tutorías individualizadas.',
                medio: 'Profundizar en aplicaciones avanzadas de los conceptos aprendidos.',
                alto: 'Desafiar con problemas complejos y proyectos de investigación.'
            },
            procedimental: {
                bajo: 'Practicar procedimientos paso a paso con supervisión constante.',
                medio: 'Fomentar aplicación independiente de procedimientos en nuevos contextos.',
                alto: 'Promover creación de nuevos procedimientos y optimización de existentes.'
            },
            actitudinal: {
                bajo: 'Establecer metas conductuales claras y sistema de refuerzo positivo.',
                medio: 'Fomentar autonomía y responsabilidad en cumplimiento de compromisos.',
                alto: 'Reconocer como modelo positivo y asignar roles de liderazgo.'
            },
            socioemocional: {
                bajo: 'Trabajar habilidades sociales básicas y participación grupal guiada.',
                medio: 'Promover roles activos en trabajo colaborativo y resolución de conflictos.',
                alto: 'Fomentar liderazgo y mediación en dinámicas grupales.'
            }
        };
        
        return recomendaciones[area]?.[nivel] || 'No hay recomendación disponible.';
    }
    
    generarReporteGrupal(grupoId) {
        const evaluaciones = this.obtenerEvaluacionesGrupo(grupoId);
        const promedioGrupo = this.obtenerPromedioGrupo(grupoId);
        
        if (evaluaciones.length === 0) {
            return {
                grupoId: grupoId,
                mensaje: 'No hay evaluaciones registradas para este grupo',
                promedioGrupo: 0,
                totalEvaluaciones: 0,
                estudiantesEvaluados: 0
            };
        }
        
        // Agrupar evaluaciones por estudiante
        const evaluacionesPorEstudiante = {};
        evaluaciones.forEach(eval => {
            if (!evaluacionesPorEstudiante[eval.estudianteId]) {
                evaluacionesPorEstudiante[eval.estudianteId] = {
                    nombre: eval.estudianteNombre,
                    evaluaciones: [],
                    promedio: 0
                };
            }
            evaluacionesPorEstudiante[eval.estudianteId].evaluaciones.push(eval);
        });
        
        // Calcular promedio por estudiante
        Object.keys(evaluacionesPorEstudiante).forEach(estudianteId => {
            const evalEstudiante = evaluacionesPorEstudiante[estudianteId];
            const suma = evalEstudiante.evaluaciones.reduce((total, eval) => total + (eval.promedio || 0), 0);
            evalEstudiante.promedio = Math.round(suma / evalEstudiante.evaluaciones.length);
        });
        
        // Distribución de calificaciones
        const promediosEstudiantes = Object.values(evaluacionesPorEstudiante).map(e => e.promedio);
        const distribucion = {
            excelente: promediosEstudiantes.filter(p => p >= 90).length,
            bueno: promediosEstudiantes.filter(p => p >= 70 && p < 90).length,
            regular: promediosEstudiantes.filter(p => p >= 50 && p < 70).length,
            insuficiente: promediosEstudiantes.filter(p => p < 50).length
        };
        
        return {
            grupoId: grupoId,
            promedioGrupo: promedioGrupo,
            totalEvaluaciones: evaluaciones.length,
            estudiantesEvaluados: Object.keys(evaluacionesPorEstudiante).length,
            distribucionCalificaciones: distribucion,
            evaluacionesPorEstudiante: evaluacionesPorEstudiante,
            tendencia: this.calcularTendenciaGrupo(grupoId)
        };
    }
    
    calcularTendenciaGrupo(grupoId) {
        const evaluaciones = this.obtenerEvaluacionesGrupo(grupoId);
        if (evaluaciones.length < 2) return 'estable';
        
        // Ordenar por fecha
        evaluaciones.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
        
        // Dividir en primeros y últimos
        const mitad = Math.floor(evaluaciones.length / 2);
        const primeras = evaluaciones.slice(0, mitad);
        const ultimas = evaluaciones.slice(-mitad);
        
        // Calcular promedios
        const promedioPrimeras = primeras.reduce((sum, eval) => sum + (eval.promedio || 0), 0) / primeras.length;
        const promedioUltimas = ultimas.reduce((sum, eval) => sum + (eval.promedio || 0), 0) / ultimas.length;
        
        const diferencia = promedioUltimas - promedioPrimeras;
        
        if (diferencia > 10) return 'mejora_significativa';
        if (diferencia > 5) return 'mejora_moderada';
        if (diferencia < -10) return 'deterioro_significativo';
        if (diferencia < -5) return 'deterioro_moderado';
        return 'estable';
    }
    
    exportarDatosEstudiante(estudianteId, formato = 'json') {
        const informe = this.generarInformeEstudiante(estudianteId);
        
        switch(formato) {
            case 'json':
                return JSON.stringify(informe, null, 2);
                
            case 'csv':
                let csv = 'Periodo,TipoEvaluacion,Asignatura,Fecha,Promedio,Calificacion\n';
                
                if (informe.evaluaciones) {
                    Object.keys(informe.evaluacionesPorPeriodo || {}).forEach(periodo => {
                        informe.evaluacionesPorPeriodo[periodo].forEach(eval => {
                            csv += `"${periodo}","${eval.tipoEvaluacion}","${eval.asignatura}","${eval.fecha}",${eval.promedio || 0},"${eval.calificacion || 'No evaluado'}"\n`;
                        });
                    });
                }
                
                return csv;
                
            case 'pdf':
                // Esto sería implementado con una librería de generación de PDF
                return this.generarContenidoPDF(informe);
                
            default:
                return JSON.stringify(informe, null, 2);
        }
    }
    
    generarContenidoPDF(informe) {
        // Contenido básico para PDF
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Informe de Evaluación - ${informe.estudianteNombre}</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 40px; }
                    .header { text-align: center; margin-bottom: 30px; }
                    .info { margin-bottom: 20px; }
                    .table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                    .table th, .table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                    .table th { background-color: #f2f2f2; }
                    .recomendaciones { margin-top: 30px; padding: 20px; background-color: #f9f9f9; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>INFORME DE EVALUACIÓN</h1>
                    <h2>${informe.estudianteNombre}</h2>
                </div>
                
                <div class="info">
                    <p><strong>Estudiante:</strong> ${informe.estudianteNombre}</p>
                    <p><strong>Total de evaluaciones:</strong> ${informe.totalEvaluaciones}</p>
                    <p><strong>Promedio general:</strong> ${informe.promedioGeneral}%</p>
                </div>
                
                <h3>Evaluaciones por Período</h3>
                <table class="table">
                    <tr>
                        <th>Período</th>
                        <th>Tipo</th>
                        <th>Asignatura</th>
                        <th>Fecha</th>
                        <th>Promedio</th>
                        <th>Calificación</th>
                    </tr>
                    ${Object.keys(informe.evaluacionesPorPeriodo || {}).map(periodo => 
                        informe.evaluacionesPorPeriodo[periodo].map(eval => `
                            <tr>
                                <td>${periodo}</td>
                                <td>${eval.tipoEvaluacion}</td>
                                <td>${eval.asignatura}</td>
                                <td>${eval.fecha}</td>
                                <td>${eval.promedio || 0}%</td>
                                <td>${eval.calificacion || 'No evaluado'}</td>
                            </tr>
                        `).join('')
                    ).join('')}
                </table>
                
                <div class="recomendaciones">
                    <h3>Recomendaciones</h3>
                    ${informe.recomendaciones ? informe.recomendaciones.map(rec => `
                        <p><strong>${rec.area}:</strong> ${rec.recomendacion}</p>
                    `).join('') : '<p>No hay recomendaciones disponibles.</p>'}
                </div>
                
                <div style="margin-top: 50px; font-size: 12px; color: #666; text-align: center;">
                    <p>Documento generado automáticamente por TecnoPIA - ${new Date().toLocaleDateString('es-CR')}</p>
                </div>
            </body>
            </html>
        `;
    }
}

// Funciones globales para el registro de evaluaciones
function inicializarRegistroEvaluacion() {
    window.registroEvaluacion = new RegistroEvaluacion();
}

function registrarNuevaEvaluacion(datosEvaluacion) {
    if (!window.registroEvaluacion) return null;
    return window.registroEvaluacion.registrarEvaluacion(datosEvaluacion);
}

function obtenerInformeEstudiante(estudianteId) {
    if (!window.registroEvaluacion) return null;
    return window.registroEvaluacion.generarInformeEstudiante(estudianteId);
}

function obtenerReporteGrupal(grupoId) {
    if (!window.registroEvaluacion) return null;
    return window.registroEvaluacion.generarReporteGrupal(grupoId);
}

function exportarInformeEstudiante(estudianteId, formato = 'json') {
    if (!window.registroEvaluacion) return null;
    return window.registroEvaluacion.exportarDatosEstudiante(estudianteId, formato);
}

// Inicializar al cargar la página
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(inicializarRegistroEvaluacion, 1000);
});
