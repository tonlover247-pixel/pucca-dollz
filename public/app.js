/* ============================================
   PUCCA DOLLZ — Whitelist App
   Manual X username · Supabase backend
   ============================================ */

// ── State ──────────────────────────────────
const state = {
    xUsername: null,
    tasks: {
        username: false,
        follow: false,
        like: false,
        repost: false,
        tag: false,
        wallet: false
    },
    wallet: null,
    replyUrl: null
};

// ── Particles ──────────────────────────────
function initParticles() {
    const container = document.getElementById('particles');
    if (!container) return;
    const count = window.innerWidth < 768 ? 25 : 50;
    for (let i = 0; i < count; i++) {
        const p = document.createElement('div');
        p.className = 'particle';
        p.style.cssText = `
            left:${Math.random() * 100}%;
            top:${Math.random() * 100}%;
            width:${Math.random() * 4 + 1}px;
            height:${Math.random() * 4 + 1}px;
            animation-delay:${Math.random() * 6}s;
            animation-duration:${Math.random() * 3 + 3}s;
        `;
        container.appendChild(p);
    }
}

// ── Navbar scroll ──────────────────────────
function initNavbar() {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;
    let lastScroll = 0;
    window.addEventListener('scroll', () => {
        const curr = window.scrollY;
        navbar.classList.toggle('scrolled', curr > 50);
        navbar.classList.toggle('hidden', curr > lastScroll && curr > 200);
        lastScroll = curr;
    });
}

// ── Mobile menu ────────────────────────────
function toggleMenu() {
    const links = document.getElementById('navLinks');
    const hamburger = document.getElementById('hamburger');
    if (!links || !hamburger) return;
    links.classList.toggle('active');
    hamburger.classList.toggle('active');
}

// ── Boop characters ───────────────────────
function boopCharacter(el) {
    el.classList.add('booped');
    setTimeout(() => el.classList.remove('booped'), 600);
}

// ── Countdown ──────────────────────────────
function initCountdown() {
    const target = new Date();
    target.setDate(target.getDate() + 14); // 2 weeks from now
    function tick() {
        const diff = target - new Date();
        if (diff <= 0) return;
        const d = Math.floor(diff / 864e5);
        const h = Math.floor((diff % 864e5) / 36e5);
        const m = Math.floor((diff % 36e5) / 6e4);
        const s = Math.floor((diff % 6e4) / 1e3);
        const el = (id) => document.getElementById(id);
        if (el('days')) el('days').textContent = String(d).padStart(2, '0');
        if (el('hours')) el('hours').textContent = String(h).padStart(2, '0');
        if (el('minutes')) el('minutes').textContent = String(m).padStart(2, '0');
        if (el('seconds')) el('seconds').textContent = String(s).padStart(2, '0');
    }
    tick();
    setInterval(tick, 1000);
}

// ── Scroll reveal ──────────────────────────
function initScrollReveal() {
    const els = document.querySelectorAll(
        '.section-header, .about-content, .info-card, .task-card, .countdown-section'
    );
    const obs = new IntersectionObserver(
        (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add('revealed'); }),
        { threshold: 0.15 }
    );
    els.forEach((el) => { el.classList.add('reveal'); obs.observe(el); });
}

// ── Tilt on info cards ─────────────────────
function initTilt() {
    document.querySelectorAll('[data-tilt]').forEach((card) => {
        card.addEventListener('mousemove', (e) => {
            const r = card.getBoundingClientRect();
            const x = ((e.clientX - r.left) / r.width - 0.5) * 10;
            const y = ((e.clientY - r.top) / r.height - 0.5) * -10;
            card.style.transform = `perspective(600px) rotateX(${y}deg) rotateY(${x}deg) scale(1.03)`;
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
        });
    });
}

// ── Toast ──────────────────────────────────
function showToast(msg, type = 'info') {
    const toast = document.getElementById('toast');
    const toastMsg = document.getElementById('toastMsg');
    if (!toast || !toastMsg) return;
    toastMsg.textContent = msg;
    toast.className = 'toast show ' + type;
    setTimeout(() => { toast.className = 'toast'; }, 3500);
}

