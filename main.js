import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

// --- Configuration ---
const COLORS = {
    cyan: 0x38d6c6,
    purple: 0xf4b860,
    pink: 0xff6f61,
    bg: 0x071013
};

// --- Mobile Menu ---
const menuToggle = document.getElementById('mobile-menu');
const navLinks = document.querySelector('.nav-links');

if (menuToggle && navLinks) {
    // Toggle menu when hamburger is clicked
    menuToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        navLinks.classList.toggle('active');
    });
    
    // Close menu when a link is clicked
    const navItems = navLinks.querySelectorAll('a');
    navItems.forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
        });
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.navbar')) {
            navLinks.classList.remove('active');
        }
    });
    
    // Close menu on window resize if screen becomes large
    window.addEventListener('resize', () => {
        if (window.innerWidth > 767) {
            navLinks.classList.remove('active');
        }
    });
}

// --- GSAP Animations ---
gsap.registerPlugin(ScrollTrigger);

const initGSAP = () => {
    // Reveal animations for sections and cards
    gsap.utils.toArray('.reveal').forEach((elem) => {
        gsap.to(elem, {
            scrollTrigger: {
                trigger: elem,
                start: "top 85%",
                toggleActions: "play none none none"
            },
            opacity: 1,
            y: 0,
            duration: 1,
            ease: "power2.out"
        });
    });

    // Hover effect for glass cards using GSAP
    gsap.utils.toArray('.glass-card').forEach((card) => {
        card.addEventListener('mouseenter', () => {
            gsap.to(card, { scale: 1.02, duration: 0.3 });
        });
        card.addEventListener('mouseleave', () => {
            gsap.to(card, { scale: 1, duration: 0.3 });
        });
    });
};

// --- Three.js Background ---
const initBackground = () => {
    const canvas = document.querySelector('#bg-canvas');
    if (!canvas) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Post Processing
    const renderScene = new RenderPass(scene, camera);
    const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
    bloomPass.threshold = 0.2;
    bloomPass.strength = 0.8;
    bloomPass.radius = 0.5;

    const composer = new EffectComposer(renderer);
    composer.addPass(renderScene);
    composer.addPass(bloomPass);

    // Particles / Neural Network
    const particlesCount = 150;
    const positions = new Float32Array(particlesCount * 3);
    const colors = new Float32Array(particlesCount * 3);
    
    const colorChoices = [new THREE.Color(COLORS.cyan), new THREE.Color(COLORS.purple), new THREE.Color(COLORS.pink)];

    for (let i = 0; i < particlesCount; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 15;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 15;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 10;

        const color = colorChoices[Math.floor(Math.random() * colorChoices.length)];
        colors[i * 3] = color.r;
        colors[i * 3 + 1] = color.g;
        colors[i * 3 + 2] = color.b;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
        size: 0.05,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);

    // Animation Loop
    const animate = () => {
        points.rotation.y += 0.001;
        points.rotation.x += 0.0005;
        
        composer.render();
        requestAnimationFrame(animate);
    };

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        composer.setSize(window.innerWidth, window.innerHeight);
    });

    animate();
};

// --- Hero 3D Object ---
const initHeroModel = () => {
    const container = document.querySelector('#hero-3d-model');
    if (!container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 100);
    camera.position.z = 3;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    const group = new THREE.Group();
    
    // Abstract Core
    const geo = new THREE.IcosahedronGeometry(1, 1);
    const mat = new THREE.MeshStandardMaterial({
        color: COLORS.cyan,
        wireframe: true,
        emissive: COLORS.cyan,
        emissiveIntensity: 0.5
    });
    const mesh = new THREE.Mesh(geo, mat);
    group.add(mesh);

    // Outer Rings
    const ringGeo = new THREE.TorusGeometry(1.4, 0.02, 16, 100);
    const ringMat = new THREE.MeshBasicMaterial({ color: COLORS.pink });
    
    const rings = [];
    for (let i = 0; i < 2; i++) {
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = Math.random() * Math.PI;
        ring.rotation.y = Math.random() * Math.PI;
        group.add(ring);
        rings.push(ring);
    }

    scene.add(group);
    scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    
    const animate = () => {
        group.rotation.y += 0.01;
        mesh.rotation.x += 0.005;
        rings.forEach((ring, i) => {
            ring.rotation.z += 0.01 * (i + 1);
        });
        renderer.render(scene, camera);
        requestAnimationFrame(animate);
    };

    animate();
};

// Initialize everything
document.addEventListener('DOMContentLoaded', () => {
    initGSAP();
    initBackground();
    initHeroModel();
});
