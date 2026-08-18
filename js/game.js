const GameManager = {
    state: 'menu', // 'menu' or 'flying'
    money: 0,
    runMaxAlt: 0,
    runMaxDist: 0,
    plane: null,
    isMouseDown: false,
    isFDown: false,

    init() {
        this.plane = { x: 0, y: 20, z: 0, vx: 0, vy: 0, vz: 0, pitch: 0, fuel: 0, hasBounced: false };
        
        // Input Listeners (Attached specifically to the canvas to avoid UI click bugs)
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
    },

    startFlight() {
        this.state = 'flying';
        UIManager.hideShop();
        
        // Reset Plane Physics
        this.plane.x = 0; this.plane.y = 20; this.plane.z = 0;
        this.plane.vx = 0; 
        this.plane.vy = UPGRADES.throw.level * CONFIG.throwPop;
        this.plane.vz = -(UPGRADES.throw.level * CONFIG.throwPower);
        this.plane.fuel = UPGRADES.fuel.level * 100;
        this.plane.hasBounced = false;
        
        this.runMaxAlt = 0;
        this.runMaxDist = 0;
        
        // Snap camera behind plane immediately
        SceneManager.camera.position.set(0, 25, 20);
        SceneManager.camera.lookAt(0, 20, 0);
        
        UIManager.toggleFuelBar(UPGRADES.fuel.level > 0);
    },

    endFlight() {
        this.state = 'menu';
        let earnings = Math.floor((this.runMaxAlt + this.runMaxDist) * CONFIG.moneyMultiplier);
        this.money += earnings;
        
        UIManager.updateRunStats(this.runMaxAlt, this.runMaxDist, earnings, this.money);
        UIManager.toggleFuelBar(false);
        UIManager.buildShopUI(this.money);
        UIManager.showShop();
    },

    buyUpgrade(key) {
        let up = UPGRADES[key];
        if(this.money >= up.cost) {
            this.money -= up.cost;
            up.level++;
            up.cost = Math.floor(up.cost * 1.6);
            UIManager.buildShopUI(this.money);
        }
    },

    update() {
        if (this.state !== 'flying') return;

        // Physics: Drag
        let drag = CONFIG.baseDrag - (UPGRADES.aero.level * CONFIG.aeroDragMultiplier);
        this.plane.vx *= drag;
        this.plane.vy *= drag;
        this.plane.vz *= drag;

        // Physics: Gravity
        this.plane.vy -= CONFIG.gravity;

        // Physics: Lift (Glide)
        if (this.isMouseDown) {
            let speed = Math.sqrt(this.plane.vx*this.plane.vx + this.plane.vz*this.plane.vz);
            if (speed > 0.1) {
                let lift = speed * CONFIG.liftMultiplier;
                this.plane.vy += lift;
                this.plane.vx *= 0.98;
                this.plane.vz *= 0.99;
            }
        }

        // Physics: Rocket Boost
        if (this.isFDown && this.plane.fuel > 0) {
            this.plane.vz -= CONFIG.rocketThrust; 
            this.plane.vy += CONFIG.rocketLift; 
            this.plane.fuel--;
            SceneManager.flameMesh.visible = true;
            SceneManager.flameMesh.scale.z = 1 + Math.random() * 0.5;
            UIManager.updateFuelBar(this.plane.fuel, UPGRADES.fuel.level * 100);
        } else {
            SceneManager.flameMesh.visible = false;
        }

        // Apply Movement
        this.plane.x += this.plane.vx;
        this.plane.y += this.plane.vy;
        this.plane.z += this.plane.vz;

        // Calculate Pitch & Apply to 3D Model
        this.plane.pitch = Math.atan2(this.plane.vy, -this.plane.vz);
        SceneManager.planeGroup.position.set(this.plane.x, this.plane.y, this.plane.z);
        SceneManager.planeGroup.rotation.x = -this.plane.pitch;

        // Camera Follow
        let camX = this.plane.x;
        let camY = this.plane.y + 5;
        let camZ = this.plane.z + 20; 
        SceneManager.camera.position.lerp(new THREE.Vector3(camX, camY, camZ), 0.1);
        SceneManager.camera.lookAt(this.plane.x, this.plane.y, this.plane.z);

        // Track Stats
        this.runMaxAlt = Math.max(this.runMaxAlt, this.plane.y);
        this.runMaxDist = Math.max(this.runMaxDist, -this.plane.z);
        UIManager.updateHUD(this.runMaxAlt, this.runMaxDist, this.money);

        // Update Environment Colors (Sky to Space)
        SceneManager.updateEnvironment(this.plane.y);

        // Ground Collision / Bounce
        if (this.plane.y <= 0) {
            if (UPGRADES.bounce.level > 0 && !this.plane.hasBounced) {
                this.plane.y = 0;
                this.plane.vy = 5 + (UPGRADES.bounce.level * 2);
                this.plane.vz *= 0.7; 
                this.plane.vx *= 0.7;
                this.plane.hasBounced = true;
            } else {
                this.endFlight();
            }
        }
    }
};
