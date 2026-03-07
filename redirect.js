const BASE_URL = "https://rainier-ps.github.io/";
const OLD_BASE = "/Personal-Website/";

let currentPath = window.location.pathname;

if (currentPath.startsWith(OLD_BASE)) {
  currentPath = currentPath.slice(OLD_BASE.length - 1);
}

const targetURL = BASE_URL + (currentPath === "/" ? "" : currentPath.replace(/^\//, ""));

const linkElement = document.getElementById("redirect-link");
linkElement.href = targetURL;

let countdown = 3;
const countdownElement = document.getElementById("countdown");

const interval = setInterval(() => {
  countdown -= 1;
  countdownElement.textContent = `Redirecting in ${countdown} seconds…`;
  if (countdown <= 0) {
    clearInterval(interval);
    window.location.href = targetURL;
  }
}, 1000);
