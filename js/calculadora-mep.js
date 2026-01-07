// Calculadora de Notas MEP para Formación Tecnológica
class CalculadoraMEP {
    constructor() {
        // Porcentajes según Reglamento de Evaluación MEP
        this.porcentajes = {
            ciclo1: { // Materno a 3°
                trabajoCotidiano: 0.65,
                tareas: 0.10,
                pruebaEjecucion: 0.15,
                asistencia: 0.10,
                proyecto: 0
            },
            ciclo2: { // 4° a 6°
                trabajoCotidiano: 0.60,
                tareas: 0.10,
                pruebaEjecucion: 0.20,
                asistencia: 0.10,
                proyecto: 0
            },
            ciclo3: { // 7° a 9°
                trabajoCotidiano: 0.50,
                tareas: 0.10,
                pruebaEjecucion: 0,
                asistencia: 0.10,
                proyecto: 0.30
            }
        };
        
        // Escalas de evaluación MEP
        this.escalaMEP = [
            { rango: [90, 100], letra: 'A', descripcion: 'Sobresaliente' },
            { rango: [80, 89], letra: 'B', descripcion: 'Muy Bueno' },
            { rango: [65, 79], letra: 'C', descripcion: 'Bueno' },
            { rango: [50, 64], letra: 'D', descripcion: 'Regular' },
            { rango: [0, 49], letra: 'F', descripcion: 'Necesita Mejorar' }
        ];
    }

    // Calcular nota final según ciclo
    calcularNotaFinal(notas, ciclo) {
        const porcentajes = this.porcentajes[ciclo] || this.porcentajes.ciclo2;
        
        const notaFinal = 
            (notas.trabajoCotidiano * porcentajes.trabajoCotidiano) +
            (notas.tareas * porcentajes.tareas) +
            (notas.pruebaEjecucion * porcentajes.pruebaEjecucion) +
            (notas.proyecto * porcentajes.proyecto) +
            (notas.asistencia * porcentajes.asistencia);
        
        return Math.min(100, Math.max(0, Math.round(notaFinal)));
    }

    // Convertir nivel de rúbrica (1-4) a porcentaje
    nivelAPorcentaje(nivel) {
        switch(nivel) {
            case 1: return 60;  // Inicio
            case 2: return 75;  // Proceso
            case 3: return 90;  // Logrado
            case 4: return 100; // Sobresaliente
            default: return 0;
        }
    }

    // Calcular nota de trabajo cotidiano (promedio de evaluaciones)
    calcularTrabajoCotidiano(evaluaciones) {
        if (!evaluaciones || evaluaciones.length === 0) return 0;
        
        const total = evaluaciones.reduce((sum, eval) => {
            // Convertir nivel de evaluación a porcentaje
            const porcentaje = this.nivelAPorcentaje(eval.nivel || eval.promedio);
            return sum + porcentaje;
        }, 0);
        
        return total / evaluaciones.length;
    }

    // Obtener calificación según escala MEP
    obtenerCalificacion(nota) {
        const calificacion = this.escalaMEP.find(c => 
            nota >= c.rango[0] && nota <= c.rango[1]
        ) || this.escalaMEP[4];
        
        return {
            nota: nota,
            letra: calificacion.letra,
            descripcion: calificacion.descripcion,
            color: this.obtenerColorCalificacion(calificacion.letra)
        };
    }

    obtenerColorCalificacion(letra) {
        const colores = {
            'A': '#10B981', // Verde
            'B': '#3B82F6', // Azul
            'C': '#F59E0B', // Amarillo
            'D': '#EF4444', // Rojo
            'F': '#DC2626'  // Rojo oscuro
        };
        return colores[letra] || '#6B7280';
    }

