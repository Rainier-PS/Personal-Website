// Projects Page Logic

document.addEventListener('DOMContentLoaded', () => {
    const toggleBtn = document.getElementById('theme-toggle');
    const root = document.documentElement;
    const updateIcon = () => {
        const isDark = root.classList.contains('dark');
        toggleBtn.innerHTML = isDark ? '<i data-lucide="sun"></i>' : '<i data-lucide="moon"></i>';
        if (window.lucide) lucide.createIcons();
    };

    const savedTheme = localStorage.getItem('theme');
    const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (savedTheme === 'dark' || (!savedTheme && systemDark)) {
        root.classList.add('dark');
    }
    updateIcon();

    toggleBtn?.addEventListener('click', () => {
        root.classList.toggle('dark');
        localStorage.setItem('theme', root.classList.contains('dark') ? 'dark' : 'light');
        updateIcon();
    });

    const menuToggle = document.getElementById('menu-toggle');
    const navLinks = document.getElementById('nav-links');
    menuToggle?.addEventListener('click', () => {
        navLinks.classList.toggle('show');
        menuToggle.classList.toggle('open');
        menuToggle.setAttribute('aria-expanded', navLinks.classList.contains('show'));
    });

    loadProjects();
});

async function loadProjects() {
    console.log('loadProjects called');
    const grid = document.getElementById('projects-grid');
    if (!grid) {
        console.error('projects-grid element not found!');
        return;
    }

    try {
        let res;
        try {
            res = await fetch('data/projects.json');
            if (!res.ok) throw new Error('Local fetch failed');
        } catch (e) {
            console.warn('Local fetch failed, trying remote...', e);
            res = await fetch('https://raw.githubusercontent.com/Rainier-PS/Personal-Website/main/data/projects.json');
        }

        if (!res.ok) throw new Error('Failed to load projects');
        const projects = await res.json();

        grid.innerHTML = '';

        projects.forEach(project => {
            const card = document.createElement('div');
            card.className = 'card project-card';

            card.innerHTML = `
                ${project.image ? `<img src="${project.image}" alt="${project.title}" loading="lazy" style="cursor: zoom-in">` : ''}
                <h3>${project.title}</h3>
                <p>${project.description}</p>
                
                ${project.labels ? `
                <div class="labels">
                    ${project.labels.map(l => `<span class="label">${l}</span>`).join('')}
                </div>` : ''}

                <div class="buttons">
                    ${project.demo ? `<a href="${project.demo}" class="btn" target="_blank" rel="noopener"><i data-lucide="external-link"></i> Demo</a>` : ''}
                    ${project.github ? `<a href="${project.github}" class="btn" target="_blank" rel="noopener"><i data-lucide="github"></i> GitHub</a>` : ''}
                </div>
            `;
            grid.appendChild(card);
        });

        if (window.lucide) lucide.createIcons();
        initLightbox();

    } catch (err) {
        console.error('Project loading error:', err);
        alert('Sorry for the inconvenience. The coder is still trying his best to fix it. :)');
        grid.innerHTML = '<h1 style="grid-column: 1/-1; text-align: center; padding: 2rem;">Sorry for the inconvenience. The coder is still trying his best to fix it. :)</h1>';
    }
}

function initLightbox() {
    const lightbox = document.getElementById('imageLightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    const closeBtn = document.getElementById('closeLightbox');
    const openBtn = document.getElementById('openInNewTab');

    if (!lightbox || !lightboxImg) return;

    document.querySelectorAll('.project-card img').forEach(img => {
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

    closeBtn?.addEventListener('click', close);
    lightbox.addEventListener('click', e => {
        if (e.target === lightbox) close();
    });

    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') close();
    });

    openBtn?.addEventListener('click', () => {
        if (lightboxImg.src) window.open(lightboxImg.src, '_blank');
    });
}
