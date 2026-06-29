const esbuild = require('esbuild');
const pkg = require('./package.json');
const externalDependencies = Object.keys(pkg.dependencies || {});

esbuild
    .build({
        entryPoints: ['../../dist/apps/backend/main.js'],
        bundle: true,
        platform: 'node',
        target: 'node20',
        outfile: '../../dist/apps/backend/main.js',
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
            'better-sqlite3',
            'pg',
            'pg-native',
            'pg-query-stream',
            'tedious',
            'sqlite3',
            'mysql',
            'oracledb',
            'mysql2',
            'ioredis',
            'sharp',
        ],
    })
    .catch(() => process.exit(1));
