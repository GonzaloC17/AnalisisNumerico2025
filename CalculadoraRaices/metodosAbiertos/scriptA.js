let debounceTimer;
function debounce(func, delay) {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(func, delay);
}

document.getElementById("funcion").addEventListener("input", function() {
  const funcionStr = this.value.trim();
  const loadingIndicator = document.getElementById("loading-indicator");
  
  loadingIndicator.classList.remove("hidden");
  
  debounce(() => {
    if (funcionStr && ggbApp) {
      try {
        const funcionNormalizada = normalizarFuncion(funcionStr);
        ggbApp.evalCommand(`f(x) = ${funcionNormalizada}`);
        console.log('Función actualizada en tiempo real:', funcionNormalizada);
      } catch (error) {
        console.log('Error al actualizar función en tiempo real:', error);
      }
    } else if (ggbApp) {
      try {
        ggbApp.evalCommand(`f(x) = undefined`);
      } catch (error) {
        console.log('Error al limpiar gráfico:', error);
      }
    }
    loadingIndicator.classList.add("hidden");
  }, 500);
});

document.getElementById("clear-function").addEventListener("click", function() {
  const funcionInput = document.getElementById("funcion");
  funcionInput.value = "";
  funcionInput.focus();
  
  if (ggbApp) {
    try {
      ggbApp.evalCommand(`f(x) = undefined`);
      console.log('Gráfico limpiado');
    } catch (error) {
      console.log('Error al limpiar gráfico:', error);
    }
  }
});

document.getElementById("capture-results").addEventListener("click", function() {
  const captureButton = document.getElementById("capture-results");
  const originalText = captureButton.innerHTML;
  
  captureButton.innerHTML = '<span>⏳</span><span>Procesando...</span>';
  captureButton.disabled = true;
  
  const tituloResultados = document.querySelector('.flex.justify-between.items-center.mt-8');
  const contenidoResultados = document.getElementById("salida");
  
  const resultadosContainer = document.createElement('div');
  resultadosContainer.style.cssText = `
    background: ${document.documentElement.classList.contains('dark') ? '#1f2937' : '#ffffff'};
    color: ${document.documentElement.classList.contains('dark') ? '#ffffff' : '#000000'};
    padding: 20px;
    border-radius: 8px;
    margin: 0;
    font-family: inherit;
    width: 600px;
    max-width: 600px;
  `;
  
  const tituloClon = tituloResultados.cloneNode(true);
  const contenidoClon = contenidoResultados.cloneNode(true);
  
  const botonCaptura = tituloClon.querySelector('#capture-results');
  if (botonCaptura) {
    botonCaptura.remove();
  }
  
  resultadosContainer.appendChild(tituloClon);
  resultadosContainer.appendChild(contenidoClon);
  
  document.body.appendChild(resultadosContainer);
  
  captureButton.style.visibility = 'hidden';
  
  html2canvas(resultadosContainer, {
    backgroundColor: document.documentElement.classList.contains('dark') ? '#1f2937' : '#ffffff',
    scale: 2,
    useCORS: true,
    allowTaint: true,
    logging: false
  }).then(canvas => {
    document.body.removeChild(resultadosContainer);
    
    captureButton.innerHTML = originalText;
    captureButton.disabled = false;
    captureButton.style.visibility = 'visible';
    
    const link = document.createElement('a');
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    link.download = `resultados-metodos-abiertos-${timestamp}.png`;
    link.href = canvas.toDataURL('image/png', 0.95);
    link.click();
    
    console.log('Captura de resultados guardada');
  }).catch(error => {
    if (document.body.contains(resultadosContainer)) {
      document.body.removeChild(resultadosContainer);
    }
    
    captureButton.innerHTML = originalText;
    captureButton.disabled = false;
    captureButton.style.visibility = 'visible';
    console.error('Error al capturar:', error);
    alert('Error al capturar los resultados. Intenta nuevamente.');
  });
});

