const SceneManager = {
    scene: null,
    camera: null,
    renderer: null,
    planeGroup: null,
    flameMesh: null,
    stars: null,

    init() {
        // Setup Scene
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 5000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        document.body.appendChild(this.renderer.domElement);

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);
        const sunLight = new THREE.DirectionalLight(0xffffff, 1);
        sunLight.position.set(100, 200, 100);
        sunLight.castShadow = true;
        this.scene.add(sunLight);

        // Sky & Fog
        this.scene.background = new THREE.Color(0x87CEEB);
        this.scene.fog = new THREE.Fog(0x87CEEB, 500, 2000);

        this.createGround();
        this.createClouds();
        this.createStars();
        this.createPlane();
    },

    createGround() {
        const groundGeo = new THREE.PlaneGeometry(10000, 10000);
        const groundMat = new THREE.MeshLambertMaterial({ color: 0x32CD32 });
        const ground = new THREE.Mesh(groundGeo, groundMat);
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = 0;
        ground.receiveShadow = true;
        this.scene.add(ground);
    },

    createClouds() {
        const cloudGroup = new THREE.Group();
        for(let i=0; i<30; i++) {
            let cloud = new THREE.Mesh(
                new THREE.SphereGeometry(20 + Math.random()*30, 8, 6),
                new THREE.MeshLambertMaterial({ color: 0xffffff, transparent: true, opacity: 0.8 })
            );
            cloud.position.set(
                (Math.random() - 0.5) * 2000,
                200 + Math.random() * 800,
                -i * 100 - Math.random()*500
            );
            cloudGroup.add(cloud);
        }
        this.scene.add(cloudGroup);
    },

    createStars() {
        const starGeo = new THREE.BufferGeometry();
        let starVerts = [];
        for(let i=0; i<1000; i++) {
            starVerts.push((Math.random() - 0.5) * 4000);
            starVerts.push(1000 + Math.random() * 3000);
            starVerts.push(-1000 - Math.random() * 3000);
        }
        starGeo.setAttribute('position', new THREE.Float32BufferAttribute(starVerts, 3));
        this.stars = new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 5 }));
        this.stars.visible = false;
        this.scene.add(this.stars);
    },

    createPlane() {
        this.planeGroup = new THREE.Group();
        const bodyGeo = new THREE.BufferGeometry();
        const bodyVerts = new Float32Array([
            0, 0, -2,      // Nose
            -1.5, 0, 1,    // Left Wing Tail
            0, 0.2, 1,     // Top Center Tail
            1.5, 0, 1,     // Right Wing Tail
            -0.5, -0.1, 1, // Bottom Left Tail
            0.5, -0.1, 1   // Bottom Right Tail
        ]);
        bodyGeo.setAttribute('position', new THREE.BufferAttribute(bodyVerts, 3));
        bodyGeo.setIndex([
            0, 2, 1, // Left top
            0, 3, 2, // Right top
            0, 1, 4, // Left bottom
            0, 5, 3, // Right bottom
            1, 5, 4, // Back left
            1, 3, 5  // Back right
        ]);
        bodyGeo.computeVertexNormals();
        const planeMat = new THREE.MeshPhongMaterial({ color: 0xffffff, side: THREE.DoubleSide, shininess: 30 });
        const planeMesh = new THREE.Mesh(bodyGeo, planeMat);
        planeMesh.castShadow = true;
        this.planeGroup.add(planeMesh);

        // Rocket Flame
        const flameGeo = new THREE.ConeGeometry(0.3, 2, 8);
        const flameMat = new THREE.MeshBasicMaterial({ color: 0xff5500, transparent: true, opacity: 0.9 });
        this.flameMesh = new THREE.Mesh(flameGeo, flameMat);
        this.flameMesh.rotation.x = Math.PI / 2; 
        this.flameMesh.position.z = 1.5;
        this.flameMesh.visible = false;
        this.planeGroup.add(this.flameMesh);

        this.scene.add(this.planeGroup);
    },

    updateEnvironment(altitude) {
        if (altitude > 1000) {
            let spaceProgress = Math.min(1, (altitude - 1000) / 2000);
            this.scene.background = new THREE.Color(0x000000).lerp(new THREE.Color(0x87CEEB), 1 - spaceProgress);
            this.scene.fog.color = this.scene.background;
            if (altitude > 2000) this.stars.visible = true;
        } else {
            this.scene.background = new THREE.Color(0x87CEEB);
            this.scene.fog.color = this.scene.background;
            this.stars.visible = false;
        }
    },

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
};
