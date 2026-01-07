// Gestor de Indicadores PNFT para TecnoPIA
class GestorIndicadoresPNFT {
    constructor() {
        this.indicadores = this.cargarIndicadoresBase();
        this.evaluaciones = JSON.parse(localStorage.getItem('tecnoPIA_evaluaciones')) || [];
        this.rubricas = this.cargarRubricasBase();
        this.init();
    }

    init() {
        // Inicializar con datos demo si no hay evaluaciones
        if (this.evaluaciones.length === 0) {
            this.crearEvaluacionesDemo();
        }
    }

    cargarIndicadoresBase() {
        // Base completa de indicadores PNFT por grado y área
        return {
            areas: [
                {
                    id: "area1",
                    nombre: "Apropiación tecnológica y Digital",
                    descripcion: "Desarrollo de habilidades para el uso efectivo y responsable de la tecnología digital",
                    color: "#4F46E5",
                    icono: "fa-laptop"
                },
                {
                    id: "area2", 
                    nombre: "Programación y Algoritmos",
                    descripcion: "Pensamiento computacional y creación de soluciones mediante programación",
                    color: "#10B981",
                    icono: "fa-code"
                },
                {
                    id: "area3",
                    nombre: "Computación física y Robótica",
                    descripcion: "Interacción entre software y hardware para crear sistemas inteligentes",
                    color: "#F59E0B",
                    icono: "fa-robot"
                },
                {
                    id: "area4",
                    nombre: "Ciencia de datos e Inteligencia artificial",
                    descripcion: "Análisis de datos y creación de sistemas inteligentes",
                    color: "#8B5CF6",
                    icono: "fa-brain"
                }
            ],
            
            // Indicadores por ciclo y grado
            ciclos: {
                ciclo1: {
                    nombre: "Primer Ciclo (Materno - 3°)",
                    grados: ["Materno", "Transición", "1°", "2°", "3°"],
                    indicadores: [
                        {
                            id: "C1-AT-1",
                            area: "area1",
                            grado: "Materno",
                            modulo: 1,
                            descripcion: "Explora dispositivos tecnológicos con supervisión",
                            saberes: ["Reconoce partes de la computadora", "Usa mouse/touchpad básico"],
                            nivel: "Inicial"
                        },
                        {
                            id: "C1-AT-2",
                            area: "area1", 
                            grado: "Transición",
                            modulo: 1,
                            descripcion: "Identifica componentes básicos de hardware",
                            saberes: ["Nombra partes de la computadora", "Diferencia entrada/salida"],
                            nivel: "Inicial"
                        },
                        {
                            id: "C1-PA-1",
                            area: "area2",
                            grado: "1°",
                            modulo: 1,
                            descripcion: "Sigue instrucciones secuenciales simples",
                            saberes: ["Ejecuta pasos en orden", "Reconoce secuencias"],
                            nivel: "Básico"
                        }
                    ]
                },
                ciclo2: {
                    nombre: "Segundo Ciclo (4° - 6°)",
                    grados: ["4°", "5°", "6°"],
                    indicadores: [
                        {
                            id: "C2-AT-1",
                            area: "area1",
                            grado: "4°",
                            modulo: 1,
                            descripcion: "Utiliza software educativo para crear contenido digital",
                            saberes: ["Crea presentaciones simples", "Usa procesador de texto básico"],
                            nivel: "Intermedio"
                        },
                        {
                            id: "C2-PA-1",
                            area: "area2",
                            grado: "5°",
                            modulo: 1,
                            descripcion: "Crea algoritmos simples para resolver problemas",
                            saberes: ["Diseña flujogramas básicos", "Usa bloques de programación"],
                            nivel: "Intermedio"
                        },
                        {
                            id: "C2-CR-1",
                            area: "area3",
                            grado: "6°",
                            modulo: 1,
                            descripcion: "Programa robots para realizar tareas simples",
                            saberes: ["Ensambla componentes básicos", "Programa movimientos simples"],
                            nivel: "Intermedio"
                        }
                    ]
                },
                ciclo3: {
                    nombre: "Tercer Ciclo (7° - 9°)",
                    grados: ["7°", "8°", "9°"],
                    indicadores: [
                        {
                            id: "C3-AT-1",
                            area: "area1",
                            grado: "7°",
                            modulo: 1,
                            descripcion: "Desarrolla proyectos colaborativos usando herramientas digitales",
                            saberes: ["Usa suites colaborativas", "Gestiona proyectos en línea"],
                            nivel: "Avanzado"
                        },
                        {
                            id: "C3-PA-1",
                            area: "area2",
                            grado: "8°",
                            modulo: 1,
                            descripcion: "Desarrolla aplicaciones simples con lenguaje de programación",
                            saberes: ["Usa variables y condicionales", "Depura errores básicos"],
                            nivel: "Avanzado"
                        },
                        {
                            id: "C3-CDI-1",
                            area: "area4",
                            grado: "9°",
                            modulo: 1,
                            descripcion: "Analiza conjuntos de datos simples y genera visualizaciones",
                            saberes: ["Organiza datos en tablas", "Crea gráficos básicos"],
                            nivel: "Avanzado"
                        }
                    ]
                }
            }
        };
    }

