const center = [54.408741, 22.014359];
const places = [
  { id: "street", label: "Первое здание" },
  { id: "bakery", label: "Озерский хлеб" },
  { id: "bridge", label: "Мост" },
  { id: "door", label: "Дверь Крупорушки" }
];
const storageKey = "kruporushka-ozersk-pins-v1";
const find = (selector) => document.querySelector(selector);
const status = find("#status");
const coordinate = find("#coordinate");
const copyFallback = find("#copy-fallback");
const warning = find("#map-warning");
const markerLayer = L.layerGroup();
const map = L.map("map", { zoomControl: false }).setView(center, 16);
L.control.zoom({ zoomInTitle: "Увеличить", zoomOutTitle: "Уменьшить" }).addTo(map);
const tiles = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 20,
  maxNativeZoom: 19,
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);
tiles.on("tileerror", () => { warning.hidden = false; });
tiles.on("tileload", () => { warning.hidden = true; });
markerLayer.addTo(map);

let active = 0;
let pins = { ...walkLocations };
function validPoint(point) {
  return Array.isArray(point) && point.length === 2 && point.every(Number.isFinite)
    && Math.abs(point[0]) <= 85 && Math.abs(point[1]) <= 180;
}
try {
  const saved = JSON.parse(localStorage.getItem(storageKey));
  if (saved) {
    pins = {};
    for (const { id } of places) {
      if (validPoint(saved[id])) pins[id] = saved[id];
    }
  }
} catch {
  status.textContent = "Память браузера недоступна. Скопируй или скачай точки перед закрытием.";
}

const cards = places.map(({ id, label }, index) => {
  const button = document.createElement("button");
  button.type = "button";
  const thumbnail = document.createElement("img");
  thumbnail.src = `assets/${id}.webp`;
  thumbnail.alt = "";
  const text = document.createElement("span");
  text.append(`${index + 1}. ${label}`, document.createElement("small"));
  button.append(thumbnail, text);
  button.addEventListener("click", () => {
    select(index);
    if (pins[id]) map.panTo(pins[id]);
  });
  find("#stop-list").append(button);
  return button;
});

function format(point) {
  return point.map((value) => value.toFixed(6)).join(", ");
}

function makeMarker(point, index) {
  const place = places[index];
  const marker = L.marker(point, {
    draggable: true,
    alt: place.label,
    title: place.label,
    icon: L.divIcon({
      className: index === active ? "walk-pin is-selected" : "walk-pin",
      html: String(index + 1),
      iconSize: [29, 29]
    })
  }).addTo(markerLayer);
  marker.on("click", () => select(index));
  marker.on("dragend", () => {
    active = index;
    const { lat, lng } = marker.getLatLng().wrap();
    placePin([lat, lng], false);
  });
}

function render() {
  markerLayer.clearLayers();
  cards.forEach((card, index) => {
    const point = pins[places[index].id];
    card.setAttribute("aria-pressed", String(index === active));
    card.querySelector("small").textContent = point ? format(point) : "Без метки";
    if (point) makeMarker(point, index);
  });
  const count = Object.keys(pins).length;
  find("#clear-pin").disabled = !pins[places[active].id];
  find("#copy-pins").disabled = count === 0;
  find("#save-pins").disabled = count === 0;
}

function select(index) {
  active = index;
  coordinate.value = pins[places[active].id] ? format(pins[places[active].id]) : "";
  render();
}

function commit(message) {
  try {
    localStorage.setItem(storageKey, JSON.stringify(pins));
    status.textContent = message;
  } catch {
    status.textContent = `${message} Сохрани точки перед закрытием страницы.`;
  }
  copyFallback.hidden = true;
  select(active);
}

function placePin(point, pan) {
  if (!validPoint(point)) {
    status.textContent = "Проверь широту и долготу. Пример: 54.408741, 22.014359.";
    return;
  }
  const { id, label } = places[active];
  pins[id] = point.map((value) => +value.toFixed(6));
  commit(`Метка «${label}» поставлена. ${Object.keys(pins).length} из 4.`);
  if (pan) map.panTo(point);
}

map.on("click", (event) => {
  const { lat, lng } = event.latlng.wrap();
  placePin([lat, lng], false);
});
find("#manual-pin").addEventListener("submit", (event) => {
  event.preventDefault();
  const value = coordinate.value.trim();
  const yandex = /[?&]ll=(-?\d+(?:\.\d+)?)(?:%2C|,)(-?\d+(?:\.\d+)?)/i.exec(value);
  const pair = /(?:@|^|[?&](?:q|query|mlat)=)(-?\d+(?:\.\d+)?)\s*(?:%2C|,|\s|&mlon=)\s*(-?\d+(?:\.\d+)?)/i.exec(value)
    || /#map=\d+\/(-?\d+(?:\.\d+)?)\/(-?\d+(?:\.\d+)?)/i.exec(value);
  const point = yandex ? [Number(yandex[2]), Number(yandex[1])] : pair ? [Number(pair[1]), Number(pair[2])] : null;
  placePin(point, true);
});
find("#clear-pin").addEventListener("click", () => {
  delete pins[places[active].id];
  commit("Метка убрана.");
  cards[active].focus();
});
find("#center-map").addEventListener("click", () => {
  const points = Object.values(pins);
  if (points.length) map.fitBounds(points, { padding: [35, 35], maxZoom: 18 });
  else map.setView(center, 16);
});

function exportText() {
  return ["Крупорушка — Озёрск, Калининградская область", ...places.map(({ id, label }, index) =>
    `${index + 1}. ${label} — ${pins[id] ? format(pins[id]) : "без метки"}`)].join("\n");
}

find("#copy-pins").addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(exportText());
    copyFallback.hidden = true;
    status.textContent = "Точки скопированы. Вставь их в сообщение.";
  } catch {
    copyFallback.hidden = false;
    copyFallback.value = exportText();
    copyFallback.select();
    status.textContent = "Скопируй выделенный текст.";
  }
});
find("#save-pins").addEventListener("click", () => {
  const data = JSON.stringify({ city: "Озёрск, Калининградская область", stops: pins }, null, 2);
  const url = URL.createObjectURL(new Blob([data + "\n"], { type: "application/json" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = "kruporushka-points.json";
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
});
select(0);