document.getElementById("formulario").addEventListener("submit", function (e) {
  e.preventDefault();

  let funcionStr = document.getElementById("funcion").value;
  const metodo = document.getElementById("metodo").value;
  const x0 = parseFloat(document.getElementById("x0").value);
  const x1 = parseFloat(document.getElementById("x1").value);
  const tolerancia = parseFloat(document.getElementById("tolerancia").value);
  const iterMax = parseInt(document.getElementById("iteraciones").value);
  const salida = document.getElementById("salida");

  // Normalizar la función para math.js
  funcionStr = normalizarFuncion(funcionStr);

  const parser = math.parser();
  let f, df;

  try {
    f = math.compile(funcionStr);
    if (metodo === "newton") {
      const derivadaStr = math.derivative(funcionStr, 'x').toString();
      df = math.compile(derivadaStr);
    }
     } catch (error) {
     salida.textContent = "Error en la función ingresada: " + error.message;
     console.error("Error al compilar función:", error);
     return;
   }

  if (!ggbApp) {
    console.log("GeoGebra aún no está listo");
    return;
  }
  
  ggbApp.evalCommand(`f(x) = ${funcionStr}`);

     let texto = `<div class="mb-3"><span class="font-bold text-emerald-600 dark:text-emerald-400">Método:</span> ${metodo === "newton" ? "Newton-Raphson" : "Secante"}</div>`;
   texto += `<div class="mb-2"><span class="font-bold text-emerald-600 dark:text-emerald-400">Iteraciones:</span></div>`;

  let xi = x0;
  let xiPrev = x1;
  let error = 1;

  for (let i = 1; i <= iterMax; i++) {
    const fxi = f.evaluate({ x: xi });
    let xiNext;

    if (metodo === "newton") {
      const dfxi = df.evaluate({ x: xi });
             if (dfxi === 0) {
         salida.textContent = "Derivada cero. No se puede continuar.";
         return;
       }
      xiNext = xi - fxi / dfxi;

      // Tangente en xi
      const pendiente = dfxi;
      const ordenada = fxi;
      const tangenteStr = `${pendiente}*(x - ${xi}) + ${ordenada}`;
      ggbApp.evalCommand(`Tang${i}(x) = ${tangenteStr}`);
    } else if (metodo === "secante") {
      const fxiPrev = f.evaluate({ x: xiPrev });
      const denominator = fxi - fxiPrev;
             if (denominator === 0) {
         salida.textContent = "División por cero.";
         return;
       }
      xiNext = xi - fxi * (xi - xiPrev) / denominator;

      // Línea secante
      const m = (fxi - fxiPrev) / (xi - xiPrev);
      const b = fxi - m * xi;
      ggbApp.evalCommand(`Secante${i}(x) = ${m}*x + ${b}`);
      xiPrev = xi;
    }

    error = Math.abs((xiNext - xi) / xiNext);
         texto += `<div class="mb-2 text-sm"><span class="font-semibold text-gray-700 dark:text-gray-300">Iteración ${i}:</span> x = <span class="font-mono">${xiNext.toFixed(6)}</span>, error = <span class="font-mono">${error.toFixed(6)}</span></div>`;

         if (Math.abs(f.evaluate({ x: xiNext })) < tolerancia || error < tolerancia) {
       texto += `\n\nRAIZ_ENCONTRADA:${xiNext.toFixed(6)}`;
       break;
     }

    xi = xiNext;
  }

       const textoFormateado = texto.replace(
    /RAIZ_ENCONTRADA:([^\\n]+)/g,
    '<div class="mt-4 p-3 bg-emerald-100 dark:bg-emerald-900 border-l-4 border-emerald-500 rounded-r-lg"><span class="font-bold text-emerald-800 dark:text-emerald-200"><svg class="w-5 h-5 inline-block mr-2 text-emerald-600 dark:text-emerald-400" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg> RAÍZ ENCONTRADA:</span> <span class="font-bold text-lg text-emerald-900 dark:text-emerald-100">$1</span></div>'
  );
  
  salida.innerHTML = textoFormateado;
  actualizarGeoGebra(funcionStr);
});

let ggbApp;

// Inicializar GeoGebra al cargar la página
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
      ggbApp = api;
      console.log('GeoGebra API cargada exitosamente');
    }
  }, true);
  
  ggbApplet.inject('geogebra-container');
});

function evaluarFuncion(funcionStr, x) {
  try {
    return eval(funcionStr.replace(/x/g, `(${x})`));
     } catch {
     alert("Error evaluando la función. Revisá la sintaxis.");
     throw new Error("Error en la función.");
   }
}

function convertirFuncionAGeoGebra(funcionJS) {
  return funcionJS
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
}


function normalizarFuncion(funcionStr) {
  // Limpiar espacios extra
  let funcion = funcionStr.trim();
  
  // Reemplazar comas por puntos para decimales
  funcion = funcion.replace(/,/g, '.');
  
  // Manejar casos específicos como "x^5+0,25x^2-1"
  // Asegurar que los términos que empiezan con x tengan coeficiente 1 implícito
  funcion = funcion.replace(/([+\-])x/g, '$11*x');
  
  // Si la función empieza con x, agregar coeficiente 1
  if (funcion.startsWith('x')) {
    funcion = '1*' + funcion;
  }
  
  // Manejar casos donde hay espacios entre coeficientes y variables
  funcion = funcion.replace(/(\d+)\s*x/g, '$1*x');
  
  // Asegurar que las potencias estén correctamente formateadas
  funcion = funcion.replace(/\^/g, '^');
  
  // Manejar casos donde los coeficientes decimales están mal formateados
  // Buscar patrones como "0,25" y convertirlos a "0.25"
  funcion = funcion.replace(/(\d+),(\d+)/g, '$1.$2');
  
  console.log('Función original:', funcionStr);
  console.log('Función normalizada:', funcion);
  return funcion;
}

function actualizarGeoGebra(funcionStr) {
  if (!ggbApp) {
    console.log("GeoGebra aún no está listo, reintentando...");
    setTimeout(() => actualizarGeoGebra(funcionStr), 500);
    return;
  }
  
  const funcionNormalizada = normalizarFuncion(funcionStr);
  const funcionGG = convertirFuncionAGeoGebra(funcionNormalizada);
  
  try {
    ggbApp.evalCommand(`f(x) = ${funcionGG}`);
  } catch (error) {
    console.log("Error al actualizar GeoGebra:", error);
  }
}