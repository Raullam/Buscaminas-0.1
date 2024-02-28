//Variables globales y valores por defecto
let tablaBuscaminas = document.getElementById("tablero"); //div en el que se guardara el tablero de juego
let filas = document.getElementById("filas").value;// Numero de filas introducidas y sino se eligen los que estan por defecto
let columnas = document.getElementById("columnas").value;// Numero de columnas introducidas y sino se eligen los que estan por defecto
let numeroDeMinas = document.getElementById("minas").value;// Cantidad de minas introducidas y sino se eligen los que estan por defecto
let tablero; //Variable que almacena los diferentes parametros de una casilla (Si es una mina, el numero de minas a su alrededor, etc)
let PrimerClick; //Variable booleana que almacena si en esta partida sea revelado una casilla o no
let MinasEncontradas; //Variable que guestiona cuantos banderines hay colocados
let numeroCasillasSinMinasPorRevelar; //Variable que guarda el numero de casillas sin minas que faltan por revelar
let temporizador; // Temporizador
let tiempo = 0; // Tiempo en segundos

// audio error windows
const errorSound = new Audio('loops/windows-error.mp3');

//funcion que ejecuta el boton dentro de Ganar
function botonganar(){
    document.getElementById('Ganar').style.display = 'none';
    principal();
}

principal();//generara la primera partida con los valores pordefecto

//Funcion para iniciar una partida
function principal(){
    
    //Si las filas introducidas por el usuario son más de 2 y menos de 31 se las asignamos a la variable,
    //si no, avisamos al usuario y el valor de filas se mantendrá igual al último utilizado
    if (document.getElementById('filas').value > 2 && document.getElementById('filas').value < 31)
        filas = document.getElementById('filas').value
    else{
        errorSound.play();
        setTimeout(alert('Escribe entre 3 y 30 filas'),1);
    }

    //Si las columnas introducidas por el usuario son más de 4 y menos de 46 se las asignamos a la variable,
    //si no, avisamos al usuario, y el valor de columnas se mantendrá igual al último utilizado
    if (document.getElementById('columnas').value > 4 && document.getElementById('columnas').value < 46)
        columnas = document.getElementById('columnas').value
    else{
        errorSound.play();
        setTimeout(alert('Escribe entre 5 y 45 columnas'),1);
    }
    //Si las minas son inferiores a filas*columnas(el numero de casillas), entonces se las asignamos a la variable,
    //de lo contrario la generacion de minas quedaria en blucle, por lo que aviso al usuario y asigno la maxima
    //cantidad de minas en el tablero mas pequeño posible(14 minas)
    if(document.getElementById("minas").value<filas*columnas && document.getElementById("minas").value>0)
    numeroDeMinas = document.getElementById("minas").value;
    else{
        errorSound.play();
        setTimeout(alert("Has introducido un numero de minas fuera del rango, el rango es de 0 al numero de casillas, ambos no incluidos. Introducieno valores por defecto(14)"), 1);
        numeroDeMinas = 14;
        document.getElementById("minas").value = 14;
    }

    PrimerClick = true;
    MinasEncontradas = 0;
    numeroCasillasSinMinasPorRevelar = (filas*columnas)-numeroDeMinas;
    tablero = [];

    tablaBuscaminas.innerHTML=""; // limpia el tablero
    for (let fila = 0; fila < filas; fila++) {
        for (let col = 0; col < columnas; col++) {
            const casilla = document.createElement("div");
            casilla.dataset.fila = fila;
            casilla.dataset.col = col;
            casilla.addEventListener("click", gestionarclick); // Agregar evento de clic izquierdo
            casilla.addEventListener("contextmenu", bandera); // Agregar evento de clic derecho
            tablaBuscaminas.appendChild(casilla);
        }
    }
    document.querySelector(":root").style.setProperty("--num-filas", filas);
    document.querySelector(":root").style.setProperty("--num-columnas", columnas);

    // Muestra el numero de minas
    document.querySelector("#numMinasRestantes").innerHTML = (numeroDeMinas - MinasEncontradas);

    detenerTemporizador();
    tiempo = 0;
    document.querySelectorAll(".tiempo").forEach(span => span.innerHTML = tiempo/10);

    crearTablero();
}


