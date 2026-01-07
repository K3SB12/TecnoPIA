// js/database.js - ARCHIVO COMPLETO
class TecnoPIADatabase {
    constructor() {
        this.db = null;
        this.DB_NAME = 'TecnoPIA_DB';
        this.DB_VERSION = 4;
        this.init();
    }

    init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);

            request.onerror = (event) => {
                console.error('Error al abrir la base de datos:', event);
                reject(event);
            };

            request.onsuccess = (event) => {
                this.db = event.target.result;
                console.log('Base de datos abierta exitosamente');
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                // Store para docentes
                if (!db.objectStoreNames.contains('docentes')) {
                    const store = db.createObjectStore('docentes', { keyPath: 'id', autoIncrement: true });
                    store.createIndex('email', 'email', { unique: true });
                }
                
                // Store para grupos
                if (!db.objectStoreNames.contains('grupos')) {
                    const store = db.createObjectStore('grupos', { keyPath: 'id', autoIncrement: true });
                    store.createIndex('docenteId', 'docenteId');
                    store.createIndex('ciclo', 'ciclo');
                }
                
                // Store para estudiantes
                if (!db.objectStoreNames.contains('estudiantes')) {
                    const store = db.createObjectStore('estudiantes', { keyPath: 'id', autoIncrement: true });
                    store.createIndex('grupoId', 'grupoId');
                    store.createIndex('cedula', 'cedula', { unique: true });
                }
                
                // Store para evaluaciones
                if (!db.objectStoreNames.contains('evaluaciones')) {
                    const store = db.createObjectStore('evaluaciones', { keyPath: 'id', autoIncrement: true });
                    store.createIndex('estudianteId', 'estudianteId');
                    store.createIndex('tipo', 'tipo');
                    store.createIndex('fecha', 'fecha');
                }
                
                // Store para indicadores PNFT
                if (!db.objectStoreNames.contains('indicadores')) {
                    const store = db.createObjectStore('indicadores', { keyPath: 'id', autoIncrement: true });
                    store.createIndex('grado', 'grado');
                    store.createIndex('area', 'area');
                }
                
                console.log('Estructura de base de datos creada');
            };
        });
    }

    // Métodos CRUD para docentes
    async guardarDocente(docente) {
        return this.guardar('docentes', docente);
    }

    async obtenerDocente(id) {
        return this.obtener('docentes', id);
    }

    async obtenerDocentePorEmail(email) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['docentes'], 'readonly');
            const store = transaction.objectStore('docentes');
            const index = store.index('email');
            const request = index.get(email);
            
            request.onsuccess = (event) => {
                resolve(event.target.result);
            };
            
            request.onerror = (event) => {
                reject(event);
            };
        });
    }

    // Métodos CRUD para grupos
    async guardarGrupo(grupo) {
        return this.guardar('grupos', grupo);
    }

    async obtenerGruposPorDocente(docenteId) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['grupos'], 'readonly');
            const store = transaction.objectStore('grupos');
            const index = store.index('docenteId');
            const request = index.getAll(docenteId);
            
            request.onsuccess = (event) => {
                resolve(event.target.result || []);
            };
            
            request.onerror = (event) => {
                reject(event);
            };
        });
    }

    // Métodos CRUD para estudiantes
    async guardarEstudiante(estudiante) {
        return this.guardar('estudiantes', estudiante);
    }

    async obtenerEstudiantesPorGrupo(grupoId) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['estudiantes'], 'readonly');
            const store = transaction.objectStore('estudiantes');
            const index = store.index('grupoId');
            const request = index.getAll(grupoId);
            
            request.onsuccess = (event) => {
                resolve(event.target.result || []);
            };
            
            request.onerror = (event) => {
                reject(event);
            };
        });
    }

    // Métodos CRUD para evaluaciones
    async guardarEvaluacion(evaluacion) {
        return this.guardar('evaluaciones', evaluacion);
    }

    async obtenerEvaluacionesPorEstudiante(estudianteId, tipo = null) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['evaluaciones'], 'readonly');
            const store = transaction.objectStore('evaluaciones');
            const index = store.index('estudianteId');
            const request = index.getAll(estudianteId);
            
            request.onsuccess = (event) => {
                let evaluaciones = event.target.result || [];
                if (tipo) {
                    evaluaciones = evaluaciones.filter(e => e.tipo === tipo);
                }
                resolve(evaluaciones);
            };
            
            request.onerror = (event) => {
                reject(event);
            };
        });
    }

    // Métodos CRUD para indicadores
    async guardarIndicador(indicador) {
        return this.guardar('indicadores', indicador);
    }

    async obtenerIndicadoresPorGrado(grado) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['indicadores'], 'readonly');
            const store = transaction.objectStore('indicadores');
            const index = store.index('grado');
            const request = index.getAll(grado);
            
            request.onsuccess = (event) => {
                resolve(event.target.result || []);
            };
            
            request.onerror = (event) => {
                reject(event);
            };
        });
    }

    // Métodos genéricos
    async guardar(storeName, data) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            
            // Si no tiene ID, es un nuevo registro
            const request = data.id ? store.put(data) : store.add(data);
            
            request.onsuccess = (event) => {
                data.id = event.target.result;
                resolve(data);
            };
            
            request.onerror = (event) => {
                console.error(`Error al guardar en ${storeName}:`, event);
                reject(event);
            };
        });
    }

    async obtener(storeName, id) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.get(id);
            
            request.onsuccess = (event) => {
                resolve(event.target.result);
            };
            
            request.onerror = (event) => {
                reject(event);
            };
        });
    }

    async eliminar(storeName, id) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.delete(id);
            
            request.onsuccess = () => {
                resolve(true);
            };
            
            request.onerror = (event) => {
                reject(event);
            };
        });
    }

    async obtenerTodo(storeName) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.getAll();
            
            request.onsuccess = (event) => {
                resolve(event.target.result);
            };
            
            request.onerror = (event) => {
                reject(event);
            };
        });
    }

    // Backup y restore
    async crearBackup() {
        const backup = {
            fecha: new Date().toISOString(),
            docentes: await this.obtenerTodo('docentes'),
            grupos: await this.obtenerTodo('grupos'),
            estudiantes: await this.obtenerTodo('estudiantes'),
            evaluaciones: await this.obtenerTodo('evaluaciones'),
            indicadores: await this.obtenerTodo('indicadores')
        };
        
        const backupStr = JSON.stringify(backup);
        localStorage.setItem('tecnoPIA_backup', backupStr);
        return backup;
    }

    async restaurarBackup() {
        const backupStr = localStorage.getItem('tecnoPIA_backup');
        if (!backupStr) return false;
        
        const backup = JSON.parse(backupStr);
        
        // Limpiar base de datos actual
        const stores = ['docentes', 'grupos', 'estudiantes', 'evaluaciones', 'indicadores'];
        for (const storeName of stores) {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            store.clear();
        }
        
        // Restaurar datos
        for (const storeName in backup) {
            if (storeName === 'fecha') continue;
            
            const datos = backup[storeName];
            for (const dato of datos) {
                await this.guardar(storeName, dato);
            }
        }
        
        return true;
    }

    // Método para exportar datos a CSV
    async exportarCSV(storeName) {
        const datos = await this.obtenerTodo(storeName);
        if (datos.length === 0) return '';
        
        const headers = Object.keys(datos[0]).join(',');
        const rows = datos.map(d => 
            Object.values(d).map(v => 
                typeof v === 'string' ? `"${v.replace(/"/g, '""')}"` : v
            ).join(',')
        );
        
        return [headers, ...rows].join('\n');
    }
}

// Instancia global de la base de datos
const TecnoDB = new TecnoPIADatabase();

// Inicializar al cargar la página
document.addEventListener('DOMContentLoaded', async () => {
    try {
        await TecnoDB.init();
        console.log('Base de datos lista para usar');
    } catch (error) {
        console.error('Error al inicializar la base de datos:', error);
    }
});
