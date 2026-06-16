# Velho Sul

Jogo de corrida infinita desenvolvido com p5.js para a disciplina Web Development — HTML5 Canvas & Games da PUCPR.

## Equipe

João Paulo Vieira

## Como jogar

- Abra o arquivo `index.html` em um navegador (recomendado: Google Chrome)
- Pressione `↑` ou `W` para subir de faixa
- Pressione `↓` ou `S` para descer de faixa
- Desvie dos jagunços e barris para sobreviver o maior tempo possível
- Sua pontuação aumenta automaticamente e a velocidade também!
- Ao colidir, veja sua pontuação final e tente bater o recorde

No celular: toque acima ou abaixo do personagem para mudar de faixa.

## Tecnologias utilizadas

- HTML5
- JavaScript (ES6+)
- p5.js v1.7.0

## Funcionalidades

- Tela de menu com instrução de início
- Personagem animado com física de movimento
- Obstáculos variados gerados aleatoriamente
- Velocidade progressiva — o jogo fica mais difícil com o tempo
- Sistema de pontuação com recorde da sessão
- Tela de Game Over com pontuação final
- Efeitos sonoros e música de fundo (sintetizados com Web Audio API)
- Transição visual do pôr-do-sol para noite
- Invencibilidade temporária com power-ups

## Estrutura do projeto

```
├── index.html       # Página principal
├── sketch.js        # Lógica completa do jogo
├── entities.js      # Classes de entidades
├── audio.js         # Sistema de áudio
├── styles.css       # Estilização
└── README.md        # Este arquivo
```

## Vídeos

- **Velho Sul**: https://youtu.be/CbIJnIYsI5s
- **Chicken Run** (referência): https://youtu.be/XtrrppbpR5c
