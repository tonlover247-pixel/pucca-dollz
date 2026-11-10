/* ============================================================
   PUCCA DOLLZ — Mochi Pop Whitelist Logic
   Manual X handle · Supabase Backend · Interactive Boop
   ============================================================ */

const state = {
    xUsername: '',
    tasks: {
        username: false,
        follow: false,
        like: false,
        repost: false,
        tag: false,
        wallet: false
    },
    replyUrl: '',
    wallet: ''
};

const API_BASE = window.location.origin;

// ─── TOAST NOTIFICATION ───
function showToast(msg) {
    const toast = document.getElementById('toastNotice');
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(window.__toastTimer);
    window.__toastTimer = setTimeout(() => {
        toast.classList.remove('show');
    }, 2800);
}

// ─── BOOP DOLL INTERACTION ───
function boopDoll(cardElement, customPhrase) {
    // Remove booped state from others
    document.querySelectorAll('.doll-card.booped').forEach(el => el.classList.remove('booped'));
    
    // Add animation
    cardElement.classList.add('booped');

    if (customPhrase) {
        const speech = cardElement.querySelector('.doll-speech');
        if (speech) speech.textContent = customPhrase;
    }

    if (navigator.vibrate) {
        try { navigator.vibrate(40); } catch (e) {}
    }

    setTimeout(() => {
        cardElement.classList.remove('booped');
    }, 1200);
}

// ─── COUNTDOWN TIMER ───
function initCountdown() {
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + 7);

    function tick() {
        const now = new Date();
        const diff = deadline - now;

        if (diff <= 0) {
            document.getElementById('days').textContent = '00';
            document.getElementById('hours').textContent = '00';
            document.getElementById('minutes').textContent = '00';
            document.getElementById('seconds').textContent = '00';
            return;
        }

        const d = Math.floor(diff / (1000 * 60 * 60 * 24));
        const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const m = Math.floor((diff / (1000 * 60)) % 60);
        const s = Math.floor((diff / 1000) % 60);

        const elD = document.getElementById('days');
        const elH = document.getElementById('hours');
        const elM = document.getElementById('minutes');
        const elS = document.getElementById('seconds');

        if (elD) elD.textContent = String(d).padStart(2, '0');
        if (elH) elH.textContent = String(h).padStart(2, '0');
        if (elM) elM.textContent = String(m).padStart(2, '0');
        if (elS) elS.textContent = String(s).padStart(2, '0');
    }

    tick();
    setInterval(tick, 1000);
}

// ─── TASK 1: X USERNAME ───
function confirmUsername() {
    const input = document.getElementById('xUsernameInput');
    let val = (input?.value || '').trim();

    if (!val) {
        showToast('Please type your X handle! ✍️');
        return;
    }

    if (val.startsWith('@')) {
        val = val.substring(1);
    }

    if (val.length < 1 || val.length > 15 || !/^[A-Za-z0-9_]+$/.test(val)) {
        showToast('Invalid X username (letters, numbers, _ only)');
        return;
    }

    state.xUsername = val;
    state.tasks.username = true;
    input.value = '@' + val;

    markTaskDone('task1');
    showToast(`Handle saved: @${val} ✅`);
    checkAllTasks();
}

// ─── TASK 2 & 3: SOCIAL ACTIONS ───
function doTask(action) {
    if (action === 'follow') {
        window.open('https://x.com/intent/follow?screen_name=PuccaDollz', '_blank');
        state.tasks.follow = true;
        markTaskDone('task2');
        showToast('Follow opened! Completed task 2 ✅');
    } else if (action === 'like') {
        window.open('https://x.com/PuccaDollz', '_blank');
        state.tasks.like = true;
        showToast('Post opened! Like confirmed ♥');
        if (state.tasks.repost) markTaskDone('task3');
    } else if (action === 'repost') {
        window.open('https://x.com/PuccaDollz', '_blank');
        state.tasks.repost = true;
        showToast('Repost confirmed 🔄');
        if (state.tasks.like) markTaskDone('task3');
    }
    checkAllTasks();
}

// ─── TASK 4: REPLY URL ───
function verifyReply() {
    const input = document.getElementById('replyUrlInput');
    const url = (input?.value || '').trim();

    if (!url) {
        showToast('Paste the link to your reply tweet!');
        return;
    }

    if (!url.includes('x.com/') && !url.includes('twitter.com/')) {
        showToast('Must be a valid x.com status link');
        return;
    }

    state.replyUrl = url;
    state.tasks.tag = true;
    markTaskDone('task4');
    showToast('Reply link verified! ✅');
    checkAllTasks();
}

// ─── TASK 5: EVM WALLET ───
function submitWallet() {
    const input = document.getElementById('walletInput');
    const val = (input?.value || '').trim();

    if (!val) {
        showToast('Please enter your EVM wallet address');
        return;
    }

    if (!val.startsWith('0x') || val.length !== 42) {
        showToast('Must be a valid 42-char EVM address (0x...)');
        return;
    }

    state.wallet = val;
    state.tasks.wallet = true;
    markTaskDone('task5');
    showToast('Wallet address saved! 👛');
    checkAllTasks();
}

function markTaskDone(taskId) {
    const card = document.getElementById(taskId);
    if (card) {
        card.classList.add('done');
    }
}

function checkAllTasks() {
    const allDone = state.tasks.username &&
                    state.tasks.follow &&
                    state.tasks.like &&
                    state.tasks.repost &&
                    state.tasks.tag &&
                    state.tasks.wallet;

    const submitBtn = document.getElementById('submitAll');
    if (submitBtn) {
        submitBtn.disabled = !allDone;
    }
}

// ─── SUBMIT APPLICATION ───
async function submitWhitelist() {
    const submitBtn = document.getElementById('submitAll');
    if (submitBtn) submitBtn.disabled = true;

    try {
        const res = await fetch(API_BASE + '/api/whitelist', {
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

        if (res.ok && data.success) {
            const modal = document.getElementById('successModal');
            if (modal) modal.classList.add('show');
        } else {
            showToast(data.error || 'Submission failed. Please check inputs.');
            if (submitBtn) submitBtn.disabled = false;
        }
    } catch (err) {
        console.error('Submit error:', err);
        showToast('Server communication error. Try again.');
        if (submitBtn) submitBtn.disabled = false;
    }
}

function closeModal() {
    const modal = document.getElementById('successModal');
    if (modal) modal.classList.remove('show');
}

// ─── INIT ───
document.addEventListener('DOMContentLoaded', () => {
    initCountdown();
});