    // Calcular estadísticas de grupo
    calcularEstadisticasGrupo(estudiantes, ciclo) {
        const notasFinales = estudiantes.map(e => 
            this.calcularNotaFinal(e.notas, ciclo)
        );
        
        const asistenciaPromedio = estudiantes.length > 0 ? 
            estudiantes.reduce((sum, e) => sum + (e.asistencia?.porcentaje || 0), 0) / estudiantes.length : 0;
        
        const aprobados = notasFinales.filter(n => n >= 65).length;
        const reprobados = notasFinales.filter(n => n < 65).length;
        
        return {
            totalEstudiantes: estudiantes.length,
            promedioGrupo: this.calcularPromedio(notasFinales),
            mediana: this.calcularMediana(notasFinales),
            moda: this.calcularModa(notasFinales),
            desviacionEstandar: this.calcularDesviacionEstandar(notasFinales),
            asistenciaPromedio: asistenciaPromedio,
            aprobados: aprobados,
            reprobados: reprobados,
            porcentajeAprobacion: (aprobados / estudiantes.length) * 100,
            distribucion: this.obtenerDistribucionCalificaciones(notasFinales),
            notasPorRango: this.obtenerNotasPorRango(notasFinales)
        };
    }

    // Métodos estadísticos auxiliares
    calcularPromedio(valores) {
        if (valores.length === 0) return 0;
        return valores.reduce((a, b) => a + b, 0) / valores.length;
    }

    calcularMediana(valores) {
        if (valores.length === 0) return 0;
        const sorted = [...valores].sort((a, b) => a - b);
        const middle = Math.floor(sorted.length / 2);
        
        if (sorted.length % 2 === 0) {
            return (sorted[middle - 1] + sorted[middle]) / 2;
        }
        return sorted[middle];
    }

    calcularModa(valores) {
        if (valores.length === 0) return 0;
        const frecuencia = {};
        let maxFreq = 0;
        let moda = valores[0];
        
        valores.forEach(valor => {
            frecuencia[valor] = (frecuencia[valor] || 0) + 1;
            if (frecuencia[valor] > maxFreq) {
                maxFreq = frecuencia[valor];
                moda = valor;
            }
        });
        
        return moda;
    }

    calcularDesviacionEstandar(valores) {
        if (valores.length === 0) return 0;
        const promedio = this.calcularPromedio(valores);
        const diferenciasCuadradas = valores.map(valor => 
            Math.pow(valor - promedio, 2)
        );
        const varianza = this.calcularPromedio(diferenciasCuadradas);
        return Math.sqrt(varianza);
    }

    obtenerDistribucionCalificaciones(notas) {
        return this.escalaMEP.map(nivel => ({
            letra: nivel.letra,
            descripcion: nivel.descripcion,
            cantidad: notas.filter(n => n >= nivel.rango[0] && n <= nivel.rango[1]).length,
            porcentaje: (notas.filter(n => n >= nivel.rango[0] && n <= nivel.rango[1]).length / notas.length) * 100
        }));
    }

    obtenerNotasPorRango(notas) {
        const rangos = [
            { min: 0, max: 49, label: '0-49' },
            { min: 50, max: 64, label: '50-64' },
            { min: 65, max: 79, label: '65-79' },
            { min: 80, max: 89, label: '80-89' },
            { min: 90, max: 100, label: '90-100' }
        ];
        
        return rangos.map(rango => ({
            rango: rango.label,
            cantidad: notas.filter(n => n >= rango.min && n <= rango.max).length,
            porcentaje: (notas.filter(n => n >= rango.min && n <= rango.max).length / notas.length) * 100
        }));
    }

