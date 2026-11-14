const stops = [
  { id: "street", title: "Улица", next: "К пекарне" },
  { id: "bakery", title: "Озерский хлеб", next: "К мосту" },
  { id: "bridge", title: "Мост", next: "Налево", kind: "turn" },
  { id: "door", title: "Крупорушка", next: "Открыть дверь", kind: "door" },
  { id: "room", title: "Еще качается", next: "С начала", kind: "replay", image: "chair" }
];

const find = (selector) => document.querySelector(selector);
const viewport = find(".viewport");
const title = find("#scene-title");
const number = find("#scene-number");
const action = find("#scene-action");
const back = find("#back-control");
const door = find(".door-pin");
const motion = find("#motion-control");
const chair = find("#chair");
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
const shots = [...document.querySelectorAll(".shot")];
const route = [...document.querySelectorAll(".route a")];
let current = 0;

function updatePlaybackButton() {
  motion.textContent = chair.paused ? "Смотреть" : "Пауза";
}

function render() {
  const index = stops.findIndex((stop) => `#${stop.id}` === location.hash);
  const next = Math.max(0, index);
  const stop = stops[next];
  const enteringRoom = stop.id === "room" && (current !== next || chair.readyState === 0);
  current = next;

  shots.forEach((shot, position) => {
    const active = position === current;
    shot.classList.toggle("is-current", active);
    shot.setAttribute("aria-hidden", String(!active));
    if (active) route[position].setAttribute("aria-current", "step");
    else route[position].removeAttribute("aria-current");
  });

  viewport.style.setProperty("--scene-image", `url("assets/${stop.image || stop.id}.webp")`);
  number.textContent = `0${current + 1} / 0${stops.length}`;
  title.textContent = stop.title;
  action.querySelector("span").textContent = stop.next;
  action.dataset.kind = stop.kind || "step";
  back.hidden = current === 0;
  door.disabled = stop.id !== "door";

  motion.hidden = stop.id !== "room";
  if (stop.id !== "room") chair.pause();
  if (enteringRoom) {
    chair.currentTime = 0;
    if (!reducedMotion.matches) chair.play().catch(updatePlaybackButton);
  }
  updatePlaybackButton();
}

function go(index) {
  if (index >= 0 && index < stops.length) location.hash = stops[index].id;
}

action.addEventListener("click", () => go((current + 1) % stops.length));
back.addEventListener("click", () => {
  go(current - 1);
  if (current === 1) action.focus();
});
door.addEventListener("click", () => {
  go(current + 1);
  action.focus();
});
motion.addEventListener("click", () => {
  if (chair.paused) chair.play().catch(updatePlaybackButton);
  else chair.pause();
});
chair.addEventListener("play", updatePlaybackButton);
chair.addEventListener("pause", updatePlaybackButton);
reducedMotion.addEventListener("change", (event) => {
  if (event.matches) chair.pause();
});
window.addEventListener("hashchange", render);
window.addEventListener("keydown", (event) => {
  if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey || event.repeat) return;
  if ((event.key === "ArrowRight" || event.key === "ArrowDown") && current < stops.length - 1) {
    event.preventDefault();
    go(current + 1);
  }
  if (event.key === "ArrowLeft" && current === 2) {
    event.preventDefault();
    go(3);
  } else if ((event.key === "ArrowLeft" || event.key === "ArrowUp") && current > 0) {
    event.preventDefault();
    go(current - 1);
  }
});
render();

