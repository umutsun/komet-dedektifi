/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';

// Star data type definition for clarity
interface StarData {
  hip: number;
  dist: number;
  ra: number;
  dec: number;
  mag: number;
  x?: number; // Cartesian coordinates will be added after calculation
  y?: number;
  z?: number;
}

// --- Star Information Panel Component ---
const StarInfoPanel: React.FC<{ star: StarData; onClose: () => void }> = ({ star, onClose }) => {
  if (!star) return null;

  return (
    <div className="absolute top-4 right-4 bg-slate-900/80 backdrop-blur-sm border border-blue-400/40 p-3 w-64 text-sm text-slate-300 shadow-lg animate-fade-in panel-corners" style={{borderColor: 'rgba(96, 165, 250, 0.4)'}}>
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold text-base text-blue-300 tracking-wider">// HEDEF_BİLGİSİ</h3>
        <button onClick={onClose} className="p-1 text-slate-400 hover:text-white" aria-label="Kapat">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>
      <div className="space-y-1.5 text-xs">
        <p><span className="font-semibold text-slate-400 w-24 inline-block">HIP ID:</span> {star.hip}</p>
        <p><span className="font-semibold text-slate-400 w-24 inline-block">Mesafe:</span> {star.dist.toFixed(2)} parsec</p>
        <p><span className="font-semibold text-slate-400 w-24 inline-block">Büyüklük:</span> {star.mag.toFixed(2)}</p>
        <p><span className="font-semibold text-slate-400 w-24 inline-block">Sağ Açıklık:</span> {star.ra.toFixed(4)}</p>
        <p><span className="font-semibold text-slate-400 w-24 inline-block">Dikey Açıklık:</span> {star.dec.toFixed(4)}</p>
      </div>
    </div>
  );
};


