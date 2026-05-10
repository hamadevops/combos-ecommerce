const esbuild = require('esbuild');
const pkg = require('./package.json');
const externalDependencies = Object.keys(pkg.dependencies || {});

esbuild
    .build({
        entryPoints: ['dist/main.js'],
        bundle: true,
        platform: 'node',
        target: 'node20',
        outfile: 'dist/main.js',
        allowOverwrite: true,
        minifySyntax: true,
        minifyWhitespace: true,
        minifyIdentifiers: false,
        keepNames: true,
        external: [
            ...externalDependencies,
            '@nestjs/microservices',
            '@nestjs/websockets',
            'mariadb/callback',
            'class-transformer/storage',
            'libsql',
        ],
    })
    .catch(() => process.exit(1));
