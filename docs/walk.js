const scenes = [
  { id: "street", title: "Улица" },
  { id: "bridge", title: "Мост" },
  { id: "bakery", title: "Озерский хлеб" },
  { id: "door", title: "Крупорушка" },
  { id: "room", title: "Еще качается", location: "door" }
];

const title = document.querySelector("#scene-title");
const shots = [...document.querySelectorAll(".shot")];
const chair = document.querySelector("#chair");
const motion = document.querySelector("#motion-control");
const fade = document.querySelector(".scene-fade");
const cursor = document.querySelector("#minimap-cursor");
const pulse = cursor.querySelector(".map-pulse");
const target = document.querySelector("#minimap-target");
const sweep = document.querySelector(".radar-sweep");
const mapLink = document.querySelector(".minimap-open");
const cityLink = document.querySelector(".city");
const markers = document.querySelector("#minimap-stops");
const progress = document.querySelector(".minimap-progress");
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
let current = -1;
let mapStop;
let fadeAnimation;
let pulseAnimation;
let sweepAnimation;

const positions = Object.fromEntries(Object.entries(walkLocations).map(([id, coordinates]) => {
  const { x, y } = projectWalkPoint(coordinates, walkMapBounds, 160, 180);
  const mark = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  mark.setAttribute("cx", x);
  mark.setAttribute("cy", y);
  mark.setAttribute("r", 3);
  markers.append(mark);
  return [id, { x, y, mark }];
}));

function mapTransform({ x, y }) {
  return `translate(${x}px, ${y}px)`;
}

function showLocation(scene, animate) {
  const id = scene.location || scene.id;
  const next = scenes[current + 1];
  const nextId = next?.location || next?.id;
  progress.textContent = `0${current + 1} / 0${scenes.length}`;
  mapLink.href = cityLink.href = `route.html#${scene.id}`;
  mapLink.setAttribute("aria-label", `Открыть карту Озёрска. Сейчас: ${scene.title}.${next ? ` Дальше: ${next.title}.` : ""}`);
  const hasTarget = Boolean(nextId && nextId !== id);
  target.setAttribute("visibility", hasTarget ? "visible" : "hidden");
  if (hasTarget) target.style.transform = mapTransform(positions[nextId]);

  for (const [stop, { mark }] of Object.entries(positions)) {
    const precedesScene = scenes.findIndex((item) => item.id === stop) < current;
    mark.classList.toggle("map-past-stop", precedesScene && stop !== id);
  }

  if (mapStop === id) return;
  mapStop = id;
  cursor.style.transform = mapTransform(positions[id]);
  if (!animate) return;
  sweepAnimation?.cancel();
  sweepAnimation = sweep.animate(
    [
      { opacity: 0, transform: "rotate(-65deg)" },
      { opacity: .78, offset: .2 },
      { opacity: 0, transform: "rotate(295deg)" }
    ],
    { duration: 820, easing: "linear" }
  );
  pulseAnimation?.cancel();
  pulseAnimation = pulse.animate(
    [{ opacity: 0.85, transform: "scale(.65)" }, { opacity: 0, transform: "scale(1.85)" }],
    { duration: 630, easing: "ease-out", delay: 200 }
  );
}

function updatePlaybackButton() {
  motion.dataset.playing = String(!chair.paused);
  motion.setAttribute("aria-label", chair.paused ? "Смотреть" : "Пауза");
}

function render() {
  const next = Math.max(0, scenes.findIndex((scene) => `#${scene.id}` === location.hash));
  if (next === current) return;

  const previous = shots[current];
  const animate = Boolean(previous && !reducedMotion.matches);
  const moveFocus = previous?.contains(document.activeElement);
  const shot = shots[next];
  const scene = scenes[next];
  current = next;

  for (const frame of shots) {
    const active = frame === shot;
    frame.classList.toggle("is-current", active);
    frame.inert = !active;
  }
  if (animate) {
    fadeAnimation?.cancel();
    fadeAnimation = fade.animate(
      [{ opacity: 0 }, { opacity: 0.7, offset: 0.32 }, { opacity: 0 }],
      { duration: 480, easing: "ease-out" }
    );
  }

  title.textContent = scene.title;
  showLocation(scene, animate);

  if (scene.id === "room") {
    chair.currentTime = 0;
    if (!reducedMotion.matches) chair.play().catch(updatePlaybackButton);
  } else {
    chair.pause();
  }

  if (moveFocus) shot.querySelector(".path-forward, button").focus({ preventScroll: true });
  shots[current + 1]?.querySelector("img")?.decode().catch(() => {});
  updatePlaybackButton();
}

motion.addEventListener("click", () => {
  if (chair.paused) chair.play().catch(updatePlaybackButton);
  else chair.pause();
});
chair.addEventListener("play", updatePlaybackButton);
chair.addEventListener("pause", updatePlaybackButton);
reducedMotion.addEventListener("change", (event) => {
  if (!event.matches) return;
  chair.pause();
  fadeAnimation?.cancel();
  pulseAnimation?.cancel();
  sweepAnimation?.cancel();
});
window.addEventListener("hashchange", render);
function go(hash) {
  location.hash = hash;
  render();
}
document.querySelector(".walk").addEventListener("click", (event) => {
  if (event.defaultPrevented || event.button !== 0 || event.altKey
    || event.ctrlKey || event.metaKey || event.shiftKey) return;
  const link = event.target.closest('a[href^="#"]');
  if (!link) return;
  event.preventDefault();
  go(link.hash);
});
window.addEventListener("keydown", (event) => {
  if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey || event.repeat) return;

  const turnLeft = ["bridge", "bakery"].includes(scenes[current].id) && event.key === "ArrowLeft";
  const forward = event.key === "ArrowRight" || event.key === "ArrowDown" || turnLeft;
  const back = event.key === "ArrowLeft" || event.key === "ArrowUp";
  const next = current + (forward ? 1 : back ? -1 : 0);
  if (next !== current && scenes[next]) {
    event.preventDefault();
    go(scenes[next].id);
  }
});
render();