    cargarRubricasBase() {
        return {
            niveles: [
                {
                    id: 1,
                    nombre: "Inicio",
                    descripcion: "Requiere ayuda constante, comete errores frecuentes",
                    color: "#EF4444",
                    porcentaje: 0.6,
                    puntaje: 1
                },
                {
                    id: 2,
                    nombre: "Proceso",
                    descripcion: "Realiza con cierta autonomía, necesita apoyo ocasional",
                    color: "#F59E0B",
                    porcentaje: 0.75,
                    puntaje: 2
                },
                {
                    id: 3,
                    nombre: "Logrado",
                    descripcion: "Realiza de forma autónoma y correcta",
                    color: "#10B981",
                    porcentaje: 0.9,
                    puntaje: 3
                },
                {
                    id: 4,
                    nombre: "Sobresaliente",
                    descripcion: "Supera expectativas, aplica creativamente",
                    color: "#3B82F6",
                    porcentaje: 1.0,
                    puntaje: 4
                }
            ],
            
            // Descriptores específicos por tipo de indicador
            descriptores: {
                "habilidad": {
                    1: "Realiza la acción con ayuda constante y supervisión",
                    2: "Realiza la acción con apoyo ocasional",
                    3: "Realiza la acción de forma autónoma y correcta",
                    4: "Realiza la acción con maestría y la aplica en nuevos contextos"
                },
                "conocimiento": {
                    1: "Identifica conceptos básicos con ayuda",
                    2: "Explica conceptos con cierto detalle",
                    3: "Aplica conceptos en situaciones conocidas",
                    4: "Relaciona conceptos y transfiere a nuevas situaciones"
                },
                "producto": {
                    1: "Producto incompleto o con errores graves",
                    2: "Producto básico que cumple requisitos mínimos",
                    3: "Producto completo que cumple todos los requisitos",
                    4: "Producto excepcional con elementos creativos"
                }
            }
        };
    }

    crearEvaluacionesDemo() {
        const evaluacionesDemo = [
            {
                id: "eval1",
                grupoId: "1",
                grupoNombre: "5°A Tecnología",
                indicadorId: "C2-PA-1",
                tipo: "Trabajo Cotidiano",
                fecha: "2024-03-15",
                periodo: 1,
                estado: "pendiente",
                resultados: [],
                criterios: this.generarCriteriosParaIndicador("C2-PA-1")
            },
            {
                id: "eval2",
                grupoId: "2",
                grupoNombre: "6°B Robótica",
                indicadorId: "C2-CR-1",
                tipo: "Prueba Ejecución",
                fecha: "2024-03-18",
                periodo: 1,
                estado: "pendiente",
                resultados: [],
                criterios: this.generarCriteriosParaIndicador("C2-CR-1")
            }
        ];

        this.evaluaciones = evaluacionesDemo;
        this.guardar();
    }

