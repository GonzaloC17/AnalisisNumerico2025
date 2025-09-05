// Genera los inputs dinámicamente
function generarMatriz() {
  const n = parseInt(document.getElementById("dimension").value);
  if (!n || n < 2) {
    alert("Ingrese una dimensión válida (mínimo 2)");
    return;
  }

  const container = document.getElementById("matriz-container");
  container.innerHTML = "";

  // Crear tabla para mejor organización
  const table = document.createElement("table");
  table.className = "w-full border-collapse";
  
  // Crear encabezados
  const headerRow = document.createElement("tr");
  headerRow.className = "border-b border-gray-300 dark:border-gray-600";
  
  for (let j = 0; j < n; j++) {
    const th = document.createElement("th");
    th.className = "px-2 py-1 text-xs font-semibold text-gray-600 dark:text-gray-400";
    th.textContent = `x${j+1}`;
    headerRow.appendChild(th);
  }
  
  const thB = document.createElement("th");
  thB.className = "px-2 py-1 text-xs font-semibold text-gray-600 dark:text-gray-400 border-l-2 border-gray-300 dark:border-gray-600";
  thB.textContent = "b";
  headerRow.appendChild(thB);
  
  table.appendChild(headerRow);

  for (let i = 0; i < n; i++) {
    const row = document.createElement("tr");
    row.className = "border-b border-gray-200 dark:border-gray-700";

    for (let j = 0; j < n; j++) {
      const cell = document.createElement("td");
      cell.className = "px-1 py-1";
      
      const input = document.createElement("input");
      input.type = "number";
      input.step = "any";
      input.id = `a-${i}-${j}`;
      input.placeholder = `a${i+1}${j+1}`;
      input.className = "w-16 px-2 py-1 text-center text-sm border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent";
      cell.appendChild(input);
      row.appendChild(cell);
    }

    // Vector independiente b
    const cellB = document.createElement("td");
    cellB.className = "px-1 py-1 border-l-2 border-gray-300 dark:border-gray-600";
    
    const inputB = document.createElement("input");
    inputB.type = "number";
    inputB.step = "any";
    inputB.id = `b-${i}`;
    inputB.placeholder = `b${i+1}`;
    inputB.className = "w-16 px-2 py-1 text-center text-sm border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent";
    cellB.appendChild(inputB);
    row.appendChild(cellB);

    table.appendChild(row);
  }

  container.appendChild(table);
}

// Lee la matriz desde los inputs
function leerMatriz() {
  const n = parseInt(document.getElementById("dimension").value);
  let A = [];
  let b = [];

  for (let i = 0; i < n; i++) {
    A[i] = [];
    for (let j = 0; j < n; j++) {
      const val = parseFloat(document.getElementById(`a-${i}-${j}`).value) || 0;
      A[i][j] = val;
    }
    b[i] = parseFloat(document.getElementById(`b-${i}`).value) || 0;
  }
  return { A, b };
}

// Método de Gauss-Jordan según el algoritmo de la imagen
function gaussJordan(A, b) {
  const n = A.length;
  let pasos = []; // Para almacenar los pasos intermedios
  
  // Crear matriz aumentada [A|b]
  let matriz = [];
  for (let i = 0; i < n; i++) {
    matriz[i] = [...A[i], b[i]];
  }
  
  // Almacenar matriz inicial
  pasos.push({
    titulo: "Matriz Inicial",
    matriz: matriz.map(row => [...row]),
    descripcion: "Sistema de ecuaciones original"
  });

  // ALGORITMO GAUSS-JORDAN según la imagen
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
      
      pasos.push({
        titulo: `Paso ${i+1}.0: Intercambio de filas`,
        matriz: matriz.map(row => [...row]),
        descripcion: `Intercambio de fila ${i+1} con fila ${filaIntercambio+1}`
      });
    }
    
    // Paso 2: Dividir toda la fila por el coeficiente diagonal
    for (let j = 0; j <= n; j++) {
      matriz[i][j] = matriz[i][j] / coeficienteDiagonal;
    }
    
    pasos.push({
      titulo: `Paso ${i+1}.1: Normalización`,
      matriz: matriz.map(row => [...row]),
      descripcion: `Dividir fila ${i+1} por ${coeficienteDiagonal.toFixed(6)}`
    });
    
    // Paso 3: Hacer ceros los demás elementos de la columna i
    for (let k = 0; k < n; k++) {
      if (k !== i) {
        let coeficienteCero = matriz[k][i];
        
        // Aplicar las fórmulas de la imagen
        for (let j = 0; j <= n; j++) {
          matriz[k][j] = matriz[k][j] - (coeficienteCero * matriz[i][j]);
        }
        
        pasos.push({
          titulo: `Paso ${i+1}.${k+2}: Eliminación`,
          matriz: matriz.map(row => [...row]),
          descripcion: `Fila ${k+1} = Fila ${k+1} - (${coeficienteCero.toFixed(6)} × Fila ${i+1})`
        });
      }
    }
  }
  
  // Paso 4: Extraer la solución (términos independientes)
  let solucion = [];
  for (let i = 0; i < n; i++) {
    solucion[i] = matriz[i][n];
  }
  
  pasos.push({
    titulo: "Matriz Final",
    matriz: matriz.map(row => [...row]),
    descripcion: "Matriz identidad obtenida - solución en la última columna"
  });
  
  return { solucion, pasos };
}

