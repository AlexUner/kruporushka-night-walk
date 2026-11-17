const scenes = [
  { id: "street", title: "Улица" },
  { id: "bakery", title: "Озерский хлеб" },
  { id: "bridge", title: "Мост" },
  { id: "door", title: "Крупорушка" },
  { id: "room", title: "Еще качается", image: "chair", location: "door" }
];

const viewport = document.querySelector(".viewport");
const title = document.querySelector("#scene-title");
const shots = [...document.querySelectorAll(".shot")];
const chair = document.querySelector("#chair");
const motion = document.querySelector("#motion-control");
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
let current = -1;

const minimap = L.map("minimap", {
  attributionControl: false,
  zoomControl: false,
  dragging: false,
  keyboard: false,
  doubleClickZoom: false,
  scrollWheelZoom: false,
  touchZoom: false,
  boxZoom: false,
  zoomSnap: 0.25
});
L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", { maxNativeZoom: 19 }).addTo(minimap);

const markers = Object.fromEntries(
  Object.entries(walkLocations).map(([id, point]) => [
    id, L.circleMarker(point, { interactive: false }).addTo(minimap)
  ])
);
const bounds = L.latLngBounds(Object.values(walkLocations));
function fitMap() {
  minimap.fitBounds(bounds, { padding: [14, 16], animate: false });
}
minimap.on("resize", fitMap);
fitMap();

function showLocation(location) {
  for (const [id, marker] of Object.entries(markers)) {
    const active = id === location;
    marker.setStyle({
      radius: active ? 5 : 3,
      color: active ? "#fff2d5" : "#d2bbc0",
      fillColor: active ? "#ff675b" : "#5c484f",
      fillOpacity: 1,
      weight: active ? 2 : 1
    });
    if (active) marker.bringToFront();
  }
}

function updatePlaybackButton() {
  motion.dataset.playing = String(!chair.paused);
  motion.setAttribute("aria-label", chair.paused ? "Смотреть" : "Пауза");
}

function render() {
  const next = Math.max(0, scenes.findIndex((scene) => `#${scene.id}` === location.hash));
  if (next === current) return;
  const moveFocus = shots[current]?.contains(document.activeElement);
  current = next;
  const scene = scenes[current];

  for (const shot of shots) {
    const active = shot.dataset.stop === scene.id;
    shot.classList.toggle("is-current", active);
    shot.inert = !active;
  }

  viewport.style.setProperty("--scene-image", `url("assets/${scene.image || scene.id}.webp")`);
  title.textContent = scene.title;
  showLocation(scene.location || scene.id);

  if (scene.id === "room") {
    chair.currentTime = 0;
    if (!reducedMotion.matches) chair.play().catch(updatePlaybackButton);
  } else {
    chair.pause();
  }

  if (moveFocus) {
    const control = shots[current].querySelector(".path-forward, button");
    control.focus({ preventScroll: true });
  }
  updatePlaybackButton();
}

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

  const forward = event.key === "ArrowRight" || event.key === "ArrowDown"
    || (event.key === "ArrowLeft" && scenes[current].id === "bridge");
  const back = event.key === "ArrowLeft" || event.key === "ArrowUp";
  const next = current + (forward ? 1 : back ? -1 : 0);
  if (next !== current && scenes[next]) {
    event.preventDefault();
    location.hash = scenes[next].id;
  }
});
render();