    generarCriteriosParaIndicador(indicadorId) {
        const indicador = this.obtenerIndicadorPorId(indicadorId);
        if (!indicador) return [];

        return [
            {
                id: 1,
                descripcion: "Comprensión del concepto",
                tipo: "conocimiento",
                niveles: this.rubricas.niveles.map(n => ({
                    nivel: n.id,
                    descripcion: this.rubricas.descriptores.conocimiento[n.id]
                }))
            },
            {
                id: 2,
                descripcion: "Aplicación práctica",
                tipo: "habilidad",
                niveles: this.rubricas.niveles.map(n => ({
                    nivel: n.id,
                    descripcion: this.rubricas.descriptores.habilidad[n.id]
                }))
            },
            {
                id: 3,
                descripcion: "Calidad del producto",
                tipo: "producto",
                niveles: this.rubricas.niveles.map(n => ({
                    nivel: n.id,
                    descripcion: this.rubricas.descriptores.producto[n.id]
                }))
            }
        ];
    }

    // Métodos de consulta
    obtenerAreas() {
        return this.indicadores.areas;
    }

    obtenerCiclos() {
        return this.indicadores.ciclos;
    }

    obtenerIndicadoresPorGrado(grado) {
        const indicadores = [];
        
        for (const cicloKey in this.indicadores.ciclos) {
            const ciclo = this.indicadores.ciclos[cicloKey];
            if (ciclo.grados.includes(grado)) {
                indicadores.push(...ciclo.indicadores.filter(i => i.grado === grado));
            }
        }
        
        return indicadores;
    }

    obtenerIndicadoresPorArea(areaId) {
        const indicadores = [];
        
        for (const cicloKey in this.indicadores.ciclos) {
            const ciclo = this.indicadores.ciclos[cicloKey];
            indicadores.push(...ciclo.indicadores.filter(i => i.area === areaId));
        }
        
        return indicadores;
    }

    obtenerIndicadorPorId(id) {
        for (const cicloKey in this.indicadores.ciclos) {
            const ciclo = this.indicadores.ciclos[cicloKey];
            const indicador = ciclo.indicadores.find(i => i.id === id);
            if (indicador) return indicador;
        }
        return null;
    }

    // Gestión de evaluaciones
    crearEvaluacion(evaluacionData) {
        const nuevaEvaluacion = {
            id: `eval-${Date.now()}`,
            fechaCreacion: new Date().toISOString(),
            estado: "pendiente",
            resultados: [],
            ...evaluacionData
        };

        this.evaluaciones.push(nuevaEvaluacion);
        this.guardar();
        return nuevaEvaluacion;
    }

    obtenerEvaluacionesPendientes() {
        return this.evaluaciones.filter(e => e.estado === "pendiente");
    }

    obtenerEvaluacionesPorGrupo(grupoId) {
        return this.evaluaciones.filter(e => e.grupoId === grupoId);
    }

    registrarResultado(evaluacionId, estudianteId, resultados) {
        const evaluacion = this.evaluaciones.find(e => e.id === evaluacionId);
        if (evaluacion) {
            // Eliminar resultado existente si hay
            evaluacion.resultados = evaluacion.resultados.filter(r => r.estudianteId !== estudianteId);
            
            // Calcular puntaje promedio
            const puntajes = Object.values(resultados);
            const promedio = puntajes.reduce((a, b) => a + b, 0) / puntajes.length;
            
            // Determinar nivel según promedio
            let nivel = 1;
            if (promedio >= 3.5) nivel = 4;
            else if (promedio >= 2.5) nivel = 3;
            else if (promedio >= 1.5) nivel = 2;
            
            evaluacion.resultados.push({
                estudianteId,
                fechaEvaluacion: new Date().toISOString(),
                resultados,
                promedio,
                nivel,
                observaciones: ""
            });
            
            this.guardar();
            return true;
        }
        return false;
    }

