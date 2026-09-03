# 🕐 Relógio Digital

Relógio digital desenvolvido em **HTML, CSS e JavaScript puro**, com saudação e paleta de cores que mudam dinamicamente conforme o horário real do dia, além de **alarme**, **cronômetro**, **timer** e **seletor de fuso horário**, organizados em abas dentro do mesmo painel.

<div align="center">
  <img src="https://img.shields.io/badge/HTML-239120?style=for-the-badge&logo=html5&logoColor=white" alt="HTML5"/>
  <img src="https://img.shields.io/badge/CSS-239120?style=for-the-badge&logo=css3&logoColor=white" alt="CSS3"/>
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript"/>
</div>

<br>

## 📌 Sobre o projeto

O **Relógio Digital** exibe horas, minutos e segundos em tempo real, com uma saudação ("Bom dia", "Boa tarde", "Boa noite" ou "Boa madrugada") e um fundo em gradiente animado que mudam automaticamente conforme o horário. Além do relógio, o projeto conta com quatro funcionalidades organizadas em abas:

- ⏰ **Alarme** — cadastro de múltiplos alarmes com nome opcional, ativação/desativação individual e persistência entre sessões (via `localStorage`).
- ⏱️ **Cronômetro** — contagem crescente com precisão de centésimos de segundo, suporte a pausar/continuar e marcação de voltas.
- ⏳ **Timer** — contagem regressiva configurável em minutos e segundos, com aviso sonoro ao finalizar.
- 🌍 **Fuso horário** — seletor para visualizar o horário atual em diferentes cidades do mundo.
- ⛶ **Tela cheia** — botão para expandir o relógio ocupando toda a tela.

## 🎯 Objetivos de aprendizado

- Manipulação do DOM com JavaScript (`getElementById`, `querySelectorAll`, `addEventListener`)
- Trabalho com o objeto `Date` e com a API `Intl.DateTimeFormat` para conversão de fusos horários
- Persistência de dados no navegador com `localStorage` e `JSON.stringify`/`JSON.parse`
- Geração de som via **Web Audio API**, sem depender de arquivos de áudio externos
- Controle de tempo preciso com `Date.now()` (cronômetro) e `setInterval` (timer)
- Uso da **Fullscreen API** para alternar o modo de tela cheia
- Estilização responsiva com `clamp()`, `flexbox` e variáveis CSS (`custom properties`)
- Efeitos visuais modernos: *glassmorphism* (vidro fosco) e gradientes animados
- Boas práticas de acessibilidade (`aria-live`, `aria-selected`, `prefers-reduced-motion`)

## 🛠️ Tecnologias utilizadas

| Tecnologia | Uso no projeto |
|---|---|
| **HTML5** | Estruturação semântica do conteúdo e formulários |
| **CSS3** | Estilização, responsividade, animações e tema dinâmico |
| **JavaScript** | Relógio, alarme, cronômetro, timer, fuso horário e tela cheia |

## 🚀 Como executar o projeto

Como se trata de um projeto estático (HTML + CSS + JS), não é necessário instalar dependências. Basta:

```bash
# Clone este repositório
git clone https://github.com/IDuartee8/relogio-digital.git

# Acesse a pasta do projeto
cd relogio-digital

# Abra o arquivo index.html no navegador
```

Ou, se preferir, utilize a extensão **Live Server** do VS Code para rodar com recarregamento automático durante o desenvolvimento.

## 📁 Estrutura do projeto

```
relogio-digital/
├── index.html
└── assets/
    ├── css/
    │   └── style.css
    └── js/
        └── script.js
```

## 📚 Aprendizados

Este projeto foi uma oportunidade de aprofundar o uso de JavaScript puro para manipular a interface em tempo real, persistir dados no navegador e trabalhar com APIs nativas (Intl, Web Audio, Fullscreen) — tudo sem depender de nenhuma biblioteca ou framework externo.

## 👤 Autor

Desenvolvido por **Iago Duarte**

[![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/IDuartee8)

---

<p align="center">Feito com 💙 em JavaScript puro</p>
