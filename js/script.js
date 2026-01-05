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
  if (!tagline) return;
  tagline.textContent = '';
  let i = 0;
  const finalText = getTaglineText();
  tagline.style.whiteSpace = window.innerWidth <= 600 ? 'pre-wrap' : 'normal';

  function typeWriter() {
    if (!tagline) return;
    if (i < finalText.length) {
      const char = finalText.charAt(i++);
      tagline.textContent += char;
      setTimeout(typeWriter, 60); // adjust speed here
    } else {
      tagline.style.borderRight = "none";
    }
  }

  typeWriter();
}

if (tagline) startTypewriter();

let typewriterTimeout;
if (tagline) {
  window.addEventListener('resize', () => {
    clearTimeout(typewriterTimeout);
    typewriterTimeout = setTimeout(startTypewriter, 200);
  });
}

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

function setCarouselSlide(carousel, index) {
  const track = carousel.querySelector(".carousel-track");
  const dots = carousel.querySelectorAll(".carousel-dots button");
  const max = dots.length - 1;

  const clamped = Math.max(0, Math.min(index, max));

  track.style.transform = `translateX(-${clamped * 100}%)`;

  dots.forEach(d => d.classList.remove("active"));
  dots[clamped]?.classList.add("active");

  carousel.dataset.activeIndex = clamped;
}

function initCarousels() {
  document.querySelectorAll("[data-carousel]").forEach(carousel => {
    const track = carousel.querySelector(".carousel-track");
    if (!track) return;

    const pages = Array.from(track.children);
    const dotsContainer = carousel.querySelector(".carousel-dots");
    if (!dotsContainer) return;

    dotsContainer.innerHTML = '';
    carousel.dataset.activeIndex = 0;

    pages.forEach((_, idx) => {
      const dot = document.createElement("button");
      dot.setAttribute("aria-label", `Go to slide ${idx + 1}`);
      if (idx === 0) dot.classList.add("active");

      dot.addEventListener("click", () => {
        setCarouselSlide(carousel, idx);
      });

      dotsContainer.appendChild(dot);
    });

    addSwipeSupport(carousel); // SAFE now
  });
}

function addSwipeSupport(carousel) {
  if (carousel.dataset.swipeBound === "true") return;
  carousel.dataset.swipeBound = "true";

  const track = carousel.querySelector(".carousel-track");
  if (!track) return;

  let startX = 0;
  let active = false;
  let handled = false;

  const threshold = 45;

  const getIndex = () => Number(carousel.dataset.activeIndex || 0);

  const start = x => {
    startX = x;
    active = true;
    handled = false;
  };

  const move = x => {
    if (!active || handled) return;

    const diff = x - startX;
    if (Math.abs(diff) > threshold) {
      const index = getIndex();
      setCarouselSlide(carousel, diff < 0 ? index + 1 : index - 1);
      handled = true;
    }
  };

  const end = () => {
    active = false;
    handled = false;
  };

  track.addEventListener("touchstart", e => start(e.touches[0].clientX), { passive: true });
  track.addEventListener("touchmove", e => move(e.touches[0].clientX), { passive: true });
  track.addEventListener("touchend", end);

  track.addEventListener("mousedown", e => start(e.clientX));
  window.addEventListener("mousemove", e => move(e.clientX));
  window.addEventListener("mouseup", end);
}

const menuToggle = document.getElementById("menu-toggle");
const navLinks = document.getElementById("nav-links");
menuToggle?.addEventListener("click", () => {
  navLinks.classList.toggle("show");
  menuToggle.classList.toggle("open");
  const expanded = menuToggle.getAttribute("aria-expanded") === "true";
  menuToggle.setAttribute("aria-expanded", String(!expanded));
});

document.addEventListener('click', (e) => {
  if (navLinks.classList.contains('show') &&
    !navLinks.contains(e.target) &&
    !menuToggle.contains(e.target)) {
    closeMenu();
  }
});

