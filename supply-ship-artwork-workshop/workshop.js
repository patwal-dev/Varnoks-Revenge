const flight = document.querySelector(".flights");
const lanes = document.querySelector(".lanes");
const flightToggle = document.querySelector("#flight-toggle");

const flightSpeed = 162;
const halfHitboxWidth = 52.8 / 2;
let distance = lanes.clientWidth / 2 + halfHitboxWidth;
let lastFrameTime;
let animationFrame = null;

function animateFlight(time) {
  if (lastFrameTime !== undefined) {
    distance += (time - lastFrameTime) / 1000 * flightSpeed;
  }
  lastFrameTime = time;

  const span = lanes.clientWidth + 2 * halfHitboxWidth;
  distance %= 2 * span;
  const facingLeft = distance >= span;
  const x = (facingLeft ? 2 * span - distance : distance) - halfHitboxWidth;
  flight.style.setProperty("--flight-x", `${x}px`);
  flight.classList.toggle("facing-left", facingLeft);
  animationFrame = requestAnimationFrame(animateFlight);
}

flightToggle.addEventListener("click", () => {
  if (animationFrame === null) {
    animationFrame = requestAnimationFrame(animateFlight);
    flightToggle.textContent = "Pause flight";
  } else {
    cancelAnimationFrame(animationFrame);
    animationFrame = null;
    lastFrameTime = undefined;
    flightToggle.textContent = "Resume flight";
  }
});
