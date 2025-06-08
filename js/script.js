/**
 * Mobile Menu Handler
 */
class MobileMenu {
    constructor() {
        this.toggle = document.querySelector('.mobile-menu-toggle');
        this.nav = document.querySelector('header nav');
        this.header = document.querySelector('header');
        this.isOpen = false;
        
        this.init();
    }
    
    init() {
        if (!this.toggle || !this.nav) return;
        
        this.toggle.addEventListener('click', () => this.toggleMenu());
        document.addEventListener('click', (e) => this.handleOutsideClick(e));
    }
    
    toggleMenu() {
        this.isOpen = !this.isOpen;
        this.nav.classList.toggle('active', this.isOpen);
        this.toggle.textContent = this.isOpen ? '✕' : '☰';
        this.header.classList.toggle('header-solid-bg', this.isOpen);
        document.body.style.overflow = this.isOpen ? 'hidden' : '';
    }
    
    closeMenu() {
        if (!this.isOpen) return;
        this.isOpen = false;
        this.nav.classList.remove('active');
        this.toggle.textContent = '☰';
        this.header.classList.remove('header-solid-bg');
        document.body.style.overflow = '';
    }
    
    handleOutsideClick(e) {
        if (this.isOpen && 
            !this.nav.contains(e.target) && 
            !this.toggle.contains(e.target)) {
            this.closeMenu();
        }
    }
}

/**
 * Navigation and Smooth Scrolling Handler
 */
class Navigation {
    constructor(mobileMenu) {
        this.mobileMenu = mobileMenu;
        this.links = document.querySelectorAll('nav ul li a:not(.btn), .mobile-nav-menu ul li a:not(.btn)');
        this.sections = document.querySelectorAll('section[id]');
        this.header = document.querySelector('header');
        this.isScrolling = false; // Flag to prevent scroll interference
        
        this.init();
    }
    
    init() {
        this.links.forEach(link => {
            link.addEventListener('click', (e) => this.handleLinkClick(e, link));
        });
        
        // Throttle scroll events to improve performance and prevent conflicts
        let scrollTimeout;
        window.addEventListener('scroll', () => {
            // Don't update during programmatic scrolling
            if (this.isScrolling) return;
            
            if (scrollTimeout) {
                clearTimeout(scrollTimeout);
            }
            scrollTimeout = setTimeout(() => this.updateActiveLink(), 50);
        });
        
        this.updateActiveLink(); // Initial call
    }
    
    handleLinkClick(e, link) {
        if (!link.hash) return;
        
        e.preventDefault();
        const target = document.querySelector(link.hash);
        if (!target) return;
        
        // Immediately update the active link
        this.setActiveLink(link.hash.substring(1));
        
        // Disable scroll updates during smooth scrolling
        this.isScrolling = true;
        
        const headerHeight = this.header.offsetHeight;
        const targetPosition = target.offsetTop - headerHeight;
        
        window.scrollTo({
            top: targetPosition,
            behavior: "smooth"
        });
        
        // Re-enable scroll updates after smooth scroll completes
        setTimeout(() => {
            this.isScrolling = false;
        }, 1000); // Give enough time for smooth scroll to complete
        
        this.mobileMenu.closeMenu();
    }
    
    setActiveLink(sectionId) {
        this.links.forEach(link => {
            const isActive = link.getAttribute('href') === `#${sectionId}`;
            link.classList.toggle('active', isActive);
        });
    }
    
    updateActiveLink() {
        let currentSectionId = '';
        let scrollPosition = window.pageYOffset;
        
        // Find which section we're currently in
        this.sections.forEach(section => {
            const sectionTop = section.offsetTop - 150; // Adjusted offset
            const sectionBottom = sectionTop + section.offsetHeight;
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
                currentSectionId = section.getAttribute('id');
            }
        });
        
        // If we're at the very top of the page (before any sections)
        if (scrollPosition < 150) {
            currentSectionId = 'home';
        }
        
        // Only update if we have a valid section
        if (currentSectionId) {
            this.setActiveLink(currentSectionId);
        }
    }
}

/**
 * Theme Toggle Handler
 */