    // Generar reporte de notas en formato MEP
    generarReporteNotas(grupo, estudiantes) {
        const estadisticas = this.calcularEstadisticasGrupo(estudiantes, grupo.ciclo);
        
        const reporte = {
            grupo: {
                nombre: grupo.nombre,
                grado: grupo.grado,
                ciclo: grupo.ciclo,
                docente: grupo.docente,
                institucion: grupo.institucion,
                periodo: grupo.periodo,
                año: grupo.año
            },
            fechaGeneracion: new Date().toISOString(),
            estadisticas: estadisticas,
            estudiantes: estudiantes.map(estudiante => {
                const notaFinal = this.calcularNotaFinal(estudiante.notas, grupo.ciclo);
                const calificacion = this.obtenerCalificacion(notaFinal);
                
                return {
                    id: estudiante.id,
                    nombre: estudiante.nombreCompleto,
                    cedula: estudiante.cedula,
                    asistencia: estudiante.asistencia,
                    notas: estudiante.notas,
                    notaFinal: notaFinal,
                    calificacion: calificacion,
                    evaluaciones: estudiante.evaluaciones?.length || 0
                };
            }),
            resumen: {
                fecha: new Date().toLocaleDateString('es-CR'),
                hora: new Date().toLocaleTimeString('es-CR'),
                generadoPor: 'TecnoPIA Sistema MEP',
                version: '1.0.0'
            }
        };
        
        return reporte;
    }

    // Exportar reporte a diferentes formatos
    exportarReporte(reporte, formato = 'json') {
        switch(formato.toLowerCase()) {
            case 'json':
                return JSON.stringify(reporte, null, 2);
                
            case 'csv':
                return this.convertirACSV(reporte);
                
            case 'html':
                return this.convertirAHTML(reporte);
                
            default:
                return JSON.stringify(reporte, null, 2);
        }
    }

    convertirACSV(reporte) {
        let csv = 'ID,Cédula,Nombre Completo,Asistencia%,TC,Tareas,PE,Proyecto,Nota Final,Calificación\n';
        
        reporte.estudiantes.forEach(est => {
            csv += `"${est.id}","${est.cedula}","${est.nombre}",` +
                   `${est.asistencia?.porcentaje || 0},${est.notas.trabajoCotidiano},` +
                   `${est.notas.tareas},${est.notas.pruebaEjecucion},` +
                   `${est.notas.proyecto},${est.notaFinal},"${est.calificacion.letra}"\n`;
        });
        
        return csv;
    }