// ── Modal ──────────────────────────────────
function showModal() {
    const m = document.getElementById('successModal');
    if (m) m.classList.add('active');
}
function closeModal() {
    const m = document.getElementById('successModal');
    if (m) m.classList.remove('active');
}

// ── Task helpers ───────────────────────────
function markTask(name, done) {
    state.tasks[name] = done;
    const card = document.querySelector(`.task-card[data-task="${name}"]`);
    if (card) card.classList.toggle('completed', done);
    checkAllTasks();
}

function checkAllTasks() {
    const all = Object.values(state.tasks).every(Boolean);
    const btn = document.getElementById('submitAll');
    if (btn) btn.disabled = !all;
}

// ── Step 1: Confirm X username ─────────────
function confirmUsername() {
    const input = document.getElementById('xUsernameInput');
    if (!input) return;
    let val = input.value.trim();
    // Strip leading @
    if (val.startsWith('@')) val = val.slice(1);
    // Validate: 1-15 chars, alphanumeric + underscore
    const valid = /^[A-Za-z0-9_]{1,15}$/.test(val);
    if (!valid) {
        showToast('Enter a valid X username (1-15 chars, letters/numbers/underscore)', 'error');
        return;
    }
    state.xUsername = val;
    markTask('username', true);
    showToast(`Username @${val} confirmed ✓`, 'success');
}

// ── Step 2/3: Social tasks ─────────────────
const PINNED_TWEET_ID = 'PINNED_TWEET_ID'; // Replace with actual tweet ID

function doTask(type) {
    switch (type) {
        case 'follow':
            window.open('https://x.com/intent/follow?screen_name=PuccaDollz', '_blank');
            markTask('follow', true);
            showToast('Followed @PuccaDollz ✓', 'success');
            break;
        case 'like':
            window.open(`https://x.com/intent/like?tweet_id=${PINNED_TWEET_ID}`, '_blank');
            markTask('like', true);
            showToast('Liked the pinned post ✓', 'success');
            break;
        case 'repost':
            window.open(`https://x.com/intent/retweet?tweet_id=${PINNED_TWEET_ID}`, '_blank');
            markTask('repost', true);
            showToast('Reposted the pinned post ✓', 'success');
            break;
    }
}

// ── Step 4: Verify reply ───────────────────
function verifyReply() {
    const input = document.getElementById('replyUrl');
    if (!input) return;
    const url = input.value.trim();
    if (!url || (!url.includes('x.com/') && !url.includes('twitter.com/'))) {
        showToast('Paste a valid X / Twitter reply link', 'error');
        return;
    }
    state.replyUrl = url;
    markTask('tag', true);
    showToast('Reply verified ✓', 'success');
}

// ── Step 5: Wallet ─────────────────────────
function submitWallet() {
    const input = document.getElementById('walletInput');
    if (!input) return;
    const addr = input.value.trim();
    if (!addr.startsWith('0x') || addr.length !== 42) {
        showToast('Enter a valid EVM wallet address (0x… 42 chars)', 'error');
        return;
    }
    state.wallet = addr;
    markTask('wallet', true);
    showToast('Wallet saved ✓', 'success');
}

// ── Submit whitelist ───────────────────────
async function submitWhitelist() {
    if (!Object.values(state.tasks).every(Boolean)) {
        showToast('Complete all tasks first!', 'error');
        return;
    }
    const btn = document.getElementById('submitAll');
    if (btn) { btn.disabled = true; btn.textContent = 'Submitting…'; }

    try {
        const res = await fetch('/api/whitelist', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                xUsername: state.xUsername,
                wallet: state.wallet,
                replyUrl: state.replyUrl,
                tasks: state.tasks
            })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Submission failed');
        showModal();
        showToast('Whitelist application submitted! 🎉', 'success');
    } catch (err) {
        showToast(err.message || 'Something went wrong', 'error');
        if (btn) { btn.disabled = false; btn.textContent = '🔥 Submit Whitelist Application 🔥'; }
    }
}

// ── Init ───────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    initParticles();
    initNavbar();
    initCountdown();
    initScrollReveal();
    initTilt();
});