    completarEvaluacion(evaluacionId) {
        const evaluacion = this.evaluaciones.find(e => e.id === evaluacionId);
        if (evaluacion) {
            evaluacion.estado = "completada";
            evaluacion.fechaCompletacion = new Date().toISOString();
            this.guardar();
            
            // Actualizar notas de estudiantes
            this.actualizarNotasEstudiantes(evaluacion);
            return true;
        }
        return false;
    }

    actualizarNotasEstudiantes(evaluacion) {
        // Obtener el gestor de grupos
        const gestorGrupos = window.GestorGruposMEP;
        if (!gestorGrupos) return;

        const grupo = gestorGrupos.obtenerGrupoPorId(evaluacion.grupoId);
        if (!grupo) return;

        // Calcular porcentaje según tipo de evaluación y ciclo
        let porcentaje = 0;
        switch(evaluacion.tipo) {
            case "Trabajo Cotidiano":
                porcentaje = grupo.ciclo === "ciclo1" ? 65 :
                            grupo.ciclo === "ciclo2" ? 60 : 50;
                break;
            case "Tareas":
                porcentaje = 10; // Igual para todos los ciclos
                break;
            case "Prueba Ejecución":
                porcentaje = grupo.ciclo === "ciclo1" ? 15 :
                            grupo.ciclo === "ciclo2" ? 20 : 0;
                break;
            case "Proyecto Tecnológico":
                porcentaje = grupo.ciclo === "ciclo3" ? 30 : 0;
                break;
        }

        // Actualizar notas de cada estudiante
        evaluacion.resultados.forEach(resultado => {
            const estudiante = grupo.estudiantes.find(e => e.id === resultado.estudianteId);
            if (estudiante) {
                // Convertir nivel a nota (1-4 → 0-100)
                const nota = (resultado.nivel / 4) * 100;
                
                // Actualizar según tipo de evaluación
                switch(evaluacion.tipo) {
                    case "Trabajo Cotidiano":
                        estudiante.notas.trabajoCotidiano = nota;
                        break;
                    case "Tareas":
                        estudiante.notas.tareas = nota;
                        break;
                    case "Prueba Ejecución":
                        estudiante.notas.pruebaEjecucion = nota;
                        break;
                    case "Proyecto Tecnológico":
                        estudiante.notas.proyecto = nota;
                        break;
                }

                // Calcular nota final
                estudiante.notas.notaFinal = this.calcularNotaFinal(estudiante.notas, grupo.ciclo);
            }
        });

        gestorGrupos.guardar();
    }

    calcularNotaFinal(notas, ciclo) {
        let ponderaciones = {};
        
        switch(ciclo) {
            case "ciclo1":
                ponderaciones = {
                    trabajoCotidiano: 0.65,
                    tareas: 0.10,
                    pruebaEjecucion: 0.15,
                    asistencia: 0.10,
                    proyecto: 0
                };
                break;
            case "ciclo2":
                ponderaciones = {
                    trabajoCotidiano: 0.60,
                    tareas: 0.10,
                    pruebaEjecucion: 0.20,
                    asistencia: 0.10,
                    proyecto: 0
                };
                break;
            case "ciclo3":
                ponderaciones = {
                    trabajoCotidiano: 0.50,
                    tareas: 0.10,
                    pruebaEjecucion: 0,
                    asistencia: 0.10,
                    proyecto: 0.30
                };
                break;
        }

        const notaFinal = 
            (notas.trabajoCotidiano * ponderaciones.trabajoCotidiano) +
            (notas.tareas * ponderaciones.tareas) +
            (notas.pruebaEjecucion * ponderaciones.pruebaEjecucion) +
            (notas.proyecto * ponderaciones.proyecto) +
            (notas.asistencia * ponderaciones.asistencia);

        return Math.min(100, Math.max(0, Math.round(notaFinal)));
    }

