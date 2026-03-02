/* ===== 3D INTERACTIONS & TAB NAVIGATION ===== */

class Portfolio3D {
    constructor() {
        this.currentTab = 'profile';
        this.container = document.querySelector('.portfolio-3d-container');
        this.tabs = document.querySelectorAll('.tab-btn');
        this.tabContents = document.querySelectorAll('.tab-content');

        this.init();
    }

    init() {
        this.setupTabNavigation();
        this.setup3DMouseEffect();
        this.setupCardInteractions();
        this.initializeTypewriter();
        this.setupScrollProgress();
    }

    setupScrollProgress() {
        const scrollIndicator = document.getElementById('scrollIndicator');
        if (!scrollIndicator) return;

        window.addEventListener('scroll', () => {
            const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
            const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const scrolled = (winScroll / height) * 100;
            scrollIndicator.style.width = scrolled + "%";
        });
    }

    setupTabNavigation() {
        this.tabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                e.preventDefault();
                const tabName = e.currentTarget.dataset.tab;
                if (tabName) {
                    this.switchTab(tabName);
                }
            });
        });
    }

    switchTab(tabName) {
        if (tabName === this.currentTab) return;

        // Remove active class from all tabs
        this.tabs.forEach(tab => tab.classList.remove('active'));

        // Add active class to clicked tab
        const activeTab = document.querySelector(`[data-tab="${tabName}"]`);
        activeTab.classList.add('active');

        // Get current and new content
        const currentContent = document.querySelector(`#${this.currentTab}-tab`);
        const newContent = document.querySelector(`#${tabName}-tab`);

        // Animate transition with 3D flip (Desktop only)
        if (window.innerWidth > 992) {
            currentContent.style.transform = 'rotateY(90deg)';
            currentContent.style.opacity = '0';

            setTimeout(() => {
                currentContent.classList.remove('active');
                newContent.classList.add('active');

                // Start new content from opposite rotation
                newContent.style.transform = 'rotateY(-90deg)';
                newContent.style.opacity = '0';

                // Trigger reflow
                newContent.offsetHeight;

                // Animate in
                requestAnimationFrame(() => {
                    newContent.style.transform = 'rotateY(0)';
                    newContent.style.opacity = '1';
                });
            }, 300);
        } else {
            // Instant swap for Mobile (Max Stability)
            // Clear inline styles to let CSS handle everything
            currentContent.style.opacity = '';
            currentContent.style.transform = '';
            currentContent.classList.remove('active');

            newContent.style.opacity = '';
            newContent.style.transform = '';
            newContent.classList.add('active');
        }

        this.currentTab = tabName;

        // Update particle color based on tab
        this.updateThemeColor(tabName);
    }

    updateThemeColor(tabName) {
        const colors = {
            profile: '--color-accent-cyan',
            experience: '--color-accent-purple',
            skills: '--color-accent-pink',
            projects: '--color-accent-cyan'
        };

        document.documentElement.style.setProperty('--active-color',
            `var(${colors[tabName] || colors.profile})`);
    }

    setup3DMouseEffect() {
        let mouseX = 0;
        let mouseY = 0;
        let currentX = 0;
        let currentY = 0;

        document.addEventListener('mousemove', (e) => {
            mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
            mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
        });

        const animate = () => {
            // Disable on mobile/tablet
            if (window.innerWidth <= 992) {
                if (this.container) {
                    this.container.style.transform = 'none';
                }
                requestAnimationFrame(animate);
                return;
            }

            // Smooth interpolation
            currentX += (mouseX - currentX) * 0.1;
            currentY += (mouseY - currentY) * 0.1;

            // Apply subtle 3D rotation to container
            if (this.container) {
                const rotateX = currentY * 3;
                const rotateY = currentX * 3;

                this.container.style.transform = `
          perspective(2000px)
          rotateX(${-rotateX}deg)
          rotateY(${rotateY}deg)
        `;
            }

            requestAnimationFrame(animate);
        };

        animate();
    }

    setupCardInteractions() {
        const cards = document.querySelectorAll('.card-3d, .experience-card, .skill-orb, .project-card');

        cards.forEach(card => {
            card.addEventListener('mouseenter', function () {
                if (window.innerWidth <= 992) return; // Disable on mobile
                this.style.transform = 'translateZ(80px) scale(1.05)';
            });

            card.addEventListener('mouseleave', function () {
                this.style.transform = 'translateZ(50px) scale(1)';
            });

            card.addEventListener('mousemove', function (e) {
                if (window.innerWidth <= 992) return; // Disable on mobile
                const rect = this.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                const centerX = rect.width / 2;
                const centerY = rect.height / 2;

                const rotateX = (y - centerY) / 10;
                const rotateY = (centerX - x) / 10;

                this.style.transform = `
          translateZ(80px) 
          rotateX(${rotateX}deg) 
          rotateY(${rotateY}deg)
          scale(1.05)
        `;
            });
        });
    }

    initializeTypewriter() {
        const titles = [
            'Lead AI Engineer',
            'MLOps Specialist',
            'Robotics Developer',
            'Voice Agent Expert',
            'GenAI Architect'
        ];

        let titleIndex = 0;
        let charIndex = 0;
        let isDeleting = false;
        const typewriterElement = document.querySelector('.typewriter-text');

        if (!typewriterElement) return;

        const type = () => {
            const currentTitle = titles[titleIndex];

            if (isDeleting) {
                typewriterElement.textContent = currentTitle.substring(0, charIndex - 1);
                charIndex--;
            } else {
                typewriterElement.textContent = currentTitle.substring(0, charIndex + 1);
                charIndex++;
            }

            let typeSpeed = isDeleting ? 50 : 100;

            if (!isDeleting && charIndex === currentTitle.length) {
                typeSpeed = 2000; // Pause at end
                isDeleting = true;
            } else if (isDeleting && charIndex === 0) {
                isDeleting = false;
                titleIndex = (titleIndex + 1) % titles.length;
                typeSpeed = 500; // Pause before next word
            }

            setTimeout(type, typeSpeed);
        };

        type();
    }
}

// Floating animation for elements
const addFloatingAnimation = () => {
    const floatingElements = document.querySelectorAll('.floating');

    floatingElements.forEach((el, index) => {
        const delay = index * 0.2;
        const duration = 3 + Math.random() * 2;

        el.style.animationDelay = `${delay}s`;
        el.style.animationDuration = `${duration}s`;
    });
};

// Initialize everything
document.addEventListener('DOMContentLoaded', () => {
    new Portfolio3D();
    addFloatingAnimation();
});
