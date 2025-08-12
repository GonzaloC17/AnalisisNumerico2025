document.getElementById("formulario").addEventListener("submit", function (e) {
  e.preventDefault();

  const funcionStr = document.getElementById("funcion").value;
  const metodo = document.getElementById("metodo").value;
  const x0 = parseFloat(document.getElementById("x0").value);
  const x1 = parseFloat(document.getElementById("x1").value);
  const tolerancia = parseFloat(document.getElementById("tolerancia").value);
  const iterMax = parseInt(document.getElementById("iteraciones").value);
  const salida = document.getElementById("salida");

  const parser = math.parser();
  let f, df;

  try {
    f = math.compile(funcionStr);
    if (metodo === "newton") {
      const derivadaStr = math.derivative(funcionStr, 'x').toString();
      df = math.compile(derivadaStr);
    }
  } catch (error) {
    salida.textContent = "⚠️ Error en la función ingresada.";
    return;
  }

  const ggb = document.getElementById("ggb-element").contentWindow;
  const ggbCmd = (cmd) => ggb.postMessage({ type: "evalCommand", commandString: cmd }, "*");

  ggbCmd("DeleteAll[]");
  ggbCmd(`f(x) = ${funcionStr}`);

  let texto = `📊 Método: ${metodo === "newton" ? "Newton-Raphson" : "Secante"}\n📊 Iteraciones:\n`;

  let xi = x0;
  let xiPrev = x1;
  let error = 1;

  for (let i = 1; i <= iterMax; i++) {
    const fxi = f.evaluate({ x: xi });
    let xiNext;

    if (metodo === "newton") {
      const dfxi = df.evaluate({ x: xi });
      if (dfxi === 0) {
        salida.textContent = "⚠️ Derivada cero. No se puede continuar.";
        return;
      }
      xiNext = xi - fxi / dfxi;

      // Tangente en xi
      const pendiente = dfxi;
      const ordenada = fxi;
      const tangenteStr = `${pendiente}*(x - ${xi}) + ${ordenada}`;
      ggbCmd(`Tang${i}(x) = ${tangenteStr}`);
    } else if (metodo === "secante") {
      const fxiPrev = f.evaluate({ x: xiPrev });
      const denominator = fxi - fxiPrev;
      if (denominator === 0) {
        salida.textContent = "⚠️ División por cero.";
        return;
      }
      xiNext = xi - fxi * (xi - xiPrev) / denominator;

      // Línea secante
      const m = (fxi - fxiPrev) / (xi - xiPrev);
      const b = fxi - m * xi;
      ggbCmd(`Secante${i}(x) = ${m}*x + ${b}`);
      xiPrev = xi;
    }

    error = Math.abs((xiNext - xi) / xiNext);
    texto += `Iteración ${i}: x = ${xiNext.toFixed(6)}, error = ${error.toFixed(6)}\n`;

    if (Math.abs(f.evaluate({ x: xiNext })) < tolerancia || error < tolerancia) {
      texto += `\n🎯 Raíz encontrada: ${xiNext}`;
      break;
    }

    xi = xiNext;
  }

  salida.textContent = texto;
  actualizarGeoGebra(funcionStr);
});

function evaluarFuncion(funcionStr, x) {
  try {
    return eval(funcionStr.replace(/x/g, `(${x})`));
  } catch {
    alert("⚠️ Error evaluando la función. Revisá la sintaxis.");
    throw new Error("Error en la función.");
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