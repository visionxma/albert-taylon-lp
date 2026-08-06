/* ═══════════════════════════════════════════
   TAYLON — interações da LP
   ═══════════════════════════════════════════ */

/* ─────────── Ticker de cotações ───────────
   ATENÇÃO: valores ILUSTRATIVOS (estáticos).
   Para cotação real, trocar por uma API (ex.: Twelve Data, Finnhub)
   ou remover o ticker. Não deixar número falso como se fosse live. */
const PAIRS = [
  { pair: 'EUR/USD', price: '1.0864', chg: '+0.12%', spark: [5, 4, 6, 5, 7, 6, 8, 7, 9, 10] },
  { pair: 'GBP/USD', price: '1.2731', chg: '-0.08%', spark: [9, 10, 8, 9, 7, 8, 6, 5, 6, 4] },
  { pair: 'USD/JPY', price: '151.42', chg: '+0.31%', spark: [4, 5, 4, 6, 8, 7, 9, 8, 10, 12] },
  { pair: 'AUD/USD', price: '0.6598', chg: '-0.19%', spark: [10, 9, 11, 8, 9, 7, 8, 6, 7, 5] },
  { pair: 'USD/CAD', price: '1.3572', chg: '+0.05%', spark: [6, 5, 7, 6, 8, 7, 8, 9, 8, 10] },
  { pair: 'BTC/USD', price: '68.412', chg: '+1.74%', spark: [3, 5, 4, 7, 6, 9, 8, 11, 12, 14] },
  { pair: 'ETH/USD', price: '3.298',  chg: '-0.62%', spark: [11, 12, 10, 11, 9, 10, 8, 9, 7, 6] },
];

const SPARK_W = 44;
const SPARK_H = 14;

function sparkPath(values) {
  const min = Math.min(...values);
  const span = Math.max(...values) - min || 1;
  return values.map((v, i) => {
    const x = (i / (values.length - 1)) * SPARK_W;
    const y = SPARK_H - ((v - min) / span) * SPARK_H;
    return `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join(' ');
}

const track = document.getElementById('tickerTrack');
if (track) {
  const row = PAIRS.map(({ pair, price, chg, spark }) => {
    const dir = chg.startsWith('+') ? 'up' : 'down';
    return `<span class="tick">
      <span class="tick__pair">${pair}</span>
      <span class="tick__price">${price}</span>
      <svg class="tick__spark ${dir}" viewBox="0 0 ${SPARK_W} ${SPARK_H}" aria-hidden="true">
        <path d="${sparkPath(spark)}"/>
      </svg>
      <span class="tick__chg ${dir}">${chg}</span>
    </span>`;
  }).join('');

  // duplicado para o loop infinito emendar sem salto
  track.innerHTML = row + row;
}

/* ─────────── Candlesticks de fundo ───────────
   Série determinística (hash por seno em vez de Math.random) para o desenho
   não mudar a cada carregamento e não brigar com o cache visual da página. */
function hash(i, seed) {
  const v = Math.sin(i * 12.9898 + seed * 78.233) * 43758.5453;
  return v - Math.floor(v);
}

function buildCandles(el, seed) {
  const W = 1400, H = 320, n = 36;
  const step = W / n;
  let y = H * 0.68;
  let out = '';

  for (let i = 0; i < n; i++) {
    const a = hash(i, seed);
    const b = hash(i + 100, seed);
    const up = a > 0.44;                 // sobe = y diminui
    const body = 10 + b * 34;
    const wick = 6 + a * 20;

    const open = y;
    let close = up ? y - body : y + body;
    close = Math.min(Math.max(close, H * 0.16), H * 0.88);   // segura na moldura
    y = close;

    const top = Math.min(open, close);
    const bot = Math.max(open, close);
    const x = i * step + step / 2;
    const cls = up ? 'up' : 'down';

    out += `<line class="${cls}" x1="${x.toFixed(1)}" y1="${(top - wick).toFixed(1)}" x2="${x.toFixed(1)}" y2="${(bot + wick).toFixed(1)}"/>`;
    out += `<rect class="${cls}" x="${(x - step * 0.28).toFixed(1)}" y="${top.toFixed(1)}" width="${(step * 0.56).toFixed(1)}" height="${Math.max(2, bot - top).toFixed(1)}"/>`;
  }

  el.innerHTML = `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice">${out}</svg>`;
}

document.querySelectorAll('[data-candles]').forEach((el, i) => buildCandles(el, i + 1));

/* ─────────── Reveal on scroll ───────────
   O <html> só ganha .js-anim aqui: se o JS falhar, o CSS nunca esconde nada.
   E quando a aba não está visível o Chrome congela transições — nesse caso
   revelamos sem animar, senão a página ficaria em branco. */
const canAnimate = () => document.visibilityState === 'visible';

const show = (el) => {
  if (!canAnimate()) el.classList.add('no-anim');
  el.classList.add('is-visible');
};

document.documentElement.classList.add('js-anim');

const io = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      show(entry.target);
      io.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

/* linha de tendência: desenha ao entrar na tela, mesma proteção de aba oculta */
const lineIO = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add(canAnimate() ? 'is-drawn' : 'no-anim');
    lineIO.unobserve(entry.target);
  });
}, { threshold: 0.15 });

document.querySelectorAll('.bg--line').forEach((el) => lineIO.observe(el));

document.querySelectorAll('.reveal').forEach((el, i) => {
  const inFirstScreen = el.getBoundingClientRect().top < window.innerHeight;

  if (inFirstScreen && !canAnimate()) {
    // aba em segundo plano: mostra o conteúdo acima da dobra imediatamente
    show(el);
    return;
  }

  el.style.transitionDelay = `${Math.min(i, 3) * 90}ms`;
  io.observe(el);
});

/* ─────────── Eventos do Pixel ─────────── */
document.querySelectorAll('[data-track]').forEach((el) => {
  el.addEventListener('click', () => {
    const tag = el.dataset.track;
    if (typeof fbq !== 'function') return;

    if (tag.startsWith('whatsapp')) {
      fbq('track', 'Lead', { content_name: tag });
    } else {
      fbq('trackCustom', 'SocialClick', { network: tag });
    }
  });
});

/* ─────────── Ano no rodapé ─────────── */
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();
