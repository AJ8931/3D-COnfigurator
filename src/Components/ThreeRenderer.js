import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

const ThreeRenderer = ({ onShirtLoaded }) => {
  const canvasRef = useRef();

  useEffect(() => {
    const canvas = canvasRef.current;
    const scene = new THREE.Scene();
    const BACKGROUND_COLOR = 0xf1f1f1;

    // Three.js setup
    scene.background = new THREE.Color(BACKGROUND_COLOR);
    scene.fog = new THREE.Fog(BACKGROUND_COLOR, 30, 700);

    // Add lights
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.61);
    hemiLight.position.set(0, 50, 0);
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.54);
    dirLight.position.set(-8, 12, 8);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize = new THREE.Vector2(1024, 1024);
    scene.add(dirLight);

    // Floor
    const floorGeometry = new THREE.PlaneGeometry(5000, 5000, 1, 1);
    const floorMaterial = new THREE.MeshPhongMaterial({
      color: 0xbebebe,
      shininess: 0,
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -0.5 * Math.PI;
    floor.receiveShadow = true;
    floor.position.y = -61;
    scene.add(floor);

    // Load shirt
    const shirtLoader = new GLTFLoader();
    shirtLoader.load("/Models/tshirt2222.glb", (obj) => {
      const shirt = obj.scene;
      scene.add(shirt);
      shirt.position.set(0, -60, 20);
      shirt.scale.set(2, 2, 2);
      onShirtLoaded(shirt);
    });

    const camera = new THREE.PerspectiveCamera(
      80,
      window.innerWidth / 2 / (window.innerHeight / 1.4),
      1,
      1000
    );
    camera.position.set(0, 40, 100);
    scene.add(camera);

    const renderer = new THREE.WebGLRenderer({ canvas });
    renderer.setSize(window.innerWidth / 2, window.innerHeight / 1.4);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.update();
    controls.maxPolarAngle = 1.5;

    const animate = () => {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / 2 / (window.innerHeight / 1.4);
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth / 2, window.innerHeight / 1.4);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [onShirtLoaded]);

  return <canvas ref={canvasRef} id="canvasRenderer" />;
};

export default ThreeRenderer;
