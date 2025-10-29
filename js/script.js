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
(function typeWriter(){
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

function typeLine(line, delay = 20, callback) {
let i = 0;
const interval = setInterval(() => {
    output.innerHTML += line.charAt(i);
    i++;
    terminal.scrollTop = terminal.scrollHeight;
    if (i === line.length) {
    clearInterval(interval);
    output.innerHTML += '\n';
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
setTimeout(() => input.focus(), lines.length * 500 + 500);
}

const projectData = {};
document.querySelectorAll('#projects .card').forEach(card => {
const title = card.querySelector('h3').textContent;
const desc = card.querySelector('p').textContent;
const links = Array.from(card.querySelectorAll('.buttons a')).map(a => a.href).join(' | ');
// Use kebab-case for “folder names”
const key = title.toLowerCase().replace(/\s+/g, '-');
projectData[key] = { title, desc, links };
});

const commands = {
help: 'Available commands:\nhelp, about, contact, ls, cat, clear, exit',
about: 'Hi! I\'m Rainier, a high school student passionate about technology and engineering.',
contact: 'You can reach me at: rainierps8@gmail.com',
ls: (args) => {
    if (args[0] === 'projects') {
    return Object.keys(projectData).join('\n');
    } else if (!args[0]) {
    return 'projects';
    } else {
    return `ls: cannot access '${args[0]}': No such directory`;
    }
},
cat: (args) => {
    if (!args[0]) return 'cat: missing file operand';
    const key = args[0].replace(/^projects\//, '');
    if (projectData[key]) {
    const { title, desc, links } = projectData[key];
    return `${title}\n${desc}\nLinks: ${links}`;
    } else {
    return `cat: ${args[0]}: No such file`;
    }
},
clear: () => { output.innerHTML = ''; return ''; },
exit: () => { terminal.style.display = 'none'; return 'Session terminated.'; }
};

input.addEventListener('keydown', (e) => {
if (e.key === 'Enter') {
    const raw = input.value.trim();
    if (!raw) return;

    output.innerHTML += `\n${prompt}${raw}\n`;
    history.push(raw);
    historyIndex = history.length;

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
    terminal.scrollTop = terminal.scrollHeight;
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
helpBtn.addEventListener('click', () => typeLine(commands.help));

logos.forEach(logo => {
logo.addEventListener('click', () => {
    terminal.style.display = 'block';
    bootSequence();
});
});
