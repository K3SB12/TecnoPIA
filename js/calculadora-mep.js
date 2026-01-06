// calculadora-mep.js - Sistema oficial de cálculo de notas MEP

/**
 * SISTEMA DE EVALUACIÓN MEP PARA FORMACIÓN TECNOLÓGICA
 * Basado en el Reglamento de Evaluación de los Aprendizajes (REA)
 */

const SISTEMA_EVALUACION_MEP = {
    // ========== MATERNO/TRANSICIÓN (EVALUACIÓN FORMATIVA) ==========
    "materno": {
        tipo: "formativo",
        descripcion: "Evaluación cualitativa basada en observación directa",
        instrumentos: ["Observación sistemática", "Registro anecdótico", "Listas de cotejo cualitativas"],
        escala: ["En proceso", "Logrado", "Destacado"],
        reporte: "Informe descriptivo cualitativo sin calificación numérica"
    },
    
    // ========== I CICLO (1°-3° PRIMARIA) ==========
    "ciclo1": {
        tipo: "sumativo",
        descripcion: "I Ciclo de la Educación General Básica",
        componentes: [
            { 
                nombre: "Trabajo Cotidiano", 
                codigo: "TC",
                porcentaje: 65,
                descripcion: "Evaluación continua del trabajo en clase",
                instrumentos: ["Listas de cotejo", "Rúbricas de observación", "Registro de participación"],
                rango: [0, 100]
            },
            { 
                nombre: "Tareas", 
                codigo: "TA",
                porcentaje: 10,
                descripcion: "Trabajos asignados para realizar fuera de clase",
                instrumentos: ["Rúbricas de tareas", "Listas de verificación"],
                rango: [0, 100]
            },
            { 
                nombre: "Prueba de Ejecución", 
                codigo: "PE",
                porcentaje: 15,
                descripcion: "Demostración práctica de habilidades tecnológicas",
                instrumentos: ["Rúbricas de ejecución", "Protocolos de observación"],
                rango: [0, 100]
            },
            { 
                nombre: "Asistencia", 
                codigo: "AS",
                porcentaje: 10,
                descripcion: "Puntualidad y asistencia a clases",
                instrumentos: ["Registro de asistencia"],
                rango: [0, 100],
                notaMaxima: 100 // Asistencia perfecta = 100 puntos
            }
        ],
        totalPorcentaje: 100,
        escalaAprobacion: {
            "aprobado": { min: 70, max: 100, descripcion: "Aprobado" },
            "reprobado": { min: 0, max: 69, descripcion: "Reprobado" }
        },
        notaMinimaAprobacion: 70
    },
    
    // ========== II CICLO (4°-6° PRIMARIA) ==========
    "ciclo2": {
        tipo: "sumativo",
        descripcion: "II Ciclo de la Educación General Básica",
        componentes: [
            { 
                nombre: "Trabajo Cotidiano", 
                codigo: "TC",
                porcentaje: 60,
                descripcion: "Evaluación continua del trabajo en clase",
                instrumentos: ["Listas de cotejo", "Rúbricas de observación", "Registro de participación"],
                rango: [0, 100]
            },
            { 
                nombre: "Tareas", 
                codigo: "TA",
                porcentaje: 10,
                descripcion: "Trabajos asignados para realizar fuera de clase",
                instrumentos: ["Rúbricas de tareas", "Listas de verificación"],
                rango: [0, 100]
            },
            { 
                nombre: "Prueba de Ejecución", 
                codigo: "PE",
                porcentaje: 20,
                descripcion: "Demostración práctica de habilidades tecnológicas",
                instrumentos: ["Rúbricas de ejecución", "Protocolos de observación"],
                rango: [0, 100]
            },
            { 
                nombre: "Asistencia", 
                codigo: "AS",
                porcentaje: 10,
                descripcion: "Puntualidad y asistencia a clases",
                instrumentos: ["Registro de asistencia"],
                rango: [0, 100],
                notaMaxima: 100
            }
        ],
        totalPorcentaje: 100,
        escalaAprobacion: {
            "aprobado": { min: 70, max: 100, descripcion: "Aprobado" },
            "reprobado": { min: 0, max: 69, descripcion: "Reprobado" }
        },
        notaMinimaAprobacion: 70
    },
    
    // ========== III CICLO (7°-9° SECUNDARIA) ==========
    "ciclo3": {
        tipo: "sumativo",
        descripcion: "III Ciclo de la Educación General Básica",
        componentes: [
            { 
                nombre: "Trabajo Cotidiano", 
                codigo: "TC",
                porcentaje: 50,
                descripcion: "Evaluación continua del trabajo en clase",
                instrumentos: ["Listas de cotejo", "Rúbricas de observación", "Registro de participación"],
                rango: [0, 100]
            },
            { 
                nombre: "Tareas", 
                codigo: "TA",
                porcentaje: 10,
                descripcion: "Trabajos asignados para realizar fuera de clase",
                instrumentos: ["Rúbricas de tareas", "Listas de verificación"],
                rango: [0, 100]
            },
            { 
                nombre: "Proyecto Tecnológico", 
                codigo: "PT",
                porcentaje: 30,
                descripcion: "Desarrollo de solución tecnológica integral",
                instrumentos: ["Rúbricas de proyectos", "Presentaciones", "Documentación técnica"],
                rango: [0, 100]
            },
            { 
                nombre: "Asistencia", 
                codigo: "AS",
                porcentaje: 10,
                descripcion: "Puntualidad y asistencia a clases",
                instrumentos: ["Registro de asistencia"],
                rango: [0, 100],
                notaMaxima: 100
            }
        ],
        totalPorcentaje: 100,
        escalaCalificacion: {
            "excelente": { min: 90, max: 100, descripcion: "Excelente" },
            "bueno": { min: 80, max: 89, descripcion: "Bueno" },
            "aprobado": { min: 70, max: 79, descripcion: "Aprobado" },
            "reprobado": { min: 0, max: 69, descripcion: "Reprobado" }
        },
        notaMinimaAprobacion: 70
    }
};

