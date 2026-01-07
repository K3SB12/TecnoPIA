// Sistema de Registro Cotidiano para TecnoPIA
class RegistroCotidiano {
    constructor() {
        this.registros = JSON.parse(localStorage.getItem('tecnoPIA_registros')) || [];
        this.actividadesTipo = [
            { id: 'exploracion', nombre: 'Exploración tecnológica', icono: 'fa-compass' },
            { id: 'practica', nombre: 'Práctica guiada', icono: 'fa-hands-helping' },
            { id: 'proyecto', nombre: 'Proyecto colaborativo', icono: 'fa-users' },
            { id: 'ejercicio', nombre: 'Ejercicio individual', icono: 'fa-user-edit' },
            { id: 'evaluacion', nombre: 'Evaluación formativa', icono: 'fa-clipboard-check' },
            { id: 'reflexion', nombre: 'Reflexión metacognitiva', icono: 'fa-brain' }
        ];
        this.init();
    }

    init() {
        // Crear registros demo si no existen
        if (this.registros.length === 0) {
            this.crearRegistrosDemo();
        }
    }

    crearRegistrosDemo() {
        const hoy = new Date();
        const ayer = new Date(hoy);
        ayer.setDate(ayer.getDate() - 1);
        
        this.registros = [
            {
                id: 'reg1',
                grupoId: '1',
                fecha: hoy.toISOString().split('T')[0],
                horaInicio: '08:00',
                horaFin: '09:30',
                duracion: 90,
                actividad: 'exploracion',
                descripcion: 'Exploración de hardware de computadora',
                indicadores: ['C2-AT-1'],
                recursos: ['Computadoras', 'Imágenes de hardware'],
                evidencias: ['fotos_hardware.jpg'],
                observaciones: 'Los estudiantes mostraron interés en identificar las partes',
                docente: 'Ana María Rodríguez',
                estado: 'completada'
            },
            {
                id: 'reg2',
                grupoId: '2',
                fecha: ayer.toISOString().split('T')[0],
                horaInicio: '10:00',
                horaFin: '11:30',
                duracion: 90,
                actividad: 'practica',
                descripcion: 'Práctica de programación con bloques',
                indicadores: ['C2-PA-1'],
                recursos: ['Scratch', 'Tablets'],
                evidencias: ['proyectos_scratch.sb3'],
                observaciones: 'Algunos estudiantes necesitaron apoyo adicional',
                docente: 'Ana María Rodríguez',
                estado: 'completada'
            }
        ];
        
        this.guardar();
    }

    // Crear nuevo registro
    crearRegistro(registroData) {
        const nuevoRegistro = {
            id: `reg-${Date.now()}`,
            fechaCreacion: new Date().toISOString(),
            estado: 'activo',
            ...registroData
        };

        this.registros.push(nuevoRegistro);
        this.guardar();
        return nuevoRegistro;
    }

    // Obtener registros por grupo y fecha
    obtenerRegistros(grupoId, fecha = null) {
        let filtrados = this.registros.filter(r => r.grupoId === grupoId && r.estado === 'activo');
        
        if (fecha) {
            filtrados = filtrados.filter(r => r.fecha === fecha);
        }
        
        return filtrados.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    }

    // Obtener registros del día actual
    obtenerRegistrosHoy(grupoId = null) {
        const hoy = new Date().toISOString().split('T')[0];
        let filtrados = this.registros.filter(r => r.fecha === hoy && r.estado === 'activo');
        
        if (grupoId) {
            filtrados = filtrados.filter(r => r.grupoId === grupoId);
        }
        
        return filtrados;
    }

