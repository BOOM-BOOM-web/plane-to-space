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
    }

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
    }

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
    }

    createPlanets() {
        const moon = new THREE.Mesh(new THREE.SphereGeometry(300, 32, 32), new THREE.MeshLambertMaterial({ color: 0xcccccc }));
        moon.position.set(1000, 3500, -10000);
        this.scene.add(moon);
        this.planets.push({mesh: moon, alt: 3500});

        const mars = new THREE.Mesh(new THREE.SphereGeometry(500, 32, 32), new THREE.MeshLambertMaterial({ color: 0xff4500 }));
        mars.position.set(-2000, 8000, -20000);
        this.scene.add(mars);
        this.planets.push({mesh: mars, alt: 8000});
    }

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
        this.planeGroup.add(this.sockets.rightWing);
        
        this.sockets.leftWingExt = new THREE.Object3D();
        this.sockets.leftWingExt.position.set(-1.5, 0, -0.5);
        this.planeGroup.add(this.sockets.leftWingExt);
        
        this.sockets.rightWingExt = new THREE.Object3D();
        this.sockets.rightWingExt.position.set(1.5, 0, -0.5);
        this.planeGroup.add(this.sockets.rightWingExt);

        // Default Rocket Flame
        const flameGeo = new THREE.ConeGeometry(0.4, 2, 8);
        const flameMat = new THREE.MeshBasicMaterial({ color: 0x00ffff, transparent: true, opacity: 0.9 });
        this.flameMesh = new THREE.Mesh(flameGeo, flameMat);
        this.flameMesh.rotation.x = Math.PI / 2; 
        this.flameMesh.position.z = 2.5;
        this.flameMesh.visible = false;
        this.planeGroup.add(this.flameMesh);

        this.scene.add(this.planeGroup);
    }

    createTrail() {
        this.trailGeometry = new THREE.BufferGeometry();
        const positions = new Float32Array(300 * 3);
        const colors = new Float32Array(300 * 3);
        this.trailGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        this.trailGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        
        this.trailMaterial = new THREE.PointsMaterial({ 
            size: 2, vertexColors: true, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending
        });
        this.trailMesh = new THREE.Points(this.trailGeometry, this.trailMaterial);
        this.scene.add(this.trailMesh);
    }

    updateTrail(x, y, z, speed) {
        const posArr = this.trailGeometry.attributes.position.array;
        const colArr = this.trailGeometry.attributes.color.array;
        
        for (let i = 299; i > 0; i--) {
            posArr[i * 3] = posArr[(i - 1) * 3];
            posArr[i * 3 + 1] = posArr[(i - 1) * 3 + 1];
            posArr[i * 3 + 2] = posArr[(i - 1) * 3 + 2];
        }
        
        posArr[0] = x;
        posArr[1] = y;
        posArr[2] = z + 1.5;

        let color = new THREE.Color();
        if (speed < 20) color.setHex(0x0000ff);
        else if (speed < 40) color.setHex(0x00ffff);
        else color.setHex(0xff00ff);

        for (let i = 0; i < 300; i++) {
            let alpha = 1.0 - (i / 300);
            colArr[i * 3] = color.r * alpha;
            colArr[i * 3 + 1] = color.g * alpha;
            colArr[i * 3 + 2] = color.b * alpha;
        }

        this.trailGeometry.attributes.position.needsUpdate = true;
        this.trailGeometry.attributes.color.needsUpdate = true;
    }

    updatePlaneVisuals() {
        // Clear old attachments safely
        for(let key in this.sockets) {
            while(this.sockets[key].children.length > 0) {
                this.sockets[key].remove(this.sockets[key].children[0]);
            }
        }

        const metalMat = new THREE.MeshStandardMaterial({ color: 0x888888, metalness: 0.9, roughness: 0.2 });
        const paperMat = new THREE.MeshStandardMaterial({ color: 0xf0f0f0, side: THREE.DoubleSide });

        // Throw Power -> Weighted Nose (Paperclip)
        if(UPGRADES.throw.level > 1) {
            const clipGeo = new THREE.TorusGeometry(0.2, 0.05, 8, 16, Math.PI);
            const clip = new THREE.Mesh(clipGeo, metalMat);
            clip.position.y = 0.1;
            this.sockets.nose.add(clip);
        }

        // Aero Level > 3 -> Wing Flaps
        if(UPGRADES.aero.level > 3) {
            const flapGeo = new THREE.PlaneGeometry(0.4, 0.3);
            const leftFlap = new THREE.Mesh(flapGeo, paperMat);
            leftFlap.position.set(-0.2, 0.1, 0);
            leftFlap.rotation.x = -0.5;
            this.sockets.leftWing.add(leftFlap);
            
            const rightFlap = new THREE.Mesh(flapGeo, paperMat);
            rightFlap.position.set(0.2, 0.1, 0);
            rightFlap.rotation.x = -0.5;
            this.sockets.rightWing.add(rightFlap);
        }

        // Aero Level > 7 -> Glider Wings (Extends wingspan)
        if(UPGRADES.aero.level > 7) {
            const extGeo = new THREE.PlaneGeometry(1.2, 2.5);
            const leftExt = new THREE.Mesh(extGeo, paperMat);
            leftExt.rotation.x = -Math.PI/2;
            this.sockets.leftWingExt.add(leftExt);
            
            const rightExt = new THREE.Mesh(extGeo, paperMat);
            rightExt.rotation.x = -Math.PI/2;
            this.sockets.rightWingExt.add(rightExt);
        }

        // Rocket Booster -> Thruster model
        if(UPGRADES.fuel.level > 0) {
            const thrusterGeo = new THREE.CylinderGeometry(0.3, 0.4, 1.2, 8);
            const thruster = new THREE.Mesh(thrusterGeo, metalMat);
            thruster.rotation.x = Math.PI / 2;
            thruster.position.z = 0.5;
            this.sockets.tail.add(thruster);
        }
    }

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
        this.planets.forEach(p => p.mesh.rotation.y += 0.001);
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
};
