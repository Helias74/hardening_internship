import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { ContainersService } from '../containers/containers.service';
import { parse } from 'csv-parse/sync';

@Injectable()
export class SessionsService {
  constructor(
    private db: DatabaseService,
    private containersService: ContainersService,
  ) {}

  async create(name: string) {
    const res = await this.db.query(
      `INSERT INTO sessions (name) VALUES ($1) RETURNING *`,
      [name]
    );
    return res.rows[0];
  }

  async findAll() {
    const res = await this.db.query(
      `SELECT s.*, COUNT(e.id) as nb_students
       FROM sessions s
       LEFT JOIN enrollments e ON e.session_id = s.id
       GROUP BY s.id
       ORDER BY s.started_at DESC`
    );
    return res.rows;
  }

  async start(sessionId: number) {
    await this.db.query(
      `UPDATE sessions SET active = true WHERE id = $1`,
      [sessionId]
    );

    const enrollments = await this.db.query(
      `SELECT id FROM enrollments WHERE session_id = $1`,
      [sessionId]
    );

    for (const enrollment of enrollments.rows) {
      await this.containersService.createContainer(enrollment.id);
    }

    return { success: true };
  }

  async stop(sessionId: number) {
    await this.db.query(
      `UPDATE sessions SET active = false, ended_at = NOW() WHERE id = $1`,
      [sessionId]
    );
    return { success: true };
  }

  async remove(sessionId: number) {
    const enrollments = await this.db.query(
      `SELECT id, container_ip FROM enrollments WHERE session_id = $1`,
      [sessionId]
    );

    for (const enrollment of enrollments.rows) {
      if (enrollment.container_ip) {
        try {
          await this.containersService.stopContainerByIp(enrollment.container_ip);
        } catch (e) {
          console.error(`Erreur suppression conteneur ${enrollment.container_ip}:`, e.message);
        }
      }
    }

    await this.db.query(
      `DELETE FROM sessions WHERE id = $1`,
      [sessionId]
    );

    return { success: true };
  }

  async importStudents(sessionId: number, csvContent: string) {
    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    }) as { etu_id: string; email: string }[];

    const results: { username: string; token: string }[] = [];

    for (const record of records) {
      const localPart = record.email.split('@')[0];
      const parts = localPart.split('.');
      const username = parts[0][0] + parts[1];

      const crypto = await import('crypto');
      const token = crypto.randomBytes(32).toString('hex');

      const userRes = await this.db.query(
        `INSERT INTO users (etu_id, username, email, token)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (etu_id) DO UPDATE SET etu_id = EXCLUDED.etu_id
         RETURNING id, etu_id, username, token`,
        [record.etu_id, username, record.email, token]
      );

      const userId = userRes.rows[0].id;
      const user = userRes.rows[0];

      await this.db.query(
        `INSERT INTO enrollments (session_id, user_id)
         VALUES ($1, $2)
         ON CONFLICT (session_id, user_id) DO NOTHING`,
        [sessionId, userId]
      );

      results.push({ username: user.username, token: user.token });
    }

    return results;
  }
}