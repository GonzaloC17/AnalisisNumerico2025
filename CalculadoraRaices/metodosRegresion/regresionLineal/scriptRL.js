// Script para Regresión Lineal
// Implementa el método de mínimos cuadrados para encontrar la mejor línea recta

class RegresionLineal {
  constructor() {
    this.geogebraApp = null;
    this.initializeEventListeners();
    this.initializeGeoGebra();
  }

  initializeEventListeners() {
    // Formulario
    document.getElementById('formulario').addEventListener('submit', (e) => {
      e.preventDefault();
      this.calcularRegresion();
    });

    // Botones de limpiar
    document.getElementById('clear-x').addEventListener('click', () => {
      document.getElementById('x-values').value = '';
    });

    document.getElementById('clear-y').addEventListener('click', () => {
      document.getElementById('y-values').value = '';
    });

    // Captura de resultados
    document.getElementById('capture-results').addEventListener('click', () => {
      this.capturarResultados();
    });
  }

  initializeGeoGebra() {
    const self = this;
    window.addEventListener('load', function() {
      const ggbApplet = new GGBApplet({
        "appName": "graphing",
        "width": 800,
        "height": 600,
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
          console.log('GeoGebra API cargada exitosamente para Regresión Lineal');
        }
      }, true);
      
      ggbApplet.inject('geogebra-container');
    });
  }

  parsearDatos(valor) {
    try {
      return valor.split(',').map(x => parseFloat(x.trim())).filter(x => !isNaN(x));
    } catch (error) {
      throw new Error('Error al parsear los datos. Asegúrate de separar los valores con comas.');
    }
  }

  calcularRegresion() {
    try {
      const xValues = this.parsearDatos(document.getElementById('x-values').value);
      const yValues = this.parsearDatos(document.getElementById('y-values').value);
      const precision = parseInt(document.getElementById('precision').value);
      const mostrarPasos = document.getElementById('mostrar-pasos').value === 'si';

      // Validaciones
      if (xValues.length === 0 || yValues.length === 0) {
        throw new Error('Los valores X e Y no pueden estar vacíos.');
      }

      if (xValues.length !== yValues.length) {
        throw new Error('El número de valores X debe ser igual al número de valores Y.');
      }

      if (xValues.length < 2) {
        throw new Error('Se necesitan al menos 2 puntos para realizar la regresión.');
      }

      const n = xValues.length;
      const resultado = this.metodoMinimosCuadrados(xValues, yValues, n, precision, mostrarPasos);
      
      this.mostrarResultados(resultado);
      this.graficarDatos(xValues, yValues, resultado);

    } catch (error) {
      this.mostrarError(error.message);
    }
  }

  metodoMinimosCuadrados(x, y, n, precision, mostrarPasos) {
    let salida = '';
    
    if (mostrarPasos) {
      salida += '=== MÉTODO DE MÍNIMOS CUADRADOS ===\n\n';
      salida += `Número de puntos: ${n}\n\n`;
      
      // Mostrar datos
      salida += 'Datos:\n';
      salida += 'X\tY\n';
      for (let i = 0; i < n; i++) {
        salida += `${x[i]}\t${y[i]}\n`;
      }
      salida += '\n';
    }

    // Calcular sumatorias
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
    const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);

    if (mostrarPasos) {
      salida += 'Sumatorias:\n';
      salida += `∑x = ${sumX.toFixed(precision)}\n`;
      salida += `∑y = ${sumY.toFixed(precision)}\n`;
      salida += `∑xy = ${sumXY.toFixed(precision)}\n`;
      salida += `∑x² = ${sumX2.toFixed(precision)}\n`;
      salida += `∑y² = ${sumY2.toFixed(precision)}\n\n`;
    }

    // Calcular pendiente (a)
    const denominador = n * sumX2 - sumX * sumX;
    if (Math.abs(denominador) < 1e-10) {
      throw new Error('Los datos no permiten calcular una regresión lineal (denominador muy pequeño).');
    }

    const a = (n * sumXY - sumX * sumY) / denominador;
    
    // Calcular intercepto (b)
    const b = (sumY - a * sumX) / n;

    if (mostrarPasos) {
      salida += 'Cálculo de coeficientes:\n';
      salida += `Denominador = n∑x² - (∑x)² = ${n} × ${sumX2.toFixed(precision)} - ${sumX.toFixed(precision)}² = ${denominador.toFixed(precision)}\n`;
      salida += `Pendiente (a) = (n∑xy - ∑x∑y) / denominador\n`;
      salida += `a = (${n} × ${sumXY.toFixed(precision)} - ${sumX.toFixed(precision)} × ${sumY.toFixed(precision)}) / ${denominador.toFixed(precision)}\n`;
      salida += `a = ${a.toFixed(precision)}\n\n`;
      salida += `Intercepto (b) = (∑y - a∑x) / n\n`;
      salida += `b = (${sumY.toFixed(precision)} - ${a.toFixed(precision)} × ${sumX.toFixed(precision)}) / ${n}\n`;
      salida += `b = ${b.toFixed(precision)}\n\n`;
    }

    // Calcular coeficiente de correlación
    const numeradorR = n * sumXY - sumX * sumY;
    const denominadorR = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
    const r = numeradorR / denominadorR;

    if (mostrarPasos) {
      salida += 'Coeficiente de correlación:\n';
      salida += `r = (n∑xy - ∑x∑y) / √[(n∑x² - (∑x)²)(n∑y² - (∑y)²)]\n`;
      salida += `r = ${numeradorR.toFixed(precision)} / √[${(n * sumX2 - sumX * sumX).toFixed(precision)} × ${(n * sumY2 - sumY * sumY).toFixed(precision)}]\n`;
      salida += `r = ${r.toFixed(precision)}\n\n`;
    }

    // Calcular R²
    const r2 = r * r;

    // Calcular valores predichos y errores
    const yPred = x.map(xi => a * xi + b);
    const errores = y.map((yi, i) => yi - yPred[i]);
    const sumaErroresCuadrados = errores.reduce((sum, error) => sum + error * error, 0);

    if (mostrarPasos) {
      salida += 'Valores predichos y errores:\n';
      salida += 'X\tY\tY_pred\tError\n';
      for (let i = 0; i < n; i++) {
        salida += `${x[i]}\t${y[i]}\t${yPred[i].toFixed(precision)}\t${errores[i].toFixed(precision)}\n`;
      }
      salida += '\n';
      salida += `Suma de errores al cuadrado: ${sumaErroresCuadrados.toFixed(precision)}\n\n`;
    }

    // Resultados finales
    salida += '=== RESULTADOS FINALES ===\n\n';
    salida += `Ecuación de la línea: y = ${a.toFixed(precision)}x + ${b.toFixed(precision)}\n`;
    salida += `Pendiente (a): ${a.toFixed(precision)}\n`;
    salida += `Intercepto (b): ${b.toFixed(precision)}\n`;
    salida += `Coeficiente de correlación (r): ${r.toFixed(precision)}\n`;
    salida += `Coeficiente de determinación (R²): ${r2.toFixed(precision)}\n`;
    salida += `Suma de errores al cuadrado: ${sumaErroresCuadrados.toFixed(precision)}\n\n`;

    // Interpretación del coeficiente de correlación
    salida += 'Interpretación del coeficiente de correlación:\n';
    if (Math.abs(r) >= 0.9) {
      salida += 'Correlación muy fuerte\n';
    } else if (Math.abs(r) >= 0.7) {
      salida += 'Correlación fuerte\n';
    } else if (Math.abs(r) >= 0.5) {
      salida += 'Correlación moderada\n';
    } else if (Math.abs(r) >= 0.3) {
      salida += 'Correlación débil\n';
    } else {
      salida += 'Correlación muy débil\n';
    }

    if (r > 0) {
      salida += 'Correlación positiva (aumenta X, aumenta Y)\n';
    } else {
      salida += 'Correlación negativa (aumenta X, disminuye Y)\n';
    }

    return {
      a: a,
      b: b,
      r: r,
      r2: r2,
      sumaErroresCuadrados: sumaErroresCuadrados,
      x: x,
      y: y,
      yPred: yPred,
      errores: errores,
      salida: salida
    };
  }

  mostrarResultados(resultado) {
    document.getElementById('salida').innerHTML = resultado.salida.replace(/\n/g, '<br>');
  }

  mostrarError(mensaje) {
    document.getElementById('salida').innerHTML = `<span style="color: red;">Error: ${mensaje}</span>`;
  }

  graficarDatos(x, y, resultado) {
    if (!this.geogebraApp) {
      console.log("GeoGebra aún no está listo, reintentando...");
      setTimeout(() => this.graficarDatos(x, y, resultado), 500);
      return;
    }

    try {
      // Limpiar gráfico anterior
      this.geogebraApp.evalCommand('DeleteAll()');

      // Crear lista de puntos
      const puntosX = x.join(',');
      const puntosY = y.join(',');
      
      // Crear puntos en el gráfico
      this.geogebraApp.evalCommand(`puntosX = {${puntosX}}`);
      this.geogebraApp.evalCommand(`puntosY = {${puntosY}}`);
      this.geogebraApp.evalCommand('puntos = Zip((puntosX(i), puntosY(i)), i, 1, Length(puntosX))');
      
      // Mostrar puntos
      this.geogebraApp.evalCommand('SetColor(puntos, 255, 0, 0)');
      this.geogebraApp.evalCommand('SetPointSize(puntos, 5)');

      // Crear línea de regresión
      const a = resultado.a.toFixed(6);
      const b = resultado.b.toFixed(6);
      this.geogebraApp.evalCommand(`f(x) = ${a} * x + ${b}`);
      this.geogebraApp.evalCommand('SetColor(f, 0, 0, 255)');
      this.geogebraApp.evalCommand('SetLineThickness(f, 3)');

      // Ajustar vista
      const minX = Math.min(...x) - 1;
      const maxX = Math.max(...x) + 1;
      const minY = Math.min(...y) - 1;
      const maxY = Math.max(...y) + 1;
      
      this.geogebraApp.evalCommand(`SetVisibleInView(1, 1, 1, 1)`);
      this.geogebraApp.evalCommand(`ZoomIn(${minX}, ${minY}, ${maxX}, ${maxY})`);

      // Agregar etiquetas
      this.geogebraApp.evalCommand('texto1 = "Puntos de datos"');
      this.geogebraApp.evalCommand('texto2 = "Línea de regresión"');
      this.geogebraApp.evalCommand('texto3 = "y = ' + a + 'x + ' + b + '"');
      this.geogebraApp.evalCommand('texto4 = "r = ' + resultado.r.toFixed(4) + '"');
      this.geogebraApp.evalCommand('texto5 = "R² = ' + resultado.r2.toFixed(4) + '"');

    } catch (error) {
      console.error('Error al graficar:', error);
    }
  }

  capturarResultados() {
    const elemento = document.getElementById('salida');
    
    html2canvas(elemento, {
      backgroundColor: document.documentElement.classList.contains('dark') ? '#374151' : '#f3f4f6',
      scale: 2
    }).then(canvas => {
      const link = document.createElement('a');
      link.download = 'regresion_lineal_resultados.png';
      link.href = canvas.toDataURL();
      link.click();
    }).catch(error => {
      console.error('Error al capturar:', error);
      alert('Error al capturar los resultados');
    });
  }
}

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function() {
    new RegresionLineal();
  });
} else {
  // El DOM ya está listo, inicializar inmediatamente
  new RegresionLineal();
}

