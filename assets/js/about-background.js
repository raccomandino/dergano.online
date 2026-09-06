/*
 * Statute & Council background for the ".about" section.
 * Columns, a legislative network graph, drifting document motes and a
 * cursor-reactive set of scales — scoped to the section (not the viewport)
 * so it acts as a section background and stays responsive on all sizes,
 * including touch devices.
 */
(function () {
  var canvas = document.getElementById('about-bg-canvas');
  if (!canvas) return;
  var section = canvas.closest('.about') || canvas.parentNode;
  var ctx = canvas.getContext('2d');
  if (!ctx) return;

  var W = 0, H = 0, DPR = 1;
  var reduceMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- Mouse / touch state (section-relative) ----------
  var mouse = { x: -9999, y: -9999, active: false, targetX: -9999, targetY: -9999 };

  function pointerMove(clientX, clientY) {
    var rect = section.getBoundingClientRect();
    var x = clientX - rect.left;
    var y = clientY - rect.top;
    if (x >= 0 && x <= rect.width && y >= 0 && y <= rect.height) {
      mouse.targetX = x;
      mouse.targetY = y;
      mouse.active = true;
    } else {
      mouse.active = false;
    }
  }

  window.addEventListener('mousemove', function (e) {
    pointerMove(e.clientX, e.clientY);
  });
  window.addEventListener('mouseout', function () { mouse.active = false; });
  window.addEventListener('touchmove', function (e) {
    if (e.touches && e.touches[0]) {
      pointerMove(e.touches[0].clientX, e.touches[0].clientY);
    }
  }, { passive: true });
  window.addEventListener('touchend', function () { mouse.active = false; });

  // ---------- Columns ----------
  var columns = [];
  function buildColumns() {
    columns = [];
    var count = Math.max(4, Math.floor(W / 220));
    var baseW = W / count;
    for (var i = 0; i < count; i++) {
      var cx = baseW * i + baseW / 2;
      var width = baseW * 0.34;
      var height = H * (0.34 + (i % 3) * 0.045);
      columns.push({ cx: cx, width: width, height: height, depth: 0.5 + (i % 3) * 0.15 });
    }
  }

  function drawColumns(parallaxX) {
    ctx.save();
    for (var k = 0; k < columns.length; k++) {
      var c = columns[k];
      var x = c.cx + parallaxX * c.depth;
      var topY = H - c.height;
      ctx.fillStyle = 'rgba(20, 29, 44, 0.9)';
      ctx.fillRect(x - c.width / 2, topY, c.width, c.height);
      ctx.strokeStyle = 'rgba(60, 74, 95, 0.35)';
      ctx.lineWidth = 1;
      var flutes = 5;
      for (var f = 1; f < flutes; f++) {
        var fx = x - c.width / 2 + (c.width / flutes) * f;
        ctx.beginPath();
        ctx.moveTo(fx, topY + 8);
        ctx.lineTo(fx, H - 6);
        ctx.stroke();
      }
      ctx.fillStyle = 'rgba(28, 40, 58, 0.95)';
      ctx.fillRect(x - c.width / 2 - 8, topY - 10, c.width + 16, 12);
      ctx.fillRect(x - c.width / 2 - 10, H - 14, c.width + 20, 14);
    }
    ctx.restore();
  }

  // ---------- Network nodes ----------
  var nodes = [];
  function buildNodes() {
    var area = W * H;
    var count = Math.min(90, Math.max(38, Math.floor(area / 16000)));
    nodes = [];
    for (var i = 0; i < count; i++) {
      nodes.push({
        x: Math.random() * W,
        y: Math.random() * H * 0.78,
        vx: (Math.random() - 0.5) * 0.15,
        vy: (Math.random() - 0.5) * 0.15,
        r: 1.2 + Math.random() * 1.6,
        pulse: Math.random() * Math.PI * 2
      });
    }
  }

  var LINK_DIST = 130;
  var CURSOR_LINK_DIST = 190;
  var CURSOR_FIELD = 170;

  function updateNodes(dt) {
    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i];
      n.x += n.vx * dt;
      n.y += n.vy * dt;
      n.pulse += dt * 0.001;

      if (mouse.active) {
        var dx = mouse.x - n.x;
        var dy = mouse.y - n.y;
        var dist = Math.sqrt(dx * dx + dy * dy) || 1;
        if (dist < CURSOR_FIELD) {
          var force = (1 - dist / CURSOR_FIELD) * 0.028;
          n.vx += (-dy / dist) * force + (dx / dist) * force * 0.25;
          n.vy += (dx / dist) * force + (dy / dist) * force * 0.25;
        }
      }

      n.vx *= 0.985;
      n.vy *= 0.985;

      if (n.x < -20) n.x = W + 20;
      if (n.x > W + 20) n.x = -20;
      if (n.y < -20) n.y = H * 0.78 + 20;
      if (n.y > H * 0.78 + 20) n.y = -20;
    }
  }

  function drawNetwork() {
    ctx.lineWidth = 1;
    for (var i = 0; i < nodes.length; i++) {
      for (var j = i + 1; j < nodes.length; j++) {
        var a = nodes[i], b = nodes[j];
        var dx = a.x - b.x, dy = a.y - b.y;
        var dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < LINK_DIST) {
          var alpha = (1 - dist / LINK_DIST) * 0.16;
          ctx.strokeStyle = 'rgba(184, 148, 79, ' + alpha + ')';
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    if (mouse.active) {
      for (var m = 0; m < nodes.length; m++) {
        var nn = nodes[m];
        var ddx = mouse.x - nn.x, ddy = mouse.y - nn.y;
        var d2 = Math.sqrt(ddx * ddx + ddy * ddy);
        if (d2 < CURSOR_LINK_DIST) {
          var al = (1 - d2 / CURSOR_LINK_DIST) * 0.5;
          ctx.strokeStyle = 'rgba(215, 180, 120, ' + al + ')';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(mouse.x, mouse.y);
          ctx.lineTo(nn.x, nn.y);
          ctx.stroke();
        }
      }
    }

    for (var p = 0; p < nodes.length; p++) {
      var node = nodes[p];
      var glow = 0.55 + Math.sin(node.pulse) * 0.25;
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(236, 231, 218, ' + (glow * 0.65) + ')';
      ctx.fill();
    }

    if (mouse.active) {
      ctx.beginPath();
      ctx.arc(mouse.x, mouse.y, 3, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(215, 180, 120, 0.9)';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(mouse.x, mouse.y, 9, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(215, 180, 120, 0.35)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }

  // ---------- Scales of justice ----------
  var scaleTilt = 0;
  function drawScales(cx, cy, tilt, scale) {
    var armLen = 92;
    var postH = 130;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(scale || 1, scale || 1);

    ctx.strokeStyle = 'rgba(184, 148, 79, 0.55)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(0, -postH * 0.5);
    ctx.lineTo(0, postH * 0.5);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(-26, postH * 0.5);
    ctx.lineTo(26, postH * 0.5);
    ctx.stroke();

    var beamY = -postH * 0.5;
    ctx.save();
    ctx.translate(0, beamY);
    ctx.rotate(tilt);

    ctx.beginPath();
    ctx.moveTo(-armLen, 0);
    ctx.lineTo(armLen, 0);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(-6, -10);
    ctx.lineTo(6, -10);
    ctx.lineTo(0, 0);
    ctx.closePath();
    ctx.fillStyle = 'rgba(184, 148, 79, 0.55)';
    ctx.fill();

    var leftDrop = 30 + Math.max(0, tilt) * 40;
    ctx.beginPath();
    ctx.moveTo(-armLen, 0);
    ctx.lineTo(-armLen, leftDrop);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(-armLen, leftDrop + 4, 14, 0, Math.PI, false);
    ctx.strokeStyle = 'rgba(215, 180, 120, 0.7)';
    ctx.stroke();

    var rightDrop = 30 + Math.max(0, -tilt) * 40;
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(184, 148, 79, 0.55)';
    ctx.moveTo(armLen, 0);
    ctx.lineTo(armLen, rightDrop);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(armLen, rightDrop + 4, 14, 0, Math.PI, false);
    ctx.strokeStyle = 'rgba(215, 180, 120, 0.7)';
    ctx.stroke();

    ctx.restore();
    ctx.restore();
  }

  // ---------- Drifting document motes ----------
  var motes = [];
  function buildMotes() {
    motes = [];
    var count = Math.floor((W * H) / 90000);
    for (var i = 0; i < count; i++) {
      motes.push({
        x: Math.random() * W,
        y: Math.random() * H + H * 0.2,
        w: 4 + Math.random() * 5,
        speed: 0.06 + Math.random() * 0.12,
        drift: (Math.random() - 0.5) * 0.08,
        rot: Math.random() * Math.PI,
        rotSpeed: (Math.random() - 0.5) * 0.0006,
        alpha: 0.08 + Math.random() * 0.12
      });
    }
  }

  function updateMotes(dt) {
    for (var i = 0; i < motes.length; i++) {
      var m = motes[i];
      m.y -= m.speed * dt * 0.06;
      m.x += m.drift * dt * 0.06;
      m.rot += m.rotSpeed * dt;
      if (m.y < -20) {
        m.y = H + 20;
        m.x = Math.random() * W;
      }
    }
  }

  function drawMotes() {
    for (var i = 0; i < motes.length; i++) {
      var m = motes[i];
      ctx.save();
      ctx.translate(m.x, m.y);
      ctx.rotate(m.rot);
      ctx.fillStyle = 'rgba(236, 231, 218, ' + m.alpha + ')';
      ctx.fillRect(-m.w / 2, -m.w * 0.7, m.w, m.w * 1.4);
      ctx.restore();
    }
  }

  // ---------- Vignette + grain (baked onto the canvas, matching the
  // original CSS overlays, so no DOM element carries a background-image) ----
  function drawVignette() {
    // Approximates radial-gradient(ellipse 120% 90% at 50% 40%,
    // transparent 40%, rgba(6,9,15,0.55) 100%).
    var cx = W * 0.5, cy = H * 0.4;
    var r = Math.max(W, H) * 0.75;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(1.2, 0.9);
    var g = ctx.createRadialGradient(0, 0, r * 0.4, 0, 0, r);
    g.addColorStop(0, 'rgba(6, 9, 15, 0)');
    g.addColorStop(1, 'rgba(6, 9, 15, 0.55)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  var grainPattern = null;
  function buildGrain() {
    var size = 120;
    var off = document.createElement('canvas');
    off.width = size;
    off.height = size;
    var octx = off.getContext('2d');
    var imgData = octx.createImageData(size, size);
    var d = imgData.data;
    for (var i = 0; i < d.length; i += 4) {
      var v = (Math.random() * 255) | 0;
      d[i] = d[i + 1] = d[i + 2] = v;
      d[i + 3] = 255;
    }
    octx.putImageData(imgData, 0, 0);
    grainPattern = ctx.createPattern(off, 'repeat');
  }

  function drawGrain() {
    if (!grainPattern) return;
    ctx.save();
    ctx.globalAlpha = 0.05;
    ctx.fillStyle = grainPattern;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
  }

  // Place the balance in the empty ".alwayson" band between the two text
  // blocks so it never sits under a paragraph, and shrink it on narrow
  // screens. Recomputed on every resize (text reflow changes the band's
  // position within the section).
  var scalesCenterY = 0;
  var scalesScale = 1;
  function computeScalesLayout() {
    scalesScale = Math.max(0.6, Math.min(1, W / 520));
    var band = section.querySelector('.alwayson');
    if (band && band.getClientRects().length) {
      var sr = section.getBoundingClientRect();
      var br = band.getBoundingClientRect();
      scalesCenterY = (br.top - sr.top) + br.height / 2;
    } else {
      scalesCenterY = H * 0.40;
    }
  }

  // ---------- Sizing ----------
  function resize() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = section.clientWidth;
    H = section.clientHeight;
    if (W === 0 || H === 0) return;
    canvas.width = W * DPR;
    canvas.height = H * DPR;
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    buildColumns();
    buildNodes();
    buildMotes();
    buildGrain();
    computeScalesLayout();
  }

  // ---------- Main loop (paused when the section is off-screen) ----------
  var last = performance.now();
  var running = false;
  var visible = true;
  var rafId = null;

  function frame(now) {
    if (!running) return;
    var dt = now - last;
    last = now;
    if (dt > 50) dt = 50;

    if (W === 0 || H === 0) { resize(); }

    mouse.x += (mouse.targetX - mouse.x) * 0.12;
    mouse.y += (mouse.targetY - mouse.y) * 0.12;

    ctx.clearRect(0, 0, W, H);

    var grad = ctx.createRadialGradient(W * 0.5, H * 0.35, 0, W * 0.5, H * 0.35, Math.max(W, H) * 0.75);
    grad.addColorStop(0, '#141d2c');
    grad.addColorStop(1, '#0a0f18');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    var parallaxX = mouse.active ? -(mouse.x - W / 2) * 0.01 : 0;

    if (!reduceMotion) {
      updateNodes(dt);
      updateMotes(dt);
    }

    drawColumns(parallaxX);
    drawMotes();
    drawNetwork();

    var targetTilt = mouse.active
      ? Math.max(-0.38, Math.min(0.38, (mouse.x - W / 2) / (W / 2) * 0.38))
      : 0;
    scaleTilt += (targetTilt - scaleTilt) * (reduceMotion ? 1 : 0.06);
    drawScales(W / 2, scalesCenterY, scaleTilt, scalesScale);

    drawVignette();
    drawGrain();

    rafId = requestAnimationFrame(frame);
  }

  function start() {
    if (running || !visible) return;
    running = true;
    last = performance.now();
    rafId = requestAnimationFrame(frame);
  }

  function stop() {
    running = false;
    if (rafId) cancelAnimationFrame(rafId);
    rafId = null;
  }

  // Rebuild on any size change (viewport resize, breakpoint reflow, .alwayson
  // hiding on mobile all change the section height).
  if (typeof ResizeObserver !== 'undefined') {
    var ro = new ResizeObserver(function () { resize(); });
    ro.observe(section);
  } else {
    window.addEventListener('resize', resize);
  }

  // Only animate while the section is on screen.
  if (typeof IntersectionObserver !== 'undefined') {
    var io = new IntersectionObserver(function (entries) {
      visible = entries[0].isIntersecting;
      if (visible) start(); else stop();
    }, { threshold: 0 });
    io.observe(section);
  }

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) stop();
    else if (visible) start();
  });

  resize();
  start();
})();