navLinks?.addEventListener('click', (e) => {
  if (e.target.tagName === 'A' || e.target.closest('a') || e.target.closest('button')) {
    closeMenu();
  }
});

function closeMenu() {
  navLinks.classList.remove('show');
  menuToggle.classList.remove('open');
  menuToggle.setAttribute('aria-expanded', 'false');
}

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
  output.scrollTop = output.scrollHeight;
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

function printBlock(text) {
  const div = document.createElement('div');
  div.textContent = text;
  div.style.whiteSpace = 'pre-wrap';
  div.style.wordBreak = 'break-word';
  output.appendChild(div);
  autoScroll();
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
    ["color", "Change terminal text color (RGB)"],
    ["matrix", "Toggle matrix visual effect"],
    ["exit", "Return to main site"]
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

const STATIC_DATA = {
  about: "I'm a high school student passionate about technology, science, and innovation. I enjoy creating projects that solve real-world problems while constantly exploring new ideas and learning new skills, whether through STEM competitions or personal projects. Feel free to check out my projects below!",
  experience: [
    "- Hack Club Member",
    "- Club Leader Hack Club Binus School Semarang",
    "- Hack the Hat Elective Member (Raspberry Pi & Sense HAT)",
    "- STEM Club Member",
    "- Digital Journalism Elective Member",
    "- RevoU SECC - Coding Camp"
  ],
  education: [
    "- Binus School Semarang — High School (2024–Present)",
    "- Daniel Creative School — Junior High School (2021–2024)",
    "- Daniel Creative School — Elementary (2015–2021)"
  ],
  skills: [
    { title: "Maths & Science", desc: "I have strong knowledge in mathematics and science, which I apply to problem-solving, experiments, research, and technical projects." },
    { title: "3D Printing & PCB Design", desc: "I design and assemble mechanical and electronic projects using Fusion 360 for 3D modeling and KiCad for PCB design, with hands-on experience in soldering and assembling custom electronics." },
    { title: "Programming", desc: "I have experience in programming languages such as Python, JavaScript (ES6+), SQL (basic), and Arduino (C/C++), as well as web technologies including HTML and CSS." },
    { title: "Languages", desc: "English (Fluent), Chinese (Learning), German (Learning), Indonesian (Native)" }
  ],
  contact: [
    { platform: "GitHub", link: "https://github.com/Rainier-PS" },
    { platform: "Email", link: "mailto:rainierps8@gmail.com" },
    { platform: "Instagram", link: "https://instagram.com/rainierps8" },
    { platform: "Instructables", link: "https://www.instructables.com/member/Rainier-PS/" },
    { platform: "LinkedIn", link: "https://www.linkedin.com/in/YOUR_LINKEDIN_USERNAME" },
    { platform: "Semarang, Indonesia", link: "https://www.google.com/maps/place/Semarang,+Indonesia" }
  ]
};

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
      experience: experienceItems.length ? Array.from(experienceItems).map(li => li.textContent.trim()) : STATIC_DATA.experience.map(s => s.replace(/^- /, '')),
      education: educationItems.length ? Array.from(educationItems).map(p => p.textContent.trim()) : STATIC_DATA.education.map(s => s.replace(/^- /, '')),
      skills: skillCards.length ? Array.from(skillCards).map(h3 => h3.textContent.trim()) : STATIC_DATA.skills.map(s => s.title),
      awards: DATA.awards.map(card => ({
        title: card.title || '',
        desc: card.description || ''
      }))
    };

    if (!args[0]) return structure['/'].join('\n');
    if (args[0] === 'projects') return structure['projects'].join('\n');
    if (args[0] === 'contact') {
      const links = document.querySelectorAll('#contact .contact-links a');
      if (links.length) {
        contactTable();
      } else {
        // Static contact table
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

        STATIC_DATA.contact.forEach(({ platform, link }) => {
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
      return '';
    }
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
      about: document.querySelector('#about p')?.textContent.trim() || STATIC_DATA.about,
      experience: (Array.from(document.querySelectorAll('#experience ul li')).map(li => `- ${li.textContent.trim()}`).join('\n')) || STATIC_DATA.experience.join('\n'),
      education: (Array.from(document.querySelectorAll('#education p')).map(p => `- ${p.textContent.trim()}`).join('\n')) || STATIC_DATA.education.join('\n'),
      skills: (Array.from(document.querySelectorAll('#skills .card')).map(card => {
        const title = card.querySelector('h3')?.textContent.trim() || '';
        const desc = card.querySelector('p')?.textContent.trim() || '';
        return `${title}: ${desc}`;
      }).join('\n\n')) || STATIC_DATA.skills.map(s => `${s.title}: ${s.desc}`).join('\n\n'),
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

  exit: () => {
    window.location.href = 'index.html';
    return 'Logging out...';
  },

  // Secret Commands
  dev: () => {
    return '--- SECRET DEVELOPER MENU ---\n' +
      'view <file>   : View source code of project files\n' +
      'available files:\n' +
      '  index.html, terminal.html, sitemap.xml, script.js,\n' +
      '  styles.css, projects.json, awards.json, readme.md';
  },

  view: (args) => {
    if (!args[0]) return 'Usage: view <filename>\nTry "dev" for a list of files.';

    const file = args[0].toLowerCase();
    const map = {
      'index.html': 'index.html',
      'terminal.html': 'terminal.html',
      'sitemap.xml': 'sitemap.xml',
      'readme.md': 'README.md',
      'script.js': 'js/script.js',
      'styles.css': 'css/styles.css',
      'projects.json': 'data/projects.json',
      'awards.json': 'data/awards.json'
    };

    if (!map[file]) return `File not found: ${file}`;

    const baseUrl = 'https://raw.githubusercontent.com/Rainier-PS/Personal-Website/refs/heads/main/';
    const url = baseUrl + map[file];

    window.open(url, '_blank');
    return `Opening ${file} in a new tab...`;
  },

  color: (args) => {
    if (args.length < 3) return 'Usage: color <r> <g> <b>\nExample: color 255 100 50';
    const [r, g, b] = args.map(Number);
    if ([r, g, b].some(n => isNaN(n) || n < 0 || n > 255)) return 'Invalid value. Use 0-255.';

    // Calculate brightness (perceived)
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    const isDark = brightness < 60; // Threshold for visibility against black bg

    const colorVal = `rgb(${r}, ${g}, ${b})`;
    terminal.style.setProperty('--terminal-color', colorVal);

    // Use green if too dark, otherwise use the custom color
    const btnColor = isDark ? '#0f0' : colorVal;
    terminal.style.setProperty('--terminal-btn-color', btnColor);

    return `Terminal color set to ${colorVal}${isDark ? ' (Buttons kept bright)' : ''}`;
  },

  matrix: () => {
    document.body.classList.toggle('matrix-mode');
    return document.body.classList.contains('matrix-mode') ? 'Matrix mode enabled.' : 'Matrix mode disabled.';
  }
};

if (input) {
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
}

backBtn?.addEventListener('click', () => {
  if (document.body.classList.contains('terminal-body')) {
    window.location.href = 'index.html';
  } else {
    terminal.style.display = 'none';
  }
});
helpBtn?.addEventListener('click', () => helpFunction());

logos.forEach(logo => {
  logo.addEventListener('click', (e) => {
    if (logo.tagName === 'IMG' && logo.parentElement.tagName !== 'A') {
      terminal.style.display = 'block';
      bootSequence();
      autoScroll();
    }
  });
});

if (document.body.classList.contains('terminal-body')) {
  terminal.style.display = 'block';
  setTimeout(() => {
    bootSequence();
    autoScroll();
    input.focus();
  }, 100);
}

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

if (lightbox) {
  lightbox.addEventListener('click', e => {
    if (e.target === lightbox) {
      lightbox.classList.remove('active');
      document.body.style.overflow = '';
    }
  });
}

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
