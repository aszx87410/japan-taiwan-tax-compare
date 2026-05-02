const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const { build } = require('./build');

const rootDir = __dirname;
const port = Number(process.env.PORT || 8000);
const watchFiles = [
    path.join(rootDir, 'src', 'template.html'),
    path.join(rootDir, 'translations.json'),
    path.join(rootDir, 'tax-rules.js'),
    path.join(rootDir, 'build.js')
];

const mimeTypes = {
    '.css': 'text/css; charset=utf-8',
    '.html': 'text/html; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.md': 'text/markdown; charset=utf-8',
    '.png': 'image/png',
    '.svg': 'image/svg+xml; charset=utf-8',
    '.txt': 'text/plain; charset=utf-8',
    '.xml': 'application/xml; charset=utf-8'
};

function rebuild() {
    const files = build();
    console.log(`[build] ${files.join(', ')}`);
}

function serveFile(req, res) {
    const url = new URL(req.url, `http://localhost:${port}`);
    const pathname = url.pathname === '/' ? '/index.html' : url.pathname;
    const filePath = path.normalize(path.join(rootDir, decodeURIComponent(pathname)));

    const relativePath = path.relative(rootDir, filePath);
    if (relativePath.startsWith('..') || path.isAbsolute(relativePath)) {
        res.writeHead(403);
        res.end('Forbidden');
        return;
    }

    fs.readFile(filePath, (error, content) => {
        if (error) {
            res.writeHead(error.code === 'ENOENT' ? 404 : 500);
            res.end(error.code === 'ENOENT' ? 'Not found' : 'Server error');
            return;
        }

        const ext = path.extname(filePath);
        res.writeHead(200, {
            'Content-Type': mimeTypes[ext] || 'application/octet-stream',
            'Cache-Control': 'no-store'
        });
        res.end(content);
    });
}

function start() {
    rebuild();

    const server = http.createServer(serveFile);
    server.listen(port, () => {
        console.log(`[dev] http://localhost:${port}`);
    });

    let timer;
    for (const file of watchFiles) {
        fs.watch(file, () => {
            clearTimeout(timer);
            timer = setTimeout(() => {
                try {
                    rebuild();
                } catch (error) {
                    console.error(`[build] ${error.message}`);
                }
            }, 80);
        });
    }
}

start();
