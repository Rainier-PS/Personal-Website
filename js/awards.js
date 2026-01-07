// Awards Page Logic
document.addEventListener('DOMContentLoaded', () => {
    // Theme Toggle Logic
    const toggleBtn = document.getElementById('theme-toggle');
    const root = document.documentElement;
    const updateIcon = () => {
        const isDark = root.classList.contains('dark');
        if (toggleBtn) toggleBtn.innerHTML = isDark ? '<i data-lucide="sun"></i>' : '<i data-lucide="moon"></i>';
        if (window.lucide) lucide.createIcons();
    };

    const savedTheme = localStorage.getItem('theme');
    const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (savedTheme === 'dark' || (!savedTheme && systemDark)) {
        root.classList.add('dark');
    }
    updateIcon();

    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            root.classList.toggle('dark');
            localStorage.setItem('theme', root.classList.contains('dark') ? 'dark' : 'light');
            updateIcon();
        });
    }

    // Mobile Menu Logic
    const menuToggle = document.getElementById('menu-toggle');
    const navLinks = document.getElementById('nav-links');
    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('show');
            menuToggle.classList.toggle('open');
            menuToggle.setAttribute('aria-expanded', navLinks.classList.contains('show'));
        });
    }

    // Intersection Observer for Fade-in Animations
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("visible");
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('section').forEach(sec => observer.observe(sec));

    loadAwards();
});

async function loadAwards() {
    const grid = document.getElementById('awards-grid');
    if (!grid) return;

    try {
        let res;
        try {
            res = await fetch('data/awards.json');
            if (!res.ok) throw new Error('Local fetch failed');
        } catch (e) {
            console.warn('Local fetch failed, trying remote...', e);
            res = await fetch('https://raw.githubusercontent.com/Rainier-PS/Personal-Website/main/data/awards.json');
        }

        if (!res.ok) throw new Error('Failed to load awards');
        const awards = await res.json();

        grid.innerHTML = '';

        awards.forEach(award => {
            const card = document.createElement('div');
            card.className = `card award-card ${!award.image ? 'no-image' : ''}`;

            card.innerHTML = `
                ${award.image ? `<img src="${award.image}" alt="${award.title}" loading="lazy">` : ''}
                <h3>${award.title}</h3>
                <p>${award.description || ''}</p>
            `;
            grid.appendChild(card);
        });

        if (window.lucide) lucide.createIcons();
        initLightbox();

    } catch (err) {
        console.error('Award loading error:', err);
        grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--subtext);">Unable to load awards at this time.</p>';
    }
}

function initLightbox() {
    const lightbox = document.getElementById('imageLightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    const closeBtn = document.getElementById('closeLightbox');
    const openBtn = document.getElementById('openInNewTab');

    if (!lightbox || !lightboxImg) return;

    document.querySelectorAll('.award-card img').forEach(img => {
        img.addEventListener('click', () => {
            lightboxImg.src = img.src;
            lightbox.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    });

    const close = () => {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
    };

    if (closeBtn) closeBtn.addEventListener('click', close);
    lightbox.addEventListener('click', e => {
        if (e.target === lightbox) close();
    });

    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') close();
    });

    if (openBtn) {
        openBtn.addEventListener('click', () => {
            if (lightboxImg.src) window.open(lightboxImg.src, '_blank');
        });
    }
}
