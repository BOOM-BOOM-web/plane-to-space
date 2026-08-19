SceneManager.init();
UIManager.init();
GameManager.init();

window.addEventListener('resize', () => {
    SceneManager.onWindowResize();
});

function animate() {
    requestAnimationFrame(animate);
    GameManager.update();
    SceneManager.renderer.render(SceneManager.scene, SceneManager.camera);
}

animate();
