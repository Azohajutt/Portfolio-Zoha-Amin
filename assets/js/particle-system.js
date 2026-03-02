/* ===== MOUSE-FOLLOWING PARTICLE SYSTEM ===== */

class ParticleSystem {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.maxParticles = 100;
        this.mouseX = 0;
        this.mouseY = 0;
        this.lastX = 0;
        this.lastY = 0;
        this.isMouseMoving = false;

        this.init();
        this.setupEventListeners();
        this.animate();
    }

    init() {
        this.resize();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    setupEventListeners() {
        window.addEventListener('resize', () => this.resize());

        let mouseTimeout;
        document.addEventListener('mousemove', (e) => {
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
            this.isMouseMoving = true;

            // Create particles when mouse moves
            if (Math.random() < 0.3) { // 30% chance per frame
                this.createParticle(this.mouseX, this.mouseY);
            }

            clearTimeout(mouseTimeout);
            mouseTimeout = setTimeout(() => {
                this.isMouseMoving = false;
            }, 100);
        });
    }

    createParticle(x, y) {
        if (this.particles.length >= this.maxParticles) {
            this.particles.shift(); // Remove oldest particle
        }

        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 2 + 1;

        this.particles.push({
            x: x + (Math.random() - 0.5) * 10,
            y: y + (Math.random() - 0.5) * 10,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: 1.0,
            decay: Math.random() * 0.01 + 0.005,
            size: Math.random() * 3 + 2,
            color: this.getParticleColor()
        });
    }

    getParticleColor() {
        const colors = [
            { r: 0, g: 243, b: 255 },    // Cyan
            { r: 157, g: 70, b: 255 },   // Purple
            { r: 255, g: 0, b: 110 }     // Pink
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    updateParticles() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];

            // Update position
            p.x += p.vx;
            p.y += p.vy;

            // Apply gravity
            p.vy += 0.05;

            // Apply drag
            p.vx *= 0.98;
            p.vy *= 0.98;

            // Fade out
            p.life -= p.decay;

            // Remove dead particles
            if (p.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }

    drawParticles() {
        this.particles.forEach(p => {
            const alpha = p.life * 0.8;

            // Draw particle
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${alpha})`;
            this.ctx.fill();

            // Glow effect
            this.ctx.shadowBlur = 15;
            this.ctx.shadowColor = `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${alpha})`;
            this.ctx.fill();
            this.ctx.shadowBlur = 0;

            // Draw trail line to previous particles
            if (this.particles.length > 1) {
                const prevParticle = this.particles[this.particles.indexOf(p) - 1];
                if (prevParticle) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(p.x, p.y);
                    this.ctx.lineTo(prevParticle.x, prevParticle.y);
                    this.ctx.strokeStyle = `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${alpha * 0.3})`;
                    this.ctx.lineWidth = 1;
                    this.ctx.stroke();
                }
            }
        });
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.updateParticles();
        this.drawParticles();

        this.lastX = this.mouseX;
        this.lastY = this.mouseY;

        requestAnimationFrame(() => this.animate());
    }
}

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    new ParticleSystem('particle-canvas');
});
