const GameManager = {
    state: 'menu', money: 0, runMaxAlt: 0, runMaxDist: 0,
    plane: null, isMouseDown: false, isFDown: false, planetsReached: [],
    lastTime: performance.now(), frames: 0, fps: 0,

    init() {
        this.plane = { x: 0, y: 20, z: 0, vx: 0, vy: 0, vz: 0, pitch: 0, fuel: 0, hasBounced: false };
        
        const saveData = StorageManager.load();
        if (saveData) {
            this.money = saveData.money || 0;
            if (saveData.upgrades) {
                for (let key in UPGRADES) {
                    if (saveData.upgrades[key]) {
                        UPGRADES[key].level = saveData.upgrades[key].level;
                        UPGRADES[key].cost = saveData.upgrades[key].cost;
                        if (typeof saveData.upgrades[key].locked !== 'undefined') UPGRADES[key].locked = saveData.upgrades[key].locked;
                    }
                }
            }
        }
        
        const canvas = SceneManager.renderer.domElement;
        canvas.addEventListener('mousedown', () => this.isMouseDown = true);
        window.addEventListener('mouseup', () => this.isMouseDown = false);
        canvas.addEventListener('touchstart', (e) => { this.isMouseDown = true; e.preventDefault(); }, {passive: false});
        window.addEventListener('touchend', () => this.isMouseDown = false);
        
        window.addEventListener('keydown', (e) => {
            if(e.code === 'Space') { this.isMouseDown = true; e.preventDefault(); }
            if(e.code === 'KeyF') this.isFDown = true;
        });
        window.addEventListener('keyup', (e) => {
            if(e.code === 'Space') this.isMouseDown = false;
            if(e.code === 'KeyF') this.isFDown = false;
        });

        UIManager.buildShopUI(this.money);
        SceneManager.updatePlaneVisuals(); 
    },

    startFlight() {
        this.state = 'flying';
        UIManager.hideShop();
        
        let baseThrow = UPGRADES.throw.level * CONFIG.throwPower;
        let tier2Throw = (UPGRADES.throw2.locked ? 0 : UPGRADES.throw2.level) * 10;
        
        this.plane.x = 0; this.plane.y = 20; this.plane.z = 0;
        this.plane.vx = 0; 
        this.plane.vy = (UPGRADES.throw.level * CONFIG.throwPop);
        this.plane.vz = -(baseThrow + tier2Throw);
        
        let maxFuel = (UPGRADES.fuel.level * 100);
        if(!UPGRADES.fuel2.locked) maxFuel += (UPGRADES.fuel2.level * 250);
        this.plane.fuel = maxFuel;
        this.plane.hasBounced = false;
        
        this.runMaxAlt = 0; this.runMaxDist = 0; this.planetsReached = [];
        
        SceneManager.camera.position.set(0, 25, 20);
        SceneManager.camera.lookAt(0, 20, 0);
        SceneManager.updatePlaneVisuals(); 
        UIManager.toggleFuelBar(maxFuel > 0);
    },

    endFlight() {
        this.state = 'menu';
        let earnings = Math.floor((this.runMaxAlt + this.runMaxDist) * CONFIG.moneyMultiplier);
        this.money += earnings;
        
        UIManager.updateRunStats(this.runMaxAlt, this.runMaxDist, earnings, this.money);
        UIManager.toggleFuelBar(false);
        UIManager.buildShopUI(this.money);
        UIManager.showShop();
        StorageManager.save(this.money, UPGRADES);
    },

    buyUpgrade(key) {
        let up = UPGRADES[key];
        if(this.money >= up.cost && !up.locked && up.level < up.maxLevel) {
            this.money -= up.cost;
            up.level++;
            up.cost = Math.floor(up.cost * 1.8);
            UIManager.buildShopUI(this.money);
            SceneManager.updatePlaneVisuals(); 
            StorageManager.save(this.money, UPGRADES);
        }
    },

    checkPlanetMilestones() {
        PLANETS.forEach(planet => {
            if(this.runMaxAlt >= planet.altitude && !this.planetsReached.includes(planet.name)) {
                this.planetsReached.push(planet.name);
                UIManager.showPlanetToast(`<div>${planet.desc}</div>`);
                if(planet.unlocks && UPGRADES[planet.unlocks].locked) {
                    UPGRADES[planet.unlocks].locked = false;
                    StorageManager.save(this.money, UPGRADES);
                }
            }
        });
    },

    calculateFPS() {
        this.frames++;
        let now = performance.now();
        if (now - this.lastTime >= 1000) {
            this.fps = Math.round((this.frames * 1000) / (now - this.lastTime));
            this.frames = 0; this.lastTime = now;
            UIManager.updateFPS(this.fps);
        }
    },

    update() {
        this.calculateFPS();
        if (this.state !== 'flying') return;

        let airDensity = Math.max(0.1, 1.0 - (this.plane.y / 5000));
        
        let dragCoeff = CONFIG.baseDragCoeff - (UPGRADES.aero.level * CONFIG.aeroDragReduction);
        if(!UPGRADES.aero2.locked) {
            dragCoeff -= (UPGRADES.aero2.level * CONFIG.aero2DragReduction);
        }
        dragCoeff = Math.max(0.001, dragCoeff); 

        let speed = Math.sqrt(this.plane.vx**2 + this.plane.vy**2 + this.plane.vz**2);
        let dragForce = dragCoeff * speed * airDensity;
        
        if (speed > 0) {
            this.plane.vx -= (this.plane.vx / speed) * dragForce;
            this.plane.vy -= (this.plane.vy / speed) * dragForce;
            this.plane.vz -= (this.plane.vz / speed) * dragForce;
        }

        let currentGravity = CONFIG.gravity;
        if(this.plane.y > 2000) {
            currentGravity = CONFIG.gravity * Math.max(0.3, 1.0 - (this.plane.y - 2000) / 15000);
        }
        this.plane.vy -= currentGravity;

        let controlNimbleness = Math.min(CONFIG.maxPitchResponse, CONFIG.controlAuthority + (speed * 0.005));
        
        if (this.isMouseDown) {
            let lift = speed * CONFIG.liftMultiplier;
            this.plane.vy += lift;
            this.plane.vz *= (1.0 - 0.01 * airDensity); 
        }

        let isBoosting = false;
        if (this.isFDown && this.plane.fuel > 0) {
            this.plane.vz -= CONFIG.rocketThrust + (!UPGRADES.fuel2.locked ? UPGRADES.fuel2.level * 0.1 : 0);
            this.plane.vy += CONFIG.rocketLift;
            this.plane.fuel--;
            isBoosting = true;
        }
        SceneManager.flameMesh.visible = isBoosting;
        if(isBoosting) {
            let maxFuel = (UPGRADES.fuel.level * 100) + (!UPGRADES.fuel2.locked ? UPGRADES.fuel2.level * 250 : 0);
            UIManager.updateFuelBar(this.plane.fuel, maxFuel);
            SceneManager.flameMesh.scale.z = 1.5 + Math.random() * 0.5;
        }

        this.plane.x += this.plane.vx;
        this.plane.y += this.plane.vy;
        this.plane.z += this.plane.vz;

        let targetPitch = Math.atan2(this.plane.vy, -this.plane.vz);
        this.plane.pitch += (targetPitch - this.plane.pitch) * controlNimbleness;
        
        SceneManager.planeGroup.position.set(this.plane.x, this.plane.y, this.plane.z);
        SceneManager.planeGroup.rotation.x = -this.plane.pitch;
        
        SceneManager.updateTrail(this.plane.x, this.plane.y, this.plane.z, speed);

        let camX = this.plane.x;
        let camY = this.plane.y + 5;
        let camZ = this.plane.z + 20; 
        SceneManager.camera.position.lerp(new THREE.Vector3(camX, camY, camZ), 0.1);
        SceneManager.camera.lookAt(this.plane.x, this.plane.y, this.plane.z);

        this.runMaxAlt = Math.max(this.runMaxAlt, this.plane.y);
        this.runMaxDist = Math.max(this.runMaxDist, -this.plane.z);
        UIManager.updateHUD(this.runMaxAlt, this.runMaxDist, this.money);
        
        this.checkPlanetMilestones();
        SceneManager.updateEnvironment(this.plane.y);

        if (this.plane.y <= 0) {
            if (UPGRADES.bounce.level > 0 && !this.plane.hasBounced) {
                this.plane.y = 0;
                this.plane.vy = 5 + (UPGRADES.bounce.level * 3);
                this.plane.vz *= 0.7; 
                this.plane.vx *= 0.7;
                this.plane.hasBounced = true;
            } else {
                this.endFlight();
            }
        }
    }
};
