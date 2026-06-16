# Documentação Técnica — Velho Sul

## Visão Geral

Velho Sul é um jogo tipo runner implementado com p5.js, demonstrando técnicas de programação em HTML5 Canvas como interpolação linear (lerp), mapeamento de valores (map), trigonometria (sin/cos), colisão, estado de máquina e síntese de áudio com Web Audio API.

## Estrutura de Arquivos

```
velho-sul/
├── index.html          # Página principal
├── styles.css          # Estilos responsivos
├── sketch.js           # Lógica do jogo e máquina de estados
├── entities.js         # Classes de entidades do jogo
├── audio.js            # Sistema de som com Web Audio API
├── assets/
│   └── image/
│       ├── pinhao.svg  # Sprite do coletável
│       └── chimarrao.svg # Sprite do power-up
├── docs/
│   ├── TECNICA.md      # Este arquivo
│   └── superpowers/    # Especificações de design
└── LICENSE             # MIT License
```

## Componentes Principais

### 1. sketch.js — Game Loop e Estados

Define a classe `Game` que gerencia:

- **Estados**: menu, help, about, playing, paused, gameover
- **Loop Principal**: update() e draw() sincronizados com deltaTime
- **Progressão**: 4 fases com dificuldade crescente
- **Cenário**: transição de pôr-do-sol para noite com `lerpColor()`
- **Colisões**: detecção de contato entre player, obstáculos e coletáveis
- **Entrada**: teclado (↑/↓/W/S), mouse/toque

**Pontos-chave de implementação:**

- `lerp()` para movimento suave entre trilhas
- `map()` para dimensionar velocidade durante o tempo
- `lerpColor()` para transição de céu ao longo de 60 segundos
- LocalStorage para persistência de recorde

### 2. entities.js — Lógica de Entidades

Classes para objetos do jogo:

#### Player
- Posição em Y vinculada a uma de três trilhas
- Movimento suave com interpolação
- Colisão: AABB (axis-aligned bounding box)
- Invencibilidade temporária (power-up)
- Animação de passo baseada em tempo

#### Obstacle
- Jagunços (ocupam 1 trilha)
- Barris (ocupam 1 trilha)
- Pares de jagunços com tábua (ocupam 2 trilhas)
- Velocidade escalável
- Pooling implícito: objetos removidos quando saem da tela

#### Collectible
- Pinhões: movimento senoidal, aumentam score
- Chimarrão da Sorte: concede 3 segundos de invencibilidade

#### Particle
- Efeitos visuais de coleta e dano
- Duração limitada

### 3. audio.js — Web Audio API

Síntese de som usando osciladores:

- **Contexto**: desbloqueia com primeira entrada (user interaction)
- **Música**: loop melodioso com 16 notas MIDI
- **Efeitos**:
  - Menu: 440 Hz (Lá 4)
  - Coleta: arpegio ascendente
  - Power-up: 3 notas sequenciais
  - Dano: modulação de frequência (chirp)
  - Fase: arpejo maior

**Recursos:**
- `playTone()`: oscilador com envelope ADSR simplificado
- `midiToFrequency()`: conversão MIDI para Hz
- Fade in/out com `exponentialRampToValueAtTime()`
- Volume master global (mute toggle)

## Conteúdo Técnico Demonstrado

### Interpolação
```javascript
// Movimento suave entre trilhas
const interpolation = 1 - Math.pow(0.82, deltaSeconds * 60);
this.position.y = lerp(this.position.y, targetY, interpolation);
```

### Mapeamento
```javascript
// Velocidade aumenta com o tempo
const intensity = map(this.elapsed, 0, 120, 0, 1);
const speed = map(intensity, 0, 1, 280, 820);
```

### Trigonometria
```javascript
// Movimento senoidal de coletáveis
const wave = sin(time * 2) * 8;
```

### Transição de Cor
```javascript
// Céu muda de pôr-do-sol para noite
const nightAmount = map(this.elapsed, 45, 60, 0, 1);
const skyTop = lerpColor(this.palette.sunsetTop, this.palette.nightTop, nightAmount);
```

### Web Audio API
```javascript
// Síntese de tom com modulação
const oscillator = this.context.createOscillator();
oscillator.frequency.exponentialRampToValueAtTime(endFreq, startTime + duration);
```

## Fluxo de Jogo

1. **Menu Principal**: Jogar, Como Jogar, Sobre
2. **Jogo Ativo** (120 segundos por fase):
   - Spawnar obstáculos em intervalos aleatórios
   - Spawnar coletáveis com menor frequência
   - Aumentar velocidade gradualmente
   - Detectar colisões
   - Atualizar UI (score, vidas, fase)
3. **Modo Noturno** (entre 45-60 seg):
   - Céu escurece
   - Lanternas de jagunços iluminam em raio
4. **Pausa**: Congelar estado, permitir resumo
5. **Game Over**: Mostrar recorde, opção de reiniciar

## Otimizações

- **Pooling**: Reutilizar arrays em vez de criar novos
- **Single Responsibility**: Cada classe tem um objetivo claro
- **Deltatime**: Usar `deltaTime` para independência de framerate
- **Draw Order**: Fundo → entidades → UI
- **Mobile**: Touch detection com `touchStarted()`

## Testes Recomendados

- [ ] Navegação de todos os menus
- [ ] Entrada por teclado e toque
- [ ] Colisões acertam
- [ ] Coleta funciona
- [ ] Power-up deixa invencível
- [ ] Velocidade aumenta
- [ ] Fases mudam em 25, 50, 75 segundos
- [ ] Céu fica noturno entre 45-60 seg
- [ ] Lanternas aparecem à noite
- [ ] Pausa e resumo funcionam
- [ ] Game over mostra recorde
- [ ] Som pode ser mutado
- [ ] Recorde persiste (localStorage)

## Extensões Futuras

- Múltiplos temas (winter, jungle)
- Leaderboard remoto
- Diferentes personagens desbloqueáveis
- Efeitos de partícula mais elaborados
- Áudio: samples vs síntese
