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
        const funcionGG = convertirFuncionAGeoGebra(funcionStr);
        ggbApp.evalCommand(`f(x) = ${funcionGG}`);
        console.log('Función actualizada en tiempo real:', funcionStr);
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
    link.download = `resultados-metodos-cerrados-${timestamp}.png`;
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

  const funcionStr = document.getElementById("funcion").value;
  const metodo = document.getElementById("metodo").value;
  const xiInput = parseFloat(document.getElementById("xi").value);
  const xdInput = parseFloat(document.getElementById("xd").value);
  const tolerancia = parseFloat(document.getElementById("tolerancia").value);
  const iterMax = parseInt(document.getElementById("iteraciones").value);
  const salida = document.getElementById("salida");

  let xi = xiInput;
  let xd = xdInput;
  let fxi = evaluarFuncion(funcionStr, xi);
  let fxd = evaluarFuncion(funcionStr, xd);
  let texto = "";

     if (fxi * fxd > 0) {
     salida.textContent = "La función no cambia de signo en el intervalo.";
     return;
   }

  let xr = xi;
  let xrAnterior = xi;
  let error = 1;

     texto += `<div class="mb-3"><span class="font-bold text-blue-600 dark:text-blue-400">Método:</span> ${metodo === "biseccion" ? "Bisección" : "Regla falsa"}</div>`;
   texto += `<div class="mb-2"><span class="font-bold text-blue-600 dark:text-blue-400">Iteraciones:</span></div>`;

  for (let i = 1; i <= iterMax; i++) {
    if (metodo === "biseccion") {
      xr = (xi + xd) / 2;
    } else if (metodo === "falsa") {
      xr = (xi * fxd - xd * fxi) / (fxd - fxi);
    }

    const fxr = evaluarFuncion(funcionStr, xr);
    error = Math.abs((xr - xrAnterior) / xr);

         texto += `<div class="mb-2 text-sm"><span class="font-semibold text-gray-700 dark:text-gray-300">Iteración ${i}:</span> xr = <span class="font-mono">${xr.toFixed(6)}</span>, f(xr) = <span class="font-mono">${fxr.toFixed(6)}</span>, error = <span class="font-mono">${error.toFixed(6)}</span></div>`;

         if (Math.abs(fxr) < tolerancia || error < tolerancia) {
       texto += `\n\nRAIZ_ENCONTRADA:${xr.toFixed(6)}`;
       break;
     }

    if (fxi * fxr > 0) {
      xi = xr;
      fxi = fxr;
    } else {
      xd = xr;
      fxd = fxr;
    }

    xrAnterior = xr;
  }

       const textoFormateado = texto.replace(
    /RAIZ_ENCONTRADA:([^\\n]+)/g,
    '<div class="mt-4 p-3 bg-blue-100 dark:bg-blue-900 border-l-4 border-blue-500 rounded-r-lg"><span class="font-bold text-blue-800 dark:text-blue-200"><svg class="w-5 h-5 inline-block mr-2 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg> RAÍZ ENCONTRADA:</span> <span class="font-bold text-lg text-blue-900 dark:text-blue-100">$1</span></div>'
  );
  
  salida.innerHTML = textoFormateado;

  actualizarGeoGebra(funcionStr);
});

let ggbApp;

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
    const fn = new Function('x', `with (Math) { return ${funcionStr}; }`);
    const val = fn(x);
    if (typeof val !== 'number' || !isFinite(val)) {
      throw new Error('La evaluación no devolvió un número finito.');
    }
    return val;
  } catch (err) {
    alert("Error evaluando la función. Revisá la sintaxis. Ejemplos válidos: 'Math.exp(x)-15', 'exp(x)-15', 'Math.pow(x,5)+0.25*x*x-1'.\nDetalle: " + err.message);
    throw err;
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


function actualizarGeoGebra(funcionStr) {
  if (!ggbApp) {
    console.log("GeoGebra aún no está listo, reintentando...");
    setTimeout(() => actualizarGeoGebra(funcionStr), 500);
    return;
  }
  
  const funcionGG = convertirFuncionAGeoGebra(funcionStr);
  
  try {
    ggbApp.evalCommand(`f(x) = ${funcionGG}`);
  } catch (error) {
    console.log("Error al actualizar GeoGebra:", error);
  }
}