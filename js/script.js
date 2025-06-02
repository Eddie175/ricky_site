document.addEventListener('DOMContentLoaded', () => {
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const mobileNavMenu = document.querySelector('.mobile-nav-menu');
    const navLinks = document.querySelectorAll('nav ul li a:not(.btn), .mobile-nav-menu ul li a:not(.btn)');
    const sections = document.querySelectorAll('section[id]');
    const themeToggle = document.getElementById('theme-toggle');
    const contactForm = document.getElementById('contact-form');
    const testimonialSlides = document.querySelector('.testimonial-slides');
    const prevButton = document.querySelector('.prev-slide');
    const nextButton = document.querySelector('.next-slide');
    const header = document.querySelector('header');
    let currentSlide = 0;

    // Sticky header with transparency on scroll
    if (header) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) { // Add .scrolled class after 50px of scroll
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
    }

    // Mobile Menu Toggle
    if (mobileMenuToggle && mobileNavMenu) {
        mobileMenuToggle.addEventListener('click', () => {
            mobileNavMenu.classList.toggle('active');
            mobileMenuToggle.textContent = mobileNavMenu.classList.contains('active') ? '✕' : '☰';
        });
    }

    // Smooth Scrolling & Active Nav Link Highlighting
    function setActiveLink() {
        let currentSectionId = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            if (pageYOffset >= sectionTop - 100) { // Adjusted for header height + a bit more
                currentSectionId = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSectionId}`) {
                link.classList.add('active');
            }
        });
    }

    navLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            if (this.hash !== "") {
                e.preventDefault();
                const hash = this.hash;
                const targetElement = document.querySelector(hash);
                if (targetElement) {
                    const headerOffset = document.querySelector('header').offsetHeight;
                    const elementPosition = targetElement.offsetTop;
                    const offsetPosition = elementPosition - headerOffset;

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: "smooth"
                    });

                    // Close mobile menu if open and link is clicked
                    if (mobileNavMenu && mobileNavMenu.classList.contains('active')) {
                        mobileNavMenu.classList.remove('active');
                        mobileMenuToggle.textContent = '☰';
                    }
                }
            }
        });
    });

    window.addEventListener('scroll', setActiveLink);
    setActiveLink(); // Initial call to set active link on page load

    // Theme Switcher
    function setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        if (themeToggle) themeToggle.checked = theme === 'dark';
    }

    if (themeToggle) {
        themeToggle.addEventListener('change', () => {
            setTheme(themeToggle.checked ? 'dark' : 'light');
        });
    }

    // Load saved theme or default to light
    const savedTheme = localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    setTheme(savedTheme);

    // Fade-in animations for elements
    const fadeInElements = document.querySelectorAll('.fade-in');
    const observerOptions = {
        root: null, // relative to document viewport 
        rootMargin: '0px',
        threshold: 0.1 // 10% of item is visible
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // If parent has 'fade-in-parent', stagger children
                if (entry.target.parentElement.classList.contains('fade-in-parent')) {
                    const children = entry.target.parentElement.querySelectorAll('.fade-in');
                    children.forEach((child, index) => {
                        child.style.animationDelay = `${index * 0.2}s`; // Stagger by 0.2s
                        child.style.animationName = 'fadeInAnimation'; // Ensure animation name is set
                        child.classList.add('animate'); // Add a class to trigger animation
                    });
                } else {
                    entry.target.style.animationName = 'fadeInAnimation';
                    entry.target.classList.add('animate');
                }
                observer.unobserve(entry.target); // Stop observing once animated
            }
        });
    }, observerOptions);

    fadeInElements.forEach(el => {
        observer.observe(el);
    });

    // Testimonial Slider
    function showTestimonial(index) {
        if (!testimonialSlides) return;
        const totalSlides = testimonialSlides.children.length;
        if (index >= totalSlides) currentSlide = 0;
        else if (index < 0) currentSlide = totalSlides - 1;
        else currentSlide = index;
        testimonialSlides.style.transform = `translateX(-${currentSlide * 100}%)`;
    }

    if (prevButton && nextButton) {
        prevButton.addEventListener('click', () => {
            showTestimonial(currentSlide - 1);
        });

        nextButton.addEventListener('click', () => {
            showTestimonial(currentSlide + 1);
        });
        // Auto-slide (optional)
        // setInterval(() => {
        //     showTestimonial(currentSlide + 1);
        // }, 5000); // Change slide every 5 seconds
    }
    showTestimonial(0); // Show first testimonial initially

    // Photo Gallery View More
    const galleryGrid = document.querySelector('.gallery-grid');
    const viewMoreGalleryButton = document.getElementById('viewMoreGallery');
    const initiallyVisibleItems = 8; // Show 8 items initially

    if (galleryGrid && viewMoreGalleryButton) {
        const galleryItems = Array.from(galleryGrid.querySelectorAll('.gallery-item'));

        // Initial setup: mark items beyond the initial count as hidden if not already
        galleryItems.forEach((item, index) => {
            if (index >= initiallyVisibleItems && !item.hasAttribute('data-hidden')) {
                item.setAttribute('data-hidden', 'true');
            }
        });

        function updateGalleryVisibility() {
            let allCurrentlyHidden = true;
            let actualVisibleCount = 0;

            galleryItems.forEach((item, index) => {
                const isMarkedHidden = item.getAttribute('data-hidden') === 'true';

                if (viewMoreGalleryButton.classList.contains('all-visible')) {
                    // If 'View Less' is active, show all items
                    item.style.display = 'flex';
                    actualVisibleCount++;
                    if(isMarkedHidden) allCurrentlyHidden = false; // If any hidden item is now shown
                } else {
                    // If 'View More' is active
                    if (index < initiallyVisibleItems) {
                        item.style.display = 'flex';
                        actualVisibleCount++;
                        if(isMarkedHidden) allCurrentlyHidden = false;
                    } else if (isMarkedHidden) {
                        item.style.display = 'none';
                    } else { // Items beyond initial that are not marked hidden (should be rare after init)
                        item.style.display = 'flex'; 
                        actualVisibleCount++;
                    }
                }
            });
            
            const totalItems = galleryItems.length;
            const hiddenItemsCount = galleryItems.filter(item => item.getAttribute('data-hidden') === 'true').length;

            if (viewMoreGalleryButton.classList.contains('all-visible')) {
                viewMoreGalleryButton.textContent = 'View Less';
                // Show button if there are items to hide (i.e., more than initially visible)
                if (totalItems > initiallyVisibleItems) {
                    viewMoreGalleryButton.style.display = 'inline-block';
                } else {
                    viewMoreGalleryButton.style.display = 'none';
                }
            } else {
                viewMoreGalleryButton.textContent = 'View More';
                // Show button if there are hidden items to show
                if (hiddenItemsCount > 0 && actualVisibleCount < totalItems) {
                     viewMoreGalleryButton.style.display = 'inline-block';
                } else {
                    viewMoreGalleryButton.style.display = 'none';
                }
            }
             // Final check: if all items are visible by default (e.g. less than initiallyVisibleItems), hide button
            if (totalItems <= initiallyVisibleItems) {
                viewMoreGalleryButton.style.display = 'none';
            }
        }

        updateGalleryVisibility(); // Call on page load

        viewMoreGalleryButton.addEventListener('click', () => {
            viewMoreGalleryButton.classList.toggle('all-visible');
            updateGalleryVisibility();
        });
    }

});

// Ensure animations are re-triggered if elements become visible again (e.g. through tab switching)
// This is a simple approach; more complex scenarios might need a different strategy.
// document.addEventListener("visibilitychange", () => {
//     if (document.visibilityState === "visible") {
//         fadeInElements.forEach(el => {
//             // Reset animation if it was previously applied and element is not intersecting
//             // This logic might need refinement based on specific needs
//             if (el.classList.contains('animate') && !isElementInViewport(el)) {
//                 el.classList.remove('animate');
//                 el.style.opacity = 0; // Reset opacity
//                 el.style.transform = 'translateY(20px)'; // Reset transform
//             }
//             // Re-observe if not already animated or if it was reset
//             if (!el.classList.contains('animate')) {
//                 observer.observe(el);
//             }
//         });
//     }
// });

// Helper function to check if element is in viewport (simplified)
// function isElementInViewport(el) {
//     const rect = el.getBoundingClientRect();
//     return (
//         rect.top >= 0 &&
//         rect.left >= 0 &&
//         rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
//         rect.right <= (window.innerWidth || document.documentElement.clientWidth)
//     );
// } 