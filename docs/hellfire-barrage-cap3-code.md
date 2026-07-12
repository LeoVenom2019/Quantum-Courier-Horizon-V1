# Hellfire Barrage - Cap 3

Documento gerado para analisar e melhorar o efeito visual do Especial Hellfire Barrage na batalha do Cap 3.

Arquivo fonte: `components/VoidBattleArena.tsx`

## Fluxo rapido

- A habilidade e acionada no bloco `type === 'burst'`.
- Ela cria `hellfireQueue` com 5 disparos e agenda `hellfireNextLaunchAt`.
- O loop principal tira itens da fila, cria `fireballs`, atualiza arco/posicao e emite `trailParts`.
- Ao atingir alvo ou fim de voo, chama a rotina de impacto, cria `burnZones` e aplica dano imediato/continuo.
- O HUD mostra o botao `F` como `HB BARRAGE` e usa `hud.burstCooldown`.

## Estado e Tipos Relacionados

Campos do VoidBattleState usados pelo Hellfire Barrage.

Linhas aproximadas: 145-170

```tsx
  flashAlpha: number;
  flashColor?: string;
  shockwaves: any[];
  scars: any[];
  cameraPunch: { x: number; y: number; targetX: number; targetY: number };
  destroyedMeteors: number;
  destroyedMeteorites: number;
  specialEnergyBalls: any[];
  laserState: 'idle' | 'charge' | 'firing' | 'collapse';
  laserStateStart: number;
  laserImpactPos: { x: number; y: number };
  laserParticles: any[];
  laserArcs: any[];
  laserEmbers: any[];
  laserDistortionWaves: any[];
  laserBeamWidth: number;
  laserFlashAlpha: number;
  laserResidualBurnLife: number;
  laserLastDamageTick: number;
  playerShotDuckedUntil: number;
  fireballs: any[];
  hellfireQueue: any[];
  hellfireNextLaunchAt: number;
  trailParts: any[];
  burnZones: any[];
  playerDotEffects: any[];
```

## Multiplicadores de Dano

Constantes que controlam dano de impacto e dano continuo da area queimada.

Linhas aproximadas: 248-253

```tsx

const randomInt = ([min, max]: [number, number]) => Math.floor(min + Math.random() * (max - min + 1));
const BOSS_SPRITE_FADE_MS = 110;
const BOSS_SHOOT_SPRITE_MS = 320;
const HELLFIRE_IMPACT_DAMAGE_MULTIPLIER = 6;
const HELLFIRE_BURN_TICK_DAMAGE_MULTIPLIER = 0.35;
```

## Inicializacao do Estado

Arrays e timers do Hellfire inicializados dentro de gameRef.

Linhas aproximadas: 492-531

```tsx
    frameCount: 0,
    flashAlpha: 0,
    shockwaves: [],
    scars: [],
    cameraPunch: { x: 0, y: 0, targetX: 0, targetY: 0 },
    destroyedMeteors: 0,
    destroyedMeteorites: 0,
    specialEnergyBalls: [],
    laserState: 'idle',
    laserStateStart: 0,
    laserImpactPos: { x: 0, y: 0 },
    laserParticles: [],
    laserArcs: [],
    laserEmbers: [],
    laserDistortionWaves: [],
    laserBeamWidth: 0,
    laserFlashAlpha: 0,
    laserResidualBurnLife: 0,
    laserLastDamageTick: 0,
    playerShotDuckedUntil: 0,
    meteorEvent: meteorEventEnabled ? {
      active: true,
      startTime: Date.now() + 500, // Começa quase imediatamente
      lastSpawn: 0,
      warningShown: false,
      extraEnemiesSpawned: 0
    } : {
      active: false,
      startTime: 0,
      lastSpawn: 0,
      warningShown: false,
      extraEnemiesSpawned: 0
    },
    fireballs: [],
    hellfireQueue: [],
    hellfireNextLaunchAt: 0,
    trailParts: [],
    burnZones: [],
    playerDotEffects: [],
    impactFlash: 0,
```

## Ativacao do Hellfire Barrage

Bloco acionado pela habilidade burst, ligada ao botao/tecla F no HUD.

Linhas aproximadas: 800-874

