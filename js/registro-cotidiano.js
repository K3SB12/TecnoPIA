// js/registro-cotidiano.js
class RegistroCotidiano {
    constructor() {
        this.actividades = [];
        this.observaciones = {};
        this.cargarDatos();
    }
    
    cargarDatos() {
        try {
            const actividadesGuardadas = localStorage.getItem('tecnoPIA_actividades');
            if (actividadesGuardadas) {
                this.actividades = JSON.parse(actividadesGuardadas);
            }
            
            const observacionesGuardadas = localStorage.getItem('tecnoPIA_observaciones');
            if (observacionesGuardadas) {
                this.observaciones = JSON.parse(observacionesGuardadas);
            }
        } catch (error) {
            console.error('Error cargando datos del registro cotidiano:', error);
        }
    }
    
    guardarDatos() {
        try {
            localStorage.setItem('tecnoPIA_actividades', JSON.stringify(this.actividades));
            localStorage.setItem('tecnoPIA_observaciones', JSON.stringify(this.observaciones));
        } catch (error) {
            console.error('Error guardando datos del registro cotidiano:', error);
        }
    }
    
    registrarActividad(actividad) {
        const actividadCompleta = {
            id: Date.now(),
            fecha: new Date().toISOString(),
            fechaLegible: new Date().toLocaleDateString('es-CR'),
            ...actividad
        };
        
        this.actividades.unshift(actividadCompleta); // Agregar al inicio
        this.guardarDatos();
        
        // Limitar a 1000 actividades para evitar problemas de almacenamiento
        if (this.actividades.length > 1000) {
            this.actividades = this.actividades.slice(0, 1000);
            this.guardarDatos();
        }
        
        return actividadCompleta;
    }
    
    registrarObservacion(grupoId, estudianteId, observacion) {
        const key = `${grupoId}_${estudianteId}`;
        
        if (!this.observaciones[key]) {
            this.observaciones[key] = [];
        }
        
        const observacionCompleta = {
            id: Date.now(),
            fecha: new Date().toISOString(),
            fechaLegible: new Date().toLocaleDateString('es-CR'),
            ...observacion
        };
        
        this.observaciones[key].unshift(observacionCompleta);
        this.guardarDatos();
        
        return observacionCompleta;
    }
    
    obtenerActividadesRecientes(limite = 50) {
        return this.actividades.slice(0, limite);
    }
    
    obtenerActividadesPorFecha(fecha) {
        const fechaBusqueda = new Date(fecha).toDateString();
        return this.actividades.filter(actividad => {
            const actividadFecha = new Date(actividad.fecha).toDateString();
            return actividadFecha === fechaBusqueda;
        });
    }
    
    obtenerActividadesPorGrupo(grupoId) {
        return this.actividades.filter(actividad => actividad.grupoId === grupoId);
    }
    
    obtenerObservacionesEstudiante(grupoId, estudianteId) {
        const key = `${grupoId}_${estudianteId}`;
        return this.observaciones[key] || [];
    }
    
    obtenerEstadisticasDiarias() {
        const hoy = new Date().toDateString();
        const actividadesHoy = this.actividades.filter(actividad => {
            const actividadFecha = new Date(actividad.fecha).toDateString();
            return actividadFecha === hoy;
        });
        
        return {
            total: actividadesHoy.length,
            evaluaciones: actividadesHoy.filter(a => a.tipo === 'evaluacion').length,
            observaciones: actividadesHoy.filter(a => a.tipo === 'observacion').length,
            asistencias: actividadesHoy.filter(a => a.tipo === 'asistencia').length,
            otras: actividadesHoy.filter(a => !['evaluacion', 'observacion', 'asistencia'].includes(a.tipo)).length
        };
    }
    
    generarReporteDiario() {
        const actividadesHoy = this.obtenerActividadesPorFecha(new Date().toISOString());
        const estadisticas = this.obtenerEstadisticasDiarias();
        
        let reporte = `REPORTE DIARIO - ${new Date().toLocaleDateString('es-CR')}\n\n`;
        reporte += `Total actividades: ${estadisticas.total}\n`;
        reporte += `Evaluaciones: ${estadisticas.evaluaciones}\n`;
        reporte += `Observaciones: ${estadisticas.observaciones}\n`;
        reporte += `Asistencias: ${estadisticas.asistencias}\n`;
        reporte += `Otras: ${estadisticas.otras}\n\n`;
        
        if (actividadesHoy.length > 0) {
            reporte += 'Actividades realizadas:\n';
            reporte += '----------------------\n';
            
            actividadesHoy.forEach(actividad => {
                reporte += `• ${actividad.fechaLegible} - ${actividad.tipo.toUpperCase()}\n`;
                if (actividad.descripcion) {
                    reporte += `  ${actividad.descripcion}\n`;
                }
                if (actividad.grupo) {
                    reporte += `  Grupo: ${actividad.grupo}\n`;
                }
                if (actividad.estudiante) {
                    reporte += `  Estudiante: ${actividad.estudiante}\n`;
                }
                reporte += '\n';
            });
        } else {
            reporte += 'No se registraron actividades hoy.\n';
        }
        
        return reporte;
    }
    
