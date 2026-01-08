class CalculadoraMEP {
    constructor() {
        this.porcentajes = {
            ciclo1: { trabajoCotidiano: 0.65, tareas: 0.10, pruebaEjecucion: 0.15, asistencia: 0.10, proyecto: 0 },
            ciclo2: { trabajoCotidiano: 0.60, tareas: 0.10, pruebaEjecucion: 0.20, asistencia: 0.10, proyecto: 0 },
            ciclo3: { trabajoCotidiano: 0.50, tareas: 0.10, pruebaEjecucion: 0, asistencia: 0.10, proyecto: 0.30 }
        };
        this.escalaMEP = [
            { rango: [90, 100], letra: 'A', descripcion: 'Sobresaliente' },
            { rango: [80, 89], letra: 'B', descripcion: 'Muy Bueno' },
            { rango: [65, 79], letra: 'C', descripcion: 'Bueno' },
            { rango: [50, 64], letra: 'D', descripcion: 'Regular' },
            { rango: [0, 49], letra: 'F', descripcion: 'Necesita Mejorar' }
        ];
    }

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

    nivelAPorcentaje(nivel) {
        switch(nivel) { case 1: return 60; case 2: return 75; case 3: return 90; case 4: return 100; default: return 0; }
    }

    obtenerCalificacion(nota) {
        const calificacion = this.escalaMEP.find(c => nota >= c.rango[0] && nota <= c.rango[1]) || this.escalaMEP[4];
        return { nota: nota, letra: calificacion.letra, descripcion: calificacion.descripcion };
    }

    calcularEstadisticasGrupo(estudiantes, ciclo) {
        const notasFinales = estudiantes.map(e => this.calcularNotaFinal(e.notas, ciclo));
        const asistenciaPromedio = estudiantes.length > 0 ? 
            estudiantes.reduce((sum, e) => sum + (e.asistencia?.porcentaje || 0), 0) / estudiantes.length : 0;
        const aprobados = notasFinales.filter(n => n >= 65).length;
        return {
            totalEstudiantes: estudiantes.length,
            promedioGrupo: this.calcularPromedio(notasFinales),
            asistenciaPromedio: asistenciaPromedio,
            aprobados: aprobados,
            reprobados: estudiantes.length - aprobados,
            porcentajeAprobacion: (aprobados / estudiantes.length) * 100
        };
    }

    calcularPromedio(valores) {
        if (valores.length === 0) return 0;
        return valores.reduce((a, b) => a + b, 0) / valores.length;
    }

    generarReporteNotas(grupo, estudiantes) {
        return {
            grupo: { nombre: grupo.nombre, grado: grupo.grado, ciclo: grupo.ciclo },
            fechaGeneracion: new Date().toISOString(),
            estadisticas: this.calcularEstadisticasGrupo(estudiantes, grupo.ciclo),
            estudiantes: estudiantes.map(estudiante => {
                const notaFinal = this.calcularNotaFinal(estudiante.notas, grupo.ciclo);
                const calificacion = this.obtenerCalificacion(notaFinal);
                return { nombre: estudiante.nombreCompleto, notaFinal: notaFinal, calificacion: calificacion };
            })
        };
    }
}
window.CalculadoraMEP = new CalculadoraMEP();