    // Generación de reportes
    generarReporteEvaluacion(evaluacionId) {
        const evaluacion = this.evaluaciones.find(e => e.id === evaluacionId);
        if (!evaluacion) return null;

        const indicador = this.obtenerIndicadorPorId(evaluacion.indicadorId);
        const area = this.indicadores.areas.find(a => a.id === indicador?.area);

        return {
            evaluacion,
            indicador,
            area,
            estadisticas: this.calcularEstadisticasEvaluacion(evaluacion),
            resultados: evaluacion.resultados
        };
    }

    calcularEstadisticasEvaluacion(evaluacion) {
        if (evaluacion.resultados.length === 0) {
            return { promedio: 0, distribucion: { 1: 0, 2: 0, 3: 0, 4: 0 } };
        }

        const promedios = evaluacion.resultados.map(r => r.promedio);
        const promedioTotal = promedios.reduce((a, b) => a + b, 0) / promedios.length;

        const distribucion = { 1: 0, 2: 0, 3: 0, 4: 0 };
        evaluacion.resultados.forEach(r => {
            distribucion[r.nivel]++;
        });

        return {
            promedio: promedioTotal,
            distribucion,
            totalEstudiantes: evaluacion.resultados.length
        };
    }

    // Exportación
    exportarEvaluaciones() {
        const data = {
            evaluaciones: this.evaluaciones,
            fechaExportacion: new Date().toISOString(),
            version: "1.0.0"
        };
        return JSON.stringify(data, null, 2);
    }

    // Guardar en localStorage
    guardar() {
        localStorage.setItem('tecnoPIA_evaluaciones', JSON.stringify(this.evaluaciones));
        
        // Actualizar dashboard
        this.actualizarDashboard();
    }

    actualizarDashboard() {
        const pendientes = this.obtenerEvaluacionesPendientes();
        const totalEvaluaciones = this.evaluaciones.length;
        
        const dashboardEvaluations = pendientes.map(e => ({
            id: e.id,
            type: e.tipo,
            group: e.grupoNombre,
            date: new Date(e.fecha).toLocaleDateString('es-CR'),
            completed: false
        }));
        
        localStorage.setItem('pendingEvaluations', JSON.stringify(dashboardEvaluations));
        
        // Actualizar estadísticas generales
        const stats = JSON.parse(localStorage.getItem('dashboardStats')) || {};
        stats.evaluations = `${totalEvaluaciones - pendientes.length}/${totalEvaluaciones}`;
        localStorage.setItem('dashboardStats', JSON.stringify(stats));
    }
}

// Inicializar gestor global
window.GestorIndicadoresPNFT = new GestorIndicadoresPNFT();

// Funciones de utilidad
window.obtenerIndicadores = function(grado) {
    return window.GestorIndicadoresPNFT.obtenerIndicadoresPorGrado(grado);
};

window.crearNuevaEvaluacion = function(grupoId, indicadorId, tipo) {
    const gestor = window.GestorIndicadoresPNFT;
    const gestorGrupos = window.GestorGruposMEP;
    
    const grupo = gestorGrupos.obtenerGrupoPorId(grupoId);
    if (!grupo) {
        alert("Grupo no encontrado");
        return null;
    }

    const evaluacion = gestor.crearEvaluacion({
        grupoId,
        grupoNombre: grupo.nombre,
        indicadorId,
        tipo,
        fecha: new Date().toISOString().split('T')[0],
        periodo: 1
    });

    alert(`Evaluación creada para ${grupo.nombre}`);
    return evaluacion;
};

window.generarReporte = function(evaluacionId) {
    const reporte = window.GestorIndicadoresPNFT.generarReporteEvaluacion(evaluacionId);
    if (reporte) {
        console.log("Reporte generado:", reporte);
        return reporte;
    }
    alert("Evaluación no encontrada");
    return null;
};
