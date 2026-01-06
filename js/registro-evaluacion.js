class RegistroEvaluacionTecnologia {
    constructor() {
        this.registros = this.cargarRegistros();
        this.estudiantes = [];
    }
    
    // Registrar trabajo cotidiano (el 50-65%)
    registrarTrabajoCotidiano(estudianteId, fecha, criterios) {
        const registro = {
            id: `TC-${Date.now()}`,
            tipo: 'trabajo_cotidiano',
            estudianteId,
            fecha,
            criterios,
            puntuacion: this.calcularPuntuacionTC(criterios),
            evidencias: criterios.filter(c => c.evidencia).map(c => c.evidencia)
        };
        
        this.registros.push(registro);
        this.guardarRegistros();
        return registro;
    }
    
    // Registrar tarea (10% en todos los ciclos)
    registrarTarea(estudianteId, tareaId, puntuacion) {
        const registro = {
            id: `TA-${Date.now()}`,
            tipo: 'tarea',
            estudianteId,
            tareaId,
            fechaEntrega: new Date().toISOString(),
            puntuacion,
            porcentaje: 10 // Siempre 10% en todos los ciclos
        };
        
        this.registros.push(registro);
        this.guardarRegistros();
        return registro;
    }
    
    // Registrar proyecto tecnológico (30% en III Ciclo)
    registrarProyectoTecnologico(estudianteId, proyecto, rúbrica) {
        const puntuacion = this.evaluarConRubrica(proyecto, rúbrica);
        
        const registro = {
            id: `PT-${Date.now()}`,
            tipo: 'proyecto_tecnologico',
            estudianteId,
            proyecto: proyecto.nombre,
            fecha: new Date().toISOString(),
            rúbricaUtilizada: rúbrica.id,
            puntuacionBruta: puntuacion,
            puntuacionFinal: puntuacion * 0.30, // 30% del total
            evidencias: proyecto.evidencias || []
        };
        
        this.registros.push(registro);
        this.guardarRegistros();
        return registro;
    }
}
