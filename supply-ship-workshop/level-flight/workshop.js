// Local snapshot of the ready-artwork branch in drawLevel2BonusShip().
// The game first fits the top-down artwork, then swaps the axes with a 90° turn.
const vesperArtWidth = 49.5;
const vesperArtHeight = vesperArtWidth * 232 / 248;
const hitboxWidth = 52.8;
const hitboxHeight = vesperArtHeight;
const flightSpeed = 162;
const flightY = 42;
const imageWidth = 232;
const ships = [
  {
    id: "kestrel",
    name: "Kestrel",
    description: "Swept ivory armor, red flashes and twin rectangular thrusters.",
    originalHeight: 204,
    direction: 1,
    startFraction: 0.24,
  },
  {
    id: "vesper",
    name: "Vesper",
    description: "Curved pearl foils, a teardrop canopy and a mint nose.",
    originalHeight: 248,
    direction: -1,
    startFraction: 0.76,
  },
];

const root = document.documentElement;
root.style.setProperty("--hit-width", `${hitboxWidth}px`);
root.style.setProperty("--hit-height", `${hitboxHeight}px`);
root.style.setProperty("--flight-y", `${flightY}px`);

function formatSize(width, height) {
  return `${width.toFixed(2)} × ${height.toFixed(2)} px`;
}

function setArtwork(container, ship, drawWidth, drawHeight) {
  container.style.setProperty("--art-width", `${drawWidth}px`);
  container.style.setProperty("--art-height", `${drawHeight}px`);
  container.querySelectorAll(".ship img").forEach((image) => {
    image.src = `./assets/${ship.id}.svg`;
  });
}

const grid = document.querySelector("#comparison-grid");
const laneList = document.querySelector("#flight-lanes");
const cardTemplate = document.querySelector("#ship-card");
const laneTemplate = document.querySelector("#flight-lane");
const lanes = ships.map((ship) => {
  const drawWidth = Math.min(vesperArtWidth, vesperArtHeight * ship.originalHeight / imageWidth);
  const drawHeight = drawWidth * imageWidth / ship.originalHeight;

  const card = cardTemplate.content.firstElementChild.cloneNode(true);
  card.querySelector("h3").textContent = ship.name;
  card.querySelector(".description").textContent = ship.description;
  card.querySelector(".art-size").textContent = `Artwork ${formatSize(drawWidth, drawHeight)}`;
  card.querySelector(".hit-size").textContent = `Hitbox ${formatSize(hitboxWidth, hitboxHeight)}`;
  setArtwork(card, ship, drawWidth, drawHeight);
  grid.append(card);

  const lane = laneTemplate.content.firstElementChild.cloneNode(true);
  lane.querySelector("h3").textContent = ship.name;
  setArtwork(lane, ship, drawWidth, drawHeight);
  laneList.append(lane);

  const runway = lane.querySelector(".runway");
  const sprite = runway.querySelector(".ship");
  return {
    runway,
    sprite,
    width: runway.clientWidth,
    x: runway.clientWidth * ship.startFraction,
    direction: ship.direction,
  };
});

const boundsToggle = document.querySelector("#show-bounds");
function updateBounds() {
  root.classList.toggle("show-bounds", boundsToggle.checked);
}
boundsToggle.addEventListener("change", updateBounds);
updateBounds();

document.querySelector("#flight-speed").textContent = flightSpeed;

function drawFlight(lane) {
  lane.sprite.style.left = `${lane.x}px`;
  lane.sprite.classList.toggle("faces-left", lane.direction < 0);
}

let animationFrame;
let lastTime;
const halfHitbox = hitboxWidth / 2;
const resizeObserver = new ResizeObserver(() => {
  for (const lane of lanes) {
    const width = lane.runway.clientWidth;
    lane.x = (lane.x + halfHitbox) * (width + hitboxWidth) / (lane.width + hitboxWidth) - halfHitbox;
    lane.width = width;
    drawFlight(lane);
  }
});
lanes.forEach((lane) => resizeObserver.observe(lane.runway));

function fly(now) {
  const elapsed = lastTime === undefined ? 0 : Math.min((now - lastTime) / 1000, 0.05);
  lastTime = now;
  for (const lane of lanes) {
    const nextX = lane.x + lane.direction * flightSpeed * elapsed;
    const left = -halfHitbox;
    const right = lane.width + halfHitbox;
    if (nextX <= left || nextX >= right) {
      lane.direction = nextX <= left ? 1 : -1;
    }
    lane.x = Math.max(left, Math.min(right, nextX));
    drawFlight(lane);
  }
  animationFrame = requestAnimationFrame(fly);
}

const motionPreference = matchMedia("(prefers-reduced-motion: reduce)");
const flightToggle = document.querySelector("#flight-toggle");
function setPlaying(playing) {
  cancelAnimationFrame(animationFrame);
  animationFrame = undefined;
  lastTime = undefined;
  if (playing) animationFrame = requestAnimationFrame(fly);
  flightToggle.textContent = playing ? "Pause flight" : "Play flight";
}

flightToggle.addEventListener("click", () => setPlaying(animationFrame === undefined));
motionPreference.addEventListener("change", (event) => setPlaying(!event.matches));
lanes.forEach(drawFlight);
setPlaying(!motionPreference.matches);
