
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const { execFile } = require('node:child_process');
const { promisify } = require('node:util');
const path = require('node:path');

const execFileAsync = promisify(execFile);

const targetGroupId = '120363431845610698@g.us';
let isTesRunning = false;

const client = new Client({
    authStrategy: new LocalAuth({
        clientId: 'bot-utama'
    }),
    puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

client.on('qr', (qr) => {
    console.log('Scan QR dengan WhatsApp:');
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('Bot berhasil terhubung!');
    console.log('Grup target: Tes Gem Bot');
    console.log('Kata pemicu: halo');
});

client.on('message', async (msg) => {
    try {
        // Abaikan pesan dari akun bot sendiri
        if (msg.fromMe) return;

        if (msg.body.trim().toLowerCase() !== 'halo') return;

        if (!msg.from.endsWith('@g.us')) return;

        if (!targetGroupId) {
            console.log('ID grup pemicu:', msg.from);
            console.log('Isi targetGroupId di index.js dengan ID di atas.');
            return;
        }

        if (msg.from !== targetGroupId) return;

        if (isTesRunning) {
            console.log('tes.py masih berjalan; trigger baru diabaikan.');
            return;
        }

        isTesRunning = true;
        try {
            const { stdout, stderr } = await execFileAsync(
                'python',
                [path.join(__dirname, 'tes.py')],
                { cwd: __dirname, windowsHide: true }
            );

            if (stdout.trim()) console.log(stdout.trim());
            if (stderr.trim()) console.error(stderr.trim());

            await msg.reply('p0 sudah dibuatkan');
            console.log('tes.py selesai dan balasan dikirim.');
        } catch (error) {
            console.error('Gagal menjalankan tes.py:', error);
            try {
                await msg.reply('Program tes.py gagal dijalankan.');
            } catch (replyError) {
                console.error('Gagal mengirim pesan error:', replyError);
            }
        } finally {
            isTesRunning = false;
        }
    } catch (error) {
        console.error('Gagal membalas:', error);
    }
});

client.initialize();