```tsx
      setTimeout(() => { gameRef.current.dodgeActive = false; }, 400);
    } else if (type === 'shield') {
      if (voidResourcesRef.current.energy < 500) { addLog(t('notEnoughEnergy'), 'error'); return; }
      onUpdateResources({ ...voidResourcesRef.current, energy: voidResourcesRef.current.energy - 500 });
      s.abilities.shield.lastUsed = now;
      s.playerShield = Math.min(s.playerMaxShield, s.playerShield + (s.playerMaxShield * 0.4));
      playSfx('level_up');
    } else if (type === 'burst') {
      if (playerShipStats.rarity !== 'mythic') return;
      if (s.fireballs.length > 0 || s.hellfireQueue.length > 0) return;
      if (s.laserState !== 'idle') return; // Bloqueia se o laser estiver ativo
      if (voidResourcesRef.current.tech < 500) { addLog(t('notEnoughEnergy'), 'error'); return; }
      onUpdateResources({ ...voidResourcesRef.current, tech: voidResourcesRef.current.tech - 500 });
      s.abilities.burst.lastUsed = now;

      const dirs = ['up', 'forward', 'down'];
      s.fireballs = [];
      s.hellfireQueue = Array.from({ length: 5 }, (_, index) => ({
        id: `hb-${now}-${index}`,
        dir: dirs[index % dirs.length],
        arcSeed: Math.random(),
        size: 22 + Math.random() * 12,
      }));
      s.hellfireNextLaunchAt = now;

      /*
      for(let i = 0; i < 0; i++) {
          const dir = dirs[Math.floor(Math.random() * dirs.length)];
          let ox = baseOX, oy = baseOY;
          if (dir === 'up') { ox -= 10; oy -= 28; }
          else if (dir === 'forward') { ox += 10; }
          else { ox -= 10; oy += 28; }

          // Localizar inimigo mais próximo
          const target = s.enemies.reduce<VoidBattleEnemy | null>((closest, en) => {
            if (en.hp <= 0) return closest;
            if (!closest) return en;

            const closestDistance = Math.hypot((closest.x / 100) * cWidth - ox, (closest.y / 100) * cHeight - oy);
            const enemyDistance = Math.hypot((en.x / 100) * cWidth - ox, (en.y / 100) * cHeight - oy);
            return enemyDistance < closestDistance ? en : closest;
          }, null);

          const tx = target ? (target.x / 100) * cWidth : cWidth + 200;
          const ty = target ? (target.y / 100) * cHeight : oy + (Math.random() - 0.5) * 200;
          const dist = Math.hypot(tx - ox, ty - oy);

          // Viagem entre 35 e 65 frames
          const travelFrames = Math.max(35, Math.min(65, dist / 12));
          const speed = 1 / travelFrames;

          s.fireballs.push({
              id: `hb-${now}-${i}`,
              ox, oy, tx, ty,
              targetId: target?.id,
              x: ox, y: oy,
              t: 0,
              speed,
              arcBend: (dir === 'up' ? -1 : dir === 'down' ? 1 : 0) * (40 + Math.random() * 50) + (Math.random() - 0.5) * 30,
              size: 22 + Math.random() * 12,
              life: 1,
              done: false,
              readyAt: now + (i * 120) // Mesma base clock do loop
          });
      }
      */
      s.playerShotDuckedUntil = now + 8500;
      playSfx('big_energy_explosion_2', { volume: 1.0, category: 'player' });
    } else if (type === 'special') {
      if (playerShipStats.rarity !== 'mythic') return;
      if (s.fireballs.length > 0 || s.hellfireQueue.length > 0) return; // Bloqueia se HB estiver em curso
      s.abilities.special.lastUsed = now;
      s.laserState = 'charge';
      s.laserStateStart = now;
      s.laserFlashAlpha = 1.0;
```

## Impacto e Area Queimada

Funcao que cria burnZones, flash/impacto e aplica dano imediato.

Linhas aproximadas: 1328-1366

```tsx
          y: (y / cHeight) * 100,
          vx: (Math.cos(angle) * spd / cWidth) * 100,
          vy: (Math.sin(angle) * spd / cHeight) * 100,
          life: smoke ? 0.8 + Math.random() * 0.4 : 0.5 + Math.random() * 0.5,
          maxLife: 1,
          size: smoke ? 3 + Math.random() * 5 : Math.random() < 0.15 ? 3 + Math.random() * 5 : 1 + Math.random() * 2,
          color: smoke ? `rgba(255,120,30,0.5)` : col,
          type: smoke ? 'smoke' : 'spark',
          blend: 'lighter',
          friction: 0.93,
          gravity: smoke ? -0.005 : 0.002,
        });
      }

      // Burn Zone — gravar em pixels
      s.burnZones.push({
        x,       // pixels
        y,       // pixels
        life: 1,
        startTime: now,
        duration: 3500,
        radius: (60 + Math.random() * 25) * (cWidth / 800), // escala com canvas
      });

      // Dano imediato nos inimigos próximos
      const SPLASH_PX = 90 * (cWidth / 800);
      const immDmg = playerShipStatsRef.current.damage * HELLFIRE_IMPACT_DAMAGE_MULTIPLIER;

      s.enemies.forEach(en => {
        if (en.hp <= 0) return;
        const ex = (en.x / 100) * cWidth;
        const ey = (en.y / 100) * cHeight;
        const d = Math.hypot(ex - x, ey - y);
        if (d > SPLASH_PX) return;
        const falloff = d < 5 ? 1 : (1 - d / SPLASH_PX);
        const dmg = Math.floor(immDmg * falloff);
        applyPlayerDamageToEnemy(en, dmg);
      });
    };
```

