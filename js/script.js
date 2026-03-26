let rutas, condiciones, sectores;

//Carga los datos y llena los selectores del HTML
window.onload = async () => {
    await cargarDatos();
    cargarSectoresEnPantalla();
};

async function cargarDatos() {

  const temporalRutas = await fetch("../data/vias.json");
  rutas = await temporalRutas.json();

  const temporalCondiciones = await fetch("../data/condiciones.json");
  condiciones = await temporalCondiciones.json();

  const temporalSectores = await fetch("../data/sectores.json");
  sectores = await temporalSectores.json();

}

function cargarSectoresEnPantalla() {
    const origenSelect = document.getElementById("origen");
    const destinoSelect = document.getElementById("destino");

    // Limpiar los selectores por si acaso
    origenSelect.innerHTML = '<option value="">Selecciona origen...</option>';
    destinoSelect.innerHTML = '<option value="">Selecciona destino...</option>';

    sectores.forEach(s => {
        
        const opcion = `<option value="${s.nombre}">${s.nombre}</option>`;
        
        origenSelect.innerHTML += opcion;
        destinoSelect.innerHTML += opcion;
    });
}

function buscarRutas(origen, destino) {

  let resultado = [];

  rutas.forEach(function(ruta) {

    if (ruta.origen === origen && ruta.destino === destino) {
      resultado.push(ruta);
    }

  });

  return resultado;
}

function calculos(tipo, ruta, condicionesActivas) {
  
    let tiempoFinal = tipo.tiempo_min; 
    let costoRuta = tipo.costo;
    let costoExtraTransbordo = 0;
    let detalleTransbordo = "";

    // Si la ruta tiene transbordo, buscamos el costo extra para este tipo de transporte
    if (ruta.transbordo) {
        costoExtraTransbordo = ruta.transbordo.costo_extra[tipo.tipo] || 0;
        detalleTransbordo = ruta.transbordo.detalle;
    }

    // condiciones activas
    let sumaCostosCondiciones = 0;

    condicionesActivas.forEach(condicion => {
        // fórmula del examen: tiempo * (1 + pct/100) 
        if (condicion.tiempo_pct) {
            let aumento = 1 + (condicion.tiempo_pct / 100);
            tiempoFinal = tiempoFinal * aumento;
        }
        
        // Sumamos el costo extra de la condición de las condiciones activas si tiene uno 
        if (condicion.costo_extra && condicion.costo_extra[tipo.tipo]) {
            sumaCostosCondiciones += condicion.costo_extra[tipo.tipo];
        }
    });

    return {
        tiempo: Math.round(tiempoFinal), // Redondeo obligatorio [cite: 24]
        costoTotal: costoRuta + costoExtraTransbordo + sumaCostosCondiciones,
        costoBase: costoRuta,
        costoTransbordo: costoExtraTransbordo,
        detalle: detalleTransbordo // Para que lo puedas mostrar en pantalla
    };
}

function guardarFavorito(tipo, origen, destino, tiempo, costo) {
    const listaFavoritos = document.getElementById("favoritos-lista");
    
    const divFav = document.createElement("div");
    divFav.className = "tarjeta-favorito";
    divFav.innerHTML = `
        <p><strong>${origen} -> ${destino}</strong></p>
        <p>${tipo} | ${tiempo} mins | RD$${costo}</p>
        <button onclick="this.parentElement.remove()" class="btn-secundario">Eliminar</button>
        <hr>
    `;
    listaFavoritos.appendChild(divFav);
}

function mostrarResultados(lista, origen, destino) {
  let div = document.getElementById("resultados");
  div.innerHTML = "";

  lista.forEach(function(e) {
    let detalleCostos = "";

    // Si hay transbordo
    if (e.costoTransbordo > 0) {
      detalleCostos = `
        <p><strong>Costo Inicial:</strong> RD$${e.costoBase}</p>
        <p><strong>Pago en Transbordo:</strong> RD$${e.costoTransbordo}</p>
        <p>------- FACTURA FINAL DEL VIAJE -------<p/>
        <p><strong>Total a pagar:</strong> RD$${e.costoTotal}</p>
        <p>Detalle: ${e.transbordo}</p>
      `;
    } else {
      // si  no hay trasbordo
      detalleCostos = `
        <p><strong>Costo Total:</strong> RD$${e.costoTotal}</p>
        <p>Ruta Directa</p>
      `;
    }

    div.innerHTML += `
      <div class="tarjeta">
        <p><strong>Tipo:</strong> ${e.tipo}</p>
        <p><strong>Tiempo Est:</strong> ${e.tiempo} min</p>
        ${detalleCostos}
        <button onclick="guardarFavorito('${e.tipo}', '${origen}', '${destino}', ${e.tiempo}, ${e.costoTotal})">
            Guardar en Favoritos 
        </button>
        <hr>
      </div>
    `;
  });
}

document.getElementById("formulario-ruta").addEventListener("submit", function(e) {
    e.preventDefault(); // Evita que la página se vuelva a cargar

    const origen = document.getElementById("origen").value;
    const destino = document.getElementById("destino").value;

    // Validación para que no deje seleccionar el mismo origen y destino
    if (origen === destino) {
        alert("El origen y el destino no pueden ser iguales. ¡Elige sectores distintos!");
        return;
    }
    
    // Capturar condiciones marcadas
    const checkboxes = document.querySelectorAll('input[name="condicion"]:checked');
    let seleccionadas = [];
    checkboxes.forEach(cb => {
        const cond = condiciones.find(c => c.nombre === cb.value);
        if (cond) seleccionadas.push(cond);
    });

    // busqueda y calculos para cada ruta encontrada
    const caminosHallados = buscarRutas(origen, destino);
    let resultadosFinales = [];

    caminosHallados.forEach(ruta => {
        ruta.tipos.forEach(tipo => {
            // Se calculan los valores finales de tiempo y costo
            const calculoCamino = calculos(tipo, ruta, seleccionadas);
            resultadosFinales.push({
                tipo: tipo.tipo,
                tiempo: calculoCamino.tiempo,
                costoTotal: calculoCamino.costoTotal, 
                costoBase: calculoCamino.costoBase,
                costoTransbordo: calculoCamino.costoTransbordo,
                transbordo: ruta.transbordo ? ruta.transbordo.detalle : null
            });
        });
    });

    // categorias de ordenamiento
    const criterio = document.getElementById("ordenar").value;

    // ordenamiento a la lista 
    resultadosFinales.sort(function(a, b) {
        
        if (criterio === "transbordos") {
            
            if (a.transbordo === null) {
                // Si no tiene transbordo, es menor
                return -1; 
            } 
            else if (b.transbordo === null) {
                return 1;
            } 
            else {
                // se quedan igual
                return 0;
            }
        } 
        
        // ordenar por Tiempo o Costo
        else {
            // Si el resultado es negativo, el primero es menor y se queda arriba.
            return a[criterio] - b[criterio];
        }
    });

   mostrarResultados(resultadosFinales, origen, destino);
});