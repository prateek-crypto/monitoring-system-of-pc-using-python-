// ── Config ──────────────────────────────────────────
const REFRESH_MS = 2000;
const SPARK_MAX  = 60; // points

// ── State ────────────────────────────────────────────
const cpuHistory = [];
const ramHistory = [];

// ── Sparkline class ──────────────────────────────────
class Sparkline {
  constructor(canvas, color, glowColor) {
    this.canvas    = canvas;
    this.ctx       = canvas.getContext('2d');
    this.color     = color;
    this.glowColor = glowColor;
    this.data      = [];
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    const rect = this.canvas.parentElement.getBoundingClientRect();
    this.canvas.width  = rect.width || 260;
    this.canvas.height = 40;
    this.draw();
  }

  push(val) {
    this.data.push(val);
    if (this.data.length > SPARK_MAX) this.data.shift();
    this.draw();
  }

  draw() {
    const { ctx, canvas, data, color, glowColor } = this;
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);
    if (data.length < 2) return;

    const step = W / (SPARK_MAX - 1);
    const points = data.map((v, i) => ({
      x: (SPARK_MAX - data.length + i) * step,
      y: H - (v / 100) * (H - 4) - 2
    }));

    // Glow
    ctx.save();
    ctx.shadowColor = glowColor;
    ctx.shadowBlur  = 8;

    // Area fill
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, color + '44');
    grad.addColorStop(1, color + '00');
    ctx.beginPath();
    ctx.moveTo(points[0].x, H);
    points.forEach(p => ctx.lineTo(p.x, p.y));
    ctx.lineTo(points[points.length - 1].x, H);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    // Line
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    points.forEach(p => ctx.lineTo(p.x, p.y));
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();
  }
}

// ── Gauge helper ─────────────────────────────────────
// Arc path from 20,100 to 180,100 (r=80, half-circle)
// Total arc length ≈ π * 80 ≈ 251.3
const ARC_LEN = Math.PI * 80;

function setGauge(arcId, valId, pct, warnThreshold = 85, critThreshold = 95) {
  const arc = document.getElementById(arcId);
  const val = document.getElementById(valId);
  if (!arc || !val) return;

  const fill = (pct / 100) * ARC_LEN;
  arc.setAttribute('stroke-dasharray', `${fill} ${ARC_LEN}`);

  // Color
  let color = '#00e5a0';
  if (arcId === 'ram-arc') color = '#4090e0';
  if (pct >= critThreshold) color = '#ff4040';
  else if (pct >= warnThreshold) color = '#e0a030';
  arc.style.stroke = color;
  arc.style.filter = `drop-shadow(0 0 6px ${color}80)`;

  val.textContent = pct.toFixed(1) + '%';
}

// ── Clock ────────────────────────────────────────────
function updateClock() {
  const now = new Date();
  const pad = n => String(n).padStart(2, '0');
  document.getElementById('clock').textContent =
    `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
  document.getElementById('date').textContent =
    now.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }).toUpperCase();
}
setInterval(updateClock, 1000);
updateClock();

// ── Uptime ───────────────────────────────────────────
const startTime = Date.now();
function updateUptime() {
  const elapsed = Math.floor((Date.now() - startTime) / 1000);
  const h = Math.floor(elapsed / 3600);
  const m = Math.floor((elapsed % 3600) / 60);
  const s = elapsed % 60;
  const pad = n => String(n).padStart(2, '0');
  const el = document.getElementById('uptime');
  if (el) el.textContent = `${pad(h)}:${pad(m)}:${pad(s)}`;
}
setInterval(updateUptime, 1000);

// ── GPU renderer ─────────────────────────────────────
function renderGPUs(gpus) {
  const grid = document.getElementById('gpu-grid');
  if (!grid) return;

  if (!gpus || gpus.length === 0) {
    grid.innerHTML = '<div class="no-gpu-msg">No GPU detected</div>';
    return;
  }

  grid.innerHTML = gpus.map((gpu, i) => {
    const loadPct  = gpu.load.toFixed(1);
    const memPct   = gpu.mem_total ? ((gpu.mem_used / gpu.mem_total) * 100).toFixed(1) : 0;
    return `
    <div class="gpu-card" style="animation-delay:${i * 0.06}s">
      <div class="gpu-name">${gpu.name}</div>
      <div class="gpu-metrics">
        <div>
          <div class="gpu-metric-label">LOAD</div>
          <div class="gpu-metric-val">${loadPct}<span style="font-size:0.55em;font-weight:400">%</span></div>
        </div>
        <div>
          <div class="gpu-metric-label">TEMP</div>
          <div class="gpu-metric-val">${gpu.temp}<span style="font-size:0.55em;font-weight:400">°C</span></div>
        </div>
        <div>
          <div class="gpu-metric-label">VRAM USED</div>
          <div class="gpu-metric-val">${gpu.mem_used}</div>
          <div class="gpu-metric-sub">MB</div>
        </div>
        <div>
          <div class="gpu-metric-label">VRAM TOTAL</div>
          <div class="gpu-metric-val">${gpu.mem_total}</div>
          <div class="gpu-metric-sub">MB</div>
        </div>
      </div>
      <div class="gpu-bar-row">
        <div class="gpu-bar-label">
          <span>GPU LOAD</span><span>${loadPct}%</span>
        </div>
        <div class="gpu-bar">
          <div class="gpu-bar-fill" style="width:${loadPct}%"></div>
        </div>
        <div class="gpu-bar-label">
          <span>VRAM</span><span>${memPct}%</span>
        </div>
        <div class="gpu-bar">
          <div class="gpu-bar-fill gpu-bar-fill--mem" style="width:${memPct}%"></div>
        </div>
      </div>
    </div>`;
  }).join('');
}

// ── Refresh static ───────────────────────────────────
async function refreshStatic() {
  const btn = document.querySelector('.refresh-btn');
  btn.textContent = '↻ REFRESHING...';
  btn.disabled = true;
  try {
    const res = await fetch('/api/static/refresh');
    const data = await res.json();
    document.querySelector('.stat-val:nth-of-type(1)'); // just re-fetch page
    btn.textContent = '✓ REFRESHED';
    setTimeout(() => {
      btn.textContent = '↺ REFRESH STATIC';
      btn.disabled = false;
    }, 2000);
  } catch (e) {
    btn.textContent = '✗ FAILED';
    btn.disabled = false;
  }
}

// ── Main poll loop ────────────────────────────────────
const cpuSpark = new Sparkline(
  document.getElementById('cpu-spark'),
  '#00e5a0',
  '#00e5a0'
);
const ramSpark = new Sparkline(
  document.getElementById('ram-spark'),
  '#4090e0',
  '#4090e0'
);

async function fetchDynamic() {
  try {
    const res  = await fetch('/api/dynamic');
    const data = await res.json();

    setGauge('cpu-arc', 'cpu-val', data.cpu_usage);
    setGauge('ram-arc', 'ram-val', data.ram_usage);

    cpuSpark.push(data.cpu_usage);
    ramSpark.push(data.ram_usage);

    renderGPUs(data.gpus);
  } catch (e) {
    console.warn('Fetch failed:', e);
  }
}

// Kick off
fetchDynamic();
setInterval(fetchDynamic, REFRESH_MS);
