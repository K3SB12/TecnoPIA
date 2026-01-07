// js/auth.js - ARCHIVO COMPLETO
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.isLoggedIn = false;
        this.init();
    }

    init() {
        // Verificar si hay usuario en localStorage
        const savedUser = localStorage.getItem('tecnoPIA_currentUser');
        if (savedUser) {
            try {
                this.currentUser = JSON.parse(savedUser);
                this.isLoggedIn = true;
                console.log('Usuario restaurado de localStorage:', this.currentUser.nombre);
            } catch (error) {
                console.error('Error al restaurar usuario:', error);
                this.logout();
            }
        }
    }

    async login(email, password) {
        try {
            // Verificar credenciales en la base de datos
            const docente = await TecnoDB.obtenerDocentePorEmail(email);
            
            if (!docente) {
                // Si no existe, crear docente demo (en producción usaría hash de contraseña)
                if (email === 'demo@tecno.edu' && password === 'demo123') {
                    this.currentUser = {
                        id: 1,
                        nombre: 'Docente Demo',
                        email: 'demo@tecno.edu',
                        escuela: 'Escuela Técnica Demo',
                        telefono: '8888-8888',
                        fechaRegistro: new Date().toISOString()
                    };
                    
                    await TecnoDB.guardarDocente(this.currentUser);
                } else {
                    throw new Error('Credenciales incorrectas');
                }
            } else {
                // En producción, verificar hash de contraseña
                if (password !== 'demo123' && email !== 'demo@tecno.edu') {
                    // Para otros usuarios, verificar contraseña simple
                    if (docente.password !== password) {
                        throw new Error('Credenciales incorrectas');
                    }
                }
                
                this.currentUser = docente;
            }
            
            this.isLoggedIn = true;
            
            // Guardar en localStorage
            localStorage.setItem('tecnoPIA_currentUser', JSON.stringify(this.currentUser));
            
            // Guardar en sessionStorage para la sesión actual
            sessionStorage.setItem('tecnoPIA_session', JSON.stringify({
                userId: this.currentUser.id,
                loginTime: new Date().toISOString()
            }));
            
            console.log('Login exitoso:', this.currentUser.nombre);
            return this.currentUser;
            
        } catch (error) {
            console.error('Error en login:', error);
            throw error;
        }
    }

    async register(docenteData) {
        try {
            // Verificar si el email ya existe
            const existente = await TecnoDB.obtenerDocentePorEmail(docenteData.email);
            if (existente) {
                throw new Error('El email ya está registrado');
            }
            
            // Crear nuevo docente
            const nuevoDocente = {
                nombre: docenteData.nombre,
                email: docenteData.email,
                escuela: docenteData.escuela || '',
                telefono: docenteData.telefono || '',
                password: docenteData.password, // En producción, usar hash
                fechaRegistro: new Date().toISOString(),
                activo: true
            };
            
            // Guardar en la base de datos
            const docenteGuardado = await TecnoDB.guardarDocente(nuevoDocente);
            
            // Iniciar sesión automáticamente
            this.currentUser = docenteGuardado;
            this.isLoggedIn = true;
            
            // Guardar en localStorage
            localStorage.setItem('tecnoPIA_currentUser', JSON.stringify(this.currentUser));
            
            console.log('Registro exitoso:', docenteGuardado.nombre);
            return docenteGuardado;
            
        } catch (error) {
            console.error('Error en registro:', error);
            throw error;
        }
    }

    logout() {
        this.currentUser = null;
        this.isLoggedIn = false;
        
        // Limpiar almacenamiento
        localStorage.removeItem('tecnoPIA_currentUser');
        sessionStorage.removeItem('tecnoPIA_session');
        
        console.log('Logout exitoso');
        
        // Redirigir a login
        window.location.href = 'login.html';
    }

    getCurrentUser() {
        return this.currentUser;
    }

    checkAuth() {
        if (!this.isLoggedIn) {
            // Redirigir a login si no está autenticado
            if (!window.location.href.includes('login.html') && 
                !window.location.href.includes('register.html') &&
                !window.location.href.includes('index.html')) {
                window.location.href = 'login.html';
            }
            return false;
        }
        return true;
    }

    updateProfile(updatedData) {
        if (!this.currentUser) return false;
        
        Object.assign(this.currentUser, updatedData);
        localStorage.setItem('tecnoPIA_currentUser', JSON.stringify(this.currentUser));
        
        // Actualizar en la base de datos
        TecnoDB.guardarDocente(this.currentUser);
        
        return true;
    }

    // Verificar si la sesión está activa
    isSessionActive() {
        const sessionData = sessionStorage.getItem('tecnoPIA_session');
        if (!sessionData) return false;
        
        try {
            const session = JSON.parse(sessionData);
            const loginTime = new Date(session.loginTime);
            const now = new Date();
            const hoursDiff = (now - loginTime) / (1000 * 60 * 60);
            
            // Sesión expira después de 8 horas
            return hoursDiff < 8;
        } catch (error) {
            return false;
        }
    }
}

// Instancia global del administrador de autenticación
const Auth = new AuthManager();

// Función para proteger rutas
function requireAuth() {
    if (!Auth.checkAuth()) {
        return false;
    }
    return true;
}

// Función para redirigir si ya está autenticado
function redirectIfAuthenticated() {
    if (Auth.isLoggedIn && Auth.isSessionActive()) {
        if (window.location.href.includes('login.html') || 
            window.location.href.includes('register.html')) {
            window.location.href = 'dashboard.html';
        }
    }
}

// Inicializar al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    redirectIfAuthenticated();
    
    // Si estamos en una página protegida, verificar autenticación
    if (!window.location.href.includes('login.html') && 
        !window.location.href.includes('register.html') &&
        !window.location.href.includes('index.html')) {
        requireAuth();
    }
});

// Exportar para uso global
window.Auth = Auth;
window.requireAuth = requireAuth;
