/* ==========================================================
   RELÓGIO DIGITAL — script principal
   Dividido em blocos: relógio, abas, som, alarme, cronômetro,
   timer, tela cheia e o "ciclo principal" que amarra tudo.
   ========================================================== */

/* ---------- 1. Relógio (com suporte a fuso horário) ---------- */

const elHoras = document.getElementById('horas');
const elMinutos = document.getElementById('minutos');
const elSegundos = document.getElementById('segundos');
const elSaudacao = document.getElementById('saudacao');
const elData = document.getElementById('data');
const seletorFuso = document.getElementById('fuso');

const diasDaSemana = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'];
const meses = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];

function doisDigitos(valor) {
    return valor < 10 ? '0' + valor : String(valor);
}

// Devolve { hora, minuto, segundo, dia semana, dia, mes } no fuso escolhido.
// Quando o fuso é "local", usamos o relógio do próprio dispositivo.
// Para qualquer outro fuso, usamos a API Intl (nativa do navegador) para
// perguntar "que horas são agora, em tal lugar do mundo?".
function obterDataHoraNoFuso(fuso) {
    const agora = new Date();

    if (fuso === 'local') {
        return {
            hora: agora.getHours(),
            minuto: agora.getMinutes(),
            segundo: agora.getSeconds(),
            diaSemana: agora.getDay(),
            dia: agora.getDate(),
            mes: agora.getMonth()
        };
    }

    const formatador = new Intl.DateTimeFormat('pt-BR', {
        timeZone: fuso,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        hour12: false
    });

    const partes = formatador.formatToParts(agora);
    const obter = (tipo) => partes.find((parte) => parte.type === tipo)?.value;

    const indiceDia = diasDaSemana.indexOf(obter('weekday'));
    const indiceMes = meses.indexOf(obter('month'));

    return {
        hora: Number(obter('hour')),
        minuto: Number(obter('minute')),
        segundo: Number(obter('second')),
        diaSemana: indiceDia >= 0 ? indiceDia : agora.getDay(),
        dia: Number(obter('day')),
        mes: indiceMes >= 0 ? indiceMes : agora.getMonth()
    };
}

function obterSaudacao(hora) {
    if (hora >= 5 && hora < 12) 
        return 'Bom dia';
    if (hora >= 12 && hora < 18)
         return 'Boa tarde';
    if (hora >= 18 && hora < 24)
         return 'Boa noite';
    return 'Boa madrugada';
}

function obterPeriodo(hora) {
    if (hora >= 5 && hora < 12) 
        return 'morning';
    if (hora >= 12 && hora < 18)
         return 'afternoon';
    if (hora >= 18 && hora < 22)
         return 'evening';
    return 'night';
}

function atualizarRelogio() {
    const { hora, minuto, segundo, diaSemana, dia, mes } = obterDataHoraNoFuso(seletorFuso.value);

    elHoras.textContent = doisDigitos(hora);
    elMinutos.textContent = doisDigitos(minuto);
    elSegundos.textContent = doisDigitos(segundo);

    elSaudacao.textContent = obterSaudacao(hora);
    document.body.dataset.period = obterPeriodo(hora);

    elData.textContent = `${diasDaSemana[diaSemana]}, ${dia} de ${meses[mes]}`;
    document.title = `${doisDigitos(hora)}:${doisDigitos(minuto)} · Relógio Digital`;
}

seletorFuso.addEventListener('change', atualizarRelogio);

/* ---------- 2. Sistema de abas ---------- */

const botoesAba = document.querySelectorAll('.tab-btn');
const paineis = {
    relogio: document.getElementById('painel-relogio'),
    alarme: document.getElementById('painel-alarme'),
    cronometro: document.getElementById('painel-cronometro'),
    timer: document.getElementById('painel-timer')
};

botoesAba.forEach((botao) => {
    botao.addEventListener('click', () => {
        botoesAba.forEach((b) => {
            b.classList.remove('active');
            b.setAttribute('aria-selected', 'false');
        });
        botao.classList.add('active');
        botao.setAttribute('aria-selected', 'true');

        Object.entries(paineis).forEach(([nome, painel]) => {
            painel.hidden = nome !== botao.dataset.tab;
        });
    });
});

/* ---------- 3. Som (bipe) reutilizável para alarme e timer ---------- */

let contextoAudio;

function tocarBipe(duracaoMs = 600, frequencia = 880) {
    if (!contextoAudio) {
        contextoAudio = new (window.AudioContext || window.webkitAudioContext)();
    }
    const oscilador = contextoAudio.createOscillator();
    const ganho = contextoAudio.createGain();

    oscilador.type = 'sine';
    oscilador.frequency.value = frequencia;
    ganho.gain.setValueAtTime(0.15, contextoAudio.currentTime);
    ganho.gain.exponentialRampToValueAtTime(0.0001, contextoAudio.currentTime + duracaoMs / 1000);

    oscilador.connect(ganho);
    ganho.connect(contextoAudio.destination);

    oscilador.start();
    oscilador.stop(contextoAudio.currentTime + duracaoMs / 1000);
}

