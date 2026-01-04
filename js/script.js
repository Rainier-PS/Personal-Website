document.addEventListener("DOMContentLoaded", async () => {
  if (window.lucide) lucide.createIcons();

  document.querySelectorAll('link[rel="preload"][as="style"]').forEach(link => {
    function enableStylesheet() {
      try { link.rel = 'stylesheet'; } catch (e) { }
    }
    link.addEventListener('load', enableStylesheet);
    if (link.sheet) enableStylesheet();
  });

  const [projects, awardsData] = await Promise.all([
    loadProjectsFromJSON(),
    loadAwardsFromJSON()
  ]);

  DATA.projects = projects;

  const rawAwards = Array.isArray(awardsData)
    ? awardsData
    : (awardsData.awards || awardsData.data || []);

  DATA.awards = rawAwards.map(item => ({
    title: item.title || item.award || item.name || item.eventName || "Untitled Award",
    description: item.description || item.desc || item.details || item.date || "",
    image: item.image || item.logo || null,
    ...item
  }));

  console.log('Loaded projects:', DATA.projects);
  console.log('Loaded awards:', DATA.awards);

  DATA.projects.forEach(p => {
    projectData[p.slug] = {
      title: p.title,
      desc: p.description,
      links: [p.demo, p.github].filter(Boolean).join(' | ')
    };
  });

  const getPerPage = () => window.innerWidth <= 600 ? 1 : window.innerWidth <= 900 ? 2 : 3;

  renderCarousel({
    containerId: 'projects-grid',
    items: DATA.projects,
    perPage: getPerPage()
  });

  renderCarousel({
    containerId: 'awards-grid',
    items: DATA.awards,
    perPage: getPerPage()
  });

  initCarousels();
  bindLightboxImages();

  window.addEventListener('resize', () => {
    renderCarousel({
      containerId: 'projects-grid',
      items: DATA.projects,
      perPage: getPerPage()
    });
    renderCarousel({
      containerId: 'awards-grid',
      items: DATA.awards,
      perPage: getPerPage()
    });

    initCarousels();
    bindLightboxImages();
  });
});

const DATA = {
  projects: [],
  awards: []
};

async function loadProjectsFromJSON() {
  try {
    const res = await fetch(
      'https://raw.githubusercontent.com/Rainier-PS/Personal-Website/main/data/projects.json'
    );
    if (!res.ok) throw new Error('Failed to load projects.json');
    return await res.json();
  } catch (err) {
    console.error('Failed to load projects.json:', err);
    return [];
  }
}

async function loadAwardsFromJSON() {
  try {
    const res = await fetch(
      'https://raw.githubusercontent.com/Rainier-PS/Personal-Website/main/data/awards.json'
    );
    if (!res.ok) throw new Error('Failed to load awards.json');
    return await res.json();
  } catch (err) {
    console.error('Failed to load awards.json:', err);
    return [];
  }
}

const sections = document.querySelectorAll("section");
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add("visible"); });
}, { threshold: 0.1 });
sections.forEach(sec => observer.observe(sec));

const header = document.getElementById("header");

if (header) {
  let scrollTimeout;
  window.addEventListener("scroll", () => {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      header.style.boxShadow = window.scrollY > 50
        ? "0 4px 12px rgba(0,0,0,0.2)"
        : "0 2px 5px rgba(0,0,0,0.1)";
    }, 50);
  });
}

const tagline = document.getElementById("tagline");
let text = "High School Student • Aspiring Engineer • Tech Enthusiast";
function getTaglineText() {
  return window.innerWidth <= 600 ? text.replace(/ • /g, "\n") : text;
}

function startTypewriter() {
  tagline.textContent = '';
  let i = 0;
  const finalText = getTaglineText();
  tagline.style.whiteSpace = window.innerWidth <= 600 ? 'pre-wrap' : 'normal';

  function typeWriterRAF() {
    if (i < finalText.length) {
      tagline.textContent += finalText.charAt(i++);
      requestAnimationFrame(typeWriterRAF);
    } else {
      tagline.style.borderRight = "none";
    }
  }

  requestAnimationFrame(typeWriterRAF);
}

