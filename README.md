# Velho Sul

Velho Sul é um runner em três faixas feito com p5.js para o projeto final da disciplina de HTML5 Canvas & Games.

A ideia foi trazer a mecânica simples de jogos como Subway Surfers para um cenário inspirado no Sul do Brasil. O personagem precisa fugir dos jagunços, desviar de barris e de barreiras, além de coletar pinhões durante o caminho.

## Participante

João Paulo Vieira

## Como executar

O projeto não precisa de instalação. Basta iniciar um servidor local na pasta do jogo.

Com Python:

```bash
python -m http.server 8080
```

Depois, acesse `http://localhost:8080` no navegador.

Também é possível abrir o `index.html` usando a extensão Live Server do VS Code.

## Como jogar

- `↑` ou `W`: subir uma faixa
- `↓` ou `S`: descer uma faixa
- `P`: pausar ou continuar
- `Esc`: pausar ou voltar para a tela de título
- `M`: ligar ou desligar o som
- `Enter` ou `Espaço`: confirmar uma opção do menu

No celular, o personagem pode ser controlado tocando acima ou abaixo dele.

O jogador começa com três vidas. A pontuação aumenta com o tempo de sobrevivência e com os pinhões coletados. O Chimarrão da Sorte deixa o personagem invencível por três segundos.

## Progressão

O jogo possui quatro fases. Conforme o tempo passa, os obstáculos ficam mais rápidos e aparecem com intervalos menores. O cenário também muda do pôr do sol para a noite.

O gerador de obstáculos verifica as três faixas antes de criar um novo inimigo. Dessa forma, sempre existe pelo menos um caminho possível para o jogador.

## Arquivos principais

```text
index.html
styles.css
sketch.js
entities.js
audio.js
assets/
  image/
    chimarrao.svg
    pinhao.svg
```

`sketch.js` controla os estados, fases, pontuação, colisões e cenário.

`entities.js` contém as classes do jogador, obstáculos, coletáveis e partículas.

`audio.js` gera a trilha e os efeitos sonoros com a Web Audio API.

## Vídeos

- **Velho Sul**: https://youtu.be/CbIJnIYsI5s
- **Chicken Run** (referência de design): https://youtu.be/XtrrppbpR5c