class ThemeToggler {
    constructor() {
        this.toggle = document.getElementById('theme-toggle');
        this.init();
    }
    
    init() {
        if (!this.toggle) return;
        
        this.toggle.addEventListener('change', () => {
            const theme = this.toggle.checked ? 'dark' : 'light';
            this.setTheme(theme);
        });
        
        // Load saved theme or default to system preference
        const savedTheme = localStorage.getItem('theme') || 
            (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
        this.setTheme(savedTheme);
    }
    
    setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        if (this.toggle) this.toggle.checked = theme === 'dark';
    }
}

/**
 * Service Card Animation Handler
 */
class ServiceCardAnimations {
    constructor() {
        this.cards = document.querySelectorAll('.service-card');
        this.jumpClasses = ['icon-jump-up', 'icon-jump-left', 'icon-jump-right'];
        this.init();
    }
    
    init() {
        if (!this.cards.length) return;
        
        this.cards.forEach(card => {
            let touchMoved = false;
            
            card.addEventListener('touchstart', () => {
                touchMoved = false;
            });
            
            card.addEventListener('touchmove', () => {
                touchMoved = true;
            });
            
            card.addEventListener('touchend', () => {
                if (!touchMoved) {
                    this.animateIcon(card);
                }
            });
            
            card.addEventListener('click', () => {
                this.animateIcon(card);
            });
        });
    }
    
    animateIcon(card) {
        const icon = card.querySelector('.service-icon i');
        if (!icon) return;
        
        // Remove any existing animation classes
        this.jumpClasses.forEach(cls => icon.classList.remove(cls));
        
        // Randomly select a jump animation
        const randomClass = this.jumpClasses[Math.floor(Math.random() * this.jumpClasses.length)];
        icon.classList.add(randomClass);
        
        // Remove the class after animation duration
        setTimeout(() => {
            icon.classList.remove(randomClass);
        }, 800);
    }
}

/**
 * Fade-in Animation Observer
 */
class AnimationObserver {
    constructor() {
        this.elements = document.querySelectorAll('.fade-in');
        this.observer = null;
        this.init();
    }
    
    init() {
        if (!this.elements.length) return;
        
        const options = {
            root: null,
            rootMargin: '0px',
            threshold: 0.1
        };
        
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate');
                    this.observer.unobserve(entry.target);
                }
            });
        }, options);
        
        this.elements.forEach(el => this.observer.observe(el));
    }
}

/**
 * Image Modal Handler
 */
class ImageModal {
    constructor() {
        this.modal = document.getElementById('imageModal');
        this.image = document.getElementById('modalImage');
        this.closeBtn = document.getElementById('modalCloseButton');
        
        this.init();
    }
    
    init() {
        if (!this.modal) return;
        
        this.closeBtn?.addEventListener('click', () => this.close());
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) this.close();
        });
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen()) this.close();
        });
    }
    
    open(src) {
        if (!this.modal || !this.image) return;
        
        this.image.src = src;
        this.image.alt = this.generateAltText(src);
        this.modal.classList.add('active');
        this.modal.setAttribute('aria-hidden', 'false');
    }
    
    close() {
        this.modal?.classList.remove('active');
        this.modal?.setAttribute('aria-hidden', 'true');
    }
    
    isOpen() {
        return this.modal?.classList.contains('active') || false;
    }
    
    generateAltText(src) {
        const match = src.match(/photo_(\d+)\.jpeg$/);
        return match ? `Full Size Image of Ricky's Work - Project ${match[1]}` : "Full Size Image of Ricky's Work";
    }
}

/**
 * Photo Gallery Handler
 */
class PhotoGallery {
    constructor(imageModal) {
        this.imageModal = imageModal;
        this.grid = document.querySelector('.gallery-grid');
        this.viewMoreBtn = document.getElementById('viewMoreGallery');
        
        this.config = {
            basePath: './photos/',
            prefix: 'photo_',
            extension: '.jpeg',
            maxToCheck: 50,
            initialVisible: 8,
            maxConsecutiveMisses: 3
        };
        
        this.items = [];
        this.isExpanded = false;
        this.init();
    }
    