## Trail Particles

Atualizacao das particulas de trilha deixadas pelas bolas de fogo.

Linhas aproximadas: 2480-2518

```tsx
          dn.y -= 0.3 * deltaTime;
          dn.life -= 0.02 * deltaTime;
          if (dn.life > 0) remainingDN.push(dn);
        }
        s.damageNumbers = remainingDN;
      }

      // ── HELLFIRE BARRAGE: Trail Particles ──
      if (s.trailParts.length > 0) {
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        s.trailParts = s.trailParts.filter(p => {
          p.x += p.vx * deltaTime;
          p.y += p.vy * deltaTime;
          p.vy -= 0.05 * deltaTime;
          p.life -= p.decay * deltaTime;
          if (p.life <= 0) return false;

          const px2 = (p.x / 100) * cWidth;
          const py2 = (p.y / 100) * cHeight;
          const a = p.life * (p.smoke ? 0.20 : 0.65);
          ctx.globalAlpha = a;

          if (p.smoke) {
            const sg = ctx.createRadialGradient(px2, py2, 0, px2, py2, p.size * p.life * 0.5 * (cWidth / 800));
            sg.addColorStop(0, `rgba(255,120,20,${p.life * 0.5})`);
            sg.addColorStop(1, 'transparent');
            ctx.fillStyle = sg;
          } else {
            ctx.fillStyle = p.color;
          }
          const r = Math.max(0.5, p.size * p.life * (cWidth / 800));
          ctx.beginPath();
          ctx.arc(px2, py2, r, 0, Math.PI * 2);
          ctx.fill();
          return true;
        });
        ctx.restore();
      }
```

## Burn Zones

Atualizacao visual e dano continuo das zonas de fogo no chao.

Linhas aproximadas: 2520-2561

```tsx
      // ── HELLFIRE BARRAGE: Burn Zones ──
      s.burnZones = s.burnZones.filter(bz => {
        const age = now - bz.startTime;
        bz.life = Math.max(0, 1 - age / bz.duration);
        if (bz.life <= 0) return false;

        const bx = bz.x; // já em pixels (gravado no spawnHBImpact)
        const by = bz.y;
        const flicker = 0.85 + Math.sin(now * 0.018 + bx * 0.005) * 0.15;
        const r = bz.radius * flicker;

        const g = ctx.createRadialGradient(bx, by, 0, bx, by, r);
        g.addColorStop(0,    `rgba(255,210,60,${bz.life * 0.9})`);
        g.addColorStop(0.3,  `rgba(255,100,10,${bz.life * 0.75})`);
        g.addColorStop(0.65, `rgba(180,20,0,${bz.life * 0.5})`);
        g.addColorStop(1,    'transparent');

        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(bx, by, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Dano contínuo aos inimigos na zona (a cada 20 frames)
        if (s.frameCount % 20 === 0) {
          s.enemies.forEach(en => {
            if (en.hp <= 0) return;
            const ex = (en.x / 100) * cWidth;  // ← FIX 3: converter para pixels
            const ey = (en.y / 100) * cHeight;
            const d = Math.hypot(ex - bx, ey - by);
            if (d < bz.radius) {
              const dmg = playerShipStatsRef.current.damage * HELLFIRE_BURN_TICK_DAMAGE_MULTIPLIER * deltaTime;
              applyPlayerDamageToEnemy(en, dmg);
              // Add visible damage number for DoT
            }
          });
        }
        return true;
      });

```

## Lancamento e Movimento das Fireballs

Fila, arco, easing, posicao e particulas emitidas durante o voo.

Linhas aproximadas: 2562-2634