class CalculadoraMEP {
    constructor() {
        this.sistema = SISTEMA_EVALUACION_MEP;
        this.historialCalculos = [];
    }
    
    /**
     * Calcula la nota final según el ciclo y las puntuaciones
     * @param {string} ciclo - 'ciclo1', 'ciclo2', 'ciclo3'
     * @param {Object} puntuaciones - Objeto con las calificaciones por componente
     * @returns {Object} - Nota final, condición y desglose
     */
    calcularNotaFinal(ciclo, puntuaciones) {
        if (!this.sistema[ciclo]) {
            throw new Error(`Ciclo no válido: ${ciclo}`);
        }
        
        if (ciclo === 'materno') {
            return this.generarReporteFormativo(puntuaciones);
        }
        
        const componentes = this.sistema[ciclo].componentes;
        let notaFinal = 0;
        let desglose = {};
        
        // Calcular contribución de cada componente
        componentes.forEach(componente => {
            const codigo = componente.codigo;
            const puntuacion = this.validarPuntuacion(puntuaciones[codigo], componente.rango);
            const contribucion = (puntuacion * componente.porcentaje) / 100;
            
            notaFinal += contribucion;
            desglose[codigo] = {
                nombre: componente.nombre,
                puntuacionBruta: puntuacion,
                porcentaje: componente.porcentaje,
                contribucion: contribucion,
                notaRedondeada: this.redondearNota(contribucion)
            };
        });
        
        // Redondear nota final
        notaFinal = this.redondearNota(notaFinal);
        
        // Determinar condición
        const condicion = this.determinarCondicion(notaFinal, ciclo);
        
        // Guardar en historial
        const calculo = {
            fecha: new Date().toISOString(),
            ciclo,
            puntuaciones,
            notaFinal,
            condicion,
            desglose
        };
        
        this.historialCalculos.push(calculo);
        this.guardarHistorial();
        
        return {
            notaFinal,
            condicion,
            desglose,
            escala: this.sistema[ciclo].escalaCalificacion || this.sistema[ciclo].escalaAprobacion,
            mensaje: this.generarMensajeResultado(notaFinal, condicion, ciclo)
        };
    }
    
    /**
     * Calcula la nota necesaria en un componente para alcanzar una nota final objetivo
     * @param {string} ciclo - Ciclo educativo
     * @param {Object} puntuacionesActuales - Puntuaciones actuales
     * @param {string} componenteCodigo - Código del componente (TC, TA, PE, PT, AS)
     * @param {number} notaObjetivo - Nota final que se desea alcanzar
     * @returns {number} - Puntuación necesaria en el componente
     */
    calcularNotaNecesaria(ciclo, puntuacionesActuales, componenteCodigo, notaObjetivo) {
        const componentes = this.sistema[ciclo].componentes;
        const componente = componentes.find(c => c.codigo === componenteCodigo);
        
        if (!componente) {
            throw new Error(`Componente no válido: ${componenteCodigo}`);
        }
        
        // Calcular contribución actual de otros componentes
        let contribucionOtros = 0;
        componentes.forEach(comp => {
            if (comp.codigo !== componenteCodigo) {
                const puntuacion = this.validarPuntuacion(puntuacionesActuales[comp.codigo], comp.rango);
                contribucionOtros += (puntuacion * comp.porcentaje) / 100;
            }
        });
        
        // Calcular puntuación necesaria
        const contribucionNecesaria = notaObjetivo - contribucionOtros;
        const puntuacionNecesaria = (contribucionNecesaria * 100) / componente.porcentaje;
        
        // Ajustar si supera el rango máximo
        return Math.min(Math.max(puntuacionNecesaria, 0), 100);
    }
    
