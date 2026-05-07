// database/seeds/seed.js
// Usage : node seed.js

require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const { Pool } = require('pg');
const crypto   = require('crypto');

const pool = new Pool({
    host:     process.env.DB_HOST,
    port:     parseInt(process.env.DB_PORT ?? '5432'),
    database: process.env.DB_NAME,
    user:     process.env.DB_USER,
    password: process.env.DB_PASSWORD,
});

const STUDENTS = [
    { etu_id: 'p2109922', username: 'cbouillot', email: 'clement.bouillot@etu.univ-lyon1.fr' },
    { etu_id: 'p2100001', username: 'amartin',   email: 'alice.martin@etu.univ-lyon1.fr'     },
    { etu_id: 'p2100002', username: 'bdupont',   email: 'bob.dupont@etu.univ-lyon1.fr'       },
];

async function seed() {
    const client = await pool.connect();

    try {
        console.log('Seeding users...\n');

        for (const s of STUDENTS) {
            const token = crypto.randomBytes(32).toString('hex');

            const res = await client.query(
                `INSERT INTO users (etu_id, username, email, token)
                 VALUES ($1, $2, $3, $4)
                 ON CONFLICT (etu_id) DO NOTHING
                 RETURNING id, etu_id, username, token`,
                [s.etu_id, s.username, s.email, token]
            );

            if (res.rows.length > 0) {
                const row = res.rows[0];
                console.log(`${row.username} (${row.etu_id})`);
                console.log(`   token: ${row.token}\n`);
            } else {
                console.log(`${s.username} déjà présent, ignoré\n`);
            }
        }

        console.log('Done.');
    } finally {
        client.release();
        await pool.end();
    }
}

seed().catch(err => {
    console.error('Seed failed:', err.message);
    process.exit(1);
});