startTypewriter();

let typewriterTimeout;
window.addEventListener('resize', () => {
  clearTimeout(typewriterTimeout);
  typewriterTimeout = setTimeout(startTypewriter, 200);
});

const themeToggle = document.getElementById("theme-toggle");
const html = document.documentElement;
function setTheme(mode) {
  html.classList.toggle("dark", mode === "dark");

  if (!themeToggle) return;

  themeToggle.textContent = '';
  const icon = document.createElement('i');
  icon.setAttribute('data-lucide', mode === 'dark' ? 'sun' : 'moon');
  themeToggle.appendChild(icon);

  if (window.lucide) lucide.createIcons();
  localStorage.setItem("theme", mode);
}

const savedTheme = localStorage.getItem("theme");
if (savedTheme) setTheme(savedTheme); else setTheme(window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
themeToggle?.addEventListener("click", () => { setTheme(html.classList.contains("dark") ? "light" : "dark"); });

function initCarousels() {
  document.querySelectorAll("[data-carousel]").forEach(carousel => {
    const track = carousel.querySelector(".carousel-track");
    if (!track) return;

    track.style.transform = `translateX(0%)`;

    const pages = Array.from(track.children);
    const dotsContainer = carousel.querySelector(".carousel-dots");
    if (!dotsContainer) return;

    dotsContainer.innerHTML = '';

    pages.forEach((_, idx) => {
      const dot = document.createElement("button");
      dot.setAttribute("aria-label", `Go to slide ${idx + 1}`);
      if (idx === 0) dot.classList.add("active");

      dot.addEventListener("click", () => {
        track.style.transform = `translateX(-${idx * 100}%)`;
        dotsContainer.querySelectorAll("button").forEach(b => b.classList.remove("active"));
        dot.classList.add("active");
      });

      dotsContainer.appendChild(dot);
    });
  });
}

const menuToggle = document.getElementById("menu-toggle");
const navLinks = document.getElementById("nav-links");
menuToggle?.addEventListener("click", () => {
  navLinks.classList.toggle("show");
  menuToggle.classList.toggle("open");
  const expanded = menuToggle.getAttribute("aria-expanded") === "true";
  menuToggle.setAttribute("aria-expanded", String(!expanded));
});

const logos = document.querySelectorAll('.brand img.logo');

const emailUser = "rainierps8";
const emailDomain = "gmail.com";
const emailLink = document.getElementById('email-link');
if (emailLink) emailLink.href = `mailto:${emailUser}@${emailDomain}`;
const terminal = document.getElementById('terminal');
const output = document.getElementById('terminal-output');
const input = document.getElementById('terminal-input');
const backBtn = document.getElementById('terminal-back');
const helpBtn = document.getElementById('terminal-help');


const prompt = 'guest@portfolio:~$ ';
let history = [];
let historyIndex = -1;
let loginTime = new Date();

function autoScroll() {
  terminal.scrollTop = terminal.scrollHeight;
}

function typeLine(line, delay = 20, callback) {
  let i = 0;
  const interval = setInterval(() => {
    output.textContent += line.charAt(i);
    i++;
    autoScroll();
    if (i === line.length) {
      clearInterval(interval);
      output.textContent += '\n';
      autoScroll();
      if (callback) callback();
    }
  }, delay);
}

// NOTE: typeHTML renders internal, trusted HTML only.
// Do NOT pass user-generated content into this function.
function typeHTML(html, delay = 10, callback) {
  const temp = document.createElement("div");
  temp.innerHTML = html.trim();
  const lines = [];

  temp.querySelectorAll(":scope > *").forEach(el => {
    lines.push(el.outerHTML);
  });

  let i = 0;
  function typeNext() {
    if (i < lines.length) {
      let line = lines[i];
      let j = 0;
      const div = document.createElement("div");
      output.appendChild(div);

      function typeChar() {
        if (j < line.length) {
          div.innerHTML = line.slice(0, j + 1);
          j++;
          autoScroll();
          setTimeout(typeChar, delay * 0.75);
        } else {
          i++;
          setTimeout(typeNext, delay * 2);
        }
      }

      typeChar();
    } else if (callback) {
      callback();
    }
  }

  typeNext();
}

function bootSequence() {
  const lines = [
    '[  OK  ] Initializing system modules...',
    '[  OK  ] Checking environment...',
    '[  OK  ] Network services started.',
    '[  OK  ] User session created.',
    '--- Terminal Ready ---',
    'Type "help" to get started.'
  ];
  output.textContent = '';
  lines.forEach((line, i) => {
    setTimeout(() => typeLine(line, 10), i * 500);
  });
  setTimeout(() => { loginTime = new Date(); input.focus(); autoScroll(); }, lines.length * 500 + 500);
}

function collectProjectsFromDOM() {
  return Array.from(document.querySelectorAll('#projects .card')).map(card => {
    const title = card.querySelector('h3')?.textContent.trim() || '';
    const desc = card.querySelector('p')?.textContent.trim() || '';
    const buttons = card.querySelectorAll('.buttons a');

    return {
      slug: title.toLowerCase().replace(/\s+/g, '-'),
      title,
      description: desc,
      demo: buttons[0]?.href || '',
      github: buttons[1]?.href || ''
    };
  });
}

function renderCarousel({ containerId, items, perPage }) {
  const track = document.getElementById(containerId);
  if (!track) {
    return;
  }

  track.innerHTML = '';

  if (!items || items.length === 0) {
    return;
  }

  for (let i = 0; i < items.length; i += perPage) {
    const page = document.createElement('div');
    page.className = 'cards';

    items.slice(i, i + perPage).forEach(item => {
      const card = document.createElement('div');
      card.className = `card ${item.empty ? 'empty' : ''}`;

      if (item.empty) {
        card.textContent = item.title;
        page.appendChild(card);
        return;
      }

      card.innerHTML = `
          ${item.image ? `<img src="${item.image}" alt="${item.title}" loading="lazy" decoding="async">` : ''}
          <h3>${item.title}</h3>
          <p>${item.description}</p>

          ${item.labels?.length ? `
            <div class="labels">
              ${item.labels.map(l => `<span class="label">${l}</span>`).join('')}
            </div>
          ` : ''}

          ${item.demo || item.github ? `
            <div class="buttons">
              ${item.demo ? `<a href="${item.demo}" class="btn" target="_blank" rel="noopener"><i data-lucide="external-link"></i> Demo</a>` : ''}
              ${item.github ? `<a href="${item.github}" class="btn" target="_blank" rel="noopener"><i data-lucide="github"></i> GitHub</a>` : ''}
            </div>
          ` : ''}
        `;

      page.appendChild(card);
    });

    track.appendChild(page);
  }

  if (window.lucide) lucide.createIcons();
}

const projectData = {};

function helpFunction() {
  const container = document.createElement("div");
  container.classList.add("help-table");

  const header = document.createElement("div");
  header.classList.add("help-row", "help-header");
  header.innerHTML = `<div class="help-command">Command</div><div class="help-desc">Description</div>`;
  container.appendChild(header);

  const cmdList = [
    ["help", "Show all available commands"],
    ["about", "Display information about me"],
    ["ls", "List sections or projects"],
    ["cat", "Display section or project content"],
    ["echo", "Display a line of text"],
    ["date", "Show the current date and time"],
    ["who", "Show who is logged in"],
    ["whoami", "Display the current user"],
    ["clear", "Clear the terminal screen"],
    ["history", "Show previously entered commands"],
    ["exit", "Close the terminal session"]
  ];

  cmdList.forEach(([cmd, desc]) => {
    const row = document.createElement("div");
    row.classList.add("help-row");
    row.innerHTML = `
        <div class="help-command"><span class="neon">${cmd}</span></div>
        <div class="help-desc">${desc}</div>
      `;
    container.appendChild(row);
  });

  typeHTML(container.outerHTML, 10);
  autoScroll();
}

function contactTable() {
  const container = document.createElement("div");
  container.classList.add("help-table", "contact-table");

  const title = document.createElement("div");
  title.textContent = "You can reach me at:";
  title.style.marginBottom = "8px";
  container.appendChild(title);

  const header = document.createElement("div");
  header.classList.add("help-row", "help-header");
  header.innerHTML = `<div class="help-command">Platform</div><div class="help-desc">Username / Address</div>`;
  container.appendChild(header);

  const contacts = Array.from(document.querySelectorAll('#contact .contact-links a')).map(a => ({
    platform: a.textContent.trim(),
    link: a.href
  }));

  contacts.forEach(({ platform, link }) => {
    const row = document.createElement("div");
    row.classList.add("help-row");
    const shortLink = link.replace(/^https?:\/\//, '').replace(/^mailto:/, '');
    row.innerHTML = `
        <div class="help-command">${platform}</div>
        <div class="help-desc"><a href="${link}" target="_blank" rel="noopener" class="cli-link">${shortLink}</a></div>
      `;
    container.appendChild(row);
  });

  typeHTML(container.outerHTML, 10);
  autoScroll();
}

const commands = {
  help: () => { helpFunction(); return ''; },

  about: 'Hi! I\'m Rainier, a high school student passionate about technology and engineering.',

  echo: (args) => args.join(' '),

  date: () => {
    const now = new Date();
    const options = {
      weekday: 'short',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      year: 'numeric',
      hour12: false,
    };
    const formatted = new Intl.DateTimeFormat('en-US', options)
      .format(now)
      .replace(',', '');
    const offset = -now.getTimezoneOffset();
    const sign = offset >= 0 ? '+' : '-';
    const hours = String(Math.floor(Math.abs(offset) / 60)).padStart(2, '0');
    const minutes = String(Math.abs(offset) % 60).padStart(2, '0');
    return `${formatted} UTC${sign}${hours}${minutes}`;
  },

  who: () => {
    const date = loginTime.toISOString().split('T')[0];
    const time = loginTime.toTimeString().split(' ')[0].slice(0, 5);
    return `guest pts/1        ${date} ${time}`;
  },

  whoami: () => {
    return 'guest';
  },

  ls: (args) => {
    const structure = {
      '/': ['about', 'experience', 'education', 'skills', 'projects', 'awards', 'contact'],
      'projects': Object.keys(projectData)
    };

    const experienceItems = document.querySelectorAll('#experience ul li');
    const educationItems = document.querySelectorAll('#education p');
    const skillCards = document.querySelectorAll('#skills .card h3');

    const sections = {
      experience: Array.from(experienceItems).map(li => li.textContent.trim()),
      education: Array.from(educationItems).map(p => p.textContent.trim()),
      skills: Array.from(skillCards).map(h3 => h3.textContent.trim()),
      awards: DATA.awards.map(card => ({
        title: card.title || '',
        desc: card.description || ''
      }))
    };

    if (!args[0]) return structure['/'].join('\n');
    if (args[0] === 'projects') return structure['projects'].join('\n');
    if (args[0] === 'contact') { contactTable(); return ''; }
    if (args[0] === 'awards') {
      const htmlMode = args[1] === '-html';
      if (htmlMode) {
        const container = document.createElement("div");
        container.classList.add("help-table", "awards-table");

        const header = document.createElement("div");
        header.classList.add("help-row", "help-header");
        header.innerHTML = `<div class="help-command">Award</div><div class="help-desc">Description</div>`;
        container.appendChild(header);

        DATA.awards.forEach(a => {
          const row = document.createElement("div");
          row.classList.add("help-row");
          row.innerHTML = `
              <div class="help-command">${a.title}</div>
              <div class="help-desc">${a.description}</div>
            `;
          container.appendChild(row);
        });

        typeHTML(container.outerHTML, 10);
        autoScroll();
        return '';
      } else {
        return DATA.awards.map(a => a.title || '(untitled)').join('\n');
      }
    }


    if (sections[args[0]]) return sections[args[0]].map(s => typeof s === 'string' ? s : s.title).join('\n');

    return `ls: cannot access '${args[0]}': No such directory`;
  },

  cat: (args) => {
    if (!args[0]) return 'cat: missing file operand';
    const key = args[0].replace(/^projects\//, '');

    if (projectData[key]) {
      const { title, desc, links } = projectData[key];
      return `${title}\n${desc}\nLinks: ${links}`;
    }

    const sections = {
      about: document.querySelector('#about p')?.textContent.trim(),
      experience: Array.from(document.querySelectorAll('#experience ul li')).map(li => `- ${li.textContent.trim()}`).join('\n'),
      education: Array.from(document.querySelectorAll('#education p')).map(p => `- ${p.textContent.trim()}`).join('\n'),
      skills: Array.from(document.querySelectorAll('#skills .card')).map(card => {
        const title = card.querySelector('h3')?.textContent.trim() || '';
        const desc = card.querySelector('p')?.textContent.trim() || '';
        return `${title}: ${desc}`;
      }).join('\n\n'),
      awards: DATA.awards.map(card => {
        const title = card.title || '';
        const desc = card.description || '';
        return `${title} — ${desc}`;
      }).join('\n')
    };

    if (sections[args[0]]) return sections[args[0]] || '(empty)';
    return `cat: ${args[0]}: No such file or directory`;
  },

  clear: () => { output.textContent = ''; autoScroll(); return ''; },

  history: () => {
    if (history.length === 0) return 'No commands in history.';
    return history.map((cmd, i) => `${i + 1}  ${cmd}`).join('\n');
  },

  exit: () => { terminal.style.display = 'none'; return 'Session terminated.'; }
};

input.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    const raw = input.value.trim();
    if (!raw) return;

    output.textContent += `\n${prompt}${raw}\n`;
    history.push(raw);
    historyIndex = history.length;
    autoScroll();

    const parts = raw.split(' ');
    const cmd = parts[0];
    const args = parts.slice(1);

    if (commands[cmd]) {
      const result = typeof commands[cmd] === 'function' ? commands[cmd](args) : commands[cmd];
      if (result !== undefined && result !== '') typeLine(result);
    } else {
      typeLine(`bash: ${cmd}: command not found`);
    }

    input.value = '';
    autoScroll();
  }

  if (e.key === 'ArrowUp') {
    if (historyIndex > 0) {
      historyIndex--;
      input.value = history[historyIndex];
    }
  }
  if (e.key === 'ArrowDown') {
    if (historyIndex < history.length - 1) {
      historyIndex++;
      input.value = history[historyIndex];
    } else {
      input.value = '';
    }
  }
});

