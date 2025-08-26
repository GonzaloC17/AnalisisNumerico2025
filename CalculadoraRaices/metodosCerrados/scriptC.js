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
    salida.textContent = "⚠️ La función no cambia de signo en el intervalo.";
    return;
  }

  let xr = xi;
  let xrAnterior = xi;
  let error = 1;

  texto += `📊 Método: ${metodo === "biseccion" ? "Bisección" : "Falsa Posición"}\n`;
  texto += `📊 Iteraciones:\n`;

  for (let i = 1; i <= iterMax; i++) {
    if (metodo === "biseccion") {
      xr = (xi + xd) / 2;
    } else if (metodo === "falsa") {
      xr = (xi * fxd - xd * fxi) / (fxd - fxi);
    }

    const fxr = evaluarFuncion(funcionStr, xr);
    error = Math.abs((xr - xrAnterior) / xr);

    texto += `Iteración ${i}: xr = ${xr.toFixed(6)}, f(xr) = ${fxr.toFixed(6)}, error = ${error.toFixed(6)}\n`;

    if (Math.abs(fxr) < tolerancia || error < tolerancia) {
      texto += `\n🎯 Raíz encontrada: ${xr}`;
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

  salida.textContent = texto;

  // Actualizar GeoGebra con función convertida
  actualizarGeoGebra(funcionStr);
});


// function evaluarFuncion(funcionStr, x) {
//   try {
//     return eval(funcionStr.replace(/x/g, `(${x})`));
//   } catch {
//     alert("⚠️ Error evaluando la función. Revisá la sintaxis.");
//     throw new Error("Error en la función.");
//   }
// }

function evaluarFuncion(funcionStr, x) {
  try {
    // Creamos una función con el parámetro x y con Math en el scope
    // "with (Math)" permite usar sin(), cos(), exp(), etc. sin poner Math.
    const fn = new Function('x', `with (Math) { return ${funcionStr}; }`);
    const val = fn(x);
    if (typeof val !== 'number' || !isFinite(val)) {
      throw new Error('La evaluación no devolvió un número finito.');
    }
    return val;
  } catch (err) {
    alert("⚠️ Error evaluando la función. Revisá la sintaxis. Ejemplos válidos: 'Math.exp(x)-15', 'exp(x)-15', 'Math.pow(x,5)+0.25*x*x-1'.\nDetalle: " + err.message);
    throw err;
  }
}

function convertirFuncionAGeoGebra(funcionJS) {
  return funcionJS
    .replace(/Math\.pow\(([^,]+),\s*([^)]+)\)/g, '($1)^($2)')
    .replace(/Math\.sin\(/g, 'sin(')
    .replace(/Math\.cos\(/g, 'cos(')
    .replace(/Math\.tan\(/g, 'tan(')
    .replace(/Math\.log\(/g, 'log(')
    .replace(/Math\.exp\(/g, 'exp(')
    .replace(/Math\.abs\(/g, 'abs(');
}


// GeoGebra API embedding
function actualizarGeoGebra(funcionStr) {
    const funcionGG = convertirFuncionAGeoGebra(funcionStr);
  const applet = `
    <html>
      <head>
        <script src="https://www.geogebra.org/apps/deployggb.js"></script>
      </head>
      <body>
        <div id="ggb-element"></div>
        <script>
          const ggbApp = new GGBApplet({
            "appName": "graphing",
            "width": 800,
            "height": 600,
            "showToolBar": false,
            "showAlgebraInput": false,
            "showMenuBar": false,
            "appletOnLoad": function(api) {
              api.evalCommand("f(x) = ${funcionGG}");
            }
          }, true);
          window.addEventListener("load", () => ggbApp.inject('ggb-element'));
        </script>
      </body>
    </html>
  `;
  const blob = new Blob([applet], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  document.getElementById("geogebra").src = url;
}