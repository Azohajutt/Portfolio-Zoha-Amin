/* ===== MODERN ANIMATIONS & INTERACTIONS ===== */

// Intersection Observer for scroll-triggered animations
const animateOnScroll = () => {
    const elements = document.querySelectorAll('.animate-on-scroll');

    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);

    elements.forEach(el => observer.observe(el));
};

// Initialize on DOM load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', animateOnScroll);
} else {
    animateOnScroll();
}

// Smooth active nav link highlighting on scroll
const updateActiveNavLink = () => {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.navbar-nav .nav-link');

    let scrollY = window.pageYOffset;

    sections.forEach(current => {
        const sectionHeight = current.offsetHeight;
        const sectionTop = current.offsetTop - 100;
        const sectionId = current.getAttribute('id');

        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${sectionId}`) {
                    link.classList.add('active');
                }
            });
        }
    });
};

// Debounce function for performance
const debounce = (func, wait = 10) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

// Apply debounced scroll listener
window.addEventListener('scroll', debounce(updateActiveNavLink, 10));

// Add hover tilt effect to project cards (subtle 3D effect)
const addTiltEffect = () => {
    const cards = document.querySelectorAll('.work__item, .glass-card');

    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = (y - centerY) / 20;
            const rotateY = (centerX - x) / 20;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
        });
    });
};

// Initialize tilt effect when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', addTiltEffect);
} else {
    addTiltEffect();
}

// Preload critical images for better performance
const preloadImages = () => {
    const criticalImages = [
        'assets/img/Me.png' // Profile picture
    ];

    criticalImages.forEach(src => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = src;
        document.head.appendChild(link);
    });
};

preloadImages();

// Enhanced navbar scroll behavior
let lastScroll = 0;
const navbar = document.querySelector('.navbar');

const handleNavbarScroll = () => {
    const currentScroll = window.pageYOffset;

    // Add background blur when scrolled
    if (currentScroll > 50) {
        navbar?.classList.add('scrolled');
    } else {
        navbar?.classList.remove('scrolled');
    }

    lastScroll = currentScroll;
};

window.addEventListener('scroll', debounce(handleNavbarScroll, 10));