backBtn?.addEventListener('click', () => terminal.style.display = 'none');
helpBtn?.addEventListener('click', () => helpFunction());

logos.forEach(logo => {
  logo.addEventListener('click', () => {
    terminal.style.display = 'block';
    bootSequence();
    autoScroll();
  });
});

const lightbox = document.getElementById('imageLightbox');
const lightboxImg = document.getElementById('lightboxImg');
const closeBtn = document.getElementById('closeLightbox');
const openBtn = document.getElementById('openInNewTab');

function bindLightboxImages() {
  document.querySelectorAll('#awards .card img, #projects .card img').forEach(img => {
    img.style.cursor = 'zoom-in';
    img.addEventListener('click', () => {
      lightboxImg.src = img.src;
      lightbox.classList.add('active');
      document.body.style.overflow = 'hidden';
    });
  });
}

closeBtn?.addEventListener('click', () => {
  lightbox.classList.remove('active');
  document.body.style.overflow = '';
});

openBtn?.addEventListener('click', () => {
  if (lightboxImg.src) window.open(lightboxImg.src, '_blank', 'noopener');
});

lightbox.addEventListener('click', e => {
  if (e.target === lightbox) {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
  }
});

function closeLightbox() {
  if (!lightbox) return;
  lightbox.classList.remove('active');
  document.body.style.overflow = '';
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' || e.key === 'Esc') {
    if (lightbox && lightbox.classList.contains('active')) closeLightbox();
  }
});

document.getElementById("backToTop")
  ?.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
