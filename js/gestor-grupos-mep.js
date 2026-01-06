// gestor-grupos.js - Sistema completo de gestión de grupos MEP

class GestorGrupos {
    constructor() {
        this.grupos = this.cargarGrupos();
        this.configuracion = this.cargarConfiguracion();
        this.calendario = this.cargarCalendario();
    }
    
    // ========== GESTIÓN DE GRUPOS ==========
    
    crearGrupo(ciclo, codigo, config = {}) {
        // Validar código único
        const existe = this.grupos.find(g => 
            g.ciclo === ciclo && g.codigo === codigo
        );
        
        if (existe) {
            throw new Error(`Ya existe un grupo ${codigo} en el ciclo ${ciclo}`);
        }
        
        const grupo = {
            id: `GRP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            ciclo,
            codigo,
            nombreCompleto: config.nombre || `${this.obtenerNombreCiclo(ciclo)} - ${codigo}`,
            fechaCreacion: new Date().toISOString(),
            activo: true,
            estudiantes: [],
            horario: config.horario || 'Por definir',
            docente: config.docente || 'Docente MEP',
            aula: config.aula || 'Taller de Tecnología',
            configuracion: {
                maxEstudiantes: config.maxEstudiantes || 30,
                permiteNuevos: config.permiteNuevos !== false,
                porcentajes: this.obtenerPorcentajesCiclo(ciclo)
            },
            estadisticas: {
                totalEstudiantes: 0,
                promedioGeneral: 0,
                asistenciaPromedio: 100,
                ultimaActualizacion: null
            },
            periodos: this.crearPeriodosDefault()
        };
        
        this.grupos.push(grupo);
        this.guardarGrupos();
        
        console.log(`✅ Grupo creado: ${grupo.nombreCompleto}`);
        return grupo;
    }
    
    eliminarGrupo(grupoId) {
        const index = this.grupos.findIndex(g => g.id === grupoId);
        
        if (index === -1) {
            throw new Error('Grupo no encontrado');
        }
        
        // Desvincular estudiantes
        const grupo = this.grupos[index];
        grupo.estudiantes.forEach(estId => {
            this.removerEstudianteDeGrupo(grupoId, estId);
        });
        
        // Eliminar grupo
        this.grupos.splice(index, 1);
        this.guardarGrupos();
        
        console.log(`🗑️ Grupo eliminado: ${grupo.codigo}`);
        return true;
    }
    
    agregarEstudianteAGrupo(grupoId, estudianteId) {
        const grupo = this.buscarGrupo(grupoId);
        if (!grupo) return false;
        
        // Verificar límite
        if (grupo.estudiantes.length >= grupo.configuracion.maxEstudiantes) {
            throw new Error(`Límite de ${grupo.configuracion.maxEstudiantes} estudiantes alcanzado`);
        }
        
        // Verificar si ya está en el grupo
        if (grupo.estudiantes.includes(estudianteId)) {
            console.warn(`Estudiante ya está en el grupo ${grupo.codigo}`);
            return false;
        }
        
        grupo.estudiantes.push(estudianteId);
        grupo.estadisticas.totalEstudiantes = grupo.estudiantes.length;
        grupo.estadisticas.ultimaActualizacion = new Date().toISOString();
        
        this.guardarGrupos();
        
        // Actualizar registro de estudiantes
        const registro = new RegistroEvaluacionTecnologia();
        const estudiante = registro.buscarEstudiante(estudianteId);
        if (estudiante) {
            estudiante.grupos = estudiante.grupos || [];
            if (!estudiante.grupos.includes(grupoId)) {
                estudiante.grupos.push(grupoId);
                registro.guardarEstudiantes();
            }
        }
        
        console.log(`✅ Estudiante agregado al grupo ${grupo.codigo}`);
        return true;
    }
    
    removerEstudianteDeGrupo(grupoId, estudianteId) {
        const grupo = this.buscarGrupo(grupoId);
        if (!grupo) return false;
        
        const index = grupo.estudiantes.indexOf(estudianteId);
        if (index !== -1) {
            grupo.estudiantes.splice(index, 1);
            grupo.estadisticas.totalEstudiantes = grupo.estudiantes.length;
            grupo.estadisticas.ultimaActualizacion = new Date().toISOString();
            
            this.guardarGrupos();
            
            // Actualizar estudiante
            const registro = new RegistroEvaluacionTecnologia();
            const estudiante = registro.buscarEstudiante(estudianteId);
            if (estudiante && estudiante.grupos) {
                estudiante.grupos = estudiante.grupos.filter(g => g !== grupoId);
                registro.guardarEstudiantes();
            }
            
            console.log(`✅ Estudiante removido del grupo ${grupo.codigo}`);
            return true;
        }
        
        return false;
    }
    
    buscarGrupo(grupoId) {
        return this.grupos.find(g => g.id === grupoId);
    }
    
    obtenerGruposPorCiclo(ciclo) {
        return this.grupos.filter(g => 
            g.ciclo === ciclo && g.activo === true
        ).sort((a, b) => a.codigo.localeCompare(b.codigo));
    }
    
    obtenerGruposPorDocente(docente) {
        return this.grupos.filter(g => 
            g.docente === docente && g.activo === true
        );
    }
    
    // ========== ESTADÍSTICAS ==========
    
    obtenerEstadisticasGrupo(grupoId) {
        const grupo = this.buscarGrupo(grupoId);
        if (!grupo) return null;
        
        const registro = new RegistroEvaluacionTecnologia();
        const calculadora = new CalculadoraMEP();
        
        const estudiantes = grupo.estudiantes.map(id => 
            registro.buscarEstudiante(id)
        ).filter(e => e !== undefined && e.activo !== false);
        
        if (estudiantes.length === 0) {
            return {
                grupo: grupo.nombreCompleto,
                totalEstudiantes: 0,
                promedioGeneral: 0,
                asistenciaPromedio: 100,
                distribucionNotas: { excelente: 0, bueno: 0, aprobado: 0, reprobado: 0 }
            };
        }
        
        // Calcular promedios y asistencia
        let sumaNotas = 0;
        let estudiantesConNotas = 0;
        let sumaAsistencia = 0;
        const distribucion = { excelente: 0, bueno: 0, aprobado: 0, reprobado: 0 };
        
        estudiantes.forEach(estudiante => {
            // Calcular nota del período actual
            const notaPeriodo = this.calcularNotaPeriodoEstudiante(estudiante.id, grupo.id);
            if (notaPeriodo) {
                sumaNotas += notaPeriodo.notaFinal;
                estudiantesConNotas++;
                
                // Clasificar por distribución
                if (notaPeriodo.notaFinal >= 90) distribucion.excelente++;
                else if (notaPeriodo.notaFinal >= 80) distribucion.bueno++;
                else if (notaPeriodo.notaFinal >= 70) distribucion.aprobado++;
                else distribucion.reprobado++;
            }
            
            // Asistencia
            sumaAsistencia += estudiante.asistencia?.porcentaje || 100;
        });
        
        const promedioGeneral = estudiantesConNotas > 0 ? 
            sumaNotas / estudiantesConNotas : 0;
        const asistenciaPromedio = estudiantes.length > 0 ?
            sumaAsistencia / estudiantes.length : 100;
        
        // Actualizar estadísticas del grupo
        grupo.estadisticas = {
            totalEstudiantes: estudiantes.length,
            promedioGeneral: Math.round(promedioGeneral * 100) / 100,
            asistenciaPromedio: Math.round(asistenciaPromedio * 100) / 100,
            ultimaActualizacion: new Date().toISOString()
        };
        
        this.guardarGrupos();
        
        return {
            grupo: grupo.nombreCompleto,
            totalEstudiantes: estudiantes.length,
            promedioGeneral: grupo.estadisticas.promedioGeneral,
            asistenciaPromedio: grupo.estadisticas.asistenciaPromedio,
            distribucionNotas: distribucion,
            estudiantesActivos: estudiantes.length
        };
    }
    
    calcularNotaPeriodoEstudiante(estudianteId, grupoId) {
        const registro = new RegistroEvaluacionTecnologia();
        const grupo = this.buscarGrupo(grupoId);
        
        if (!grupo) return null;
        
        const periodoActual = this.obtenerPeriodoActual();
        
        // Filtrar evaluaciones del estudiante en este grupo y período
        const evaluaciones = registro.registros.filter(r => 
            r.estudianteId === estudianteId && 
            r.periodo === periodoActual
        );
        
        if (evaluaciones.length === 0) return null;
        
        // Agrupar por tipo de evaluación
        const tc = evaluaciones.filter(e => e.tipo === 'trabajo_cotidiano');
        const ta = evaluaciones.filter(e => e.tipo === 'tarea');
        const pe = evaluaciones.filter(e => e.tipo === 'prueba_ejecucion');
        const pt = evaluaciones.filter(e => e.tipo === 'proyecto_tecnologico');
        
        // Calcular promedios
        const promedioTC = tc.length > 0 ? 
            tc.reduce((sum, e) => sum + e.puntuacionBruta, 0) / tc.length : 0;
        
        const promedioTA = ta.length > 0 ? 
            ta.reduce((sum, e) => sum + e.puntuacionBruta, 0) / ta.length : 0;
        
        const promedioPE = pe.length > 0 ? 
            pe.reduce((sum, e) => sum + e.puntuacionBruta, 0) / pe.length : 0;
        
        const promedioPT = pt.length > 0 ? 
            pt.reduce((sum, e) => sum + e.puntuacionBruta, 0) / pt.length : 0;
        
        const estudiante = registro.buscarEstudiante(estudianteId);
        const notaAS = estudiante?.asistencia?.porcentaje || 100;
        
        // Usar calculadora MEP
        const calculadora = new CalculadoraMEP();
        const puntuaciones = {
            TC: promedioTC,
            TA: promedioTA,
            PE: promedioPE,
            PT: promedioPT,
            AS: notaAS
        };
        
        return calculadora.calcularNotaFinal(grupo.ciclo, puntuaciones);
    }
    
    // ========== CALENDARIO Y SEMANAS ==========
    
    configurarCalendarioEscolar(anoLectivo, config) {
        this.configuracion.calendario = {
            anoLectivo,
            trimestres: [
                { 
                    nombre: 'I Trimestre',
                    inicio: config.trimestre1?.inicio || `${anoLectivo}-02-05`,
                    fin: config.trimestre1?.fin || `${anoLectivo}-04-12`,
                    semanas: 10
                },
                { 
                    nombre: 'II Trimestre',
                    inicio: config.trimestre2?.inicio || `${anoLectivo}-05-06`,
                    fin: config.trimestre2?.fin || `${anoLectivo}-07-12`,
                    semanas: 10
                },
                { 
                    nombre: 'III Trimestre',
                    inicio: config.trimestre3?.inicio || `${anoLectivo}-08-05`,
                    fin: config.trimestre3?.fin || `${anoLectivo}-10-11`,
                    semanas: 10
                }
            ],
            periodosExtraordinarios: config.periodosExtraordinarios || [],
            diasFeriados: config.diasFeriados || [],
            semanasEvaluacion: config.semanasEvaluacion || [4, 8, 10]
        };
        
        this.guardarConfiguracion();
        this.generarSemanasEscolares();
    }
    
    generarSemanasEscolares() {
        const calendario = this.configuracion.calendario;
        if (!calendario) return;
        
        const semanas = [];
        let semanaNum = 1;
        
        calendario.trimestres.forEach(trimestre => {
            const inicio = new Date(trimestre.inicio);
            const fin = new Date(trimestre.fin);
            
            let fechaActual = new Date(inicio);
            
            while (fechaActual <= fin && semanaNum <= 40) { // Máximo 40 semanas
                const semanaFin = new Date(fechaActual);
                semanaFin.setDate(semanaFin.getDate() + 4); // Semana escolar de 5 días
                
                semanas.push({
                    numero: semanaNum,
                    trimestre: trimestre.nombre,
                    inicio: fechaActual.toISOString().split('T')[0],
                    fin: semanaFin.toISOString().split('T')[0],
                    tipo: this.obtenerTipoSemana(semanaNum),
                    evaluacion: calendario.semanasEvaluacion.includes(semanaNum % 10 || 10),
                    actividades: []
                });
                
                fechaActual.setDate(fechaActual.getDate() + 7); // Siguiente semana
                semanaNum++;
            }
        });
        
        this.calendario.semanas = semanas;
        this.guardarCalendario();
        
        console.log(`📅 Generadas ${semanas.length} semanas escolares`);
    }
    
    obtenerTipoSemana(numeroSemana) {
        if (numeroSemana === 1) return 'inicio';
        if (numeroSemana % 10 === 0) return 'evaluacion';
        if (numeroSemana % 5 === 0) return 'revision';
        return 'normal';
    }
    
    obtenerSemanaActual() {
        if (!this.calendario.semanas || this.calendario.semanas.length === 0) {
            return null;
        }
        
        const hoy = new Date().toISOString().split('T')[0];
        
        return this.calendario.semanas.find(semana => 
            hoy >= semana.inicio && hoy <= semana.fin
        );
    }
    
    obtenerPeriodoActual() {
        const hoy = new Date();
        const ano = hoy.getFullYear();
        const mes = hoy.getMonth() + 1;
        
        if (mes >= 2 && mes <= 4) return `I-${ano}`;
        if (mes >= 5 && mes <= 7) return `II-${ano}`;
        if (mes >= 8 && mes <= 10) return `III-${ano}`;
        return `Extra-${ano}`;
    }
    
    // ========== FUNCIONES DE UTILIDAD ==========
    
    obtenerNombreCiclo(ciclo) {
        const nombres = {
            'ciclo1': 'I Ciclo (1°-3°)',
            'ciclo2': 'II Ciclo (4°-6°)',
            'ciclo3': 'III Ciclo (7°-9°)',
            'materno': 'Materno/Transición'
        };
        return nombres[ciclo] || ciclo;
    }
    
    obtenerPorcentajesCiclo(ciclo) {
        const porcentajes = {
            'ciclo1': { TC: 65, TA: 10, PE: 15, AS: 10 },
            'ciclo2': { TC: 60, TA: 10, PE: 20, AS: 10 },
            'ciclo3': { TC: 50, TA: 10, PT: 30, AS: 10 },
            'materno': { OBS: 100 }
        };
        return porcentajes[ciclo] || { TC: 60, TA: 10, PE: 20, AS: 10 };
    }
    
    crearPeriodosDefault() {
        const ano = new Date().getFullYear();
        return [
            {
                nombre: `I Trimestre ${ano}`,
                codigo: `I-${ano}`,
                inicio: `${ano}-02-05`,
                fin: `${ano}-04-12`,
                semanas: 10,
                evaluaciones: [],
                estado: 'activo'
            },
            {
                nombre: `II Trimestre ${ano}`,
                codigo: `II-${ano}`,
                inicio: `${ano}-05-06`,
                fin: `${ano}-07-12`,
                semanas: 10,
                evaluaciones: [],
                estado: 'pendiente'
            },
            {
                nombre: `III Trimestre ${ano}`,
                codigo: `III-${ano}`,
                inicio: `${ano}-08-05`,
                fin: `${ano}-10-11`,
                semanas: 10,
                evaluaciones: [],
                estado: 'pendiente'
            }
        ];
    }
    
    // ========== PERSISTENCIA ==========
    
    cargarGrupos() {
        try {
            const datos = localStorage.getItem('tecnoPIA_grupos');
            return datos ? JSON.parse(datos) : [];
        } catch (error) {
            console.error('Error al cargar grupos:', error);
            return [];
        }
    }
    
    guardarGrupos() {
        try {
            localStorage.setItem('tecnoPIA_grupos', JSON.stringify(this.grupos));
        } catch (error) {
            console.error('Error al guardar grupos:', error);
        }
    }
    
    cargarConfiguracion() {
        try {
            const datos = localStorage.getItem('tecnoPIA_config_grupos');
            return datos ? JSON.parse(datos) : {
                docente: 'Docente MEP',
                institucion: 'Centro Educativo',
                anoLectivo: new Date().getFullYear(),
                calendario: null
            };
        } catch (error) {
            console.error('Error al cargar configuración:', error);
            return {
                docente: 'Docente MEP',
                institucion: 'Centro Educativo',
                anoLectivo: new Date().getFullYear(),
                calendario: null
            };
        }
    }
    
    guardarConfiguracion() {
        try {
            localStorage.setItem('tecnoPIA_config_grupos', JSON.stringify(this.configuracion));
        } catch (error) {
            console.error('Error al guardar configuración:', error);
        }
    }
    
    cargarCalendario() {
        try {
            const datos = localStorage.getItem('tecnoPIA_calendario');
            return datos ? JSON.parse(datos) : {
                semanas: [],
                eventos: [],
                evaluaciones: []
            };
        } catch (error) {
            console.error('Error al cargar calendario:', error);
            return {
                semanas: [],
                eventos: [],
                evaluaciones: []
            };
        }
    }
    
    guardarCalendario() {
        try {
            localStorage.setItem('tecnoPIA_calendario', JSON.stringify(this.calendario));
        } catch (error) {
            console.error('Error al guardar calendario:', error);
        }
    }
    
    // ========== IMPORTACIÓN/EXPORTACIÓN ==========
    
    exportarGruposCSV() {
        if (this.grupos.length === 0) return '';
        
        const headers = ['Ciclo', 'Código', 'Nombre', 'Estudiantes', 'Horario', 'Aula', 'Promedio'];
        const filas = this.grupos.map(grupo => [
            this.obtenerNombreCiclo(grupo.ciclo),
            grupo.codigo,
            grupo.nombreCompleto,
            grupo.estudiantes.length,
            grupo.horario,
            grupo.aula,
            grupo.estadisticas.promedioGeneral || '--'
        ]);
        
        return [headers, ...filas].map(row => 
            row.map(cell => `"${cell}"`).join(',')
        ).join('\n');
    }
    
    importarGruposCSV(datosCSV) {
        const lineas = datosCSV.split('\n');
        const gruposImportados = [];
        
        for (let i = 1; i < lineas.length; i++) {
            if (lineas[i].trim() === '') continue;
            
            const columnas = lineas[i].split(',').map(col => 
                col.replace(/"/g, '').trim()
            );
            
            if (columnas.length >= 2) {
                try {
                    const ciclo = this.obtenerCicloDeNombre(columnas[0]);
                    const grupo = this.crearGrupo(ciclo, columnas[1], {
                        nombre: columnas[2] || columnas[1],
                        horario: columnas[4] || '',
                        aula: columnas[5] || '',
                        maxEstudiantes: parseInt(columnas[6]) || 30
                    });
                    
                    gruposImportados.push(grupo);
                } catch (error) {
                    console.warn(`Error importando grupo línea ${i}:`, error.message);
                }
            }
        }
        
        return gruposImportados;
    }
    
    obtenerCicloDeNombre(nombre) {
        if (nombre.includes('I Ciclo')) return 'ciclo1';
        if (nombre.includes('II Ciclo')) return 'ciclo2';
        if (nombre.includes('III Ciclo')) return 'ciclo3';
        if (nombre.includes('Materno')) return 'materno';
        return 'ciclo1';
    }
}

// Exportar para uso global
window.GestorGrupos = GestorGrupos;

// Inicialización automática
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ Gestor de Grupos MEP cargado');
    console.log('📊 Sistema completo para gestión docente');
    console.log('👥 Soporta múltiples grupos por nivel (1-1, 1-2, 1-3, etc.)');
    console.log('📅 Calendario escolar por semanas y trimestres');
});
