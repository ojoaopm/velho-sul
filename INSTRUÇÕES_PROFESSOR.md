# Instruções para Avaliação — Velho Sul

## Sobre o Projeto

**Aluno**: João Paulo Vieira  
**Disciplina**: HTML5 Canvas & Games  
**Data de Entrega**: 2026-06-15  
**Link do Repositório**: https://github.com/joaopaulovic/velho-sul

## Como Executar

### Opção 1: Servidor Python
```bash
cd velho-sul
python -m http.server 8080
```
Acesse: http://localhost:8080

### Opção 2: Live Server (VS Code)
1. Abra a pasta `velho-sul` no VS Code
2. Clique com botão direito em `index.html`
3. Selecione "Open with Live Server"

### Opção 3: GitHub Pages
O repositório pode ser configurado para GitHub Pages, permitindo jogar direto na web.

## Controles

**Desktop:**
- `↑` ou `W` → Subir uma faixa
- `↓` ou `S` → Descer uma faixa
- `P` → Pausar/Continuar
- `Esc` → Menu Principal
- `M` → Ligar/Desligar som

**Mobile:**
- Toque acima do personagem → Subir
- Toque abaixo do personagem → Descer

## Conteúdo Técnico Demonstrado

O jogo implementa diversos tópicos da disciplina:

### 1. **Interpolação Linear** (`lerp`)
- Movimento suave do jogador entre trilhas
- Arquivo: `entities.js` (classe `Player`, método `update()`)

### 2. **Mapeamento de Valores** (`map`)
- Velocidade do jogo aumenta ao longo do tempo (0-120s)
- Intensidade da música responde à dificuldade
- Arquivo: `sketch.js` (método `updateGame()`)

### 3. **Trigonometria** (sin/cos)
- Pinhões flutuam com movimento senoidal
- Animação de passo do jogador
- Arquivo: `entities.js` (métodos `draw()`)

### 4. **Transição de Cores** (`lerpColor`)
- Céu transita de pôr-do-sol para noite entre 45-60 segundos
- Arquivo: `sketch.js` (método `drawScene()`)

### 5. **Máquina de Estados**
- Estados: menu → playing → paused → gameover
- Transitions e lógica de cada estado
- Arquivo: `sketch.js` (classe `Game`)

### 6. **Colisão AABB**
- Detecção entre jogador e obstáculos/coletáveis
- Arquivo: `sketch.js` (métodos `checkCollisions()`)

### 7. **Web Audio API**
- Síntese de som com osciladores
- Efeitos dinâmicos baseados em eventos
- Arquivo: `audio.js` (classe `SoundManager`)

### 8. **Organização de Código**
- Separação em módulos (sketch, entities, audio)
- Reutilização com classes e métodos
- Arquivo: Arquitetura modular

## Mecânicas do Jogo

### Progressão
- **4 Fases**: anunciadas em 0s, 25s, 50s, 75s
- **Dificuldade Crescente**:
  - Velocidade base sobe de 280 px/s para 820 px/s
  - Obstáculos spawnados com intervalos menores
- **Modo Noturno**: entre 45-60s, lanternas iluminam

### Entidades
- **Jagunços**: obstáculo em 1 trilha
- **Barris**: obstáculo em 1 trilha
- **Pares com Tábua**: obstáculo em 2 trilhas
- **Pinhões**: coletáveis, +10 pontos
- **Chimarrão da Sorte**: power-up, 3s de invencibilidade

### Sistema de Vidas
- Começa com 3 vidas
- Colisão com obstáculo = -1 vida
- Chimarrão = imunidade temporária
- Game Over ao perder todas as vidas

## Checklist de Avaliação

- [ ] **Executa sem erros** — jogo inicia no navegador
- [ ] **Navegação funciona** — menu, como jogar, sobre, play
- [ ] **Controles** — teclado e toque respondem
- [ ] **Colisão** — obstáculos causam dano
- [ ] **Coletáveis** — pinhões aumentam score
- [ ] **Power-up** — Chimarrão funciona (invencibilidade)
- [ ] **Progressão** — 4 fases com aumento de dificuldade
- [ ] **Modo Noturno** — céu muda de cor (45-60s)
- [ ] **Som** — música toca e pode ser desligada
- [ ] **Pausa** — jogo pausa e resume
- [ ] **Game Over** — mostra recorde e permite reiniciar
- [ ] **Responsivo** — funciona em mobile
- [ ] **Código limpo** — módulos bem separados
- [ ] **Documentação** — README e docs técnica presentes

## Conceitos Demonstrados

```
Técnicas p5.js:          Conceitos de Programação:     Game Design:
✓ createCanvas()         ✓ Programação orientada a     ✓ Game loop
✓ draw()/update()        objetos (classes)             ✓ Estados e transições
✓ keyPressed()           ✓ Encapsulamento              ✓ Progressão
✓ mousePressed()         ✓ Reutilização de código      ✓ Feedback ao jogador
✓ loadImage()            ✓ Deltatime para              ✓ Balanceamento
✓ fill()/stroke()        independência de framerate
✓ rect()/circle()        ✓ Colisão                     Matemática:
✓ text()                 ✓ Entrada do usuário          ✓ Interpolação (lerp)
✓ lerp()/lerpColor()     ✓ Persistência de dados       ✓ Mapeamento (map)
✓ map()                  (localStorage)                ✓ Trigonometria (sin)
✓ constrain()            ✓ Modularização               ✓ Easing
✓ sin()/cos()            ✓ Naming conventions          ✓ Envelope de áudio
✓ color()                                              ✓ Frequência (MIDI)
```

## Dúvidas?

Para informações técnicas, consulte:
- `docs/TECNICA.md` — Detalhes de implementação
- Comentários no código (sketch.js, entities.js, audio.js)
- Especificação original: `docs/superpowers/specs/`

---

**Boa avaliação!** 🎮🤠
