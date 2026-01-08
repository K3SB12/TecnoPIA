class GestorIndicadoresPNFT {
    constructor() {
        this.indicadores = this.cargarIndicadoresBase();
        this.evaluaciones = JSON.parse(localStorage.getItem('tecnoPIA_evaluaciones')) || [];
        this.rubricas = this.cargarRubricasBase();
        this.init();
    }

    init() { if (this.evaluaciones.length === 0) this.crearEvaluacionesDemo(); }

    cargarIndicadoresBase() {
        return {
            areas: [
                { id: "area1", nombre: "Apropiación tecnológica y Digital", color: "#4F46E5", icono: "fa-laptop" },
                { id: "area2", nombre: "Programación y Algoritmos", color: "#10B981", icono: "fa-code" },
                { id: "area3", nombre: "Computación física y Robótica", color: "#F59E0B", icono: "fa-robot" },
                { id: "area4", nombre: "Ciencia de datos e Inteligencia artificial", color: "#8B5CF6", icono: "fa-brain" }
            ],
            ciclos: {
                ciclo1: {
                    nombre: "Primer Ciclo (Materno - 3°)",
                    grados: ["Materno", "Transición", "1°", "2°", "3°"],
                    indicadores: [
                        { id: "C1-AT-1", area: "area1", grado: "Materno", modulo: 1, descripcion: "Explora dispositivos tecnológicos con supervisión", saberes: ["Reconoce partes"], nivel: "Inicial" },
                        { id: "C1-PA-1", area: "area2", grado: "1°", modulo: 1, descripcion: "Sigue instrucciones secuenciales simples", saberes: ["Ejecuta pasos"], nivel: "Básico" }
                    ]
                },
                ciclo2: {
                    nombre: "Segundo Ciclo (4° - 6°)",
                    grados: ["4°", "5°", "6°"],
                    indicadores: [
                        { id: "C2-AT-1", area: "area1", grado: "4°", modulo: 1, descripcion: "Utiliza software educativo", saberes: ["Crea presentaciones"], nivel: "Intermedio" },
                        { id: "C2-PA-1", area: "area2", grado: "5°", modulo: 1, descripcion: "Crea algoritmos simples", saberes: ["Diseña flujogramas"], nivel: "Intermedio" }
                    ]
                },
                ciclo3: {
                    nombre: "Tercer Ciclo (7° - 9°)",
                    grados: ["7°", "8°", "9°"],
                    indicadores: [
                        { id: "C3-AT-1", area: "area1", grado: "7°", modulo: 1, descripcion: "Desarrolla proyectos colaborativos", saberes: ["Usa suites"], nivel: "Avanzado" },
                        { id: "C3-CDI-1", area: "area4", grado: "9°", modulo: 1, descripcion: "Analiza conjuntos de datos", saberes: ["Organiza datos"], nivel: "Avanzado" }
                    ]
                }
            }
        };
    }

    cargarRubricasBase() {
        return {
            niveles: [
                { id: 1, nombre: "Inicio", descripcion: "Requiere ayuda constante", color: "#EF4444", porcentaje: 0.6, puntaje: 1 },
                { id: 2, nombre: "Proceso", descripcion: "Realiza con cierta autonomía", color: "#F59E0B", porcentaje: 0.75, puntaje: 2 },
                { id: 3, nombre: "Logrado", descripcion: "Realiza de forma autónoma", color: "#10B981", porcentaje: 0.9, puntaje: 3 },
                { id: 4, nombre: "Sobresaliente", descripcion: "Supera expectativas", color: "#3B82F6", porcentaje: 1.0, puntaje: 4 }
            ]
        };
    }

    crearEvaluacionesDemo() {
        this.evaluaciones = [
            { id: "eval1", grupoId: "1", indicadorId: "C2-PA-1", tipo: "Trabajo Cotidiano", fecha: "2024-03-15", estado: "pendiente", resultados: [] },
            { id: "eval2", grupoId: "2", indicadorId: "C2-AT-1", tipo: "Prueba Ejecución", fecha: "2024-03-18", estado: "pendiente", resultados: [] }
        ];
        this.guardar();
    }

    obtenerAreas() { return this.indicadores.areas; }
    obtenerCiclos() { return this.indicadores.ciclos; }

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

    obtenerIndicadorPorId(id) {
        for (const cicloKey in this.indicadores.ciclos) {
            const ciclo = this.indicadores.ciclos[cicloKey];
            const indicador = ciclo.indicadores.find(i => i.id === id);
            if (indicador) return indicador;
        }
        return null;
    }

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

    guardar() {
        localStorage.setItem('tecnoPIA_evaluaciones', JSON.stringify(this.evaluaciones));
        const pendientes = this.obtenerEvaluacionesPendientes();
        const dashboardEvaluations = pendientes.map(e => ({
            id: e.id, type: e.tipo, group: e.grupoNombre, date: new Date(e.fecha).toLocaleDateString('es-CR'), completed: false
        }));
        localStorage.setItem('pendingEvaluations', JSON.stringify(dashboardEvaluations));
        const stats = JSON.parse(localStorage.getItem('dashboardStats')) || {};
        stats.evaluations = `${this.evaluaciones.length - pendientes.length}/${this.evaluaciones.length}`;
        localStorage.setItem('dashboardStats', JSON.stringify(stats));
    }
}
window.GestorIndicadoresPNFT = new GestorIndicadoresPNFT();