    /**
     * Genera reporte formativo para Materno/Transición
     * @param {Object} observaciones - Observaciones cualitativas
     * @returns {Object} - Reporte formativo
     */
    generarReporteFormativo(observaciones) {
        const fecha = new Date().toLocaleDateString('es-CR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        return {
            tipo: "Informe Formativo",
            fecha,
            areasEvaluadas: Object.keys(observaciones),
            observaciones: observaciones,
            recomendaciones: this.generarRecomendacionesFormativo(observaciones),
            formato: "Cualitativo descriptivo",
            proximosPasos: "Transición al I Ciclo con evaluación sumativa"
        };
    }
    
    /**
     * Determina la condición según la nota y el ciclo
     * @param {number} nota - Nota final (0-100)
     * @param {string} ciclo - Ciclo educativo
     * @returns {string} - Condición (Excelente, Bueno, Aprobado, Reprobado, etc.)
     */
    determinarCondicion(nota, ciclo) {
        const sistemaCiclo = this.sistema[ciclo];
        
        if (!sistemaCiclo) {
            return "Ciclo no válido";
        }
        
        if (ciclo === 'ciclo1' || ciclo === 'ciclo2') {
            return nota >= sistemaCiclo.notaMinimaAprobacion ? "Aprobado" : "Reprobado";
        }
        
        if (ciclo === 'ciclo3') {
            const escala = sistemaCiclo.escalaCalificacion;
            for (const [key, rango] of Object.entries(escala)) {
                if (nota >= rango.min && nota <= rango.max) {
                    return rango.descripcion;
                }
            }
        }
        
        return "No determinado";
    }
    
    /**
     * Valida que una puntuación esté dentro del rango permitido
     * @param {number} puntuacion - Puntuación a validar
     * @param {Array} rango - [min, max]
     * @returns {number} - Puntuación validada
     */
    validarPuntuacion(puntuacion, rango = [0, 100]) {
        if (puntuacion === undefined || puntuacion === null) {
            return rango[0]; // Retorna el mínimo si no hay puntuación
        }
        
        let puntuacionNum = parseFloat(puntuacion);
        
        if (isNaN(puntuacionNum)) {
            return rango[0];
        }
        
        // Asegurar que esté dentro del rango
        puntuacionNum = Math.max(rango[0], Math.min(puntuacionNum, rango[1]));
        
        return puntuacionNum;
    }
    
    /**
     * Redondea una nota según estándares MEP
     * @param {number} nota - Nota a redondear
     * @param {number} decimales - Número de decimales (por defecto 2)
     * @returns {number} - Nota redondeada
     */
    redondearNota(nota, decimales = 2) {
        const factor = Math.pow(10, decimales);
        return Math.round(nota * factor) / factor;
    }
    
    /**
     * Genera recomendaciones basadas en observaciones formativas
     * @param {Object} observaciones - Observaciones por área
     * @returns {Array} - Lista de recomendaciones
     */
    generarRecomendacionesFormativo(observaciones) {
        const recomendaciones = [];
        
        if (observaciones.exploracionSensorial === 'en proceso') {
            recomendaciones.push("Continuar con actividades de exploración sensorial con diferentes texturas y materiales seguros");
        }
        
        if (observaciones.relacionCausaEfecto === 'en proceso') {
            recomendaciones.push("Reforzar actividades que demuestren causa-efecto con dispositivos tecnológicos simples");
        }
        
        if (observaciones.manejoMateriales === 'en proceso') {
            recomendaciones.push("Supervisar el manejo seguro de materiales tecnológicos y reforzar normas de seguridad");
        }
        
        if (recomendaciones.length === 0) {
            recomendaciones.push("El estudiante muestra desarrollo adecuado para su nivel. Continuar con el proceso de estimulación tecnológica.");
        }
        
        return recomendaciones;
    }
    
