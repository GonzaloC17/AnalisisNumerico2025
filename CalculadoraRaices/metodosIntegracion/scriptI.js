// Script principal para Integración Numérica
// Unidad 4: Métodos de Integración Numérica

class CalculadoraIntegracion {
    constructor() {
        this.geogebraApp = null;
        this.initializeEventListeners();
        this.initializeGeoGebra();
    }

    initializeEventListeners() {
        const form = document.getElementById('integration-form');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleSubmit(e);
            });
        }
        
        // También agregar listener al botón de calcular por si acaso
        const calcularBtn = document.querySelector('button[type="submit"]');
        if (calcularBtn) {
            calcularBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleSubmit(e);
            });
        }

        // Validación en tiempo real
        const metodoSelect = document.getElementById('metodo');
        const subintervalosInput = document.getElementById('subintervalos');
        
        if (metodoSelect && subintervalosInput) {
            metodoSelect.addEventListener('change', () => this.updateSubintervalosValidation());
            subintervalosInput.addEventListener('input', () => this.updateSubintervalosValidation());
        }
    }

    initializeGeoGebra() {
        const self = this;
        window.addEventListener('load', function() {
            const ggbApplet = new GGBApplet({
                "appName": "graphing",
                "width": 800,
                "height": 400,
                "showToolBar": false,
                "showAlgebraInput": false,
                "showMenuBar": false,
                "showToolBarHelp": false,
                "showResetIcon": false,
                "enableLabelDrags": false,
                "enableShiftDragZoom": true,
                "enableRightClick": false,
                "showZoomButtons": false,
                "appletOnLoad": function(api) {
                    self.geogebraApp = api;
                    console.log('GeoGebra API cargada exitosamente para Integración Numérica');
                }
            }, true);
            
            ggbApplet.inject('geogebra-container');
        });
    }

    updateSubintervalosValidation() {
        const metodo = document.getElementById('metodo').value;
        const subintervalosInput = document.getElementById('subintervalos');
        const helpText = subintervalosInput.nextElementSibling;

        if (!metodo) {
            helpText.textContent = 'Selecciona un método para ver las restricciones.';
            return;
        }

        switch (metodo) {
            case 'simpson-13-multiple':
                helpText.textContent = 'Para Simpson 1/3 múltiple, n debe ser par (2, 4, 6, 8, ...).';
                break;
            case 'simpson-38':
                helpText.textContent = 'Para Simpson 3/8, n debe ser múltiplo de 3 (3, 6, 9, 12, ...).';
                break;
            case 'simpson-combinado':
                helpText.textContent = 'Para Simpson combinado, n debe ser impar (3, 5, 7, 9, ...).';
                break;
            default:
                helpText.textContent = 'Cualquier valor entero positivo es válido.';
        }
    }

    handleSubmit(event) {
        const funcion = document.getElementById('funcion').value.trim();
        const xi = parseFloat(document.getElementById('xi').value);
        const xd = parseFloat(document.getElementById('xd').value);
        const subintervalos = parseInt(document.getElementById('subintervalos').value);
        const metodo = document.getElementById('metodo').value;
        
        const data = {
            funcion: funcion,
            xi: xi,
            xd: xd,
            subintervalos: subintervalos,
            metodo: metodo
        };

        // Validaciones
        if (!this.validateInput(data)) {
            return;
        }

        // Calcular resultado
        const resultado = this.calcularIntegral(data);
        
        // Mostrar resultado
        this.mostrarResultado(resultado, data);
        
        // Actualizar gráfica
        this.actualizarGrafica(data);
    }

    validateInput(data) {
        // Validar función
        if (!Utils.validateFunction(data.funcion)) {
            this.mostrarError('La función ingresada no es válida. Verifica la sintaxis.');
            return false;
        }

        // Validar intervalo
        if (data.xi >= data.xd) {
            this.mostrarError('El extremo izquierdo (Xi) debe ser menor que el extremo derecho (Xd).');
            return false;
        }

        // Validar subintervalos
        if (data.subintervalos < 1) {
            this.mostrarError('La cantidad de subintervalos debe ser mayor a 0.');
            return false;
        }

        // Validaciones específicas por método
        switch (data.metodo) {
            case 'simpson-13-multiple':
                if (data.subintervalos % 2 !== 0) {
                    this.mostrarError('Para Simpson 1/3 múltiple, la cantidad de subintervalos debe ser par.');
                    return false;
                }
                break;
            case 'simpson-38':
                if (data.subintervalos % 3 !== 0) {
                    this.mostrarError('Para Simpson 3/8, la cantidad de subintervalos debe ser múltiplo de 3.');
                    return false;
                }
                break;
            case 'simpson-combinado':
                if (data.subintervalos % 2 === 0) {
                    this.mostrarError('Para Simpson combinado, la cantidad de subintervalos debe ser impar.');
                    return false;
                }
                break;
        }

        return true;
    }

    calcularIntegral(data) {
        const { funcion, xi, xd, subintervalos, metodo } = data;
        
        try {
            let resultado;
            
            switch (metodo) {
                case 'trapecios-simple':
                    resultado = this.trapeciosSimple(funcion, xi, xd);
                    break;
                case 'trapecios-multiple':
                    resultado = this.trapeciosMultiple(funcion, xi, xd, subintervalos);
                    break;
                case 'simpson-13-simple':
                    resultado = this.simpson13Simple(funcion, xi, xd);
                    break;
                case 'simpson-13-multiple':
                    resultado = this.simpson13Multiple(funcion, xi, xd, subintervalos);
                    break;
                case 'simpson-38':
                    resultado = this.simpson38(funcion, xi, xd);
                    break;
                case 'simpson-combinado':
                    resultado = this.simpsonCombinado(funcion, xi, xd, subintervalos);
                    break;
                default:
                    throw new Error('Método no válido');
            }

            return {
                success: true,
                resultado: resultado,
                metodo: metodo,
                datos: data
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Método de Trapecios Simple
    trapeciosSimple(funcion, xi, xd) {
        const h = xd - xi;
        const fx1 = this.evaluarFuncion(funcion, xi);
        const fx2 = this.evaluarFuncion(funcion, xd);
        
        return (h / 2) * (fx1 + fx2);
    }

    // Método de Trapecios Múltiple
    trapeciosMultiple(funcion, xi, xd, n) {
        const h = (xd - xi) / n;
        let sum = 0;
        
        // Suma de puntos intermedios
        for (let i = 1; i < n; i++) {
            const x = xi + h * i;
            sum += this.evaluarFuncion(funcion, x);
        }
        
        const fx1 = this.evaluarFuncion(funcion, xi);
        const fx2 = this.evaluarFuncion(funcion, xd);
        
        return (h / 2) * (fx1 + 2 * sum + fx2);
    }

    // Método de Simpson 1/3 Simple
    simpson13Simple(funcion, xi, xd) {
        const h = (xd - xi) / 2;
        const fx1 = this.evaluarFuncion(funcion, xi);
        const fx2 = this.evaluarFuncion(funcion, xi + h);
        const fx3 = this.evaluarFuncion(funcion, xd);
        
        return (h / 3) * (fx1 + 4 * fx2 + fx3);
    }

    // Método de Simpson 1/3 Múltiple
    simpson13Multiple(funcion, xi, xd, n) {
        const h = (xd - xi) / n;
        let sumImpares = 0;
        let sumPares = 0;
        
        // Suma de puntos impares (coeficiente 4)
        for (let i = 1; i < n; i += 2) {
            const x = xi + h * i;
            sumImpares += this.evaluarFuncion(funcion, x);
        }
        
        // Suma de puntos pares (coeficiente 2)
        for (let i = 2; i < n; i += 2) {
            const x = xi + h * i;
            sumPares += this.evaluarFuncion(funcion, x);
        }
        
        const fx1 = this.evaluarFuncion(funcion, xi);
        const fx2 = this.evaluarFuncion(funcion, xd);
        
        return (h / 3) * (fx1 + 4 * sumImpares + 2 * sumPares + fx2);
    }

    // Método de Simpson 3/8
    simpson38(funcion, xi, xd) {
        const h = (xd - xi) / 3;
        const fx1 = this.evaluarFuncion(funcion, xi);
        const fx2 = this.evaluarFuncion(funcion, xi + h);
        const fx3 = this.evaluarFuncion(funcion, xi + 2 * h);
        const fx4 = this.evaluarFuncion(funcion, xd);
        
        return (3 * h / 8) * (fx1 + 3 * fx2 + 3 * fx3 + fx4);
    }

    // Método de Simpson Combinado (1/3 Múltiple + 3/8)
    simpsonCombinado(funcion, xi, xd, n) {
        const h = (xd - xi) / n;
        let resultado = 0;
        let simpson38Hecho = false;
        
        // Si n es impar, aplicar Simpson 3/8 a los últimos 3 subintervalos
        if (n % 2 !== 0 && !simpson38Hecho) {
            const nuevoXi = xi + h * (n - 3);
            resultado = this.simpson38(funcion, nuevoXi, xd);
            n = n - 3;
            xd = nuevoXi;
            simpson38Hecho = true;
        }
        
        // Aplicar Simpson 1/3 múltiple al resto
        if (n > 0) {
            const hAjustado = (xd - xi) / n;
            let sumImpares = 0;
            let sumPares = 0;
            
            for (let i = 1; i < n; i += 2) {
                const x = xi + hAjustado * i;
                sumImpares += this.evaluarFuncion(funcion, x);
            }
            
            for (let i = 2; i < n; i += 2) {
                const x = xi + hAjustado * i;
                sumPares += this.evaluarFuncion(funcion, x);
            }
            
            const fx1 = this.evaluarFuncion(funcion, xi);
            const fx2 = this.evaluarFuncion(funcion, xd);
            
            resultado += (hAjustado / 3) * (fx1 + 4 * sumImpares + 2 * sumPares + fx2);
        }
        
        return resultado;
    }

    evaluarFuncion(funcion, x) {
        try {
            // Convertir log() a Math.log() y ^ a ** para la evaluación
            let funcionConvertida = funcion.replace(/log\(/g, 'Math.log(');
            funcionConvertida = funcionConvertida.replace(/\^/g, '**');
            // Crear función segura
            const func = new Function('x', `with (Math) { return ${funcionConvertida}; }`);
            const resultado = func(x);
            
            if (typeof resultado !== 'number' || !isFinite(resultado)) {
                throw new Error('La función no es válida en el punto x = ' + x);
            }
            
            return resultado;
        } catch (error) {
            throw new Error('Error al evaluar la función: ' + error.message);
        }
    }

    mostrarResultado(resultado, datos) {
        const container = document.getElementById('resultado-container');
        
        if (!resultado.success) {
            this.mostrarError(resultado.error);
            return;
        }

        const metodoNombres = {
            'trapecios-simple': 'Trapecios Simple',
            'trapecios-multiple': 'Trapecios Múltiple',
            'simpson-13-simple': 'Simpson 1/3 Simple',
            'simpson-13-multiple': 'Simpson 1/3 Múltiple',
            'simpson-38': 'Simpson 3/8',
            'simpson-combinado': 'Simpson Combinado'
        };

        container.innerHTML = `
            <div class="space-y-4">
                <div class="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                    <h4 class="font-semibold text-green-800 dark:text-green-200 mb-2">Resultado del Cálculo</h4>
                    <div class="text-2xl font-bold text-green-600 dark:text-green-400">
                        Área ≈ ${Utils.formatNumber(resultado.resultado, 8)}
                    </div>
                </div>
                
                <div class="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <h4 class="font-semibold text-gray-800 dark:text-gray-200 mb-3">Detalles del Cálculo</h4>
                    <div class="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <span class="text-gray-600 dark:text-gray-300">Método:</span>
                            <span class="font-medium text-gray-800 dark:text-gray-200">${metodoNombres[datos.metodo]}</span>
                        </div>
                        <div>
                            <span class="text-gray-600 dark:text-gray-300">Función:</span>
                            <span class="font-medium text-gray-800 dark:text-gray-200">f(x) = ${datos.funcion}</span>
                        </div>
                        <div>
                            <span class="text-gray-600 dark:text-gray-300">Intervalo:</span>
                            <span class="font-medium text-gray-800 dark:text-gray-200">[${datos.xi}, ${datos.xd}]</span>
                        </div>
                        <div>
                            <span class="text-gray-600 dark:text-gray-300">Subintervalos:</span>
                            <span class="font-medium text-gray-800 dark:text-gray-200">${datos.subintervalos}</span>
                        </div>
                    </div>
                </div>
                
                <div class="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    <h4 class="font-semibold text-blue-800 dark:text-blue-200 mb-2">Información del Método</h4>
                    <p class="text-sm text-blue-600 dark:text-blue-300">
                        ${this.getMethodDescription(datos.metodo)}
                    </p>
                </div>
            </div>
        `;
    }

    getMethodDescription(metodo) {
        const descriptions = {
            'trapecios-simple': 'Aproxima el área bajo la curva usando un solo trapecio. Fórmula: (h/2) * [f(a) + f(b)]',
            'trapecios-multiple': 'Divide el intervalo en n subintervalos y aplica la regla del trapecio a cada uno. Error: O(h²)',
            'simpson-13-simple': 'Aproxima la función con una parábola usando 3 puntos. Fórmula: (h/3) * [f(a) + 4f((a+b)/2) + f(b)]',
            'simpson-13-multiple': 'Aplica Simpson 1/3 a múltiples subintervalos. Requiere n par. Error: O(h⁴)',
            'simpson-38': 'Aproxima la función con un polinomio cúbico usando 4 puntos. Requiere n múltiplo de 3. Error: O(h⁴)',
            'simpson-combinado': 'Combina Simpson 1/3 múltiple con Simpson 3/8 para manejar intervalos impares. Máxima precisión.'
        };
        return descriptions[metodo] || 'Método de integración numérica.';
    }

    mostrarError(mensaje) {
        const container = document.getElementById('resultado-container');
        container.innerHTML = `
            <div class="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
                <div class="flex items-center gap-2 mb-2">
                    <svg class="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
                    </svg>
                    <h4 class="font-semibold text-red-800 dark:text-red-200">Error</h4>
                </div>
                <p class="text-red-600 dark:text-red-300">${mensaje}</p>
            </div>
        `;
    }

    actualizarGrafica(datos) {
        if (!this.geogebraApp) {
            console.log("GeoGebra aún no está listo, reintentando...");
            setTimeout(() => this.actualizarGrafica(datos), 500);
            return;
        }

        try {
            // Limpiar gráfica anterior
            this.geogebraApp.evalCommand('DeleteAll()');
            
            // Definir la función
            const funcionGeoGebra = Utils.convertToGeoGebra(datos.funcion);
            this.geogebraApp.evalCommand(`f(x) = ${funcionGeoGebra}`);
            
            // Crear puntos para visualizar el método
            this.crearPuntosMetodo(datos);
            
            // Configurar vista
            this.geogebraApp.evalCommand(`SetActiveView(1)`);
            this.geogebraApp.evalCommand(`ZoomIn(${datos.xi - 1}, ${datos.xd + 1})`);
            
        } catch (error) {
            console.error('Error al actualizar la gráfica:', error);
        }
    }

    crearPuntosMetodo(datos) {
        const { funcion, xi, xd, subintervalos, metodo } = datos;
        const h = (xd - xi) / subintervalos;
        
        // Crear puntos de evaluación
        for (let i = 0; i <= subintervalos; i++) {
            const x = xi + i * h;
            const y = this.evaluarFuncion(funcion, x);
            this.geogebraApp.evalCommand(`P${i} = (${x}, ${y})`);
        }
        
        // Crear líneas según el método
        switch (metodo) {
            case 'trapecios-simple':
            case 'trapecios-multiple':
                this.crearTrapecios(xi, xd, subintervalos);
                break;
            case 'simpson-13-simple':
            case 'simpson-13-multiple':
                this.crearSimpson13(xi, xd, subintervalos);
                break;
            case 'simpson-38':
                this.crearSimpson38(xi, xd);
                break;
            case 'simpson-combinado':
                this.crearSimpsonCombinado(xi, xd, subintervalos);
                break;
        }
    }

    crearTrapecios(xi, xd, n) {
        const h = (xd - xi) / n;
        for (let i = 0; i < n; i++) {
            const x1 = xi + i * h;
            const x2 = xi + (i + 1) * h;
            this.geogebraApp.evalCommand(`Segment((${x1}, 0), (${x2}, 0))`);
            this.geogebraApp.evalCommand(`Segment(P${i}, P${i + 1})`);
        }
    }

    crearSimpson13(xi, xd, n) {
        const h = (xd - xi) / n;
        for (let i = 0; i < n; i += 2) {
            if (i + 2 <= n) {
                const x1 = xi + i * h;
                const x2 = xi + (i + 1) * h;
                const x3 = xi + (i + 2) * h;
                this.geogebraApp.evalCommand(`Parabola(P${i}, P${i + 1}, P${i + 2})`);
            }
        }
    }

    crearSimpson38(xi, xd) {
        this.geogebraApp.evalCommand(`Cubic(P0, P1, P2, P3)`);
    }

    crearSimpsonCombinado(xi, xd, n) {
        // Implementar visualización para Simpson combinado
        if (n % 2 !== 0) {
            // Aplicar Simpson 3/8 a los últimos 3 puntos
            this.geogebraApp.evalCommand(`Cubic(P${n-3}, P${n-2}, P${n-1}, P${n})`);
            // Aplicar Simpson 1/3 al resto
            for (let i = 0; i < n - 3; i += 2) {
                if (i + 2 < n - 3) {
                    this.geogebraApp.evalCommand(`Parabola(P${i}, P${i + 1}, P${i + 2})`);
                }
            }
        }
    }
}


// Funciones de utilidad globales
function toggleModoOscuro() {
    const html = document.documentElement;
    const modoIcon = document.getElementById('modo-icon');
    html.classList.toggle('dark');
    localStorage.setItem('modoOscuro', html.classList.contains('dark'));
    
    // Cambiar icono
    if (html.classList.contains('dark')) {
        modoIcon.innerHTML = '<path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"/>';
    } else {
        modoIcon.innerHTML = '<path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"/>';
    }
}

// Inicializar cuando se carga la página
document.addEventListener('DOMContentLoaded', function() {
    new CalculadoraIntegracion();
    
    // Configurar icono de modo oscuro
    const modoIcon = document.getElementById('modo-icon');
    if (localStorage.getItem('modoOscuro') === 'true') {
        modoIcon.innerHTML = '<path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"/>';
    } else {
        modoIcon.innerHTML = '<path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"/>';
    }
});
