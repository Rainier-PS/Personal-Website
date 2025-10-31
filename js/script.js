if (window.lucide) { lucide.createIcons(); }
window.addEventListener("DOMContentLoaded", () => { if (window.lucide) lucide.createIcons(); });

const sections = document.querySelectorAll("section");
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add("visible"); });
}, { threshold: 0.1 });
sections.forEach(sec => observer.observe(sec));

const header = document.getElementById("header");
window.addEventListener("scroll", () => {
  header.style.boxShadow = window.scrollY > 50 ? "0 4px 12px rgba(0,0,0,0.2)" : "0 2px 5px rgba(0,0,0,0.1)";
});

const tagline = document.getElementById("tagline");
let text = "High School Student • Aspiring Engineer • Tech Enthusiast";
if (window.innerWidth <= 600) { text = text.replace(/ • /g, "\n"); tagline.style.whiteSpace = "pre-wrap"; }
let i = 0;
(function typeWriter() {
  if (i < text.length) { tagline.textContent += text.charAt(i++); setTimeout(typeWriter, 70); }
  else { tagline.style.borderRight = "none"; }
})();

const themeToggle = document.getElementById("theme-toggle");
const html = document.documentElement;
function setTheme(mode) {
  if (mode === "dark") { html.classList.add("dark"); themeToggle.innerHTML = '<i data-lucide="sun"></i>'; }
  else { html.classList.remove("dark"); themeToggle.innerHTML = '<i data-lucide="moon"></i>'; }
  if (window.lucide) lucide.createIcons();
  localStorage.setItem("theme", mode);
}
const savedTheme = localStorage.getItem("theme");
if (savedTheme) setTheme(savedTheme); else setTheme(window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
themeToggle.addEventListener("click", () => { setTheme(html.classList.contains("dark") ? "light" : "dark"); });

document.querySelectorAll("[data-carousel]").forEach(carousel => {
  const track = carousel.querySelector(".carousel-track");
  const pages = Array.from(track.children);
  const dotsContainer = carousel.querySelector(".carousel-dots");
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

const menuToggle = document.getElementById("menu-toggle");
const navLinks = document.getElementById("nav-links");
menuToggle.addEventListener("click", () => {
  navLinks.classList.toggle("show");
  const expanded = menuToggle.getAttribute("aria-expanded") === "true";
  menuToggle.setAttribute("aria-expanded", String(!expanded));
});

const logos = document.querySelectorAll('.brand img.logo');
const terminal = document.getElementById('terminal');
const output = document.getElementById('terminal-output');
const input = document.getElementById('terminal-input');
const backBtn = document.getElementById('terminal-back');
const helpBtn = document.getElementById('terminal-help');

const prompt = 'guest@portfolio:~$ ';
let history = [];
let historyIndex = -1;

function autoScroll() {
  terminal.scrollTop = terminal.scrollHeight;
}

function scrollToBottom() {
  autoScroll();
}

function typeLine(line, delay = 20, callback) {
  let i = 0;
  const interval = setInterval(() => {
    output.innerHTML += line.charAt(i);
    i++;
    autoScroll();
    if (i === line.length) {
      clearInterval(interval);
      output.innerHTML += '\n';
      autoScroll();
      if (callback) callback();
    }
  }, delay);
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
  output.innerHTML = '';
  lines.forEach((line, i) => {
    setTimeout(() => typeLine(line, 10), i * 500);
  });
  setTimeout(() => { input.focus(); autoScroll(); }, lines.length * 500 + 500);
}

const projectData = {};
document.querySelectorAll('#projects .card').forEach(card => {
  const title = card.querySelector('h3').textContent;
  const desc = card.querySelector('p').textContent;
  const links = Array.from(card.querySelectorAll('.buttons a')).map(a => a.href).join(' | ');
  const key = title.toLowerCase().replace(/\s+/g, '-');
  projectData[key] = { title, desc, links };
});

function help_function() {
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

  output.appendChild(container);
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

  output.appendChild(container);
  autoScroll();
}

const commands = {
  help: () => { help_function(); return ''; },

  about: 'Hi! I\'m Rainier, a high school student passionate about technology and engineering.',

  ls: (args) => {
    const structure = {
      '/': ['about', 'experience', 'education', 'skills', 'projects', 'awards', 'contact'],
      'projects': Object.keys(projectData)
    };

    const sections = {
      experience: Array.from(document.querySelectorAll('#experience ul li')).map(li => li.textContent.trim()),
      education: Array.from(document.querySelectorAll('#education p')).map(p => p.textContent.trim()),
      skills: Array.from(document.querySelectorAll('#skills .card h3')).map(h3 => h3.textContent.trim()),
      awards: Array.from(document.querySelectorAll('#awards .card')).map(card => ({
        title: card.querySelector('h3')?.textContent.trim() || '',
        desc: card.querySelector('p')?.textContent.trim() || ''
      }))
    };

    if (!args[0]) return structure['/'].join('\n');
    if (args[0] === 'projects') return structure['projects'].join('\n');
    if (args[0] === 'contact') { contactTable(); return ''; }
    if (args[0] === 'awards') {
      const container = document.createElement("div");
      container.classList.add("help-table", "awards-table");

      const header = document.createElement("div");
      header.classList.add("help-row", "help-header");
      header.innerHTML = `<div class="help-command">Award</div><div class="help-desc">Description</div>`;
      container.appendChild(header);

      // Grab all award cards from the page
      const awardCards = document.querySelectorAll('#awards .card');

      awardCards.forEach(card => {
        const title = card.querySelector('h3')?.textContent.trim() || '';
        const desc = card.querySelector('p')?.textContent.trim() || '';
        const imgSrc = card.querySelector('img')?.src || '';

        const row = document.createElement("div");
        row.classList.add("help-row");
        row.innerHTML = `
          <div class="help-command">${title}</div>
          <div class="help-desc"><a href="#" class="cli-link" data-cert="${imgSrc}">${desc}</a></div>
        `;

        // Add click handler to open certificate in new tab
        row.querySelector('.cli-link').addEventListener('click', (e) => {
          e.preventDefault();
          window.open(imgSrc, '_blank', 'noopener');
        });

        container.appendChild(row);
      });

      output.appendChild(container);
      autoScroll();
      return '';
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
      awards: Array.from(document.querySelectorAll('#awards .card')).map(card => {
        const title = card.querySelector('h3')?.textContent.trim() || '';
        const desc = card.querySelector('p')?.textContent.trim() || '';
        return `${title} — ${desc}`;
      }).join('\n')
    };

    if (sections[args[0]]) return sections[args[0]] || '(empty)';
    return `cat: ${args[0]}: No such file or directory`;
  },

  clear: () => { output.innerHTML = ''; autoScroll(); return ''; },

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

    output.innerHTML += `\n${prompt}${raw}\n`;
    history.push(raw);
    historyIndex = history.length;
    autoScroll();

    const parts = raw.split(' ');
    const cmd = parts[0];
    const args = parts.slice(1);

    if (commands[cmd]) {
      const result = typeof commands[cmd] === 'function' ? commands[cmd](args) : commands[cmd];
      if (result) typeLine(result);
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

backBtn.addEventListener('click', () => terminal.style.display = 'none');
helpBtn.addEventListener('click', () => help_function());

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

document.querySelectorAll('#awards .card img, #projects .card img').forEach(img => {
  img.style.cursor = 'zoom-in';
  img.addEventListener('click', () => {
    lightboxImg.src = img.src;
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
  });
});

closeBtn.addEventListener('click', () => {
  lightbox.classList.remove('active');
  document.body.style.overflow = '';
});

openBtn.addEventListener('click', () => {
  if (lightboxImg.src) window.open(lightboxImg.src, '_blank');
});

lightbox.addEventListener('click', e => {
  if (e.target === lightbox) {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
  }
});
