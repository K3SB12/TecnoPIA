class CalculadoraMEP {
    constructor() {
        this.sistema = SISTEMA_EVALUACION_MEP;
    }
    
    // Calcular nota final según ciclo
    calcularNotaFinal(ciclo, puntuaciones) {
        let notaFinal = 0;
        
        switch(ciclo) {
            case 'ciclo1': // 1°-3°
                notaFinal = 
                    (puntuaciones.trabajoCotidiano * 0.65) +
                    (puntuaciones.tareas * 0.10) +
                    (puntuaciones.pruebaEjecucion * 0.15) +
                    (puntuaciones.asistencia * 0.10);
                break;
                
            case 'ciclo2': // 4°-6°
                notaFinal = 
                    (puntuaciones.trabajoCotidiano * 0.60) +
                    (puntuaciones.tareas * 0.10) +
                    (puntuaciones.pruebaEjecucion * 0.20) +
                    (puntuaciones.asistencia * 0.10);
                break;
                
            case 'ciclo3': // 7°-9°
                notaFinal = 
                    (puntuaciones.trabajoCotidiano * 0.50) +
                    (puntuaciones.tareas * 0.10) +
                    (puntuaciones.proyecto * 0.30) +
                    (puntuaciones.asistencia * 0.10);
                break;
        }
        
        return this.redondearNota(notaFinal);
    }
    
    // Determinar condición según escala MEP
    determinarCondicion(nota, ciclo) {
        const escala = this.sistema[ciclo].escala;
        
        if (ciclo === 'ciclo3') {
            // Para III Ciclo (7°-9°)
            if (nota >= 90) return "Excelente";
            if (nota >= 80) return "Bueno";
            if (nota >= 70) return "Aprobado";
            return "Reprobado";
        } else {
            // Para I y II Ciclo
            return nota >= 70 ? "Aprobado" : "Reprobado";
        }
    }
    
    // Generar reporte descriptivo para Materno
    generarReporteFormativo(observaciones) {
        return {
            tipo: "Informe Formativo",
            fecha: new Date().toLocaleDateString(),
            areasEvaluadas: observaciones.map(obs => obs.area),
            descripcion: this.crearDescripcionCualitativa(observaciones),
            recomendaciones: this.generarRecomendaciones(observaciones)
        };
    }
}
