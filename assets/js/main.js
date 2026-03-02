/*===== SMOOTH SCROLL =====*/
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        if (targetId !== '#') {
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const offsetTop = targetElement.offsetTop - 70; // Account for fixed navbar
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });

                // Close mobile menu after click
                const navbarCollapse = document.getElementById('navbarNav');
                if (navbarCollapse && navbarCollapse.classList.contains('show')) {
                    const bsCollapse = new bootstrap.Collapse(navbarCollapse, {
                        toggle: false
                    });
                    bsCollapse.hide();
                }
            }
        }
    });
});

/*==================== SCROLL SECTIONS ACTIVE LINK ====================*/
const sections = document.querySelectorAll('section[id]');

function scrollActive() {
    const scrollY = window.pageYOffset;

    sections.forEach(current => {
        const sectionHeight = current.offsetHeight;
        const sectionTop = current.offsetTop - 100;
        const sectionId = current.getAttribute('id');

        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
            // Update Bootstrap nav-link active state
            document.querySelectorAll('.navbar-nav .nav-link').forEach(link => {
                link.classList.remove('active');
            });

            const activeLink = document.querySelector('.navbar-nav a[href*=' + sectionId + ']');
            if (activeLink) {
                activeLink.classList.add('active');
            }
        }
    });
}
window.addEventListener('scroll', scrollActive);

/*===== SCROLL REVEAL ANIMATION =====*/
const sr = ScrollReveal({
    origin: 'top',
    distance: '60px',
    duration: 500,
    delay: 50,
});

// Update the ID to match the one in your HTML
sr.reveal('.home__data, .about__img, .skills__subtitle, .skills__text, .personal, .personal__img', {});
sr.reveal('.home__img, .about__subtitle, .about__text, .skills__img, .personal__text', { delay: 400 });
sr.reveal('.home__social-icon', { interval: 200 });
sr.reveal('.skills__data, .work__img, .contact__input', { interval: 200 });


document.addEventListener("DOMContentLoaded", function () {
    const titles = ["AI Engineer", "Data Scientist", "MLOps Engineer", "IoT Developer"];
    const titleElement = document.querySelector(".home__title .job-title");

    if (!titleElement) return; // Guard clause

    let titleIndex = 0;

    function typeTitle() {
        const currentTitle = titles[titleIndex];
        const currentText = titleElement.innerHTML;
        const lengthToType = Math.min(currentText.length + 1, currentTitle.length);

        titleElement.innerHTML = currentTitle.substring(0, lengthToType);

        if (lengthToType < currentTitle.length) {
            requestAnimationFrame(typeTitle);
        } else {
            setTimeout(replaceTitle, 2000);
        }
    }

    function replaceTitle() {
        const currentTitle = titles[titleIndex];
        titleElement.innerHTML = currentTitle;

        setTimeout(eraseTitle, 1000);
    }

    function eraseTitle() {
        const currentText = titleElement.innerHTML;

        if (currentText !== "") {
            titleElement.innerHTML = currentText.substring(0, currentText.length - 1);
            requestAnimationFrame(eraseTitle);
        } else {
            titleIndex = (titleIndex + 1) % titles.length;
            setTimeout(typeTitle, 1000);
        }
    }

    setTimeout(typeTitle, 1000);
});

const workImages = document.querySelectorAll('.work__img');

workImages.forEach((workImage) => {
    const description = workImage.getAttribute('data-description');
    const descriptionElement = workImage.querySelector('.work__description');

    if (descriptionElement && description) {
        descriptionElement.textContent = description;
    }
});