    /**
     * Genera mensaje descriptivo del resultado
     * @param {number} nota - Nota final
     * @param {string} condicion - Condición obtenida
     * @param {string} ciclo - Ciclo educativo
     * @returns {string} - Mensaje descriptivo
     */
    generarMensajeResultado(nota, condicion, ciclo) {
        const mensajes = {
            'ciclo1': {
                'Aprobado': `El estudiante ha logrado los aprendizajes esperados con una calificación de ${nota}.`,
                'Reprobado': `El estudiante requiere refuerzo en los aprendizajes. Calificación: ${nota}.`
            },
            'ciclo2': {
                'Aprobado': `Desempeño satisfactorio en Formación Tecnológica. Calificación: ${nota}.`,
                'Reprobado': `Necesita apoyo adicional para alcanzar los aprendizajes. Calificación: ${nota}.`
            },
            'ciclo3': {
                'Excelente': `Desempeño excepcional en todas las áreas tecnológicas. Calificación: ${nota}.`,
                'Bueno': `Buen desempeño en Formación Tecnológica. Calificación: ${nota}.`,
                'Aprobado': `Ha logrado los aprendizajes mínimos requeridos. Calificación: ${nota}.`,
                'Reprobado': `No ha logrado los aprendizajes mínimos. Requiere refuerzo. Calificación: ${nota}.`
            }
        };
        
        return mensajes[ciclo]?.[condicion] || `Calificación: ${nota}. Condición: ${condicion}.`;
    }
    
    /**
     * Obtiene estadísticas de un grupo de estudiantes
     * @param {Array} estudiantes - Lista de estudiantes con sus notas
     * @returns {Object} - Estadísticas del grupo
     */
    obtenerEstadisticasGrupo(estudiantes) {
        if (!estudiantes || estudiantes.length === 0) {
            return {
                total: 0,
                promedio: 0,
                maximo: 0,
                minimo: 0,
                aprobados: 0,
                reprobados: 0,
                porcentajeAprobacion: 0
            };
        }
        
        const notas = estudiantes.map(e => e.notaFinal).filter(n => !isNaN(n));
        const aprobados = estudiantes.filter(e => this.determinarCondicion(e.notaFinal, e.ciclo) !== 'Reprobado').length;
        
        const suma = notas.reduce((acc, nota) => acc + nota, 0);
        const promedio = notas.length > 0 ? suma / notas.length : 0;
        
        return {
            total: estudiantes.length,
            promedio: this.redondearNota(promedio),
            maximo: Math.max(...notas),
            minimo: Math.min(...notas),
            aprobados,
            reprobados: estudiantes.length - aprobados,
            porcentajeAprobacion: this.redondearNota((aprobados / estudiantes.length) * 100)
        };
    }
    
    /**
     * Guarda el historial de cálculos en localStorage
     */
    guardarHistorial() {
        try {
            localStorage.setItem('tecnoPIA_historial_calculos', JSON.stringify(this.historialCalculos));
        } catch (error) {
            console.error('Error al guardar historial:', error);
        }
    }
    
    /**
     * Carga el historial de cálculos desde localStorage
     */
    cargarHistorial() {
        try {
            const historial = localStorage.getItem('tecnoPIA_historial_calculos');
            if (historial) {
                this.historialCalculos = JSON.parse(historial);
            }
        } catch (error) {
            console.error('Error al cargar historial:', error);
        }
    }
    
    /**
     * Exporta datos en formato CSV para Excel
     * @param {Array} datos - Datos a exportar
     * @returns {string} - CSV formateado
     */
    exportarCSV(datos) {
        if (!datos || datos.length === 0) {
            return '';
        }
        
        const headers = Object.keys(datos[0]).join(',');
        const filas = datos.map(item => 
            Object.values(item).map(val => 
                typeof val === 'string' ? `"${val}"` : val
            ).join(',')
        );
        
        return [headers, ...filas].join('\n');
    }
}

// Exportar para uso global
window.CalculadoraMEP = CalculadoraMEP;
window.SISTEMA_EVALUACION_MEP = SISTEMA_EVALUACION_MEP;

// Inicialización automática
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ Calculadora MEP cargada correctamente');
    console.log('📊 Sistema de evaluación con porcentajes oficiales MEP');
    console.log('🎯 I Ciclo: 65% TC + 10% TA + 15% PE + 10% AS');
    console.log('🎯 II Ciclo: 60% TC + 10% TA + 20% PE + 10% AS');
    console.log('🎯 III Ciclo: 50% TC + 10% TA + 30% PT + 10% AS');
});