function crearTablero() {
    // Crea el tablero y llena con casillas vacías con propiedades
    for (let fila = 0; fila < filas; fila++) {
        const Arrayfila = [];
        for (let col = 0; col < columnas; col++) {
            Arrayfila.push({
                esMina: false,//Parametro que guarda si es una mina
                revelada: false,//Parametro que guarda si se a revelado
                bandera: 0,//Parametro que guarda si es una bandera o interrogante (0=nada, 1=bandera, 2=interrogante)
                vecinos: 0//Parametro que la cantidad de minas alrededor
            });
        }
        tablero.push(Arrayfila);
    }
}

//Funcion que genera y coloca las minas
function plantMines(Pf, Pc) {
    // Coloca minas en ubicaciones aleatorias.
    for (let i = 0; i < numeroDeMinas; i++) {
        let fila, col;
        do {
            fila = Math.floor(Math.random() * filas);
            col = Math.floor(Math.random() * columnas);
        } while (tablero[fila][col].esMina || (fila===Pf && col===Pc) );  // no puedes poner una mina donde ya se ha echo clic
        tablero[fila][col].esMina = true;
        //suma 1 a las casillas vecinas
        for (let f = fila - 1; f <= fila + 1; f++) {
            for (let c = col - 1; c <= col + 1; c++) {
                if (f >= 0 && c >= 0 && f < filas && c < columnas) {
                    tablero[f][c].vecinos++;
                }
            }
        }
    }
}

//Funcion que muestra las casillas
function mostrarcasilla(fila, col) {
    if (fila < 0 || col < 0 || fila >= filas || col >= columnas) return; // Evita desbordamiento del tablero.

    let casilla = tablero[fila][col]; //Creamos una variable con las propiedades de la casilla en esta fila y columna
    if (casilla.revelada || casilla.bandera > 0)return; // No revelamos una casilla ya revelada o con bandera.
    casilla.revelada = true;
    if(PrimerClick){
        plantMines(fila, col);
        PrimerClick=false;
        tiempo = 0;
        temporizador = setInterval(function() {
            tiempo++;
            document.querySelectorAll(".tiempo").forEach(span => span.innerHTML = tiempo/10);
        }, 100);
    }

    let casillaHTML = document.querySelector(`[data-fila="${fila}"][data-col="${col}"]`);
    casillaHTML.classList.add('destapado');


    if (casilla.esMina) {
        casillaHTML.classList.add("icon-mina");
        detenerTemporizador();
        desabilitarEventosClickBotones();
        // Código para mostrar el contenedor gameOver después de 5 segundos
    setTimeout(function () {
        const gameOver = document.getElementById('gameOver')
        gameOver.style.display = 'block' // Mostrar el contenedor
  
        // Código para ocultar el contenedor después de 3 segundos adicionales (total 8 segundos)
        setTimeout(function () {
          gameOver.style.display = 'none' // Ocultar el contenedor
        }, 5000)
      }, 2000)
        // Revelar todas las minas
        for (let f = 0; f < filas; f++) {
            for (let c = 0; c < columnas; c++) {
                if (tablero[f][c].esMina) {
                    casilla = tablero[f][c];
                    casillaHTML = document.querySelector(`[data-fila="${f}"][data-col="${c}"]`);
                    casillaHTML.classList.add('destapado');
                    if(casilla.bandera === 0)casillaHTML.classList.add("icon-mina");
                    casillaHTML.style.backgroundColor = "var(--color-fons-mina)";
                }
            }
        }
        video.style.display = 'block'; // Mostrar el video
        video.play(); // Reproducir el video

        document.getElementById("explosionAudio").play();
    } else if (casilla.vecinos === 0) {
        // Si la casilla no tiene minas vecinas, revela las casillas adyacentes.
        for (let f = fila - 1; f <= fila + 1; f++) {
            for (let c = col - 1; c <= col + 1; c++) {
                mostrarcasilla(f, c);
            }
        }
        numeroCasillasSinMinasPorRevelar--;
    } else {
        //Añado la clase que cotrola el color del numero dependiendo las minas que tiene alrededor.
        casillaHTML.classList.add('c' + tablero[fila][col].vecinos);
        //Añade dentro de la casilla el numero de minas.
        casillaHTML.innerHTML = tablero[fila][col].vecinos;
        numeroCasillasSinMinasPorRevelar--;
    }
    bubbleSound.currentTime = 0;
    bubbleSound.play();
}