    async init() {
        if (!this.grid) return;
        await this.loadImages();
        this.setupControls();
    }
    
    async loadImages() {
        this.grid.innerHTML = '';
        this.items = [];
        let consecutiveMisses = 0;
        
        for (let i = 1; i <= this.config.maxToCheck; i++) {
            const url = `${this.config.basePath}${this.config.prefix}${i}${this.config.extension}`;
            
            if (await this.imageExists(url)) {
                consecutiveMisses = 0;
                const item = this.createGalleryItem(url, i);
                this.grid.appendChild(item);
                this.items.push(item);
            } else {
                consecutiveMisses++;
                if (consecutiveMisses >= this.config.maxConsecutiveMisses) break;
            }
        }
        
        this.refreshGridAnimation();
    }
    
    createGalleryItem(url, index) {
        const item = document.createElement('div');
        item.classList.add('gallery-item');
        
        const img = document.createElement('img');
        img.src = url;
        img.alt = `Handyman project example ${index}`;
        img.style.cursor = 'pointer';
        
        // Add loading state management
        img.addEventListener('load', () => {
            item.classList.add('loaded');
        });
        
        img.addEventListener('error', () => {
            item.classList.add('loaded'); // Still remove skeleton on error
        });
        
        img.addEventListener('click', () => this.imageModal.open(url));
        
        item.appendChild(img);
        return item;
    }
    
    setupControls() {
        if (!this.viewMoreBtn || this.items.length === 0) {
            this.hideViewMoreButton();
            return;
        }
        
        // Mark items as initially hidden but keep them visible for loading
        this.items.forEach((item, index) => {
            if (index >= this.config.initialVisible) {
                item.classList.add('gallery-item-hidden');
            }
        });
        
        // Update grid to show only initial items
        this.updateGridDisplay();
        
        if (this.items.length <= this.config.initialVisible) {
            this.hideViewMoreButton();
        } else {
            this.showViewMoreButton();
            this.viewMoreBtn.addEventListener('click', () => this.toggleViewMore());
        }
    }
    
    updateGridDisplay() {
        // Use CSS to control visibility instead of display: none
        this.grid.setAttribute('data-expanded', this.isExpanded.toString());
    }
    
    toggleViewMore() {
        this.isExpanded = !this.isExpanded;
        this.updateGridDisplay();
        
        if (this.isExpanded) {
            this.items.forEach(item => item.classList.remove('gallery-item-hidden'));
        } else {
            this.items.forEach((item, index) => {
                if (index >= this.config.initialVisible) {
                    item.classList.add('gallery-item-hidden');
                }
            });
        }
        
        this.viewMoreBtn.textContent = this.isExpanded ? 'View Less' : 'View More';
    }
    
    hideViewMoreButton() {
        if (this.viewMoreBtn) this.viewMoreBtn.style.display = 'none';
    }
    
    showViewMoreButton() {
        if (this.viewMoreBtn) {
            this.viewMoreBtn.style.display = 'inline-block';
            this.viewMoreBtn.textContent = 'View More';
        }
    }
    
    refreshGridAnimation() {
        if (this.grid.classList.contains('animate')) {
            this.grid.classList.remove('animate');
            this.grid.style.animationName = 'none';
            void this.grid.offsetWidth; // Trigger reflow
            this.grid.style.animationName = 'fadeInAnimation';
            this.grid.classList.add('animate');
        } else if (!this.grid.classList.contains('fade-in')) {
            this.grid.style.opacity = '1';
        }
    }
    
    async imageExists(url) {
        return new Promise(resolve => {
            const img = new Image();
            img.onload = () => resolve(true);
            img.onerror = () => resolve(false);
            img.src = url;
        });
    }
}

/**
 * Main Application Controller
 */
class App {
    constructor() {
        this.mobileMenu = new MobileMenu();
        this.navigation = new Navigation(this.mobileMenu);
        this.themeToggler = new ThemeToggler();
        this.serviceAnimations = new ServiceCardAnimations();
        this.animationObserver = new AnimationObserver();
        this.imageModal = new ImageModal();
        this.photoGallery = new PhotoGallery(this.imageModal);
    }
}

// Initialize the application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new App();
});