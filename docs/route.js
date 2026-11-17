const plane = document.querySelector(".route-plane");
const cards = [...document.querySelectorAll(".route-stops [data-stop]")];
const back = document.querySelector(".return-link");
const markers = new Map();

for (const card of cards) {
  const id = card.dataset.stop;
  const label = card.querySelector("span").textContent;
  const number = card.querySelector("b").textContent;
  const { x, y } = projectWalkPoint(walkLocations[id], routeMapBounds, 100, 100);
  const marker = document.createElement("a");
  marker.className = "route-marker";
  marker.href = card.href;
  marker.style.setProperty("--x", `${x}%`);
  marker.style.setProperty("--y", `${y}%`);
  marker.setAttribute("aria-label", label);
  const icon = document.createElement("span");
  icon.className = "marker-number";
  icon.textContent = number;
  const caption = document.createElement("span");
  caption.className = "marker-caption";
  caption.textContent = label;
  marker.append(icon, caption);
  plane.append(marker);
  markers.set(id, marker);
}

function highlightStop() {
  const requested = location.hash.slice(1);
  const scene = requested === "room" || markers.has(requested) ? requested : "street";
  const current = scene === "room" ? "door" : scene;
  back.href = `./#${scene}`;

  for (const card of cards) {
    const marker = markers.get(card.dataset.stop);
    for (const link of [card, marker]) {
      if (card.dataset.stop === current) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    }
  }
}

window.addEventListener("hashchange", highlightStop);
highlightStop();
