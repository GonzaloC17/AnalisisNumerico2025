// Genera los inputs dinámicamente
function generarMatriz() {
  const n = parseInt(document.getElementById("dimension").value);
  if (!n || n < 2) {
    alert("Ingrese una dimensión válida (mínimo 2)");
    return;
  }

  const container = document.getElementById("matriz-container");
  container.innerHTML = "";

  for (let i = 0; i < n; i++) {
    const row = document.createElement("div");
    row.className = "matriz-row";

    for (let j = 0; j < n; j++) {
      const input = document.createElement("input");
      input.type = "number";
      input.step = "any";
      input.id = `a-${i}-${j}`;
      input.placeholder = `a${i+1}${j+1}`;
      row.appendChild(input);
    }

    const sep = document.createElement("span");
    sep.className = "separador";
    row.appendChild(sep);

    // Vector independiente b
    const inputB = document.createElement("input");
    inputB.type = "number";
    inputB.step = "any";
    inputB.id = `b-${i}`;
    inputB.placeholder = `b${i+1}`;
    row.appendChild(inputB);

    container.appendChild(row);
  }
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

// Método Gauss-Jordan con normalización tipo Von-Mises
function gaussJordanVonMises(A, b) {
  const n = A.length;

  // Normalización inicial (Von-Mises: escalar filas)
  for (let i = 0; i < n; i++) {
    let norm = Math.max(...A[i].map(Math.abs));
    if (norm === 0) throw new Error("Sistema singular.");
    for (let j = 0; j < n; j++) A[i][j] /= norm;
    b[i] /= norm;
  }

  // Gauss-Jordan
  for (let i = 0; i < n; i++) {
    // Pivoteo parcial
    let maxRow = i;
    for (let k = i+1; k < n; k++) {
      if (Math.abs(A[k][i]) > Math.abs(A[maxRow][i])) maxRow = k;
    }
    [A[i], A[maxRow]] = [A[maxRow], A[i]];
    [b[i], b[maxRow]] = [b[maxRow], b[i]];

    // Normalizar pivote
    let pivote = A[i][i];
    if (Math.abs(pivote) < 1e-12) throw new Error("No se puede resolver (pivote nulo).");
    for (let j = 0; j < n; j++) A[i][j] /= pivote;
    b[i] /= pivote;

    // Eliminar otras filas
    for (let k = 0; k < n; k++) {
      if (k !== i) {
        let factor = A[k][i];
        for (let j = 0; j < n; j++) A[k][j] -= factor * A[i][j];
        b[k] -= factor * b[i];
      }
    }
  }

  return b;
}

// Ejecuta la resolución
function resolverSistema() {
  try {
    const { A, b } = leerMatriz();
    const solucion = gaussJordanVonMises(A, b);
    document.getElementById("resultado").textContent =
      "S = (" + solucion.map(x => x.toFixed(6)).join(", ") + ")";
  } catch (err) {
    document.getElementById("resultado").textContent = "Error: " + err.message;
  }
}