// Ejecuta la resolución
function resolverSistema() {
  try {
    const { A, b } = leerMatriz();
    const { solucion, pasos } = gaussJordan(A, b);
    
    // Formatear resultado con pasos detallados
    let resultadoHTML = `
      <div class="mb-3">
        <span class="font-bold text-blue-600 dark:text-blue-400">Método:</span> Gauss-Jordan
      </div>
      <div class="mb-4">
        <span class="font-bold text-blue-600 dark:text-blue-400">Solución del Sistema:</span>
      </div>
      <div class="bg-green-100 dark:bg-green-900 p-4 rounded-lg border-l-4 border-green-500 mb-6">
        <div class="font-bold text-green-800 dark:text-green-200 mb-2">
          <svg class="w-5 h-5 inline-block mr-2 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
          </svg>
          SOLUCIÓN ENCONTRADA:
        </div>
        <div class="text-lg font-mono text-green-900 dark:text-green-100">
          ${solucion.map((x, i) => `x${i+1} = ${x.toFixed(6)}`).join('<br>')}
        </div>
      </div>
    `;
    
    // Agregar pasos del algoritmo
    resultadoHTML += `
      <div class="mb-4">
        <span class="font-bold text-blue-600 dark:text-blue-400">Pasos del Algoritmo:</span>
      </div>
    `;
    
    pasos.forEach((paso, index) => {
      resultadoHTML += `
        <div class="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg mb-3 border-l-4 border-blue-500">
          <div class="font-semibold text-blue-800 dark:text-blue-200 mb-2">${paso.titulo}</div>
          <div class="text-sm text-gray-600 dark:text-gray-300 mb-2">${paso.descripcion}</div>
          <div class="font-mono text-xs bg-white dark:bg-gray-800 p-2 rounded border overflow-x-auto">
            ${paso.matriz.map((row, i) => 
              `Fila ${i+1}: [${row.map(val => val.toFixed(4).padStart(8)).join(', ')}]`
            ).join('<br>')}
          </div>
        </div>
      `;
    });
    
    document.getElementById("resultado").innerHTML = resultadoHTML;
  } catch (err) {
    document.getElementById("resultado").innerHTML = `
      <div class="bg-red-100 dark:bg-red-900 p-4 rounded-lg border-l-4 border-red-500">
        <div class="font-bold text-red-800 dark:text-red-200">
          <svg class="w-5 h-5 inline-block mr-2 text-red-600 dark:text-red-400" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
          </svg>
          Error:
        </div>
        <div class="text-red-700 dark:text-red-300">${err.message}</div>
      </div>
    `;
  }
}

// Funcionalidad de captura de resultados
document.addEventListener('DOMContentLoaded', function() {
  const captureButton = document.getElementById('capture-results');
  
  if (captureButton) {
    captureButton.addEventListener('click', function() {
      const originalText = captureButton.innerHTML;
      
      captureButton.innerHTML = '<span>⏳</span><span>Procesando...</span>';
      captureButton.disabled = true;
      
      // Crear un contenedor temporal para la captura
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
      
      // Clonar el contenido de la matriz y resultado
      const matrizContainer = document.getElementById('matriz-container').cloneNode(true);
      const resultadoContainer = document.getElementById('resultado').cloneNode(true);
      
      // Crear título
      const titulo = document.createElement('h2');
      titulo.textContent = 'Método de Gauss-Jordan - Resultados';
      titulo.className = 'text-xl font-bold mb-4';
      
      resultadosContainer.appendChild(titulo);
      resultadosContainer.appendChild(matrizContainer);
      resultadosContainer.appendChild(resultadoContainer);
      
      document.body.appendChild(resultadosContainer);
      
      // Simular captura (en un entorno real usarías html2canvas)
      setTimeout(() => {
        document.body.removeChild(resultadosContainer);
        
        captureButton.innerHTML = originalText;
        captureButton.disabled = false;
        
        // Crear y descargar un archivo de texto con los resultados
        const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
        const contenido = `Método de Gauss-Jordan - Resultados\n${new Date().toLocaleString()}\n\nMatriz:\n${document.getElementById('matriz-container').textContent}\n\nResultado:\n${document.getElementById('resultado').textContent}`;
        
        const blob = new Blob([contenido], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `resultados-gauss-jordan-${timestamp}.txt`;
        link.click();
        URL.revokeObjectURL(url);
        
        console.log('Resultados guardados como archivo de texto');
      }, 1000);
    });
  }
});
