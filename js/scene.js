const SceneManager = {
    scene: null, camera: null, renderer: null,
    planeGroup: null, flameMesh: null, stars: null, planets: [],
    trailGeometry: null, trailMaterial: null, trailMesh: null,
    sockets: {}, // Modular Attachment System

    init() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 20000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        document.body.appendChild(this.renderer.domElement);

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
        this.scene.add(ambientLight);
        const hemiLight = new THREE.HemisphereLight(0x87CEEB, 0x32CD32, 0.6);
        this.scene.add(hemiLight);
        const sunLight = new THREE.DirectionalLight(0xffffff, 1.2);
        sunLight.position.set(200, 400, 200);
        sunLight.castShadow = true;
        sunLight.shadow.mapSize.width = 2048;
        sunLight.shadow.mapSize.height = 2048;
        this.scene.add(sunLight);

        this.scene.background = new THREE.Color(0x87CEEB);
        this.scene.fog = new THREE.Fog(0x87CEEB, 500, 5000);

        this.createGround();
        this.createEnvironmentProps();
        this.createStars();
        this.createPlanets();
        this.createHighFidelityPlane();
        this.createTrail();

        // Initial camera setup so it's not inside the plane
        this.camera.position.set(0, 25, 20);
        this.camera.lookAt(0, 20, 0);
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
    }, // <-- THE MISSING COMMA WAS HERE

    createEnvironmentProps() {
        const treeGeo = new THREE.ConeGeometry(10, 30, 6);
        const treeMat = new THREE.MeshLambertMaterial({ color: 0x013220 });
        for(let i=0; i<200; i++) {
            let tree = new THREE.Mesh(treeGeo, treeMat);
            tree.position.set((Math.random() - 0.5) * 1500, 14, -Math.random() * CONFIG.mapLength);
            tree.castShadow = true;
            this.scene.add(tree);
        }
        const mtnGeo = new THREE.ConeGeometry(200, 500, 5);
        const mtnMat = new THREE.MeshLambertMaterial({ color: 0x555555 });
        for(let i=0; i<30; i++) {
            let mtn = new THREE.Mesh(mtnGeo, mtnMat);
            mtn.position.set((Math.random() - 0.5) * 3000, 240, -Math.random() * CONFIG.mapLength);
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
        const moon = new THREE.Mesh(new THREE.SphereGeometry(300, 32, 32), new THREE.MeshLambertMaterial({ color: 0xcccccc }));
        moon.position.set(1000, 3500, -10000);
        this.scene.add(moon);
        this.planets.push({mesh: moon, alt: 3500});

        const mars = new THREE.Mesh(new THREE.SphereGeometry(500, 32, 32), new THREE.MeshLambertMaterial({ color: 0xff4500 }));
        mars.position.set(-2000, 8000, -20000);
        this.scene.add(mars);
        this.planets.push({mesh: mars, alt: 8000});
    },

    createHighFidelityPlane() {
        this.planeGroup = new THREE.Group();
        
        const paperMat = new THREE.MeshStandardMaterial({ 
            color: 0xffffff, side: THREE.DoubleSide, roughness: 0.8, metalness: 0.1 
        });

        // Left Wing Half
        const leftWingGeo = new THREE.BufferGeometry();
        leftWingGeo.setAttribute('position', new THREE.Float32BufferAttribute([
            0, 0, -2,       // Nose
            0, 0.1, 1.5,    // Top spine
            -1.8, 0, 1.2,   // Left wing tip
            -0.4, -0.1, 1.5 // Left bottom fold
        ], 3));
        leftWingGeo.setIndex([0, 2, 1, 0, 3, 2, 0, 1, 3]);
        leftWingGeo.computeVertexNormals();
        this.planeGroup.add(new THREE.Mesh(leftWingGeo, paperMat));

        // Right Wing Half
        const rightWingGeo = new THREE.BufferGeometry();
        rightWingGeo.setAttribute('position', new THREE.Float32BufferAttribute([
            0, 0, -2,       // Nose
            0, 0.1, 1.5,    // Top spine
            1.8, 0, 1.2,    // Right wing tip
            0.4, -0.1, 1.5  // Right bottom fold
        ], 3));
        rightWingGeo.setIndex([0, 1, 2, 0, 2, 3, 0, 3, 1]);
        rightWingGeo.computeVertexNormals();
        this.planeGroup.add(new THREE.Mesh(rightWingGeo, paperMat));

        // Sockets for modular upgrades
        this.sockets.nose = new THREE.Object3D();
        this.sockets.nose.position.set(0, 0, -2.1);
        this.planeGroup.add(this.sockets.nose);

        this.sockets.tail = new THREE.Object3D();
        this.sockets.tail.position.set(0, 0, 1.6);
        this.planeGroup.add(this.sockets.tail);

        this.sockets.leftWing = new THREE.Object3D();
        this.sockets.leftWing.position.set(-1.5, 0, 1.0);
        this.planeGroup.add(this.sockets.leftWing);

        this.sockets.rightWing = new THREE.Object3D();
        this.sockets.rightWing.position.set(1.5, 0, 1.0);
        this.planeGroup