//Funcion que comprueba si has ganado
function checkWin() {
    // El jugador gana si todas las casillas no minadas están reveladas.
    if (numeroCasillasSinMinasPorRevelar === 0) {
        detenerTemporizador();// Detener temporizador
        desabilitarEventosClickBotones();
        new Audio('loops/winn.mp3').play();
        document.getElementById('Ganar').style.display = 'block';
    }
}

//Funcion que detiene el juego
function desabilitarEventosClickBotones(){
    let ArrayCasillas = tablaBuscaminas.children;
    for (let i = 0 ; i < ArrayCasillas.length; i++) {
        //quitamos los listeners de los eventos a las casillas
        ArrayCasillas[i].removeEventListener("click", gestionarclick);
        ArrayCasillas[i].removeEventListener("contextmenu", bandera);
    }

}

//Funcion para alternar entre bandera y interrogante
function bandera(event) {
    event.preventDefault();// Evitar el menú contextual del botón derecho
    const fila = parseInt(event.target.dataset.fila);
    const col = parseInt(event.target.dataset.col);
    const casilla = tablero[fila][col];
    const casillaHTML = document.querySelector(`[data-fila="${fila}"][data-col="${col}"]`);

    if (!casilla.revelada) {
        if (casilla.bandera===0) {
            if (MinasEncontradas<numeroDeMinas){
                MinasEncontradas++;
                casillaHTML.classList.add("icon-bandera"); // Agregar bandera
                casilla.bandera = 1;// Cambiar el estado a bandera(1)
                const pop = new Audio('loops/pop.mp3');
                pop.play();

            }
        } else if(casilla.bandera === 1){
            casillaHTML.classList.remove("icon-bandera");
            casillaHTML.classList.add("icon-duda"); // cambiar a interogante
            MinasEncontradas--;
            casilla.bandera = 2;// Cambiar el estado a interrogante(2)
            const eh = new Audio('loops/eh.mp3');
            eh.play();
        }else{
            casillaHTML.classList.remove("icon-duda");// Remover interrogante
            casilla.bandera = 0;// Cambiar el estado a vacio(0)
        }
        document.querySelector("#numMinasRestantes").innerHTML = (numeroDeMinas - MinasEncontradas);
    }
}

//Funcion que contola el click izquierdo
function gestionarclick(event) {
    const fila = parseInt(event.target.dataset.fila);
    const col = parseInt(event.target.dataset.col);

    mostrarcasilla(fila, col);
    checkWin();
}
// Funcion para detener el temporizador
function detenerTemporizador() {
    clearInterval(temporizador);
}

//funcion que ejecutara el video cuando acabe de reproducirse.
function videoEnded() {
    document.getElementById('video').style.display = 'none'; // Ocultar el video cuando termine
}

//Funciones iconos y estilos
function iconos0(){
    document.querySelector(":root").style.setProperty("--mina", 'url("mina.svg")');
    document.querySelector(":root").style.setProperty("--flag", 'url("flag.svg")');
    document.querySelector(":root").style.setProperty("--interrogant", 'url("interrogant.svg")');
}
function iconos1(){
    document.querySelector(":root").style.setProperty("--mina", 'url("mina1.svg")');
    document.querySelector(":root").style.setProperty("--flag", 'url("flag1.svg")');
    document.querySelector(":root").style.setProperty("--interrogant", 'url("interrogant1.svg")');
}
function iconos2(){
    document.querySelector(":root").style.setProperty("--mina", 'url("mina2.svg")');
    document.querySelector(":root").style.setProperty("--flag", 'url("flag2.svg")');
    document.querySelector(":root").style.setProperty("--interrogant", 'url("interrogant2.svg")');
}
function iconos3(){
    document.querySelector(":root").style.setProperty("--mina", 'url("mina3.svg")');
    document.querySelector(":root").style.setProperty("--flag", 'url("flag3.svg")');
    document.querySelector(":root").style.setProperty("--interrogant", 'url("interrogant.svg")');
}
function estilo0(){
    document.getElementById("estilo").setAttribute('href', 'css/estilo1.css');
}
function estilo1(){
    document.getElementById("estilo").setAttribute('href', 'css/estilo2.css');
}
function estilo2(){
    document.getElementById("estilo").setAttribute('href', 'css/estilo3.css');
}