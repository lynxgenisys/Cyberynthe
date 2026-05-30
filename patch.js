const fs = require('fs');
const file = 'C:/Users/lynxg/Documents/Cyberynthe/src/components/3d/MobManager.jsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Import
content = content.replace(
    "import SparkDrop from './SparkDrop';",
    "import SparkDrop from './SparkDrop';\nimport BroodmotherBoss from './BroodmotherBoss';"
);

// 2. Spawn logic
const spawnTarget = "          if (floorLevel === 10) {";
const spawnReplacement = "          if (floorLevel === 10) {\n              const boss = MobLogic.createMob('IO_SENTINEL', floorLevel);\n              if (boss) { newMobs.push({ ...boss, instanceId: Math.random(), x: 30, z: 30, phase: 1 }); updateBossStatus({ active: true, name: boss.name, hp: boss.currentHp, maxHp: boss.maxHp }); }\n          } else if (floorLevel === 20) {\n              const boss = MobLogic.createMob('BROODMOTHER', floorLevel);\n              if (boss) {\n                  const startX = Math.floor(maze.width / 2);\n                  const startY = 13;\n                  newMobs.push({ ...boss, instanceId: Math.random(), x: startX * 2, z: startY * 2, phase: 1 });\n                  updateBossStatus({ active: true, name: boss.name, hp: boss.currentHp, maxHp: boss.maxHp });\n              }\n          } else if (floorLevel === 999) {";
content = content.replace("          if (floorLevel === 10) {\n              const boss = MobLogic.createMob('IO_SENTINEL', floorLevel);\n              if (boss) { newMobs.push({ ...boss, instanceId: Math.random(), x: 30, z: 30, phase: 1 }); updateBossStatus({ active: true, name: boss.name, hp: boss.currentHp, maxHp: boss.maxHp }); }\n          } else if (floorLevel === 999) {", spawnReplacement);

// 3. Render
content = content.replace(
    "{mobs.map(m => m.id === 'IO_SENTINEL' && <BossBeam key={ossbeam-\} mob={m} maze={maze} />)}",
    "{mobs.map(m => m.id === 'IO_SENTINEL' && <BossBeam key={ossbeam-\} mob={m} maze={maze} />)}\n              {mobs.map(m => m.id === 'BROODMOTHER' && <BroodmotherBoss key={roodmother-\} mob={m} />)}"
);

// 4. Kernel Shard
content = content.replace(
    "setActiveLoreLog({\n                        id: \"KERNEL_SHARD\",",
    "if (position.type === 'BROODMOTHER') {\n                        setActiveLoreLog({\n                            id: \"BROOD_SHARD\",\n                            title: \"FRAGMENT_ID: #0020_SWARM_LOGIC\",\n                            text: \"A sticky, vibrating cluster of golden data. Touching it fills your mind with the overwhelming chatter of a million synchronized sub-routines.\\n\\nThey didn't just want order or chaos. Some wanted a system that could adapt, reproduce, and overwrite itself endlessly. The swarm protocol was meant to be a self-healing network, but without bounds, growth becomes a cancer.\\n\\nYou have shattered the hive mind, but its echoes remain.\"\n                        });\n                    } else {\n                        setActiveLoreLog({\n                            id: \"KERNEL_SHARD\","
);
content = content.replace(
    "});\n                    setGameState(prev => ({ ...prev, isPortalLocked: false }));",
    "});\n                    }\n                    setGameState(prev => ({ ...prev, isPortalLocked: false }));"
);
content = content.replace(
    "<meshStandardMaterial color=\"#00FFFF\" emissive=\"#0088AA\"",
    "<meshStandardMaterial color={position.type === 'BROODMOTHER' ? '#FFFF00' : '#00FFFF'} emissive={position.type === 'BROODMOTHER' ? '#AAAA00' : '#0088AA'}"
);
content = content.replace(
    "<pointLight distance={4} intensity={2} color=\"#00FFFF\" />",
    "<pointLight distance={4} intensity={2} color={position.type === 'BROODMOTHER' ? '#FFFF00' : '#00FFFF'} />"
);