/* ---------- 4. Alarme ---------- */

const formAlarme = document.getElementById('form-alarme');
const inputHoraAlarme = document.getElementById('input-hora-alarme');
const inputNomeAlarme = document.getElementById('input-nome-alarme');
const listaAlarmes = document.getElementById('lista-alarmes');

let alarmes = JSON.parse(localStorage.getItem('alarmes')) || [];
let ultimoMinutoChecado = null; // evita o alarme disparar várias vezes no mesmo minuto

function salvarAlarmes() {
    localStorage.setItem('alarmes', JSON.stringify(alarmes));
}

function renderizarAlarmes() {
    listaAlarmes.innerHTML = '';

    if (alarmes.length === 0) {
        listaAlarmes.innerHTML = '<li class="empty-state">Nenhum alarme cadastrado.</li>';
        return;
    }

    alarmes
        .slice()
        .sort((a, b) => a.hora.localeCompare(b.hora))
        .forEach((alarme) => {
            const item = document.createElement('li');
            item.className = 'alarm-item';

            item.innerHTML = `
                <div class="alarm-info">
                    <span class="alarm-time">${alarme.hora}</span>
                    ${alarme.nome ? `<span class="alarm-name">${alarme.nome}</span>` : ''}
                </div>
                <div class="alarm-actions">
                    <input type="checkbox" class="alarm-switch" ${alarme.ativo ? 'checked' : ''} aria-label="Ativar ou desativar alarme">
                    <button type="button" class="btn-remove" aria-label="Remover alarme">✕</button>
                </div>
            `;

            item.querySelector('.alarm-switch').addEventListener('change', (evento) => {
                alarme.ativo = evento.target.checked;
                salvarAlarmes();
            });

            item.querySelector('.btn-remove').addEventListener('click', () => {
                alarmes = alarmes.filter((a) => a.id !== alarme.id);
                salvarAlarmes();
                renderizarAlarmes();
            });

            listaAlarmes.appendChild(item);
        });
}

formAlarme.addEventListener('submit', (evento) => {
    evento.preventDefault();
    if (!inputHoraAlarme.value) return;

    alarmes.push({
        id: Date.now(),
        hora: inputHoraAlarme.value, // já vem pronto no formato "HH:MM"
        nome: inputNomeAlarme.value.trim(),
        ativo: true
    });

    salvarAlarmes();
    renderizarAlarmes();
    formAlarme.reset();
});

function verificarAlarmes(hora, minuto, segundo) {
    const horaFormatada = `${doisDigitos(hora)}:${doisDigitos(minuto)}`;

    // só verifica no segundo 0 de cada minuto, e não repete no mesmo minuto
    if (segundo !== 0 || horaFormatada === ultimoMinutoChecado) return;

    const alarmeTocando = alarmes.find((a) => a.ativo && a.hora === horaFormatada);
    if (!alarmeTocando) return;

    ultimoMinutoChecado = horaFormatada;
    tocarBipe(1000, 880);
    setTimeout(() => tocarBipe(1000, 880), 1200);
    alert(`⏰ Alarme: ${alarmeTocando.nome || 'sem nome'} — ${alarmeTocando.hora}`);
}

renderizarAlarmes();

/* ---------- 5. Cronômetro ---------- */

const displayCronometro = document.getElementById('cronometro-display');
const btnCronometroIniciar = document.getElementById('btn-cronometro-iniciar');
const btnCronometroVolta = document.getElementById('btn-cronometro-volta');
const btnCronometroZerar = document.getElementById('btn-cronometro-zerar');
const listaVoltas = document.getElementById('lista-voltas');

let cronometroRodando = false;
let cronometroInicio = 0;
let cronometroAcumulado = 0;
let cronometroIntervalo = null;

function formatarTempoCronometro(ms) {
    const totalCentesimos = Math.floor(ms / 10);
    const centesimos = totalCentesimos % 100;
    const totalSegundos = Math.floor(ms / 1000);
    const segundos = totalSegundos % 60;
    const totalMinutos = Math.floor(totalSegundos / 60);
    const minutos = totalMinutos % 60;
    const horas = Math.floor(totalMinutos / 60);

    return {
        texto: `${doisDigitos(horas)}:${doisDigitos(minutos)}:${doisDigitos(segundos)}`,
        centesimos: doisDigitos(centesimos)
    };
}

function atualizarDisplayCronometro() {
    const decorrido = cronometroAcumulado + (cronometroRodando ? Date.now() - cronometroInicio : 0);
    const { texto, centesimos } = formatarTempoCronometro(decorrido);
    displayCronometro.innerHTML = `${texto}<span class="ms">.${centesimos}</span>`;
}

