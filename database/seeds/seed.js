require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const { Pool } = require('pg');

const pool = new Pool({
    host:     process.env.DB_HOST,
    port:     parseInt(process.env.DB_PORT ?? '5432'),
    database: process.env.DB_NAME,
    user:     process.env.DB_USER,
    password: process.env.DB_PASSWORD,
});

async function seed() {
    const client = await pool.connect();

    try {
        console.log('Seeding vulnerabilities...\n');

        await client.query(`
            INSERT INTO vulnerabilities (name, category, check_fn, max_score, description)
            VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT (name) DO NOTHING
        `, [
            'ssh_default_password',
            'authentication',
            'check_ssh_password',
            100,
            'Le mot de passe par défaut "student" du compte étudiant doit être changé.'
        ]);

        console.log('Vulnérabilité "ssh_default_password" insérée.\n');
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