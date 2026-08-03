[English version](README.md)

# ⚔️ Marcos Adventure — Ultra Edition

> *"Todo grande herói precisa de um grande vilão — e aqui temos três."*

**Marcos Adventure** é um jogo de tiro espacial (shoot 'em up) no estilo **bullet-hell neon**, construído 100% com HTML5 Canvas, CSS e JavaScript puro — sem frameworks, sem dependências.

O jogador controla **Marcos** e enfrenta **3 chefes épicos** (baseados em stickers do professor) em batalhas cada vez mais brutais, com fases cheias de inimigos, power-ups e efeitos visuais.

> ⚠️ **Aviso:** Nenhum professor foi ferido durante o desenvolvimento deste jogo. Emocionalmente, talvez.

---

## 🎮 Jogabilidade

- **3 fases + 3 chefes únicos** — cada um com padrões de ataque próprios
- **Sistema de armas progressivo** — colete power-ups para evoluir do nível 1 ao 4
- **OVERDRIVE (Fúria)** — ative a fúria de Marcos para ficar temporariamente invencível e disparar em barragem
- **Inimigos variados** — 4 tipos: básico, serpenteante, tanque e zigue-zague
- **Power-ups** — cura, melhoria de arma e fúria
- **Efeitos visuais** — partículas, explosões, screen-shake, nebulosas, estrelas com parallax, scanlines CRT
- **Sons 8-bit** gerados proceduralmente (sem arquivos de áudio!)
- **Pausa, som liga/desliga, modo lento de mira (SHIFT)**
- **100% no navegador** — sem instalação, é só abrir e jogar

---

## 🕹️ Controles

| Tecla | Ação |
|---|---|
| `W A S D` / `← ↑ ↓ →` | Mover |
| `ESPAÇO` | Atirar |
| `SHIFT` | Movimento lento (mira) |
| `P` / `ESC` | Pausar |
| `M` | Som liga/desliga |

---

## 🚀 Começando

Você não precisa instalar nada. Literalmente.

```bash
# Clone o repositório
git clone https://github.com/ChristopherDond/MarcosAdventure.git
cd MarcosAdventure

# Abra o index.html no seu navegador
# (ou apenas arraste o arquivo para o navegador, também funciona)
```

> 💡 **Dica:** Use a extensão [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) no VS Code para uma melhor experiência de desenvolvimento.

---

## 📁 Estrutura do Projeto

```
MarcosAdventure/
├── index.html            # Ponto de entrada do jogo
├── css/
│   └── style.css         # Estilo, HUD, overlays, neon
├── js/
│   ├── config.js         # Configuração central (balanceamento)
│   ├── audio.js          # Sons 8-bit procedurais
│   ├── input.js          # Teclado + toque
│   ├── particles.js      # Partículas, explosões, anéis
│   ├── bullets.js        # Projéteis
│   ├── background.js     # Estrelas, nebulosas, parallax
│   ├── player.js         # Marcos: movimento, tiro, fúria
│   ├── enemies.js        # Inimigos das fases
│   ├── bosses.js         # Os 3 chefes
│   ├── ui.js             # HUD, telas, câmera
│   └── main.js           # Game loop, fases, colisões
└── assets/
    ├── marcos4.png       # Sprite do Marcos (fundo removido)
    ├── quecedisse.png    # Chefe 1
    ├── quetristeza.png   # Chefe 2
    ├── bossAbsoluto.png  # Chefe 3
    └── marcos1.gif       # GIF da vitória (mantido!)
```

---

## 🧑‍🏫 Os Chefes

| # | Chefe | Dificuldade | Padrão de ataque |
|---|---|---|---|
| 1 | Que Cê Disse? | ⭐ Fácil | Leques de balas, tiro mirado, anel |
| 2 | Que Tristeza | ⭐⭐ Médio | Anéis, tiros duplos, **fantasmas orbitais** |
| 3 | Marcos Absoluto | ⭐⭐⭐ Difícil | Barragens, **mísseis teleguiados**, anéis duplos |

---

## 🛠️ Stack Tecnológico

- **HTML5** — estrutura do jogo
- **CSS3** — animações e estilo visual
- **JavaScript (Vanilla)** — lógica do jogo, colisões e comportamento dos chefes

Sem bibliotecas externas. Zero dependências. Front-end puro de guerrilha.

---

## 📱 Versão Mobile

Quer jogar no celular? Existe uma versão otimizada para dispositivos móveis:

👉 **[Marcos Adventure — Mobile](https://github.com/ChristopherDond/MarcosAdventureMobal)**

---

## 🕹️ Jogue agora

👉 **[Marcos Adventure](https://christopherdond.github.io/MarcosAdventure/)**

---

## 👤 Autor

Construído com carinho (e um toque de vingança estudantil) por **Christopher**.

---

## 📄 Licença

Livre para uso educacional, recreativo e para zoação controlada.

*O professor sabe da existência deste repositório? Talvez. Provavelmente. Boa sorte.*

---

*Feito com ☕, HTML puro e muita vingança estudantil*