    convertirAHTML(reporte) {
        let html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Reporte de Notas - ${reporte.grupo.nombre}</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                table { border-collapse: collapse; width: 100%; margin: 20px 0; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #f2f2f2; }
                .header { background: #4F46E5; color: white; padding: 20px; }
                .stat { background: #f8f9fa; padding: 15px; margin: 10px 0; }
                .aprobado { color: #10B981; }
                .reprobado { color: #EF4444; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>${reporte.grupo.institucion}</h1>
                <h2>${reporte.grupo.nombre} - ${reporte.grupo.grado}</h2>
                <p>Docente: ${reporte.grupo.docente} | Periodo: ${reporte.grupo.periodo} ${reporte.grupo.año}</p>
            </div>
            
            <div class="stat">
                <h3>Estadísticas del Grupo</h3>
                <p><strong>Promedio:</strong> ${reporte.estadisticas.promedioGrupo.toFixed(2)}</p>
                <p><strong>Aprobación:</strong> ${reporte.estadisticas.porcentajeAprobacion.toFixed(1)}%</p>
                <p><strong>Asistencia Promedio:</strong> ${reporte.estadisticas.asistenciaPromedio.toFixed(1)}%</p>
            </div>
            
            <table>
                <thead>
                    <tr>
                        <th>Estudiante</th>
                        <th>Asistencia</th>
                        <th>Trabajo Cotidiano</th>
                        <th>Tareas</th>
                        <th>Prueba Ejecución</th>
                        <th>Proyecto</th>
                        <th>Nota Final</th>
                        <th>Calificación</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        reporte.estudiantes.forEach(est => {
            const claseNota = est.notaFinal >= 65 ? 'aprobado' : 'reprobado';
            html += `
                <tr>
                    <td>${est.nombre}</td>
                    <td>${est.asistencia?.porcentaje || 0}%</td>
                    <td>${est.notas.trabajoCotidiano.toFixed(1)}</td>
                    <td>${est.notas.tareas.toFixed(1)}</td>
                    <td>${est.notas.pruebaEjecucion.toFixed(1)}</td>
                    <td>${est.notas.proyecto.toFixed(1)}</td>
                    <td class="${claseNota}"><strong>${est.notaFinal.toFixed(1)}</strong></td>
                    <td class="${claseNota}"><strong>${est.calificacion.letra}</strong></td>
                </tr>
            `;
        });
        
        html += `
                </tbody>
            </table>
            
            <div style="margin-top: 30px; font-size: 12px; color: #666;">
                <p>Generado el ${reporte.resumen.fecha} a las ${reporte.resumen.hora}</p>
                <p>Sistema TecnoPIA - MEP Costa Rica</p>
            </div>
        </body>
        </html>
        `;
        
        return html;
    }

    // Validar si un estudiante aprueba según criterios MEP
    validarAprobacion(notaFinal, asistenciaPorcentaje) {
        const apruebaNota = notaFinal >= 65;
        const apruebaAsistencia = asistenciaPorcentaje >= 80; // Mínimo 80% según MEP
        
        return {
            aprueba: apruebaNota && apruebaAsistencia,
            detalles: {
                notaAprobada: apruebaNota,
                asistenciaAprobada: apruebaAsistencia,
                notaMinima: 65,
                asistenciaMinima: 80
            }
        };
    }

    // Calcular nota necesaria para aprobar
    calcularNotaNecesaria(notasActuales, ciclo, asistenciaPorcentaje) {
        const porcentajes = this.porcentajes[ciclo] || this.porcentajes.ciclo2;
        const notaActual = this.calcularNotaFinal(notasActuales, ciclo);
        
        if (notaActual >= 65) {
            return { necesaria: 0, posible: true };
        }
        
        // Calcular qué nota se necesita en el componente faltante
        const puntosFaltantes = 65 - notaActual;
        
        // Asumiendo que solo falta trabajo cotidiano
        const puntosPorPorcentaje = 100 * porcentajes.trabajoCotidiano;
        const porcentajeNecesario = (puntosFaltantes / puntosPorPorcentaje) * 100;
        
        return {
            necesaria: Math.ceil(porcentajeNecesario),
            posible: porcentajeNecesario <= 100,
            notaActual: notaActual,
            puntosFaltantes: puntosFaltantes
        };
    }
}

// Inicializar calculadora global
window.CalculadoraMEP = new CalculadoraMEP();

// Funciones de utilidad para usar desde HTML
window.calcularNotaEstudiante = function(estudiante, ciclo) {
    return window.CalculadoraMEP.calcularNotaFinal(estudiante.notas, ciclo);
};

window.generarReporteGrupo = function(grupoId) {
    const gestorGrupos = window.GestorGruposMEP;
    if (!gestorGrupos) return null;
    
    const grupo = gestorGrupos.obtenerGrupoPorId(grupoId);
    if (!grupo) return null;
    
    const reporte = window.CalculadoraMEP.generarReporteNotas(
        grupo,
        grupo.estudiantes.filter(e => e.activo)
    );
    
    return reporte;
};

window.exportarNotas = function(grupoId, formato = 'json') {
    const reporte = window.generarReporteGrupo(grupoId);
    if (!reporte) return null;
    
    const data = window.CalculadoraMEP.exportarReporte(reporte, formato);
    const blob = new Blob([data], { 
        type: formato === 'csv' ? 'text/csv' : 
               formato === 'html' ? 'text/html' : 'application/json' 
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `notas-${reporte.grupo.nombre.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.${formato}`;
    a.click();
    URL.revokeObjectURL(url);
    
    return data;
};

window.verEstadisticasGrupo = function(grupoId) {
    const gestorGrupos = window.GestorGruposMEP;
    if (!gestorGrupos) return null;
    
    const grupo = gestorGrupos.obtenerGrupoPorId(grupoId);
    if (!grupo) return null;
    
    const estadisticas = window.CalculadoraMEP.calcularEstadisticasGrupo(
        grupo.estudiantes.filter(e => e.activo),
        grupo.ciclo
    );
    
    console.log('Estadísticas del grupo:', estadisticas);
    return estadisticas;
};
