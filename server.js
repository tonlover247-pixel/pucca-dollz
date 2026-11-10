require('dotenv').config();
const express = require('express');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 3000;

// ─── SUPABASE CLIENT (SAFE INITIALIZATION) ───
let _supabase = null;
function getSupabase() {
    if (_supabase) return _supabase;
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_KEY;
    if (!url || !key) {
        console.warn('⚠️ Supabase credentials missing from environment variables.');
        return null;
    }
    _supabase = createClient(url, key);
    return _supabase;
}

// ─── MIDDLEWARE ───
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// ─── ADMIN AUTH MIDDLEWARE ───
function requireAdmin(req, res, next) {
    const key = req.headers['x-admin-key'];
    const expectedKey = process.env.ADMIN_KEY || 'pucca2026_admin_secret';
    if (!key || key !== expectedKey) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    next();
}

// ─── PUBLIC API ROUTES ───

// Submit whitelist application
app.post('/api/whitelist', async (req, res) => {
    const supabase = getSupabase();
    if (!supabase) {
        return res.status(500).json({ error: 'Database configuration missing. Please add SUPABASE_URL and SUPABASE_SERVICE_KEY.' });
    }

    const { xUsername, wallet, replyUrl, tasks } = req.body;

    // Validation
    if (!xUsername || xUsername.length < 1 || xUsername.length > 15) {
        return res.status(400).json({ error: 'Valid X username is required' });
    }
    if (!wallet || !wallet.startsWith('0x') || wallet.length !== 42) {
        return res.status(400).json({ error: 'Valid EVM wallet address required' });
    }
    if (!tasks?.username || !tasks?.follow || !tasks?.like || !tasks?.repost || !tasks?.tag || !tasks?.wallet) {
        return res.status(400).json({ error: 'Please complete all tasks first' });
    }

    try {
        // Check for duplicate username
        const { data: existingUser } = await supabase
            .from('whitelist')
            .select('id')
            .eq('x_username', xUsername.toLowerCase())
            .maybeSingle();

        if (existingUser) {
            return res.status(409).json({ error: 'This X username is already on the whitelist!' });
        }

        // Check for duplicate wallet
        const { data: existingWallet } = await supabase
            .from('whitelist')
            .select('id')
            .eq('wallet', wallet.toLowerCase())
            .maybeSingle();

        if (existingWallet) {
            return res.status(409).json({ error: 'This wallet is already on the whitelist!' });
        }

        // Insert entry
        const { data, error } = await supabase
            .from('whitelist')
            .insert({
                x_username: xUsername.toLowerCase(),
                wallet: wallet.toLowerCase(),
                reply_url: replyUrl || null,
                task_follow: !!tasks.follow,
                task_like: !!tasks.like,
                task_repost: !!tasks.repost,
                task_tag: !!tasks.tag,
                task_wallet: !!tasks.wallet,
            })
            .select('id')
            .single();

        if (error) {
            console.error('Supabase insert error:', error);
            return res.status(500).json({ error: 'Failed to save. Please try again.' });
        }

        console.log(`✅ Whitelist #${data.id}: @${xUsername} — ${wallet}`);
        res.json({ success: true, position: data.id });

    } catch (err) {
        console.error('Server error:', err);
        res.status(500).json({ error: 'Server error. Please try again.' });
    }
});

// Get whitelist count (public)
app.get('/api/whitelist/count', async (req, res) => {
    const supabase = getSupabase();
    if (!supabase) {
        return res.json({ count: 0, total: 3000 });
    }

    try {
        const { count, error } = await supabase
            .from('whitelist')
            .select('*', { count: 'exact', head: true });

        if (error) throw error;
        res.json({ count: count || 0, total: 3000 });
    } catch (err) {
        console.error('Count error:', err);
        res.json({ count: 0, total: 3000 });
    }
});

// ─── ADMIN API ROUTES ───

// Get all entries (admin)
app.get('/api/admin/entries', requireAdmin, async (req, res) => {
    const supabase = getSupabase();
    if (!supabase) {
        return res.status(500).json({ error: 'Database configuration missing' });
    }

    try {
        const { data, error } = await supabase
            .from('whitelist')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        // Map to frontend-friendly format
        const entries = (data || []).map(row => ({
            id: row.id,
            x_username: row.x_username,
            wallet: row.wallet,
            reply_url: row.reply_url,
            tasks: {
                follow: row.task_follow,
                like: row.task_like,
                repost: row.task_repost,
                tag: row.task_tag,
                wallet: row.task_wallet,
            },
            created_at: row.created_at,
        }));

        res.json(entries);
    } catch (err) {
        console.error('Admin entries error:', err);
        res.status(500).json({ error: 'Failed to fetch entries' });
    }
});

// Get admin stats
app.get('/api/admin/stats', requireAdmin, async (req, res) => {
    const supabase = getSupabase();
    if (!supabase) {
        return res.json({ total: 0, today: 0, cap: 3000 });
    }

    try {
        const { count: total } = await supabase
            .from('whitelist')
            .select('*', { count: 'exact', head: true });

        // Today's count
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const { count: todayCount } = await supabase
            .from('whitelist')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', today.toISOString());

        res.json({
            total: total || 0,
            today: todayCount || 0,
            cap: 3000,
        });
    } catch (err) {
        console.error('Admin stats error:', err);
        res.json({ total: 0, today: 0, cap: 3000 });
    }
});

// Delete entry (admin)
app.delete('/api/admin/entries/:id', requireAdmin, async (req, res) => {
    const supabase = getSupabase();
    if (!supabase) {
        return res.status(500).json({ error: 'Database configuration missing' });
    }

    try {
        const { error } = await supabase
            .from('whitelist')
            .delete()
            .eq('id', req.params.id);

        if (error) throw error;
        res.json({ success: true });
    } catch (err) {
        console.error('Delete error:', err);
        res.status(500).json({ error: 'Failed to delete entry' });
    }
});

// ─── CATCH-ALL (SPA routing) ───
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ─── START (Standalone / Local Mode) ───
if (!process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`
    ╔═══════════════════════════════════════╗
    ║      🎎 PUCCA DOLLZ Server 🎎        ║
    ║   http://localhost:${PORT}               ║
    ╚═══════════════════════════════════════╝
        `);
    });
}

// Export for Vercel serverless functions
module.exports = app;
