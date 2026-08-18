const SceneManager = {
    scene: null,
    camera: null,
    renderer: null,
    planeGroup: null,
    flameMesh: null,
    stars: null,
    planets: [],

    init() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 20000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        document.body.appendChild(this.renderer.domElement);

        // Better Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
        this.scene.add(ambientLight);
        
        const hemiLight = new THREE.HemisphereLight(0x87CEEB, 0x32CD32, 0.6);
        this.scene.add(hemiLight);

        const sunLight = new THREE.DirectionalLight(0xffffff, 1.2);
        sunLight.position.set(200, 400, 200);
        sunLight.castShadow = true;
        sunLight.shadow.mapSize.width = 2048;
        sunLight.shadow.mapSize.height = 2048;
        sunLight.shadow.camera.near = 10;
        sunLight.shadow.camera.far = 2000;
        sunLight.shadow.camera.left = -500;
        sunLight.shadow.camera.right = 500;
        sunLight.shadow.camera.top = 500;
        sunLight.shadow.camera.bottom = -500;
        this.scene.add(sunLight);

        this.scene.background = new THREE.Color(0x87CEEB);
        this.scene.fog = new THREE.Fog(0x87CEEB, 500, 5000);

        this.createGround();
        this.createEnvironmentProps();
        this.createStars();
        this.createPlanets();
        this.createPlane();
    },

    createGround() {
        const groundGeo = new THREE.PlaneGeometry(20000, CONFIG.mapLength);
        const groundMat = new THREE.MeshLambertMaterial({ color: 0x2eb834 });
        const ground = new THREE.Mesh(groundGeo, groundMat);
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = -1;
        ground.position.z = -CONFIG.mapLength / 2;
        ground.receiveShadow = true;
        this.scene.add(ground);
    },

    // Adds trees and mountains to give sense of speed
    createEnvironmentProps() {
        const treeGeo = new THREE.ConeGeometry(10, 30, 6);
        const treeMat = new THREE.MeshLambertMaterial({ color: 0x013220 });
        
        for(let i=0; i<200; i++) {
            let tree = new THREE.Mesh(treeGeo, treeMat);
            tree.position.set(
                (Math.random() - 0.5) * 1500,
                14,
                -Math.random() * CONFIG.mapLength
            );
            tree.castShadow = true;
            this.scene.add(tree);
        }

        const mtnGeo = new THREE.ConeGeometry(200, 500, 5);
        const mtnMat = new THREE.MeshLambertMaterial({ color: 0x555555 });
        for(let i=0; i<30; i++) {
            let mtn = new THREE.Mesh(mtnGeo, mtnMat);
            mtn.position.set(
                (Math.random() - 0.5) * 3000,
                240,
                -Math.random() * CONFIG.mapLength
            );
            this.scene.add(mtn);
        }
    },

    createStars() {
        const starGeo = new THREE.BufferGeometry();
        let starVerts = [];
        for(let i=0; i<3000; i++) {
            starVerts.push((Math.random() - 0.5) * 10000);
            starVerts.push(500 + Math.random() * 10000);
            starVerts.push(-Math.random() * 20000);
        }
        starGeo.setAttribute('position', new THREE.Float32BufferAttribute(starVerts, 3));
        this.stars = new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 15 }));
        this.stars.visible = false;
        this.scene.add(this.stars);
    },

    createPlanets() {
        // Moon
        const moon = new THREE.Mesh(
            new THREE.SphereGeometry(300, 32, 32),
            new THREE.MeshLambertMaterial({ color: 0xcccccc })
        );
        moon.position.set(1000, 3500, -10000);
        this.scene.add(moon);
        this.planets.push({mesh: moon, alt: 3500});

        // Mars
        const mars = new THREE.Mesh(
            new THREE.SphereGeometry(500, 32, 32),
            new THREE.MeshLambertMaterial({ color: 0xff4500 })
        );
        mars.position.set(-2000, 8000, -20000);
        this.scene.add(mars);
        this.planets.push({mesh: mars, alt: 8000});
    },

    createPlane() {
        this.planeGroup = new THREE.Group();
        const bodyGeo = new THREE.BufferGeometry();
        const bodyVerts = new Float32Array([
            0, 0, -3,      // Nose
            -2, 0, 1.5,    // Left Wing Tail
            0, 0.3, 1.5,   // Top Center Tail
            2, 0, 1.5,     // Right Wing Tail
            -0.5, -0.1, 1.5, // Bottom Left Tail
            0.5, -0.1, 1.5  // Bottom Right Tail
        ]);
        bodyGeo.setAttribute('position', new THREE.BufferAttribute(bodyVerts, 3));
        bodyGeo.setIndex([
            0, 2, 1, 0, 3, 2, 0, 1, 4, 0, 5, 3, 1, 5, 4, 1, 3, 5
        ]);
        bodyGeo.computeVertexNormals();
        const planeMat = new THREE.MeshPhongMaterial({ color: 0xffffff, side: THREE.DoubleSide, shininess: 100 });
        const planeMesh = new THREE.Mesh(bodyGeo, planeMat);
        planeMesh.castShadow = true;
        this.planeGroup.add(planeMesh);

        // Better Rocket Flame
        const flameGeo = new THREE.ConeGeometry(0.5, 3, 8);
        const flameMat = new THREE.MeshBasicMaterial({ color: 0x00ffff, transparent: true, opacity: 0.9 });
        this.flameMesh = new THREE.Mesh(flameGeo, flameMat);
        this.flameMesh.rotation.x = Math.PI / 2; 
        this.flameMesh.position.z = 2.5;
        this.flameMesh.visible = false;
        this.planeGroup.add(this.flameMesh);

        this.scene.add(this.planeGroup);
    },

    updateEnvironment(altitude) {
        if (altitude > 500) {
            let spaceProgress = Math.min(1, (altitude - 500) / 2500);
            this.scene.background = new THREE.Color(0x000022).lerp(new THREE.Color(0x87CEEB), 1 - spaceProgress);
            this.scene.fog.color = this.scene.background;
            if (altitude > 1500) this.stars.visible = true;
        } else {
            this.scene.background = new THREE.Color(0x87CEEB);
            this.scene.fog.color = this.scene.background;
            this.stars.visible = false;
        }
        
        // Rotate planets slowly
        this.planets.forEach(p => {
            p.mesh.rotation.y += 0.001;
        });
    },

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
};
