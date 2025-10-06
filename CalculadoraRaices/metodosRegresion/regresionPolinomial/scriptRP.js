// Script para Regresión Polinomial
// Implementa el método de mínimos cuadrados para encontrar el mejor polinomio de grado n

class RegresionPolinomial {
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
    const parameters = {
      "id": "geogebra-container",
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
      "showZoomButtons": false
    };

    this.geogebraApp = new GGBApplet(parameters, true);
    this.geogebraApp.inject('geogebra-container');
  }

  parsearDatos(valor) {
    try {
      return valor.split(',').map(x => parseFloat(x.trim())).filter(x => !isNaN(x));
    } catch (error) {
      throw new Error('Error al parsear los datos. Asegúrate de separar los valores con comas.');
    }
  }

  generarMatrizPolinomial(grado, puntosCargados, precision, mostrarPasos, salida) {
    const dimension = grado + 1;
    const matriz = [];
    
    // Inicializar matriz con ceros
    for (let i = 0; i < dimension; i++) {
      matriz[i] = [];
      for (let j = 0; j < dimension + 1; j++) {
        matriz[i][j] = 0;
      }
    }

    if (mostrarPasos) {
      salida += `Generando matriz polinomial de dimensión ${dimension}x${dimension + 1}:\n`;
    }

    for (let punto of puntosCargados) {
      const x = punto[0];
      const y = punto[1];
      
      for (let fila = 0; fila < dimension; fila++) {
        for (let col = 0; col < dimension; col++) {
          matriz[fila][col] += Math.pow(x, fila + col);
        }
        matriz[fila][dimension] += y * Math.pow(x, fila);
      }
    }

    if (mostrarPasos) {
      salida += 'Matriz polinomial generada:\n';
      for (let i = 0; i < dimension; i++) {
        salida += '[';
        for (let j = 0; j < dimension + 1; j++) {
          salida += matriz[i][j].toFixed(precision);
          if (j < dimension) salida += ', ';
        }
        salida += ']\n';
      }
      salida += '\n';
    }

    return matriz;
  }

  calcularRegresion() {
    try {
      const xValues = this.parsearDatos(document.getElementById('x-values').value);
      const yValues = this.parsearDatos(document.getElementById('y-values').value);
      const grado = parseInt(document.getElementById('grado').value);
      const precision = parseInt(document.getElementById('precision').value);
      const mostrarPasos = document.getElementById('mostrar-pasos').value === 'si';

      // Validaciones
      if (xValues.length === 0 || yValues.length === 0) {
        throw new Error('Los valores X e Y no pueden estar vacíos.');
      }

      if (xValues.length !== yValues.length) {
        throw new Error('El número de valores X debe ser igual al número de valores Y.');
      }

      if (xValues.length < grado + 1) {
        throw new Error(`Se necesitan al menos ${grado + 1} puntos para un polinomio de grado ${grado}.`);
      }

      const n = xValues.length;
      const resultado = this.metodoMinimosCuadrados(xValues, yValues, n, grado, precision, mostrarPasos);
      
      this.mostrarResultados(resultado);
      this.graficarDatos(xValues, yValues, resultado);

    } catch (error) {
      this.mostrarError(error.message);
    }
  }

  metodoMinimosCuadrados(x, y, n, grado, precision, mostrarPasos) {
    let salida = '';
    
    if (mostrarPasos) {
      salida += '=== MÉTODO DE MÍNIMOS CUADRADOS POLINOMIAL ===\n\n';
      salida += `Número de puntos: ${n}\n`;
      salida += `Grado del polinomio: ${grado}\n\n`;
      
      // Mostrar datos
      salida += 'Datos:\n';
      salida += 'X\tY\n';
      for (let i = 0; i < n; i++) {
        salida += `${x[i]}\t${y[i]}\n`;
      }
      salida += '\n';
    }

    // Generar matriz polinomial según el pseudocódigo de la imagen
    const puntosCargados = x.map((xi, i) => [xi, y[i]]);
    const matrizPolinomial = this.generarMatrizPolinomial(grado, puntosCargados, precision, mostrarPasos, salida);

    // Resolver sistema usando Gauss-Jordan
    const coeficientes = this.resolverSistemaGaussJordan(matrizPolinomial, precision, mostrarPasos, salida);
    
    // Calcular valores predichos
    const yPred = x.map(xi => {
      let resultado = 0;
      for (let i = 0; i <= grado; i++) {
        resultado += coeficientes[i] * Math.pow(xi, i);
      }
      return resultado;
    });

    // Calcular errores y R²
    const errores = y.map((yi, i) => yi - yPred[i]);
    const sumaErroresCuadrados = errores.reduce((sum, error) => sum + error * error, 0);
    
    // Calcular R²
    const yPromedio = y.reduce((sum, yi) => sum + yi, 0) / n;
    const sumaTotalCuadrados = y.reduce((sum, yi) => sum + Math.pow(yi - yPromedio, 2), 0);
    const r2 = 1 - (sumaErroresCuadrados / sumaTotalCuadrados);

    // Calcular coeficiente de correlación (r) según el pseudocódigo de la imagen
    const r = this.calcularCoeficienteCorrelacion(puntosCargados, coeficientes, precision, mostrarPasos, salida);

    // Construir salida final
    let salidaFinal = salida;
    
    if (mostrarPasos) {
      salidaFinal += 'Valores predichos y errores:\n';
      salidaFinal += 'X\tY\tY_pred\tError\n';
      for (let i = 0; i < n; i++) {
        salidaFinal += `${x[i]}\t${y[i]}\t${yPred[i].toFixed(precision)}\t${errores[i].toFixed(precision)}\n`;
      }
      salidaFinal += '\n';
      salidaFinal += `Suma de errores al cuadrado: ${sumaErroresCuadrados.toFixed(precision)}\n\n`;
    }

    // Resultados finales
    salidaFinal += '=== RESULTADOS FINALES ===\n\n';
    
    // Construir ecuación del polinomio según el pseudocódigo de la imagen
    const ecuacion = this.construirFuncionPolinomial(coeficientes, precision);

    salidaFinal += `Ecuación del polinomio: ${ecuacion}\n\n`;
    
    salidaFinal += 'Coeficientes:\n';
    for (let i = 0; i <= grado; i++) {
      salidaFinal += `a${i} = ${coeficientes[i].toFixed(precision)}\n`;
    }
    salidaFinal += '\n';
    
    salidaFinal += `Coeficiente de determinación (R²): ${r2.toFixed(precision)}\n`;
    salidaFinal += `Coeficiente de correlación (r): ${r.toFixed(precision)}\n`;
    salidaFinal += `Suma de errores al cuadrado: ${sumaErroresCuadrados.toFixed(precision)}\n\n`;

    // Interpretación de R²
    salidaFinal += 'Interpretación del R²:\n';
    if (r2 >= 0.95) {
      salidaFinal += 'Excelente ajuste (R² ≥ 0.95)\n';
    } else if (r2 >= 0.90) {
      salidaFinal += 'Muy buen ajuste (R² ≥ 0.90)\n';
    } else if (r2 >= 0.80) {
      salidaFinal += 'Buen ajuste (R² ≥ 0.80)\n';
    } else if (r2 >= 0.70) {
      salidaFinal += 'Ajuste moderado (R² ≥ 0.70)\n';
    } else {
      salidaFinal += 'Ajuste pobre (R² < 0.70)\n';
    }

    return {
      coeficientes: coeficientes,
      r2: r2,
      r: r,
      sumaErroresCuadrados: sumaErroresCuadrados,
      x: x,
      y: y,
      yPred: yPred,
      errores: errores,
      grado: grado,
      ecuacion: ecuacion,
      salida: salidaFinal
    };
  }

  // Método de resolución con Gauss-Jordan según el pseudocódigo de la imagen
  resolverSistemaGaussJordan(matriz, precision, mostrarPasos, salida) {
    const n = matriz.length;
    
    if (mostrarPasos) {
      salida += '=== RESOLUCIÓN CON GAUSS-JORDAN ===\n\n';
      salida += 'Matriz inicial:\n';
      for (let i = 0; i < n; i++) {
        salida += '[';
        for (let j = 0; j <= n; j++) {
          salida += matriz[i][j].toFixed(precision);
          if (j < n) salida += ', ';
        }
        salida += ']\n';
      }
      salida += '\n';
    }

    // Algoritmo Gauss-Jordan según el pseudocódigo de la imagen
    for (let i = 0; i < n; i++) {
      // Paso 1: Obtener coeficiente diagonal principal
      let coeficienteDiagonal = matriz[i][i];
      
      // Verificar si el coeficiente diagonal es cero
      if (Math.abs(coeficienteDiagonal) < 1e-12) {
        // Buscar una fila para intercambiar
        let filaIntercambio = -1;
        for (let k = i + 1; k < n; k++) {
          if (Math.abs(matriz[k][i]) > 1e-12) {
            filaIntercambio = k;
            break;
          }
        }
        
        if (filaIntercambio === -1) {
          throw new Error("Sistema singular: no se puede resolver");
        }
        
        // Intercambiar filas
        [matriz[i], matriz[filaIntercambio]] = [matriz[filaIntercambio], matriz[i]];
        coeficienteDiagonal = matriz[i][i];
        
        if (mostrarPasos) {
          salida += `Intercambio de fila ${i+1} con fila ${filaIntercambio+1}\n`;
        }
      }
      
      // Paso 2: Dividir toda la fila por el coeficiente diagonal
      for (let j = 0; j <= n; j++) {
        matriz[i][j] = matriz[i][j] / coeficienteDiagonal;
      }
      
      if (mostrarPasos) {
        salida += `Dividir fila ${i+1} por ${coeficienteDiagonal.toFixed(precision)}\n`;
      }
      
      // Paso 3: Hacer ceros los demás elementos de la columna i
      for (let k = 0; k < n; k++) {
        if (k !== i) {
          let coeficienteCero = matriz[k][i];
          
          // Aplicar las fórmulas de la imagen
          for (let j = 0; j <= n; j++) {
            matriz[k][j] = matriz[k][j] - (coeficienteCero * matriz[i][j]);
          }
          
          if (mostrarPasos) {
            salida += `Fila ${k+1} = Fila ${k+1} - (${coeficienteCero.toFixed(precision)} × Fila ${i+1})\n`;
          }
        }
      }
    }
    
    // Paso 4: Extraer la solución (términos independientes)
    let solucion = [];
    for (let i = 0; i < n; i++) {
      solucion[i] = matriz[i][n];
    }
    
    if (mostrarPasos) {
      salida += '\nMatriz final (forma escalonada):\n';
      for (let i = 0; i < n; i++) {
        salida += '[';
        for (let j = 0; j <= n; j++) {
          salida += matriz[i][j].toFixed(precision);
          if (j < n) salida += ', ';
        }
        salida += ']\n';
      }
      salida += '\n';
      
      salida += 'Coeficientes calculados:\n';
      for (let i = 0; i < n; i++) {
        salida += `a${i} = ${solucion[i].toFixed(precision)}\n`;
      }
      salida += '\n';
    }
    
    return solucion;
  }

  // Método para construir la función polinomial según el pseudocódigo de la imagen
  construirFuncionPolinomial(vectorResultado, precision) {
    let funcion = '';
    let signo = '';
    
    // Iterar desde el grado más alto hacia el más bajo
    for (let i = vectorResultado.length - 1; i >= 0; i--) {
      const ai = Math.round(vectorResultado[i] * Math.pow(10, precision)) / Math.pow(10, precision);
      
      if (i === vectorResultado.length - 1 && ai !== 0) {
        // Término de mayor grado
        if (i > 1) {
          funcion = `${ai}x^${i}`;
        } else if (i === 1) {
          funcion = `${ai}x`;
        } else {
          funcion = `${ai}`;
        }
      } else if (i === 1 && ai !== 0) {
        // Término lineal
        signo = ai > 0 ? '+' : '';
        funcion = `${ai}x ${signo}` + funcion;
      } else if (ai !== 0) {
        // Otros términos
        if (i > 1) {
          signo = ai > 0 ? '+' : '';
          funcion = `${ai}x^${i} ${signo}` + funcion;
        } else if (i === 0) {
          signo = ai > 0 ? '+' : '';
          funcion = `${ai} ${signo}` + funcion;
        }
      }
      
      // Actualizar signo para el siguiente término
      signo = ai > 0 ? '+' : '';
    }
    
    return `y = ${funcion}`;
  }

  // Método para calcular el coeficiente de correlación según el pseudocódigo de la imagen
  calcularCoeficienteCorrelacion(puntosCargados, vectorResultado, precision, mostrarPasos, salida) {
    let sr = 0; // Suma de cuadrados de los residuos
    let st = 0; // Suma total de cuadrados
    let sumY = 0; // Suma de valores Y
    let n = puntosCargados.length;
    
    if (mostrarPasos) {
      salida += '=== CÁLCULO DEL COEFICIENTE DE CORRELACIÓN ===\n\n';
    }
    
    // Calcular suma de Y para el promedio
    for (let punto of puntosCargados) {
      sumY += punto[1];
    }
    
    const promedioY = sumY / n;
    
    // Iterar sobre cada punto
    for (let punto of puntosCargados) {
      const x = punto[0];
      const y = punto[1];
      
      // Calcular valor predicho usando el polinomio
      let suma = 0;
      for (let i = 0; i < vectorResultado.length; i++) {
        suma += vectorResultado[i] * Math.pow(x, i);
      }
      
      // Calcular sr (suma de cuadrados de residuos)
      sr += Math.pow(suma - y, 2);
      
      // Calcular st (suma total de cuadrados)
      st += Math.pow(promedioY - y, 2);
      
      if (mostrarPasos) {
        salida += `Punto (${x}, ${y}): Predicho = ${suma.toFixed(precision)}, Residuo = ${(suma - y).toFixed(precision)}\n`;
      }
    }
    
    // Calcular coeficiente de correlación
    const r = Math.sqrt(1 - (sr / st));
    
    if (mostrarPasos) {
      salida += `\nSuma de cuadrados de residuos (sr): ${sr.toFixed(precision)}\n`;
      salida += `Suma total de cuadrados (st): ${st.toFixed(precision)}\n`;
      salida += `Coeficiente de correlación (r): ${r.toFixed(precision)}\n\n`;
    }
    
    return r;
  }


  mostrarResultados(resultado) {
    document.getElementById('salida').textContent = resultado.salida;
  }

  mostrarError(mensaje) {
    document.getElementById('salida').textContent = `Error: ${mensaje}`;
  }

  graficarDatos(x, y, resultado) {
    if (!this.geogebraApp) return;

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

      // Crear curva de regresión polinomial
      let ecuacionGeoGebra = '';
      for (let i = resultado.grado; i >= 0; i--) {
        const coef = resultado.coeficientes[i].toFixed(6);
        if (i === resultado.grado) {
          ecuacionGeoGebra += coef;
        } else {
          if (resultado.coeficientes[i] >= 0) {
            ecuacionGeoGebra += ` + ${coef}`;
          } else {
            ecuacionGeoGebra += ` - ${Math.abs(resultado.coeficientes[i]).toFixed(6)}`;
          }
        }
        
        if (i > 1) {
          ecuacionGeoGebra += ` * x^${i}`;
        } else if (i === 1) {
          ecuacionGeoGebra += ' * x';
        }
      }

      this.geogebraApp.evalCommand(`f(x) = ${ecuacionGeoGebra}`);
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
      this.geogebraApp.evalCommand('texto2 = "Curva de regresión"');
      this.geogebraApp.evalCommand('texto3 = "Grado: ' + resultado.grado + '"');
      this.geogebraApp.evalCommand('texto4 = "R² = ' + resultado.r2.toFixed(4) + '"');
      this.geogebraApp.evalCommand('texto5 = "r = ' + resultado.r.toFixed(4) + '"');

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
      link.download = 'regresion_polinomial_resultados.png';
      link.href = canvas.toDataURL();
      link.click();
    }).catch(error => {
      console.error('Error al capturar:', error);
      alert('Error al capturar los resultados');
    });
  }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
  new RegresionPolinomial();
});