    // Obtener estadísticas de registros
    obtenerEstadisticasRegistros(grupoId, periodo = 'mes') {
        const registrosGrupo = this.registros.filter(r => r.grupoId === grupoId && r.estado === 'activo');
        
        // Filtrar por período
        const fechaLimite = new Date();
        switch(periodo) {
            case 'semana':
                fechaLimite.setDate(fechaLimite.getDate() - 7);
                break;
            case 'mes':
                fechaLimite.setMonth(fechaLimite.getMonth() - 1);
                break;
            case 'trimestre':
                fechaLimite.setMonth(fechaLimite.getMonth() - 3);
                break;
        }
        
        const registrosPeriodo = registrosGrupo.filter(r => new Date(r.fecha) >= fechaLimite);
        
        // Calcular estadísticas
        const totalRegistros = registrosPeriodo.length;
        const totalHoras = registrosPeriodo.reduce((sum, r) => sum + (r.duracion || 0), 0) / 60;
        
        const actividadesPorTipo = {};
        this.actividadesTipo.forEach(tipo => {
            actividadesPorTipo[tipo.id] = registrosPeriodo.filter(r => r.actividad === tipo.id).length;
        });
        
        const indicadoresEvaluados = [];
        registrosPeriodo.forEach(r => {
            if (r.indicadores) {
                indicadoresEvaluados.push(...r.indicadores);
            }
        });
        
        const indicadoresUnicos = [...new Set(indicadoresEvaluados)];
        
        return {
            totalRegistros,
            totalHoras: Math.round(totalHoras * 10) / 10,
            actividadesPorTipo,
            indicadoresEvaluados: indicadoresUnicos.length,
            registrosPorDia: this.calcularRegistrosPorDia(registrosPeriodo),
            promedioDiario: totalRegistros > 0 ? totalHoras / totalRegistros : 0
        };
    }

    calcularRegistrosPorDia(registros) {
        const dias = {};
        registros.forEach(r => {
            if (!dias[r.fecha]) {
                dias[r.fecha] = { registros: 0, horas: 0 };
            }
            dias[r.fecha].registros++;
            dias[r.fecha].horas += (r.duracion || 0) / 60;
        });
        
        return Object.entries(dias).map(([fecha, datos]) => ({
            fecha,
            ...datos
        })).sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
    }

    // Generar reporte de actividades
    generarReporteActividades(grupoId, fechaInicio, fechaFin) {
        const registrosFiltrados = this.registros.filter(r => 
            r.grupoId === grupoId && 
            r.estado === 'activo' &&
            new Date(r.fecha) >= new Date(fechaInicio) &&
            new Date(r.fecha) <= new Date(fechaFin)
        );
        
        const gestorGrupos = window.GestorGruposMEP;
        const grupo = gestorGrupos?.obtenerGrupoPorId(grupoId);
        
        const gestorIndicadores = window.GestorIndicadoresPNFT;
        
        // Agrupar por indicador
        const indicadoresMap = {};
        registrosFiltrados.forEach(registro => {
            if (registro.indicadores) {
                registro.indicadores.forEach(indId => {
                    if (!indicadoresMap[indId]) {
                        indicadoresMap[indId] = {
                            indicador: gestorIndicadores?.obtenerIndicadorPorId(indId),
                            registros: [],
                            totalHoras: 0,
                            actividades: new Set()
                        };
                    }
                    
                    indicadoresMap[indId].registros.push(registro);
                    indicadoresMap[indId].totalHoras += (registro.duracion || 0) / 60;
                    indicadoresMap[indId].actividades.add(registro.actividad);
                });
            }
        });
        
        // Calcular cobertura del PNFT
        const todosIndicadores = gestorIndicadores?.obtenerIndicadoresPorGrado(grupo?.grado.replace('°', '') || '5');
        const indicadoresEvaluados = Object.keys(indicadoresMap);
        const coberturaPNFT = todosIndicadores ? 
            (indicadoresEvaluados.length / todosIndicadores.length) * 100 : 0;
        
        return {
            grupo: grupo,
            periodo: {
                inicio: fechaInicio,
                fin: fechaFin
            },
            resumen: {
                totalRegistros: registrosFiltrados.length,
                totalHoras: registrosFiltrados.reduce((sum, r) => sum + (r.duracion || 0), 0) / 60,
                diasConActividad: [...new Set(registrosFiltrados.map(r => r.fecha))].length,
                actividadesDiferentes: [...new Set(registrosFiltrados.map(r => r.actividad))].length
            },
            indicadores: Object.entries(indicadoresMap).map(([indId, datos]) => ({
                indicador: datos.indicador,
                registros: datos.registros.length,
                horas: Math.round(datos.totalHoras * 10) / 10,
                actividades: Array.from(datos.actividades),
                ultimaActividad: datos.registros.sort((a, b) => new Date(b.fecha) - new Date(a.fecha))[0]?.fecha
            })),
            coberturaPNFT: Math.round(coberturaPNFT * 10) / 10,
            recomendaciones: this.generarRecomendaciones(indicadoresMap, todosIndicadores)
        };
    }