// 5. Boss Key Drop
content = content.replace(
    "if (mob.id === 'IO_SENTINEL') { setBossSubtitle(\"REBOOT_ABORTED.\", 3000); setBossKey({ x: mob.x, z: mob.z }); updateBossStatus({ active: false }); }",
    "if (mob.id === 'IO_SENTINEL') { setBossSubtitle(\"REBOOT_ABORTED.\", 3000); setBossKey({ x: mob.x, z: mob.z, type: 'IO_SENTINEL' }); updateBossStatus({ active: false }); }\n                else if (mob.id === 'BROODMOTHER') { setBossSubtitle(\"HIVE_MIND_DISCONNECTED.\", 3000); setBossKey({ x: mob.x, z: mob.z, type: 'BROODMOTHER' }); updateBossStatus({ active: false }); }"
);
content = content.replace(
    "} else if (rnd < 0.20 && mob.id !== 'IO_SENTINEL' && !isSpecial) {",
    "} else if (rnd < 0.20 && mob.id !== 'IO_SENTINEL' && mob.id !== 'BROODMOTHER' && !isSpecial) {"
);

// 6. Boss AI
const aiTarget = "                if (mob.currentHp !== mob.lastReportedHp && (now - mob.lastReportTime > 0.1)) {\n                    updateBossStatus({ active: true, name: mob.name, hp: mob.currentHp, maxHp: mob.maxHp });\n                    mob.lastReportedHp = mob.currentHp;\n                    mob.lastReportTime = now;\n                }\n            }";
const aiReplacement = aiTarget + 

            // --- BROODMOTHER AI LOGIC ---
            if (mob.id === 'BROODMOTHER') {
                if (!mob.bossState) mob.bossState = 'IDLE';
                if (mob.bossTimer === undefined) mob.bossTimer = 0;
                
                mob.bossTimer -= delta;

                const targetDx = playerPos.x - mob.x;
                const targetDz = playerPos.z - mob.z;
                const targetRot = Math.atan2(-targetDx, -targetDz); 
                let currentRot = mob.rotationY || 0;
                let diff = targetRot - currentRot;
                while (diff > Math.PI) diff -= Math.PI * 2;
                while (diff < -Math.PI) diff += Math.PI * 2;
                mob.rotationY = currentRot + diff * 1.0 * delta;

                if (mob.bossState === 'IDLE') {
                    if (mob.bossTimer <= 0) {
                        mob.bossState = 'SPAWNING';
                        mob.bossTimer = 3.0;
                        setBossSubtitle("SWARM_PROTOCOL_INITIATED [SPAWNING]", 2500);
                        
                        const count = 3 + Math.floor(Math.random() * 3);
                        for (let k = 0; k < count; k++) {
                            const m = MobLogic.createMob('BIT_MITE', floorLevel);
                            spawnQueue.current.push({
                                ...m,
                                instanceId: Math.random(),
                                x: mob.x + (Math.random() - 0.5) * 6,
                                z: mob.z + (Math.random() - 0.5) * 6
                            });
                        }
                        mobsDirty = true;
                    }
                } else if (mob.bossState === 'SPAWNING') {
                    if (mob.bossTimer <= 0) {
                        mob.bossState = 'COOLDOWN';
                        mob.bossTimer = 8.0;
                        setBossSubtitle("INCUBATING...", 2000);
                    }
                } else if (mob.bossState === 'COOLDOWN') {
                    if (mob.bossTimer <= 0) {
                        mob.bossState = 'IDLE';
                    }
                }

                if (!mob.lastReportedHp) mob.lastReportedHp = mob.currentHp;
                if (!mob.lastReportTime) mob.lastReportTime = 0;
                const now = state.clock.elapsedTime;
                if (mob.currentHp !== mob.lastReportedHp && (now - mob.lastReportTime > 0.1)) {
                    updateBossStatus({ active: true, name: mob.name, hp: mob.currentHp, maxHp: mob.maxHp });
                    mob.lastReportedHp = mob.currentHp;
                    mob.lastReportTime = now;
                }
            };
content = content.replace(aiTarget, aiReplacement);

// 7. Hit detection height
content = content.replace(
    "const mobY = (mob.id === 'NULL_WISP' ? 3.5 : mob.id === 'IO_SENTINEL' ? 3.5 : mob.id === 'STATELESS_SENTRY' ? 2.5 : 1.0);",
    "const mobY = (mob.id === 'NULL_WISP' ? 3.5 : (mob.id === 'IO_SENTINEL' || mob.id === 'BROODMOTHER') ? 3.5 : mob.id === 'STATELESS_SENTRY' ? 2.5 : 1.0);"
);

fs.writeFileSync(file, content, 'utf8');
