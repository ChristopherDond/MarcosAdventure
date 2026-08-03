// ============================================================
//  MARCOS ADVENTURE — ULTRA EDITION
//  Configuração central do jogo
// ============================================================

const CONFIG = {
  CANVAS_W: 1000,
  CANVAS_H: 800,

  PLAYER: {
    speed: 380,          // px/s
    slowFactor: 0.45,    // multiplicador ao segurar SHIFT
    hp: 100,
    size: 58,            // hitbox aproximada
    shootDelay: 0.24,    // s entre tiros (nível 1)
    furyDuration: 9,     // s de OVERDRIVE
    invulnTime: 0.6,     // s de invencibilidade após levar dano
    damageFlash: 0.15,
  },

  BULLET: {
    playerSpeed: 760,
    bossSpeed: 300,
    boss2Speed: 260,
    boss3Speed: 240,
    enemyDamage: 7,       // dano de cada bala inimiga
    bossContact: 8,       // dano por contato com chefe
    bossContactInterval: 1.0, // segundos entre contatos do chefe
  },

  STAGES: [
    {
      name: 'O QUE CÊ DISSE?',
      bossClass: 'Boss1',
      bossHp: 300,
      bossColor: '#ff4444',
      img: 'assets/quecedisse.png',
      timeLimit: 35,          // segundos; -1 = sem limite
      enemies: [
        { cls: 'BasicEnemy',  hp: 2,  fireCd: 2.4, speed: 170, color: '#ff6b6b', count: 5, delay: 1.0 },
        { cls: 'BasicEnemy',  hp: 2,  fireCd: 2.6, speed: 170, color: '#ffb84d', count: 4, delay: 6.0 },
      ],
    },
    {
      name: 'QUE TRISTEZA',
      bossClass: 'Boss2',
      bossHp: 480,
      bossColor: '#ff9900',
      img: 'assets/quetristeza.png',
      timeLimit: 45,
      enemies: [
        { cls: 'WeaverEnemy', hp: 3,  fireCd: 3.2, speed: 150, color: '#b06bff', count: 3, delay: 1.0 },
        { cls: 'BasicEnemy',  hp: 2,  fireCd: 2.0, speed: 200, color: '#ff6b6b', count: 5, delay: 8.0 },
        { cls: 'TankEnemy',   hp: 8,  fireCd: 3.8, speed: 60,  color: '#7fd6ff', count: 2, delay: 12.0 },
      ],
    },
    {
      name: 'MARCOS ABSOLUTO',
      bossClass: 'Boss3',
      bossHp: 700,
      bossColor: '#bc13fe',
      img: 'assets/bossAbsoluto.png',
      timeLimit: 60,
      enemies: [
        { cls: 'BasicEnemy',  hp: 3,  fireCd: 1.8, speed: 210, color: '#ff6b6b', count: 6, delay: 1.0 },
        { cls: 'WeaverEnemy', hp: 3,  fireCd: 2.8, speed: 170, color: '#b06bff', count: 4, delay: 5.0 },
        { cls: 'TankEnemy',   hp: 10, fireCd: 3.0, speed: 70,  color: '#7fd6ff', count: 3, delay: 9.0 },
        { cls: 'ZigzagEnemy', hp: 3,  fireCd: 2.4, speed: 230, color: '#4dff88', count: 4, delay: 14.0 },
      ],
    },
  ],

  ITEMS: {
    dropChance: 0.35,        // chance de dropar item ao matar inimigo
    healChance: 0.45,        // entre os drops: chance de heal
    multishotChance: 0.35,   // chance de upgrade de arma
    // resto = fury
    fallSpeed: 170,          // px/s
    bobAmp: 4,
    bobSpeed: 4.5,
  },

  POWERUP: {
    healAmount: 30,
    maxWeaponLevel: 4,
  },

  PARTICLE: {
    trail: true,             // rastro da nave
    explosionCount: 26,
  },

  SOUND: {
    defaultMuted: false,
  },
};