const CosmosView: React.FC = () => {
    const mountRef = useRef<HTMLDivElement>(null);
    const [selectedStar, setSelectedStar] = useState<StarData | null>(null);
    const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading');
    
    // Use refs for THREE objects and data to avoid re-renders
    const sceneRef = useRef<THREE.Scene | null>(null);
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const starDataRef = useRef<StarData[]>([]);
    const starPointsRef = useRef<THREE.Points | null>(null);
    const selectionIndicatorRef = useRef<THREE.Mesh | null>(null);

    useEffect(() => {
        if (!mountRef.current) return;
        const mount = mountRef.current;
        
        // --- Basic Scene Setup ---
        sceneRef.current = new THREE.Scene();
        const scene = sceneRef.current;
        
        cameraRef.current = new THREE.PerspectiveCamera(60, mount.clientWidth / mount.clientHeight, 0.1, 4000);
        const camera = cameraRef.current;
        camera.position.z = 250;

        rendererRef.current = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        const renderer = rendererRef.current;
        renderer.setSize(mount.clientWidth, mount.clientHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        mount.appendChild(renderer.domElement);
        
        const starGroup = new THREE.Group();
        scene.add(starGroup);

        // --- Selection Indicator ---
        const indicatorGeometry = new THREE.RingGeometry(1, 1.2, 32);
        const indicatorMaterial = new THREE.MeshBasicMaterial({ color: 0x00ffff, side: THREE.DoubleSide, transparent: true, opacity: 0.8 });
        selectionIndicatorRef.current = new THREE.Mesh(indicatorGeometry, indicatorMaterial);
        const selectionIndicator = selectionIndicatorRef.current;
        selectionIndicator.visible = false;
        scene.add(selectionIndicator);

        // --- Create Star Particles ---
        const createStarTexture = () => {
            const canvas = document.createElement('canvas');
            canvas.width = 64; canvas.height = 64;
            const ctx = canvas.getContext('2d');
            if (!ctx) return null;
            const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
            gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
            gradient.addColorStop(0.2, 'rgba(180, 220, 255, 1)');
            gradient.addColorStop(0.4, 'rgba(100, 150, 255, 0.8)');
            gradient.addColorStop(1, 'rgba(100, 150, 255, 0)');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, 64, 64);
            return new THREE.CanvasTexture(canvas);
        };
        
        // --- Load Star Data and Create Scene ---
        const init = async () => {
            try {
                // Fetch data from a local file in the public directory
                const response = await fetch('/data.json'); 
                if (!response.ok) throw new Error('Yıldız verisi yüklenemedi');
                const data: StarData[] = await response.json();
                                
                const vertices = [];
                const colors = [];
                const sizes = [];

                for (let i = 0; i < data.length; i++) {
                    const star = data[i];
                    
                    // Convert spherical coordinates (RA, Dec, distance) to Cartesian (x, y, z)
                    // The 'ra' value in data.json appears to be normalized (0-1 range representing 0-24h).
                    // Convert it to a full 360-degree radian value.
                    const raRad = star.ra * 2 * Math.PI;
                    const decRad = star.dec * (Math.PI / 180); // Dec from degrees to radians
                    const r = star.dist; // Distance in parsecs

                    star.x = r * Math.cos(decRad) * Math.cos(raRad);
                    star.y = r * Math.sin(decRad); // Y is up in this coordinate system
                    star.z = r * Math.cos(decRad) * Math.sin(raRad); // Z is depth

                    vertices.push(star.x, star.y, star.z);

                    // Set size based on magnitude (brighter stars are smaller magnitude)
                    const size = Math.max(0.1, 5 - star.mag) * 0.5;
                    sizes.push(size);
                    
                    // Simple color for all stars
                    colors.push(1.0, 1.0, 1.0);
                }
                
                starDataRef.current = data;
                
                const geometry = new THREE.BufferGeometry();
                geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
                geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
                geometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));
                
                const material = new THREE.PointsMaterial({
                    size: 1,
                    vertexColors: true,
                    map: createStarTexture(),
                    blending: THREE.AdditiveBlending,
                    depthWrite: false,
                    transparent: true,
                    sizeAttenuation: true,
                });
                
                starPointsRef.current = new THREE.Points(geometry, material);
                starGroup.add(starPointsRef.current);
                
                setStatus('loaded');
            } catch (error) {
                console.error("CosmosView başlatılırken hata oluştu:", error);
                setStatus('error');
            }
        };

        init();
        
        // --- Animation Loop ---
        let mouseX = 0, mouseY = 0;
        let targetRotationX = 0;
        let targetRotationY = 0;
        const windowHalfX = window.innerWidth / 2;
        const windowHalfY = window.innerHeight / 2;
        
        const onMouseMove = (event: MouseEvent) => {
            mouseX = (event.clientX - windowHalfX) * 0.5;
            mouseY = (event.clientY - windowHalfY) * 0.5;
        };

        let animationFrameId: number;
        const animate = () => {
            animationFrameId = requestAnimationFrame(animate);
            targetRotationX = mouseY * 0.0005;
            targetRotationY = mouseX * 0.0005;
            
            starGroup.rotation.x += (targetRotationX - starGroup.rotation.x) * 0.05;
            starGroup.rotation.y += (targetRotationY - starGroup.rotation.y) * 0.05;
            
            renderer.render(scene, camera);
        };
        animate();

        // --- Interactivity ---
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();

        raycaster.params.Points.threshold = 0.5; // Adjust threshold for easier clicking

        const onClick = (event: MouseEvent) => {
            if (!starPointsRef.current || starDataRef.current.length === 0) return;

            event.preventDefault();

            mouse.x = (event.clientX / mount.clientWidth) * 2 - 1;
            mouse.y = -(event.clientY / mount.clientHeight) * 2 + 1;

            raycaster.setFromCamera(mouse, camera);

            const intersects = raycaster.intersectObject(starPointsRef.current);

            if (intersects.length > 0) {
                const intersect = intersects[0];
                if (intersect.index !== undefined) {
                    const selected = starDataRef.current[intersect.index];
                    setSelectedStar(selected);

                    // Move indicator to the selected star's position
                    if (selected.x !== undefined && selected.y !== undefined && selected.z !== undefined) {
                        selectionIndicator.position.set(selected.x, selected.y, selected.z);
                        selectionIndicator.visible = true;
                    }
                }
            } else {
                setSelectedStar(null);
                selectionIndicator.visible = false;
            }
        };

        // --- Handle Resize ---
        const handleResize = () => {
            camera.aspect = mount.clientWidth / mount.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(mount.clientWidth, mount.clientHeight);
        };

        window.addEventListener('resize', handleResize);
        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('click', onClick);

        // --- Cleanup ---
        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('click', onClick);
            if (rendererRef.current && mountRef.current) {
                mountRef.current.removeChild(rendererRef.current.domElement);
            }
        };
    }, []); // Empty dependency array ensures this runs only once on mount

    return (
        <div className="h-full w-full relative bg-black">
            {status === 'loading' && (
                <div className="absolute inset-0 flex items-center justify-center text-blue-300 tracking-widest animate-pulse">
                    [ YILDIZ_HARİTASI_YÜKLENİYOR... ]
                </div>
            )}
             {status === 'error' && (
                <div className="absolute inset-0 flex items-center justify-center text-red-400 tracking-widest">
                    [ YILDIZ_VERİSİ_YÜKLENEMEDİ ]
                </div>
            )}
            <div ref={mountRef} className="w-full h-full" />
            {selectedStar && <StarInfoPanel star={selectedStar} onClose={() => setSelectedStar(null)} />}
        </div>
    );
};

export default CosmosView;
