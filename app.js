
const root = document.documentElement;
const themeToggle = document.getElementById('theme-toggle');

function currentIsDark() {
  const attr = root.getAttribute('data-theme');
  if (attr === 'dark') return true;
  if (attr === 'light') return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function applyThemeIcon() {
  themeToggle.querySelector('svg').style.opacity = currentIsDark() ? '0.85' : '1';
}

try {
  const saved = localStorage.getItem('meridian-theme');
  if (saved === 'dark' || saved === 'light') root.setAttribute('data-theme', saved);
} catch (e) {}

applyThemeIcon();

themeToggle.addEventListener('click', () => {
  const next = currentIsDark() ? 'light' : 'dark';
  root.setAttribute('data-theme', next);
  try { localStorage.setItem('meridian-theme', next); } catch (e) {}
  applyThemeIcon();
  redrawCharts();
});
const sidebar = document.getElementById('sidebar');
const backdrop = document.getElementById('sidebar-backdrop');
const menuBtn = document.getElementById('menu-btn');

function openSidebar() {
  sidebar.classList.remove('-translate-x-full');
  backdrop.classList.remove('hidden');
}

function closeSidebar() {
  sidebar.classList.add('-translate-x-full');
  backdrop.classList.add('hidden');
}

menuBtn.addEventListener('click', openSidebar);
backdrop.addEventListener('click', closeSidebar);
const transactions = [
  { name: 'Bonnie Green', detail: 'Growth plan · Sep 12', amount: '$2,300', direction: 'in' },
  { name: 'Michael Gough', detail: 'Scale plan · Sep 11', amount: '$8,120', direction: 'in' },
  { name: 'Lana Byrd', detail: 'Starter plan · Sep 10', amount: '$430', direction: 'in' },
  { name: 'Jese Leos', detail: 'Enterprise plan · Sep 9', amount: '$14,780', direction: 'in' },
  { name: 'Thomas Lean', detail: 'Refund issued · Sep 8', amount: '$2,300', direction: 'out' },
  { name: 'Helene Engels', detail: 'Scale plan · Sep 7', amount: '$5,990', direction: 'in' },
];

function initials(name) {
  return name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase();
}

const txList = document.getElementById('tx-list');
txList.innerHTML = transactions.map(t => `
  <li class="flex items-center gap-3">
    <span class="h-9 w-9 shrink-0 rounded-full flex items-center justify-center text-xs font-semibold"
      style="background:${t.direction === 'in' ? 'var(--color-positive-soft)' : 'var(--color-negative-soft)'}; color:${t.direction === 'in' ? 'var(--color-positive)' : 'var(--color-negative)'};">
      ${initials(t.name)}
    </span>
    <span class="min-w-0 flex-1">
      <span class="block text-sm font-medium truncate">${t.name}</span>
      <span class="block text-xs truncate" style="color:var(--color-muted);">${t.detail}</span>
    </span>
    <span class="text-sm font-semibold shrink-0" style="color:${t.direction === 'in' ? 'var(--color-positive)' : 'var(--color-negative)'};">
      ${t.direction === 'in' ? '+' : '−'}${t.amount}
    </span>
  </li>
`).join('');
let revenueChart, subsChart, customersChart, churnChart, channelChart, planChart;
const days = ['01 Sep', '02 Sep', '03 Sep', '04 Sep', '05 Sep', '06 Sep', '07 Sep'];
const revenueNow = [16.8, 19.2, 18.1, 21.4, 20.6, 23.8, 25.9];
const revenuePrev = [14.1, 15.6, 17.8, 16.2, 18.9, 17.4, 19.5];

function cssVar(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

function hexToRgba(hex, alphaToken) {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alphaToken})`;
}
function sparklineOptions() {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { enabled: false } },
    scales: {
      x: { display: false },
      y: { display: false },
    },
  };
}
function fadeGradient(ctx, chartArea, color) {
  if (!chartArea) return color;
  const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
  gradient.addColorStop(0, color.replace('__ALPHA__', '0.35'));
  gradient.addColorStop(1, color.replace('__ALPHA__', '0'));
  return gradient;
}

function buildCharts() {
  const muted = cssVar('--color-muted');
  const border = cssVar('--color-border');
  const primary = cssVar('--color-primary');
  const positive = cssVar('--color-positive');
  const negative = cssVar('--color-negative');

  Chart.defaults.font.family = "'Inter', sans-serif";
  Chart.defaults.color = muted;

  // ----- Hero revenue area chart -----
  revenueChart = new Chart(document.getElementById('revenueChart'), {
    type: 'line',
    data: {
      labels: days,
      datasets: [
        {
          label: 'Revenue',
          data: revenueNow,
          borderColor: positive,
          backgroundColor: (c) => fadeGradient(c.chart.ctx, c.chart.chartArea, hexToRgba(positive, '__ALPHA__')),
          fill: true,
          tension: 0.4,
          pointRadius: 0,
          pointHoverRadius: 4,
          pointHoverBackgroundColor: positive,
          borderWidth: 2.5,
        },
        {
          label: 'Revenue (previous period)',
          data: revenuePrev,
          borderColor: primary,
          backgroundColor: (c) => fadeGradient(c.chart.ctx, c.chart.chartArea, hexToRgba(primary, '__ALPHA__')),
          fill: true,
          tension: 0.4,
          pointRadius: 0,
          pointHoverRadius: 4,
          pointHoverBackgroundColor: primary,
          borderWidth: 2.5,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: (c) => ` ${c.dataset.label}: $${c.parsed.y}k` } },
      },
      scales: {
        x: { grid: { display: false }, border: { color: border } },
        y: { grid: { color: border }, border: { display: false }, ticks: { callback: (v) => '$' + v + 'k' } },
      },
    },
  });

  // ----- Small sparkline charts -----
  subsChart = new Chart(document.getElementById('subsChart'), {
    type: 'bar',
    data: {
      labels: days,
      datasets: [{
        data: [58, 64, 61, 70, 68, 75, 80],
        backgroundColor: (c) => {
          const i = c.dataIndex;
          return i % 2 === 0 ? primary : positive;
        },
        borderRadius: 3,
        maxBarThickness: 14,
      }],
    },
    options: sparklineOptions(),
  });

  customersChart = new Chart(document.getElementById('customersChart'), {
    type: 'line',
    data: {
      labels: days,
      datasets: [{
        data: [9, 14, 11, 18, 15, 21, 19],
        borderColor: positive,
        backgroundColor: (c) => fadeGradient(c.chart.ctx, c.chart.chartArea, hexToRgba(positive, '__ALPHA__')),
        fill: true,
        tension: 0.45,
        pointRadius: 0,
        borderWidth: 2.5,
      }],
    },
    options: sparklineOptions(),
  });

  churnChart = new Chart(document.getElementById('churnChart'), {
    type: 'bar',
    data: {
      labels: days,
      datasets: [{
        data: [2.4, 2.1, 2.2, 1.9, 2.0, 1.7, 1.8],
        backgroundColor: (c) => {
          const i = c.dataIndex;
          return i === c.dataset.data.length - 2 ? border : positive;
        },
        borderRadius: 3,
        maxBarThickness: 14,
      }],
    },
    options: sparklineOptions(),
  });

  channelChart = new Chart(document.getElementById('channelChart'), {
    type: 'doughnut',
    data: {
      labels: ['Direct', 'Partner', 'Marketplace', 'Referral'],
      datasets: [{
        data: [46, 27, 18, 9],
        backgroundColor: ['#2A3ED1', '#6C7CFF', positive, border],
        borderColor: cssVar('--color-surface'),
        borderWidth: 2,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '70%',
      plugins: { legend: { display: false } },
    },
  });

  planChart = new Chart(document.getElementById('planChart'), {
    type: 'bar',
    data: {
      labels: ['Starter', 'Growth', 'Scale', 'Enterprise'],
      datasets: [{
        data: [64, 132, 78, 38],
        backgroundColor: primary,
        borderRadius: 6,
        maxBarThickness: 38,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: (c) => ' ' + c.parsed.y + ' signups' } },
      },
      scales: {
        x: { grid: { display: false }, border: { color: border } },
        y: { grid: { color: border }, border: { display: false }, ticks: { stepSize: 40 } },
      },
    },
  });
}

function redrawCharts() {
  if (!window.Chart) return;
  [revenueChart, subsChart, customersChart, churnChart, channelChart, planChart].forEach(c => c && c.destroy());
  buildCharts();
}

function init() {
  if (window.Chart) {
    buildCharts();
    return;
  }
  window.addEventListener('load', () => {
    if (window.Chart) {
      buildCharts();
    } else {
      console.error('Meridian dashboard: Chart.js did not load. Make sure chart.umd.js sits in the same folder as index.html.');
      document.querySelectorAll('canvas[role="img"]').forEach((canvas) => {
        const notice = document.createElement('p');
        notice.textContent = 'Chart unavailable — chart.umd.js failed to load.';
        notice.className = 'text-xs';
        notice.style.color = 'var(--color-negative)';
        canvas.replaceWith(notice);
      });
    }
  });
}

init();