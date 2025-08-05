document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('certifications-container');
    const items = Array.from(document.querySelectorAll('.certification-item'));
    const numItems = items.length;
    const radius = 400; // Horizontal radius
    let angle = 0;
    let autoRotateSpeed = 0;
    let targetRotateSpeed = 0;

    function positionItems() {
        items.forEach((item, i) => {
            const itemAngle = (360 / numItems) * i + angle;
            const x = radius * Math.cos(itemAngle * (Math.PI / 180));
            const scale = 0.5 + 0.5 * Math.sin(itemAngle * (Math.PI / 180));

            item.style.transform = `translate(-50%, -50%) translateX(${x}px) scale(${scale})`;
            item.style.zIndex = Math.floor(scale * 100);
        });
    }

    function updateRotation() {
        autoRotateSpeed += (targetRotateSpeed - autoRotateSpeed) * 0.1; // Smooth acceleration
        angle += autoRotateSpeed;
        positionItems();
        requestAnimationFrame(updateRotation);
    }

    function handleMove(clientX) {
        const containerRect = container.getBoundingClientRect();
        const deadZone = 250;

        if (clientX > containerRect.left && clientX < containerRect.left + deadZone) {
            targetRotateSpeed = -1 * (1 - (clientX - containerRect.left) / deadZone);
        } else if (clientX < containerRect.right && clientX > containerRect.right - deadZone) {
            targetRotateSpeed = 1 * ((clientX - (containerRect.right - deadZone)) / deadZone);
        } else {
            targetRotateSpeed = 0;
        }
    }

    container.addEventListener('mousemove', (e) => {
        handleMove(e.clientX);
    });

    container.addEventListener('touchmove', (e) => {
        handleMove(e.touches[0].clientX);
    });

    container.addEventListener('mouseleave', () => {
        targetRotateSpeed = 0;
    });

    container.addEventListener('touchend', () => {
        targetRotateSpeed = 0;
    });

    container.addEventListener('wheel', (e) => {
        e.preventDefault();
        angle += e.deltaY * 0.1;
        positionItems();
    });

    positionItems();
    updateRotation();
});
