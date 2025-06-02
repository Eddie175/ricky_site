document.addEventListener('DOMContentLoaded', () => {
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const mobileNavMenu = document.querySelector('header nav');
    const navLinks = document.querySelectorAll('nav ul li a:not(.btn), .mobile-nav-menu ul li a:not(.btn)');
    const sections = document.querySelectorAll('section[id]');
    const themeToggle = document.getElementById('theme-toggle');
    const header = document.querySelector('header');

    /* Testimonial Slider (Commented out as not present in current HTML)
    const testimonialSlides = document.querySelector('.testimonial-slides');
    const prevButton = document.querySelector('.prev-slide');
    const nextButton = document.querySelector('.next-slide');
    let currentSlide = 0;
    */

    // Sticky header scroll listener removed as header is always styled
    /*
    if (header) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) { 
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
    }
    */

    // Mobile Menu Toggle
    if (mobileMenuToggle && mobileNavMenu) {
        mobileMenuToggle.addEventListener('click', () => {
            mobileNavMenu.classList.toggle('active');
            mobileMenuToggle.textContent = mobileNavMenu.classList.contains('active') ? '✕' : '☰';
            
            // Prevent body scroll when menu is open
            document.body.style.overflow = mobileNavMenu.classList.contains('active') ? 'hidden' : '';
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (mobileNavMenu.classList.contains('active') && 
                !mobileNavMenu.contains(e.target) && 
                !mobileMenuToggle.contains(e.target)) {
                mobileNavMenu.classList.remove('active');
                mobileMenuToggle.textContent = '☰';
                document.body.style.overflow = '';
            }
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
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
                obs.unobserve(entry.target);
            }
        });
    }, observerOptions);

    fadeInElements.forEach(el => {
        observer.observe(el);
    });

    // ===== Dynamic Photo Gallery =====
    const galleryGrid = document.querySelector('.gallery-grid');
    const viewMoreGalleryButton = document.getElementById('viewMoreGallery');
    const imageModal = document.getElementById('imageModal');
    const modalImage = document.getElementById('modalImage');
    const modalCloseButton = document.getElementById('modalCloseButton');

    const photoBasePath = './photos/';
    const photoPrefix = 'photo_';
    const photoExtension = '.jpeg';
    const maxPhotosToCheck = 50; // How many photos to attempt to load (e.g., photo_1.jpeg to photo_50.jpeg)
    const initiallyVisibleItems = 8;
    let loadedGalleryItems = []; // To store the actual gallery item DOM elements

    async function imageExists(url) {
        return new Promise(resolve => {
            const img = new Image();
            img.onload = () => resolve(true);
            img.onerror = () => resolve(false);
            img.src = url;
        });
    }

    async function loadGalleryImages() {
        if (!galleryGrid) return;
        galleryGrid.innerHTML = ''; // Clear any existing items (like placeholders)
        loadedGalleryItems = [];
        let consecutiveMisses = 0;
        const maxConsecutiveMisses = 3; // Stop if 3 images in a row are not found

        for (let i = 1; i <= maxPhotosToCheck; i++) {
            const photoName = `${photoPrefix}${i}${photoExtension}`;
            const photoUrl = `${photoBasePath}${photoName}`;

            if (await imageExists(photoUrl)) {
                consecutiveMisses = 0; // Reset misses if image is found
                const item = document.createElement('div');
                item.classList.add('gallery-item');
                
                const img = document.createElement('img');
                img.src = photoUrl;
                img.alt = `Handyman project example ${i}`;
                img.style.cursor = 'pointer'; // Add pointer cursor

                img.addEventListener('click', () => openModal(photoUrl));

                item.appendChild(img);
                galleryGrid.appendChild(item);
                loadedGalleryItems.push(item);
            } else {
                consecutiveMisses++;
                if (consecutiveMisses >= maxConsecutiveMisses) {
                    console.log(`Stopping gallery load: ${maxConsecutiveMisses} consecutive images not found, last checked: ${photoName}`);
                    break; // Stop if too many images are missing in a row
                }
            }
        }
        setupGalleryControls();
        // Re-apply fade-in to the grid if it was already observed and animated
        if (galleryGrid.classList.contains('animate')) {
            galleryGrid.classList.remove('animate');
            galleryGrid.style.animationName = 'none';
            void galleryGrid.offsetWidth; // Trigger reflow
            galleryGrid.style.animationName = 'fadeInAnimation';
            galleryGrid.classList.add('animate');
        } else if (!galleryGrid.classList.contains('fade-in')){
             // If the grid itself wasn't a fade-in target, ensure it becomes visible.
             galleryGrid.style.opacity = 1;
        }
    }

    function setupGalleryControls() {
        if (!viewMoreGalleryButton || loadedGalleryItems.length === 0) {
            if(viewMoreGalleryButton) viewMoreGalleryButton.style.display = 'none';
            return;
        }

        // Initially hide items beyond the initiallyVisibleItems count
        loadedGalleryItems.forEach((item, index) => {
            item.style.opacity = '1'; // Ensure opacity is set for transition if any
            if (index >= initiallyVisibleItems) {
                item.style.display = 'none';
                item.setAttribute('data-initially-hidden', 'true');
            } else {
                item.style.display = 'block'; // Or your default display for grid items
                item.removeAttribute('data-initially-hidden');
            }
        });

        if (loadedGalleryItems.length <= initiallyVisibleItems) {
            viewMoreGalleryButton.style.display = 'none'; // Hide button if not enough items
        } else {
            viewMoreGalleryButton.style.display = 'inline-block'; // Show the button
            viewMoreGalleryButton.textContent = 'View More';
        }
    }
    
    if (viewMoreGalleryButton) {
        viewMoreGalleryButton.addEventListener('click', () => {
            const currentlyShowingAll = viewMoreGalleryButton.textContent === 'View Less';

            if (currentlyShowingAll) {
                // Hide the extra items again
                loadedGalleryItems.forEach((item, index) => {
                    if (index >= initiallyVisibleItems) {
                        item.style.display = 'none';
                    }
                });
                viewMoreGalleryButton.textContent = 'View More';
            } else {
                // Show all hidden items
                loadedGalleryItems.forEach(item => {
                    if (item.getAttribute('data-initially-hidden') === 'true') {
                        item.style.display = 'block'; // Or your default display for grid items
                    }
                });
                viewMoreGalleryButton.textContent = 'View Less';
            }
        });
    }

    // ===== Image Modal Functionality (Adapted for Dynamic Gallery) =====
    function openModal(src) {
        if (imageModal && modalImage) {
            modalImage.src = src;
            // Update alt text based on the image being opened
            const photoNumberMatch = src.match(/photo_(\d+)\.jpeg$/);
            if (photoNumberMatch && photoNumberMatch[1]) {
                modalImage.alt = `Full Size Image of Ricky's Work - Project ${photoNumberMatch[1]}`;
            } else {
                modalImage.alt = "Full Size Image of Ricky's Work";
            }
            imageModal.classList.add('active');
        }
    }

    function closeModal() {
        if (imageModal) {
            imageModal.classList.remove('active');
        }
    }

    if (modalCloseButton) {
        modalCloseButton.addEventListener('click', closeModal);
    }

    if (imageModal) {
        imageModal.addEventListener('click', (e) => {
            if (e.target === imageModal) {
                closeModal();
            }
        });
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && imageModal && imageModal.classList.contains('active')) {
            closeModal();
        }
    });

    // Initialize dynamic gallery loading
    if (galleryGrid) {
        loadGalleryImages();
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