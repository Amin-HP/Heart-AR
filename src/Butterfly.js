import * as THREE from 'three';
import heartVertexShader from './shaders/heart.vert?raw';
import heartFragmentShader from './shaders/heart.frag?raw';

export default class Butterfly {
    constructor(parent, textureLoader, options = {}) {
        this.parent = parent;
        this.textureLoader = textureLoader;

        // Configuration
        this.createBase = options.createBase !== undefined ? options.createBase : true;
        // Randomize height if not provided to avoid collisions
        // 0.4 to 1.1 range
        this.flightHeight = options.flightHeight || (0.4 + Math.random() * 0.7);
        this.movementRadius = options.movementRadius || 0.6;
        this.movementRandomness = options.movementRandomness || 0.05;
        this.movementRandomness = options.movementRandomness || 0.05;
        this.takeoffDelay = options.takeoffDelay || 0; // Additional delay
        this.scale = options.scale || 1.0; // Size scale
        this.orbitMode = options.orbitMode || false; // New mode for face tracking

        // Random offsets to make them distinct
        this.randomOffset = Math.random() * 100;

        this.fadeInDuration = options.fadeInDuration || 0.1;
        // Random flight characteristics
        this.speedFactor = 0.8 + Math.random() * 0.4; // 0.8x to 1.2x speed
        this.frequencyX = (0.8 + Math.random() * 0.4);
        this.frequencyY = (0.8 + Math.random() * 0.4);
        this.directionX = Math.random() > 0.5 ? 1 : -1;
        this.directionY = Math.random() > 0.5 ? 1 : -1;

        this.started = false;
        this.startTime = 0;

        // Base takeoff time (rest duration)
        this.baseTakeoffDuration = 3.0;

        this.init();
    }

    start(currentTime) {
        if (!this.started) {
            this.started = true;
            this.startTime = currentTime;
        }
    }

    init() {
        // 1. Target Plane (Base) - Only if requested
        if (this.createBase) {
            const targetTexture = this.textureLoader.load('./heart_target.png');
            const baseGeometry = new THREE.PlaneGeometry(1, 1);
            const baseMaterial = new THREE.MeshBasicMaterial({
                map: targetTexture,
                side: THREE.DoubleSide,
                transparent: true
            });
            this.basePlane = new THREE.Mesh(baseGeometry, baseMaterial);
            this.parent.add(this.basePlane);
        }

        // 2. Heart Object Plane (Floating & Bending)
        const heartGeometry = new THREE.PlaneGeometry(1, 1, 32, 1);
        const heartObjTexture = this.textureLoader.load('./heart_obj.png');

        // Custom Shader Material
        this.shaderMaterial = new THREE.ShaderMaterial({
            uniforms: {
                uTime: { value: 0 },
                uFlapStrength: { value: 0 },
                uOpacity: { value: 0 }, // Start invisible
                uTexture: { value: heartObjTexture }
            },
            vertexShader: heartVertexShader,
            fragmentShader: heartFragmentShader,
            side: THREE.DoubleSide,
            transparent: true,
            depthWrite: false, // Critical: Prevent invisible mesh from occluding objects behind it
        });

        this.heartObjPlane = new THREE.Mesh(heartGeometry, this.shaderMaterial);

        // Apply Scale
        this.heartObjPlane.scale.set(this.scale, this.scale, this.scale);

        // Slight random offset to resting position to avoid z-fighting if multiple are resting
        const restX = (Math.random() - 0.5) * 0.05;
        const restY = (Math.random() - 0.5) * 0.05;
        this.heartObjPlane.position.set(restX, restY, 0.01);

        this.parent.add(this.heartObjPlane);
    }

    update(currentTime) {
        if (!this.started) {
            this.shaderMaterial.uniforms.uTime.value = 0;
            this.shaderMaterial.uniforms.uFlapStrength.value = 0;
            this.shaderMaterial.uniforms.uOpacity.value = 0;
            // Keep random resting position
            this.heartObjPlane.rotation.set(0, 0, 0);
            return;
        }

        const elapsedTime = currentTime - this.startTime;

        // Scale shader time by speedFactor so flapping matches movement speed
        this.shaderMaterial.uniforms.uTime.value = elapsedTime * this.speedFactor;

        // Effective takeoff time includes the specific delay
        const actualTakeoffTime = this.baseTakeoffDuration + this.takeoffDelay;

        if (elapsedTime < actualTakeoffTime) {
            // Phase 1: Resting (Invisible)
            this.shaderMaterial.uniforms.uFlapStrength.value = 0;
            this.shaderMaterial.uniforms.uOpacity.value = 0;
            this.heartObjPlane.rotation.set(0, 0, 0);

        } else {
            // Phase 2: Takeoff & Flight
            let transition = (elapsedTime - actualTakeoffTime) / 2.0;
            transition = Math.min(Math.max(transition, 0), 1);

            // Ease out cubic
            const liftProgress = 1 - Math.pow(1 - transition, 3);

            this.shaderMaterial.uniforms.uFlapStrength.value = liftProgress;

            // Fade in calculation (faster than takeoff)
            let opacityProgress = (elapsedTime - actualTakeoffTime) / this.fadeInDuration;
            opacityProgress = Math.min(Math.max(opacityProgress, 0), 1);
            this.shaderMaterial.uniforms.uOpacity.value = opacityProgress;

            // Organic Hovering with random params
            const t = (elapsedTime + this.randomOffset) * this.speedFactor;

            const wanderBaseX = (Math.sin(t * 1.5 * this.frequencyX) + Math.cos(t * 2.3)) * 0.5 * this.movementRadius * this.directionX;
            const wanderBaseY = (Math.cos(t * 1.2 * this.frequencyY) + Math.sin(t * 2.7)) * 0.5 * this.movementRadius * this.directionY;

            const jitterX = (Math.sin(t * 5.5) + Math.cos(t * 6.3)) * 0.5 * this.movementRandomness;
            const jitterY = (Math.cos(t * 4.2) + Math.sin(t * 5.7)) * 0.5 * this.movementRandomness;

            const wanderX = wanderBaseX + jitterX;
            const wanderY = wanderBaseY + jitterY;

            // Vertical bobbing (faster flutters)
            // varying phase to desync vertical movement
            let wanderZ = Math.sin(t * 4.0 * this.frequencyX) * 0.02 + Math.cos(t * 3.1 * this.frequencyY) * 0.02;

            const baseHeight = 0.01 + (this.flightHeight * liftProgress);

            this.heartObjPlane.position.x = wanderX * liftProgress;
            this.heartObjPlane.position.y = wanderY * liftProgress;
            this.heartObjPlane.position.z = baseHeight + (wanderZ * liftProgress);

            // More dynamic rotation
            // Z (Roll): Bank into turns. significantly increased for drama.
            this.heartObjPlane.rotation.z = (Math.sin(t * 2.2) * 0.3 + Math.cos(t * 1.7) * 0.2) * liftProgress;

            // X (Pitch): Tilt up/down as it "climbs" or dives
            this.heartObjPlane.rotation.x = (Math.sin(t * 2.5) * 0.2 + 0.1) * liftProgress; // biased slightly up (0.1)

            // Y (Yaw): Turn gently
            this.heartObjPlane.rotation.y = (Math.cos(t * 1.5) * 0.3) * liftProgress;
        }
    }
}
