const rootedCrownHatchLipY = 27;
const rootedCrownHatchHingeX = 22;

function getRootedCrownHatchGap(opening) {
  return rootedCrownHatchHingeX * (1 - Math.cos(1.42 * opening));
}

const drawRootedCrownArtwork = (() => {
  // Use the accepted workshop layers and motion at their original body scale.
  function loadImage(src) {
    const image = new Image();
    image.addEventListener("error", () => {
      console.error("Could not load the Rooted Crown artwork:", src.startsWith("data:") ? "animated body layer" : src);
    }, { once: true });
    image.src = src;
    return image;
  }

  const [bodyImage, eyesImage] = ["body-maw", "eyes-predatory"].map((layer) =>
    loadImage(`finalboss-workshop/Varnok Artwork Workshop (complete ZIP)/assets/rooted-crown/${layer}.svg`)
  );
  const living = loadLivingLayers();
  const socket = new Path2D("M-18-6-11-14 4-15 14-10 18-2 16 8 7 15-10 14-17 7Z");
  const hatchCavity = new Path2D("M100 1 115 14 126 22 122 29Q100 37 78 29L74 22 85 14Z");
  const hatchPanel = new Path2D("M100 1 100 27 90 31 81 29 74 22 85 14Z");
  const hatchRidge = new Path2D("M100 3 97 17 80 24 85 17Z");
  const hatchHinge = new Path2D("M74 21 81 19 84 23 82 29 77 29 75 25Z");
  const hatchLip = new Path2D("M76 24Q100 30 124 24L121 29Q100 38 79 29Z");

  function loadLivingLayers() {
    const asset = typeof VarnokArtwork === "undefined" ? null : VarnokArtwork["rooted-crown/body-living"];
    if (!asset) return null;
    const markup = decodeURIComponent(asset.slice(asset.indexOf(",") + 1));
    const source = new DOMParser().parseFromString(markup, "image/svg+xml").documentElement;
    if (source.localName !== "svg") return null;
    const [defs, outline, shell, leftCheek, rightCheek, ...face] = source.children;
    const cheekLayers = Array.from(defs.querySelector("#plates").children);
    const plate = defs.querySelector('[data-motion="plate"]');
    const tissue = defs.querySelector('[data-motion="tissue"]');
    const jaw = source.querySelector('[data-motion="lower-jaw"]');
    const serializer = new XMLSerializer();

    function makeLayer(parts, fixedCheekParts = []) {
      const svg = source.cloneNode(false);
      const definitions = defs.cloneNode(true);
      definitions.querySelector("#plates").replaceChildren(...fixedCheekParts.map((part) => part.cloneNode(true)));
      svg.append(definitions, ...parts.map((part) => part.cloneNode(true)));
      return svg;
    }

    // Split only at the animated groups so Canvas paints the original SVG layers in order.
    const back = makeLayer([outline, shell, leftCheek, rightCheek], cheekLayers.slice(0, cheekLayers.indexOf(plate)));
    const front = makeLayer([leftCheek, rightCheek, ...face], cheekLayers.slice(cheekLayers.indexOf(tissue) + 1));
    front.querySelector('[data-motion="lower-jaw"]').remove();
    return [back, makeLayer([plate]), makeLayer([tissue]), front, makeLayer([jaw])].map((svg) => {
      const uri = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(serializer.serializeToString(svg));
      return loadImage(uri);
    });
  }

  function imageReady(image) {
    return image.complete && image.naturalWidth > 0;
  }

  function drawLivingBody(context, width, height, frameTime) {
    // Match the workshop's normal-strength motion using the decorative frame time.
    const pulse = (elapsed, period) => (1 - Math.cos(2 * Math.PI * (elapsed % period) / period)) / 2;
    const breath = pulse(frameTime + 1100, 7600);
    const flex = 0.73 * breath + 0.27 * pulse(frameTime, 14900) ** 4;
    const projection = Math.cos(0.43 - 0.13 * flex) / Math.cos(0.4);
    const [back, plate, tissue, front, jaw] = living;
    context.drawImage(back, 0, 0, width, height);
    for (const side of [0, 1]) {
      context.save();
      if (side === 1) {
        context.translate(width, 0);
        context.scale(-1, 1);
      }
      context.save();
      context.translate(0.25 * breath, 0.95 * breath);
      context.drawImage(plate, 0, 0, width, height);
      context.restore();

      context.translate(32, 82);
      context.scale(1 + 0.04 * breath, 1 + 0.25 * breath);
      context.translate(-32, -82);
      context.globalAlpha *= 0.78 + 0.22 * breath;
      context.drawImage(tissue, 0, 0, width, height);
      context.restore();
    }
    context.drawImage(front, 0, 0, width, height);
    context.save();
    context.translate(0, 71);
    context.scale(1, projection);
    context.translate(0, -71);
    context.drawImage(jaw, 0, 0, width, height);
    context.restore();
  }

  function drawCrownHatch(context, opening) {
    const fold = 1 - getRootedCrownHatchGap(opening) / rootedCrownHatchHingeX;
    const hingeX = 100 - rootedCrownHatchHingeX;
    context.save();
    context.globalAlpha *= Math.min(1, opening * 5);
    context.fillStyle = "#170f21";
    context.fill(hatchCavity);

    for (const mirror of [false, true]) {
      context.save();
      if (mirror) {
        context.translate(200, 0);
        context.scale(-1, 1);
      }
      // Foreshorten each leaf around its fixed hinge as it folds outward.
      context.save();
      context.translate(hingeX, 0);
      context.scale(fold, 1);
      context.translate(-hingeX, 0);
      context.fillStyle = "#57436f";
      context.fill(hatchPanel);
      context.strokeStyle = "#271e35";
      context.lineWidth = 1;
      context.stroke(hatchPanel);
      context.fillStyle = "#7d6991";
      context.fill(hatchRidge);
      context.restore();
      context.fillStyle = "#463556";
      context.fill(hatchHinge);
      context.restore();
    }
    context.fillStyle = "#4c3759";
    context.fill(hatchLip);
    context.restore();
  }

  // Each tentacle is two cubic curves. The other side mirrors the shape with a phase offset.
  const tentacleShapes = [
    { points: [[27, 47], [10, 42], [-25, 27], [-43, 1], [-55, -17], [-49, -39], [-27, -30]], thickness: 6, phase: 0.4, period: 8100, bend: 1.35 },
    { points: [[26, 57], [5, 57], [-25, 51], [-53, 39], [-77, 29], [-83, 7], [-62, 14]], thickness: 8, phase: 1.7, period: 9300, bend: 1.35 },
    { points: [[29, 71], [8, 75], [-24, 79], [-59, 90], [-88, 100], [-88, 77], [-69, 69]], thickness: 9, phase: 3.1, period: 8600, bend: 0.9 },
    { points: [[36, 88], [17, 98], [-4, 112], [-25, 133], [-44, 152], [-68, 155], [-61, 131]], thickness: 7, phase: 4.2, period: 9800, bend: 1.35 },
  ].map((shape) => ({ ...shape, segments: sampleTentacle(shape.points) }));

  function sampleTentacle(points) {
    const steps = 16;
    const segments = [];
    let [x, y] = points[0];
    for (const offset of [0, 3]) {
      const [a, b, c, d] = points.slice(offset, offset + 4);
      for (let i = 1; i <= steps; i++) {
        const t = i / steps;
        const s = 1 - t;
        const nextX = s ** 3 * a[0] + 3 * s * s * t * b[0] + 3 * s * t * t * c[0] + t ** 3 * d[0];
        const nextY = s ** 3 * a[1] + 3 * s * s * t * b[1] + 3 * s * t * t * c[1] + t ** 3 * d[1];
        const dx = nextX - x;
        const dy = nextY - y;
        segments.push({ length: Math.hypot(dx, dy), direction: Math.atan2(dy, dx) });
        x = nextX;
        y = nextY;
      }
    }
    return segments;
  }

  function drawTentacle(context, shape, frameTime, side, shade) {
    const { segments } = shape;
    const phase = 2 * Math.PI * (frameTime % shape.period) / shape.period + shape.phase + side * 0.85;
    // Turn each section without stretching it. The first section keeps its root and direction.
    const directions = segments.map(({ direction }, i) => {
      const reach = i / (segments.length - 1);
      return direction + Math.sin(reach * Math.PI / 2) * shape.bend * Math.sin(phase - reach * 3.6);
    });
    const edgeA = [];
    const edgeB = [];
    const shine = [];
    let [x, y] = shape.points[0];
    for (let i = 0; i <= segments.length; i++) {
      const before = directions[Math.max(0, i - 1)];
      const after = directions[Math.min(i, segments.length - 1)];
      const direction = before + Math.atan2(Math.sin(after - before), Math.cos(after - before)) / 2;
      const radius = shape.thickness * (1 - i / segments.length);
      const nx = -Math.sin(direction) * radius;
      const ny = Math.cos(direction) * radius;
      edgeA.push([x + nx, y + ny]);
      edgeB.push([x - nx, y - ny]);
      if (i / segments.length < 0.8) shine.push([x + nx * 0.45, y + ny * 0.45]);
      if (i < segments.length) {
        x += Math.cos(after) * segments[i].length;
        y += Math.sin(after) * segments[i].length;
      }
    }

    context.beginPath();
    context.moveTo(...edgeA[0]);
    for (const point of edgeA.slice(1)) context.lineTo(...point);
    for (const point of edgeB.reverse()) context.lineTo(...point);
    context.closePath();
    context.fillStyle = shade;
    context.fill();
    context.strokeStyle = "#241a34";
    context.lineWidth = 1;
    context.stroke();

    context.beginPath();
    context.moveTo(...shine[0]);
    for (const point of shine.slice(1)) context.lineTo(...point);
    context.strokeStyle = "rgba(121, 98, 135, 0.46)";
    context.lineWidth = 1.3;
    context.stroke();
  }

  return function draw(context, body, eyes, opening, frameTime, hatchOpening = 0) {
    const livingReady = living?.every(imageReady);
    if (!imageReady(eyesImage) || (!imageReady(bodyImage) && !livingReady)) {
      return false;
    }
    const width = body.right - body.left;
    const height = body.bottom - body.top;
    context.save();
    context.translate(body.left, body.top);
    context.lineJoin = "round";
    context.lineCap = "round";
    for (const side of [0, 1]) {
      context.save();
      if (side === 1) {
        context.translate(width, 0);
        context.scale(-1, 1);
      }
      const shade = context.createLinearGradient(34, 0, -92, 0);
      shade.addColorStop(0, "#382944");
      shade.addColorStop(0.38, "#513d60");
      shade.addColorStop(0.72, "#3d2c4c");
      shade.addColorStop(1, "#483657");
      for (const shape of tentacleShapes) drawTentacle(context, shape, frameTime, side, shade);
      context.restore();
    }
    if (livingReady) {
      drawLivingBody(context, width, height, frameTime);
    } else {
      context.drawImage(bodyImage, 0, 0, width, height);
    }
    if (hatchOpening > 0) drawCrownHatch(context, hatchOpening);

    // The same two curves shade the eyelid seams and reveal the eye artwork.
    const lid = new Path2D(`M-15 1C-8 ${-3 - 14.5 * opening} 7 ${-1 - 16.5 * opening} 15 1`
      + `C7 ${-1 + 18 * opening} -8 ${-3 + 20 * opening} -15 1Z`);
    for (const [side, { bounds }] of eyes.entries()) {
      const x = (bounds.left + bounds.right) / 2 - body.left;
      const y = (bounds.top + bounds.bottom) / 2 - body.top;
      const facing = side === 0 ? 1 : -1;
      context.save();
      context.translate(x, y);
      context.scale(facing, 1);
      const shade = context.createLinearGradient(0, -15, 0, 15);
      shade.addColorStop(0, "#59446e");
      shade.addColorStop(1, "#2d203e");
      context.fillStyle = shade;
      context.fill(socket);
      if (opening > 0) {
        context.save();
        context.clip(lid);
        context.scale(facing, 1);
        context.translate(-x, -y);
        context.drawImage(eyesImage, 0, 0, width, height);
        context.restore();
      }
      context.strokeStyle = "#21152b";
      context.lineWidth = 1.4;
      context.stroke(lid);
      context.restore();
    }
    context.restore();
    return true;
  };
})();
