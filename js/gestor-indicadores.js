// gestor-indicadores.js - Gestión de Indicadores PNFT

class GestorIndicadoresPNFT {
    constructor() {
        this.indicadores = this.cargarIndicadores();
    }
    
    cargarIndicadores() {
        try {
            const datos = localStorage.getItem('tecnoPIA_indicadores');
            return datos ? JSON.parse(datos) : [];
        } catch (error) {
            console.error('Error al cargar indicadores:', error);
            return [];
        }
    }
    
    guardarIndicadores() {
        try {
            localStorage.setItem('tecnoPIA_indicadores', JSON.stringify(this.indicadores));
        } catch (error) {
            console.error('Error al guardar indicadores:', error);
        }
    }
    
    agregarIndicador(indicador) {
        const nuevoIndicador = {
            id: `IND-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            fechaCreacion: new Date().toISOString(),
            activo: true,
            ...indicador
        };
        
        this.indicadores.push(nuevoIndicador);
        this.guardarIndicadores();
        return nuevoIndicador;
    }
    
    obtenerIndicadoresPorCiclo(ciclo) {
        if (!ciclo) return this.indicadores;
        return this.indicadores.filter(i => i.ciclo === ciclo && i.activo !== false);
    }
    
    obtenerIndicadoresParaComponente(componente) {
        return this.indicadores.filter(i => 
            i.activo !== false && 
            i.componentes && 
            i.componentes.includes(componente)
        );
    }
    
    buscarIndicador(indicadorId) {
        return this.indicadores.find(i => i.id === indicadorId);
    }
}

// Exportar para uso global
window.GestorIndicadoresPNFT = GestorIndicadoresPNFT;