    generarRecomendaciones(indicadoresMap, todosIndicadores) {
        const recomendaciones = [];
        
        // Identificar indicadores no trabajados
        if (todosIndicadores) {
            const indicadoresTrabajados = new Set(Object.keys(indicadoresMap));
            const indicadoresNoTrabajados = todosIndicadores.filter(
                ind => !indicadoresTrabajados.has(ind.id)
            );
            
            if (indicadoresNoTrabajados.length > 0) {
                recomendaciones.push({
                    tipo: 'prioridad',
                    mensaje: `Hay ${indicadoresNoTrabajados.length} indicadores del PNFT que no se han trabajado`,
                    detalles: indicadoresNoTrabajados.map(ind => ind.descripcion.substring(0, 50) + '...')
                });
            }
        }
        
        // Verificar distribución de actividades
        const tiposActividad = Object.values(indicadoresMap).flatMap(d => Array.from(d.actividades));
        const conteoActividades = {};
        tiposActividad.forEach(tipo => {
            conteoActividades[tipo] = (conteoActividades[tipo] || 0) + 1;
        });
        
        const actividadMayoritaria = Object.entries(conteoActividades)
            .sort((a, b) => b[1] - a[1])[0];
        
        if (actividadMayoritaria && actividadMayoritaria[1] > tiposActividad.length * 0.5) {
            recomendaciones.push({
                tipo: 'variedad',
                mensaje: 'Se observa predominancia de un solo tipo de actividad',
                sugerencia: 'Considere diversificar las estrategias didácticas'
            });
        }
        
        return recomendaciones;
    }

    // Quick registration for daily use
    registroRapido(grupoId, actividad, indicadores, observaciones = '') {
        const registro = this.crearRegistro({
            grupoId,
            fecha: new Date().toISOString().split('T')[0],
            horaInicio: new Date().toLocaleTimeString('es-CR', { hour: '2-digit', minute: '2-digit' }),
            duracion: 40, // Duración por defecto de una lección
            actividad,
            descripcion: this.actividadesTipo.find(a => a.id === actividad)?.nombre || actividad,
            indicadores: Array.isArray(indicadores) ? indicadores : [indicadores],
            observaciones,
            docente: 'Docente actual', // Se debería obtener del localStorage
            estado: 'completada'
        });
        
        return registro;
    }

    // Save to localStorage
    guardar() {
        localStorage.setItem('tecnoPIA_registros', JSON.stringify(this.registros));
    }
}

// Initialize global instance
window.RegistroCotidiano = new RegistroCotidiano();

// Utility functions for HTML
window.registrarActividadDiaria = function(grupoId, actividad, indicadores) {
    const registro = window.RegistroCotidiano.registroRapido(grupoId, actividad, indicadores);
    console.log('Actividad registrada:', registro);
    return registro;
};

window.verRegistrosGrupo = function(grupoId) {
    const registros = window.RegistroCotidiano.obtenerRegistros(grupoId);
    console.table(registros.map(r => ({
        Fecha: r.fecha,
        Actividad: r.descripcion,
        Duración: r.duracion + ' min',
        Indicadores: r.indicadores?.length || 0
    })));
    return registros;
};

window.generarReportePeriodo = function(grupoId, fechaInicio, fechaFin) {
    const reporte = window.RegistroCotidiano.generarReporteActividades(grupoId, fechaInicio, fechaFin);
    console.log('Reporte generado:', reporte);
    return reporte;
};
