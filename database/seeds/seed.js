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
            INSERT INTO vulnerabilities (name, category, check_fn, max_score, coefficient, description)
            VALUES ($1, $2, $3, $4, $5, $6)
            ON CONFLICT (name) DO UPDATE 
            SET category = EXCLUDED.category,
                check_fn = EXCLUDED.check_fn,
                max_score = EXCLUDED.max_score,
                coefficient = EXCLUDED.coefficient,
                description = EXCLUDED.description
        `, [
            'ssh_default_password',
            'authentication',
            'check_ssh_password',
            100,
            3.0,
            'Le mot de passe par défaut "student" doit être modifié, l\'accès root par mot de passe désactivé, et les mots de passe vides interdits.'
        ]);

        await client.query(`
            INSERT INTO vulnerabilities (name, category, check_fn, max_score, coefficient, description)
            VALUES ($1, $2, $3, $4, $5, $6)
            ON CONFLICT (name) DO UPDATE 
            SET category = EXCLUDED.category,
                check_fn = EXCLUDED.check_fn,
                max_score = EXCLUDED.max_score,
                coefficient = EXCLUDED.coefficient,
                description = EXCLUDED.description
        `, [
            'unused_ports',
            'network',
            'check_unused_ports',
            100,
            2.0,
            'Les ports et services inutilisés (comme rpcbind sur le port 111) doivent être fermés.'
        ]);

        console.log('Vulnérabilités de la Semaine 2 insérées/mises à jour.\n');
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