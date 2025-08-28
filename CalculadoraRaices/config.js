// Configuración centralizada para la Calculadora Numérica
const CONFIG = {
  // Configuración de GeoGebra
  geogebra: {
    appName: "graphing",
    width: 800,
    height: 600,
    options: {
      showToolBar: false,
      showAlgebraInput: false,
      showMenuBar: false,
      showToolBarHelp: false,
      showResetIcon: false,
      enableLabelDrags: false,
      enableShiftDragZoom: true,
      enableRightClick: false,
      showZoomButtons: false
    }
  },
  
  // Configuración de métodos
  methods: {
    defaultTolerance: 0.0001,
    defaultIterations: 100,
    maxIterations: 1000
  },
  
  // Configuración de UI
  ui: {
    animationDuration: 300,
    hoverScale: 1.02,
    hoverTranslate: -2
  },
  
  // Configuración de funciones matemáticas
  math: {
    supportedFunctions: [
      'sin', 'cos', 'tan', 'asin', 'acos', 'atan',
      'sinh', 'cosh', 'tanh', 'asinh', 'acosh', 'atanh',
      'exp', 'log', 'ln', 'sqrt', 'abs', 'pow'
    ],
    constants: {
      PI: Math.PI,
      E: Math.E
    }
  }
};

// Funciones de utilidad
const Utils = {
  // Formatear número para mostrar
  formatNumber: (num, decimals = 6) => {
    return Number(num).toFixed(decimals);
  },
  
  // Validar función matemática
  validateFunction: (funcStr) => {
    try {
      const testFn = new Function('x', `with (Math) { return ${funcStr}; }`);
      const testValue = testFn(1);
      return typeof testValue === 'number' && isFinite(testValue);
    } catch {
      return false;
    }
  },
  
  // Convertir función JavaScript a GeoGebra
  convertToGeoGebra: (funcJS) => {
    return funcJS
      .replace(/Math\.pow\(([^,]+),\s*([^)]+)\)/g, '($1)^($2)')
      .replace(/Math\.sin\(/g, 'sin(')
      .replace(/Math\.cos\(/g, 'cos(')
      .replace(/Math\.tan\(/g, 'tan(')
      .replace(/Math\.log\(/g, 'ln(')
      .replace(/Math\.exp\(/g, 'e^(')
      .replace(/Math\.abs\(/g, 'abs(')
      .replace(/Math\.sqrt\(/g, 'sqrt(')
      .replace(/Math\.PI/g, 'π')
      .replace(/Math\.E/g, 'e');
  },
  
  // Manejar errores de manera consistente
  handleError: (error, context = '') => {
    console.error(`Error en ${context}:`, error);
    return {
      success: false,
      error: error.message,
      context
    };
  }
};

// Exportar para uso en otros archivos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { CONFIG, Utils };
}