btnCronometroIniciar.addEventListener('click', () => {
    if (!cronometroRodando) {
        cronometroRodando = true;
        cronometroInicio = Date.now();
        cronometroIntervalo = setInterval(atualizarDisplayCronometro, 10);
        btnCronometroIniciar.textContent = 'Pausar';
        btnCronometroVolta.disabled = false;
    } else {
        cronometroRodando = false;
        cronometroAcumulado += Date.now() - cronometroInicio;
        clearInterval(cronometroIntervalo);
        btnCronometroIniciar.textContent = 'Continuar';
        btnCronometroVolta.disabled = true;
    }
});

btnCronometroVolta.addEventListener('click', () => {
    const decorrido = cronometroAcumulado + (Date.now() - cronometroInicio);
    const { texto, centesimos } = formatarTempoCronometro(decorrido);

    const item = document.createElement('li');
    item.className = 'lap-item';
    item.textContent = `Volta ${listaVoltas.children.length + 1} — ${texto}.${centesimos}`;
    listaVoltas.prepend(item);
});

btnCronometroZerar.addEventListener('click', () => {
    cronometroRodando = false;
    cronometroAcumulado = 0;
    clearInterval(cronometroIntervalo);
    btnCronometroIniciar.textContent = 'Iniciar';
    btnCronometroVolta.disabled = true;
    listaVoltas.innerHTML = '';
    atualizarDisplayCronometro();
});

atualizarDisplayCronometro();

/* ---------- 6. Timer (contagem regressiva) ---------- */

const inputTimerMin = document.getElementById('input-timer-min');
const inputTimerSeg = document.getElementById('input-timer-seg');
const displayTimer = document.getElementById('timer-display');
const btnTimerIniciar = document.getElementById('btn-timer-iniciar');
const btnTimerPausar = document.getElementById('btn-timer-pausar');
const btnTimerZerar = document.getElementById('btn-timer-zerar');

let timerSegundosRestantes = 0;
let timerIntervalo = null;
let timerRodando = false;

function formatarTimer(totalSegundos) {
    const minutos = Math.floor(totalSegundos / 60);
    const segundos = totalSegundos % 60;
    return `${doisDigitos(minutos)}:${doisDigitos(segundos)}`;
}

function atualizarDisplayTimer() {
    displayTimer.textContent = formatarTimer(timerSegundosRestantes);
}

function iniciarContagemInicial() {
    const minutos = Number(inputTimerMin.value) || 0;
    const segundos = Number(inputTimerSeg.value) || 0;
    timerSegundosRestantes = minutos * 60 + segundos;
    atualizarDisplayTimer();
}

inputTimerMin.addEventListener('input', () => { if (!timerRodando) iniciarContagemInicial(); });
inputTimerSeg.addEventListener('input', () => { if (!timerRodando) iniciarContagemInicial(); });

btnTimerIniciar.addEventListener('click', () => {
    if (timerSegundosRestantes <= 0) iniciarContagemInicial();
    if (timerSegundosRestantes <= 0) return;

    timerRodando = true;
    btnTimerIniciar.disabled = true;
    btnTimerPausar.disabled = false;
    inputTimerMin.disabled = true;
    inputTimerSeg.disabled = true;

    timerIntervalo = setInterval(() => {
        timerSegundosRestantes--;
        atualizarDisplayTimer();

        if (timerSegundosRestantes <= 0) {
            clearInterval(timerIntervalo);
            timerRodando = false;
            btnTimerIniciar.disabled = false;
            btnTimerPausar.disabled = true;
            inputTimerMin.disabled = false;
            inputTimerSeg.disabled = false;
            tocarBipe(800, 660);
            setTimeout(() => tocarBipe(800, 660), 900);
        }
    }, 1000);
});

btnTimerPausar.addEventListener('click', () => {
    clearInterval(timerIntervalo);
    timerRodando = false;
    btnTimerIniciar.disabled = false;
    btnTimerPausar.disabled = true;
});

btnTimerZerar.addEventListener('click', () => {
    clearInterval(timerIntervalo);
    timerRodando = false;
    inputTimerMin.disabled = false;
    inputTimerSeg.disabled = false;
    btnTimerIniciar.disabled = false;
    btnTimerPausar.disabled = true;
    iniciarContagemInicial();
});

iniciarContagemInicial();

/* ---------- 7. Tela cheia ---------- */

const btnFullscreen = document.getElementById('btnFullscreen');

btnFullscreen.addEventListener('click', () => {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
    } else {
        document.exitFullscreen();
    }
});

document.addEventListener('fullscreenchange', () => {
    const emTelaCheia = Boolean(document.fullscreenElement);
    btnFullscreen.textContent = emTelaCheia ? '⤢' : '⛶';
    btnFullscreen.setAttribute('aria-label', emTelaCheia ? 'Sair da tela cheia' : 'Entrar em tela cheia');
});

/* ---------- 8. Ciclo principal ---------- */

function cicloPrincipal() {
    atualizarRelogio();

    const agoraLocal = new Date();
    verificarAlarmes(agoraLocal.getHours(), agoraLocal.getMinutes(), agoraLocal.getSeconds());
}

cicloPrincipal();
setInterval(cicloPrincipal, 1000);