    exportarDatos(formato = 'json') {
        const datos = {
            actividades: this.actividades,
            observaciones: this.observaciones,
            fechaExportacion: new Date().toISOString(),
            totalActividades: this.actividades.length,
            totalObservaciones: Object.keys(this.observaciones).length
        };
        
        switch(formato) {
            case 'json':
                return JSON.stringify(datos, null, 2);
                
            case 'csv':
                let csv = 'Fecha,Tipo,Descripcion,Grupo,Estudiante,Detalles\n';
                
                this.actividades.forEach(actividad => {
                    const fecha = new Date(actividad.fecha).toLocaleDateString('es-CR');
                    const tipo = actividad.tipo || '';
                    const descripcion = actividad.descripcion || '';
                    const grupo = actividad.grupo || '';
                    const estudiante = actividad.estudiante || '';
                    const detalles = actividad.detalles ? JSON.stringify(actividad.detalles) : '';
                    
                    csv += `"${fecha}","${tipo}","${descripcion}","${grupo}","${estudiante}","${detalles}"\n`;
                });
                
                return csv;
                
            default:
                return JSON.stringify(datos, null, 2);
        }
    }
}

// Funciones de utilidad para el registro cotidiano
function inicializarRegistroCotidiano() {
    window.registroCotidiano = new RegistroCotidiano();
    
    // Ejemplo de actividades automáticas que se pueden registrar
    registrarActividadAutomatica('sistema_iniciado', {
        tipo: 'sistema',
        descripcion: 'Sistema TecnoPIA iniciado',
        detalles: { usuario: 'docente', hora: new Date().toLocaleTimeString() }
    });
}

function registrarActividadAutomatica(tipo, datos) {
    if (!window.registroCotidiano) return;
    
    const actividadesAutomaticas = {
        sistema_iniciado: {
            tipo: 'sistema',
            descripcion: 'Sistema TecnoPIA iniciado',
            detalles: datos
        },
        evaluacion_registrada: {
            tipo: 'evaluacion',
            descripcion: 'Evaluación registrada',
            grupo: datos.grupo,
            estudiante: datos.estudiante,
            detalles: datos
        },
        grupo_creado: {
            tipo: 'gestion',
            descripcion: 'Nuevo grupo creado',
            grupo: datos.nombre,
            detalles: datos
        },
        estudiante_agregado: {
            tipo: 'gestion',
            descripcion: 'Estudiante agregado a grupo',
            grupo: datos.grupo,
            estudiante: `${datos.nombre} ${datos.apellidos}`,
            detalles: datos
        },
        observacion_registrada: {
            tipo: 'observacion',
            descripcion: 'Observación registrada',
            grupo: datos.grupo,
            estudiante: datos.estudiante,
            detalles: datos
        },
        asistencia_registrada: {
            tipo: 'asistencia',
            descripcion: 'Asistencia registrada',
            grupo: datos.grupo,
            detalles: datos
        }
    };
    
    if (actividadesAutomaticas[tipo]) {
        window.registroCotidiano.registrarActividad(actividadesAutomaticas[tipo]);
    }
}

function registrarObservacionEstudiante(grupoId, estudianteId, tipo, contenido, contexto = {}) {
    if (!window.registroCotidiano) return null;
    
    const observacion = {
        tipo: tipo,
        contenido: contenido,
        contexto: contexto,
        grupoId: grupoId,
        estudianteId: estudianteId
    };
    
    return window.registroCotidiano.registrarObservacion(grupoId, estudianteId, observacion);
}

function obtenerRegistroDiario() {
    if (!window.registroCotidiano) return [];
    return window.registroCotidiano.obtenerActividadesRecientes(20);
}

function generarReporteDiarioCompleto() {
    if (!window.registroCotidiano) return 'Sistema de registro no inicializado';
    return window.registroCotidiano.generarReporteDiario();
}

function exportarRegistroCompleto(formato = 'json') {
    if (!window.registroCotidiano) return null;
    return window.registroCotidiano.exportarDatos(formato);
}

// Inicializar al cargar la página
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(inicializarRegistroCotidiano, 1000);
});