```tsx
      // ── HELLFIRE BARRAGE: Fireballs ──
      if (s.fireballs.length === 0 && s.hellfireQueue.length > 0 && now >= s.hellfireNextLaunchAt) {
        const nextHellfire = s.hellfireQueue.shift();
        const dir = nextHellfire.dir || 'forward';
        let ox = (s.playerX / 100) * cWidth + 40;
        let oy = (s.playerY / 100) * cHeight;
        if (dir === 'up') { ox -= 10; oy -= 28; }
        else if (dir === 'forward') { ox += 10; }
        else { ox -= 10; oy += 28; }

        const target = findNearestLivingEnemy(s, ox, oy, cWidth, cHeight);
        const tx = target ? (target.x / 100) * cWidth : cWidth + 200;
        const ty = target ? (target.y / 100) * cHeight : oy + (Math.random() - 0.5) * 200;
        const dist = Math.hypot(tx - ox, ty - oy);
        const travelFrames = Math.max(35, Math.min(65, dist / 12));
        const speed = 1 / travelFrames;

        s.fireballs.push({
          id: nextHellfire.id,
          ox, oy, tx, ty,
          targetId: target?.id,
          x: ox, y: oy,
          t: 0,
          speed,
          arcBend: (dir === 'up' ? -1 : dir === 'down' ? 1 : 0) * (40 + (nextHellfire.arcSeed || 0) * 50) + (Math.random() - 0.5) * 30,
          size: nextHellfire.size || 26,
          life: 1,
          done: false,
          readyAt: now,
        });
        s.hellfireNextLaunchAt = now + 180;
      }

      if (s.fireballs.length > 0) {
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';

        s.fireballs = s.fireballs.filter(fb => {
          // FIX 1 aplicado: deltaTime sem divisão por 16
          if (now < fb.readyAt) return true;

          let target = s.enemies.find(en => en.id === fb.targetId && en.hp > 0);
          if (!target) {
            target = findNearestLivingEnemy(s, fb.x, fb.y, cWidth, cHeight) || undefined;
            fb.targetId = target?.id;
          }

          if (target) {
            fb.tx = (target.x / 100) * cWidth;
            fb.ty = (target.y / 100) * cHeight;
          }

          fb.t += fb.speed * deltaTime;  // ← CORRETO

          const cx = (fb.ox + fb.tx) / 2;
          const cy = (fb.oy + fb.ty) / 2 + fb.arcBend;
          fb.x = bezier(fb.ox, cx, fb.tx, fb.t);
          fb.y = bezier(fb.oy, cy, fb.ty, fb.t);

          const hitDistance = target ? Math.hypot((target.x / 100) * cWidth - fb.x, (target.y / 100) * cHeight - fb.y) : Infinity;
          if (fb.t >= 1 || hitDistance < Math.max(34, fb.size * 1.25)) {
            // Impacto individual: cada bola recalcula o alvo vivo e explode onde ele está agora.
            if (target) {
              spawnHBImpact((target.x / 100) * cWidth, (target.y / 100) * cHeight);
            }
            return false;
          }

          // Trail a cada frame
          const isSpark = Math.random() < 0.32;
          s.trailParts.push({
            x: (fb.x / cWidth) * 100,
            y: (fb.y / cHeight) * 100,
```

## HUD do Hellfire Barrage

Botao visual no canto inferior esquerdo, cooldown e rotulo HB BARRAGE.

Linhas aproximadas: 3350-3382

```tsx
                  )}
                </div>
            </div>
            <p className="text-[10px] font-orbitron text-white/50 uppercase tracking-[0.2em] font-bold drop-shadow-md">MEGA LASER</p>
          </div>

          {/* HELLFIRE BARRAGE */}
          <div className="flex flex-col items-center gap-2">
            <div className={`relative w-16 h-16 rounded-xl border-2 flex items-center justify-center backdrop-blur-xl transition-all duration-300 ${hud.burstCooldown > 0 ? 'border-white/20 bg-black/40' : 'border-orange-500 bg-orange-500/20 shadow-[0_0_25px_rgba(249,115,22,0.6)] scale-110'}`}>
                <svg className="absolute inset-0 w-full h-full -rotate-90 scale-[0.9]">
                    <circle cx="32" cy="32" r="30" fill="none" stroke="currentColor" strokeWidth="4" className="text-white/10" />
                    <circle
                      cx="32" cy="32" r="30"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="4"
                      className="text-orange-500 transition-all duration-300"
                      strokeDasharray={188.5}
                      strokeDashoffset={188.5 * ((hud.burstCooldown || 0) / 35)}
                    />
                </svg>
                <div className="flex flex-col items-center">
                  <span className="text-white font-orbitron text-xl font-bold drop-shadow-md">F</span>
                  {hud.burstCooldown > 0 && (
                    <span className="text-[10px] text-orange-400 font-orbitron">{Math.ceil(hud.burstCooldown)}s</span>
                  )}
                </div>
            </div>
            <p className="text-[10px] font-orbitron text-white/50 uppercase tracking-[0.2em] font-bold drop-shadow-md">HB BARRAGE</p>
          </div>
        </div>
      )}

```

## Pontos mais provaveis para melhorar o visual

- `s.hellfireQueue = Array.from({ length: 5 ... })`: quantidade, intervalo e tamanho inicial dos disparos.
- `arcBend`, `speed` e `size`: forma do arco, velocidade e escala da bola de fogo.
- `s.trailParts.push(...)`: densidade, cor, vida e tamanho da trilha.
- `s.burnZones.push(...)`: raio, duracao, pulso e cor da area em chamas.
- `s.flashAlpha`, `s.impactFlash` e `s.shake`: peso cinematografico do impacto.
