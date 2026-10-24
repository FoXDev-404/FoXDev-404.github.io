'use strict';

/* ==========================================================================
   RAJPAL NISHAD — PORTFOLIO SERVER
   Minimal Express server: static files + a contact endpoint that stores
   messages locally in data/messages.json.
   ========================================================================== */

const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const ROOT = __dirname;
const DATA_DIR = path.join(ROOT, 'data');
const MESSAGES_FILE = path.join(DATA_DIR, 'messages.json');
const MAX_MESSAGES = 500;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

app.disable('x-powered-by');
app.use(express.json({ limit: '32kb' }));

// Never expose server internals or stored messages as static files.
const PRIVATE_PATHS = /^\/(?:data|node_modules|\.git)(?:\/|$)|^\/(?:server\.js|package(?:-lock)?\.json|README\.md)$/i;

app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  if (PRIVATE_PATHS.test(req.path)) {
    return res.status(404).type('text/plain').send('Not found');
  }
  next();
});

app.use(express.static(ROOT, { extensions: ['html'], dotfiles: 'deny', maxAge: 0 }));

app.get('/api/health', (req, res) => {
  res.json({ ok: true, uptime: process.uptime() });
});

app.post('/api/contact', (req, res) => {
  const body = req.body || {};

  // Honeypot: bots fill the hidden "company" field.
  if (body.company) {
    return res.status(201).json({ ok: true });
  }

  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const email = typeof body.email === 'string' ? body.email.trim() : '';
  const message = typeof body.message === 'string' ? body.message.trim() : '';

  const valid =
    name.length > 0 &&
    name.length <= 120 &&
    EMAIL_RE.test(email) &&
    email.length <= 160 &&
    message.length >= 10 &&
    message.length <= 5000;

  if (!valid) {
    return res.status(422).json({
      ok: false,
      error: 'Please provide a name, a valid email, and a message (10–5000 characters).'
    });
  }

  const entry = {
    name,
    email,
    message,
    receivedAt: new Date().toISOString(),
    ip: req.ip
  };

  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });

    let messages = [];
    if (fs.existsSync(MESSAGES_FILE)) {
      try {
        const parsed = JSON.parse(fs.readFileSync(MESSAGES_FILE, 'utf8'));
        if (Array.isArray(parsed)) messages = parsed;
      } catch (parseError) {
        console.warn('[contact] messages.json was not valid JSON; starting a fresh log.');
      }
    }

    messages.push(entry);
    if (messages.length > MAX_MESSAGES) {
      messages = messages.slice(-MAX_MESSAGES);
    }

    fs.writeFileSync(MESSAGES_FILE, JSON.stringify(messages, null, 2), 'utf8');
    console.log(`[contact] ${name} <${email}> — ${message.length} chars`);

    return res.status(201).json({ ok: true });
  } catch (error) {
    console.error('[contact] could not save message:', error);
    return res.status(500).json({ ok: false, error: 'Could not save the message.' });
  }
});

app.use((req, res) => {
  res.status(404).type('text/plain').send('404 — Not found');
});

app.listen(PORT, () => {
  console.log(`\n  Rajpal Nishad portfolio running at http://localhost:${PORT}\n`);
});
