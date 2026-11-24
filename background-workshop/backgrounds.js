"use strict";

const backgroundScenes = (() => {
  function randomSequence(seed) {
    return () => {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      return seed / 4294967296;
    };
  }

  function glow(ctx, x, y, radius, color) {
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(0, color);
    gradient.addColorStop(1, "transparent");
    ctx.fillStyle = gradient;
    ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
  }

  function disk(ctx, x, y, radius, shades, detail) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.clip();
    const surface = ctx.createRadialGradient(
      x - radius * 0.5, y - radius * 0.42, radius * 0.03,
      x + radius * 0.17, y + radius * 0.16, radius * 1.18,
    );
    shades.forEach((shade, index) => surface.addColorStop(index / (shades.length - 1), shade));
    ctx.fillStyle = surface;
    ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
    detail();
    ctx.restore();
  }

  function gasGiant(ctx) {
    const x = 744;
    const y = 512;
    const radius = 153;
    glow(ctx, x - 28, y - 24, radius * 1.25, "#306c8538");
    disk(ctx, x, y, radius, ["#234056", "#182d41", "#0d1c2e", "#0a1421"], () => {
      ctx.translate(x, y);
      ctx.rotate(-0.28);
      const random = randomSequence(274);
      for (let index = 0; index < 25; index += 1) {
        const offset = -121 + index * 9;
        const ink = ctx.createLinearGradient(-151, 0, 153, 0);
        ink.addColorStop(0, "#80b8cf00");
        ink.addColorStop(0.28, index % 3 === 0 ? "#548fa325" : "#79adc514");
        ink.addColorStop(1, "#80b8cf00");
        ctx.strokeStyle = ink;
        ctx.lineWidth = 2 + random() * 5;
        ctx.beginPath();
        ctx.moveTo(-157, offset - 10);
        ctx.bezierCurveTo(-79, offset + 12, 58, offset + 17, 155, offset - 8);
        ctx.stroke();
      }
      glow(ctx, -71, -87, 80, "#92cdec13");
    });
    ctx.strokeStyle = "#75abc043";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(x, y, radius - 0.75, Math.PI * 0.93, Math.PI * 1.69);
    ctx.stroke();
  }

  function moon(ctx) {
    const x = 681;
    const y = 128;
    const radius = 88;
    disk(ctx, x, y, radius, ["#2b3b4b", "#202d3b", "#141e2c", "#0a1421"], () => {
      const craters = [[-43, -34, 14], [-12, -56, 10], [-39, 22, 19], [19, -25, 15],
        [-7, 1, 9], [22, 27, 12], [-20, 55, 8], [53, -8, 8], [39, -45, 5], [-63, -1, 7]];
      for (const [dx, dy, size] of craters) {
        const craterX = x + dx;
        const craterY = y + dy;
        glow(ctx, craterX + 1, craterY + 2, size * 1.15, "#09132066");
        ctx.beginPath();
        ctx.ellipse(craterX, craterY, size, size * 0.74, -0.27, Math.PI * 0.04, Math.PI * 0.84);
        ctx.strokeStyle = "#70879a2b";
        ctx.lineWidth = 1.15;
        ctx.stroke();
      }
    });
  }

  function sun(ctx) {
    const x = 76;
    const y = 500;
    const radius = 103;
    glow(ctx, x + 12, y - 14, radius * 1.62, "#65453a50");
    disk(ctx, x, y, radius, ["#513629", "#3d2a25", "#291e21", "#1b1820"], () => {
      const random = randomSequence(495);
      for (let index = 0; index < 31; index += 1) {
        const dx = random() * 196 - 98;
        const dy = random() * 196 - 98;
        glow(ctx, x + dx, y + dy, 10 + random() * 22, "#b6734230");
      }
    });
    ctx.beginPath();
    ctx.arc(x, y, radius - 0.7, Math.PI * 1.07, Math.PI * 1.93);
    ctx.lineWidth = 1.25;
    ctx.strokeStyle = "#ad765651";
    ctx.stroke();
  }

  function gridNoise(x, y, seed) {
    const left = Math.floor(x);
    const top = Math.floor(y);
    function sample(col, row) {
      let value = Math.imul(col, 374761393) + Math.imul(row, 668265263) + seed;
      value = Math.imul(value ^ (value >>> 13), 1274126177);
      return ((value ^ (value >>> 16)) >>> 0) / 4294967296;
    }
    function smooth(value) {
      return value * value * (3 - 2 * value);
    }
    const u = smooth(x - left);
    const v = smooth(y - top);
    const upper = sample(left, top) * (1 - u) + sample(left + 1, top) * u;
    const lower = sample(left, top + 1) * (1 - u) + sample(left + 1, top + 1) * u;
    return upper * (1 - v) + lower * v;
  }

  function nebula(ctx, cloud) {
    const texture = document.createElement("canvas");
    texture.width = 200;
    texture.height = 150;
    const painter = texture.getContext("2d");
    const pixels = painter.createImageData(texture.width, texture.height);
    const cosine = Math.cos(cloud.angle);
    const sine = Math.sin(cloud.angle);
    for (let row = 0; row < texture.height; row += 1) {
      for (let col = 0; col < texture.width; col += 1) {
        const x = col * 4 - cloud.x;
        const y = row * 4 - cloud.y;
        const a = (x * cosine + y * sine) / cloud.length;
        const b = (y * cosine - x * sine) / cloud.width;
        const bend = (gridNoise(col / 35, row / 28, cloud.seed + 48) - 0.5) * 0.72;
        const edge = Math.exp(-(a ** 2 + (b + bend) ** 2));
        const grain = gridNoise(col / 18, row / 10, cloud.seed) * 0.68
          + gridNoise(col / 7, row / 4, cloud.seed + 1) * 0.23
          + gridNoise(col / 3, row / 2, cloud.seed + 2) * 0.09;
        const offset = (row * texture.width + col) * 4;
        const opacity = edge * Math.max(0, grain - 0.24) ** 1.45 * cloud.opacity;
        pixels.data.set(cloud.color, offset);
        pixels.data[offset + 3] = opacity * 255;
      }
    }
    painter.putImageData(pixels, 0, 0);
    ctx.drawImage(texture, 0, 0, ctx.canvas.width, ctx.canvas.height);
  }

  const scenes = {
    menu: {
      title: "Blue orbit",
      description: "A cropped, banded gas giant and a soft blue haze frame the menu.",
      seed: 88,
      color: [189, 218, 240],
      stars: 69,
      paint(ctx) {
        glow(ctx, 143, 105, 365, "#2338525e");
        gasGiant(ctx);
      },
    },
    level1: {
      title: "Cratered moon",
      description: "A slate moon above the right flank leaves the opening formation and barriers in dark space.",
      seed: 104,
      color: [186, 214, 229],
      stars: 74,
      paint(ctx) {
        glow(ctx, 669, 121, 333, "#1b2f4959");
        moon(ctx);
      },
    },
    level2: {
      title: "Amber sun",
      description: "A dim sun casts a warm glow along the lower-left edge while the flight lanes stay dark.",
      seed: 239,
      color: [221, 203, 181],
      stars: 66,
      paint(ctx) {
        glow(ctx, 64, 506, 396, "#50302759");
        sun(ctx);
      },
    },
    level3: {
      title: "Violet nebula",
      description: "A faint diagonal nebula crosses the field, with dark space for Rift and its shots.",
      seed: 312,
      color: [197, 182, 216],
      stars: 73,
      paint(ctx) {
        glow(ctx, 626, 139, 362, "#33274570");
        nebula(ctx, { x: 380, y: 324, angle: -0.52, length: 350, width: 65,
          seed: 58, color: [100, 63, 127], opacity: 0.73 });
        nebula(ctx, { x: 544, y: 211, angle: -0.45, length: 242, width: 73,
          seed: 87, color: [76, 58, 113], opacity: 0.51 });
      },
    },
    credits: {
      title: "Quiet horizon",
      description: "Cool teal haze stays along the lower corners, away from the center of the credits crawl.",
      seed: 683,
      color: [179, 219, 225],
      stars: 57,
      paint(ctx) {
        glow(ctx, 132, 571, 308, "#22444b65");
        glow(ctx, 753, 480, 291, "#24445462");
        nebula(ctx, { x: 102, y: 565, angle: -0.29, length: 190, width: 50,
          seed: 934, color: [58, 110, 115], opacity: 0.6 });
        nebula(ctx, { x: 748, y: 489, angle: 0.5, length: 148, width: 46,
          seed: 527, color: [56, 119, 134], opacity: 0.58 });
      },
    },
  };

  function makeLayer(metadata, width, height) {
    const layer = document.createElement("canvas");
    layer.width = width;
    layer.height = height;
    const ctx = layer.getContext("2d");
    ctx.fillStyle = "#07111f";
    ctx.fillRect(0, 0, width, height);

    const random = randomSequence(metadata.seed);
    const stars = [];
    for (let index = 0; index < metadata.stars; index += 1) {
      const x = 3 + random() * (width - 6);
      const y = 3 + random() * (height - 6);
      const dimCenter = metadata === scenes.credits && Math.abs(x - width / 2) < 146;
      const alpha = (0.11 + random() * 0.27) * (dimCenter ? 0.44 : 1);
      const twinkles = index % 12 === 0 && !dimCenter;
      const radius = twinkles ? 1.05 : 0.35 + random() * 0.43;
      if (twinkles) {
        stars.push({ x, y, alpha, radius, phase: random() * Math.PI * 2, period: 5 + random() * 4 });
      } else {
        drawStar(ctx, metadata.color, x, y, radius, alpha);
      }
    }
    // Paint celestial objects over the star layer so their discs obscure distant stars.
    const painted = document.createElement("canvas");
    painted.width = width;
    painted.height = height;
    const detailContext = painted.getContext("2d");
    metadata.paint(detailContext);
    return { layer, painted, stars };
  }

  function drawStar(ctx, color, x, y, radius, alpha) {
    ctx.fillStyle = `rgba(${color.join(",")},${alpha})`;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  function draw(ctx, metadata, background, time) {
    ctx.drawImage(background.layer, 0, 0);
    for (const star of background.stars) {
      const alpha = star.alpha * (1 + Math.sin(time * Math.PI * 2 / star.period + star.phase) * 0.28);
      drawStar(ctx, metadata.color, star.x, star.y, star.radius, alpha);
    }
    ctx.drawImage(background.painted, 0, 0);
  }

  return { scenes, makeLayer, draw };
})();
