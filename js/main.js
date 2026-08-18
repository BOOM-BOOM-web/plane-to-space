// Initialize the 3D Scene
SceneManager.init();

// Initialize the UI Elements and Event Listeners
UIManager.init();

// Initialize the Game Manager (Input listeners, initial shop build)
GameManager.init();

// Handle Window Resizing
window.addEventListener('resize', () => {
    SceneManager.onWindowResize();
});

// Main Animation Loop
function animate() {
    requestAnimationFrame(animate);
    
    // Update Game Logic
    GameManager.update();
    
    // Render the 3D Scene
    SceneManager.renderer.render(SceneManager.scene, SceneManager.camera);
}

// Start the loop
animate();
