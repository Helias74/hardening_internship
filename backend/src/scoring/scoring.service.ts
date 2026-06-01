import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class ScoringService {
  constructor(private readonly db: DatabaseService) {}

  // Dernier score + failles corrigées — côté étudiant
  async getStudentScore(enrollmentId: number) {
    const { rows: snapshot } = await this.db.query(`
      SELECT score, max_score, snapshot_at
      FROM score_snapshots
      WHERE enrollment_id = $1
      ORDER BY snapshot_at DESC
      LIMIT 1
    `, [enrollmentId]);

    const { rows: passed } = await this.db.query(`
      SELECT v.name, v.description, v.category, ar.last_checked_at
      FROM attack_results ar
      JOIN vulnerabilities v ON v.id = ar.vuln_id
      WHERE ar.enrollment_id = $1
        AND ar.passed = true
    `, [enrollmentId]);

    const { rows: total } = await this.db.query(`
      SELECT COUNT(*) as total FROM vulnerabilities
    `);

    return {
      score: snapshot[0] ?? null,
      passed_vulns: passed,
      total_vulns: parseInt(total[0].total),
      remaining: parseInt(total[0].total) - passed.length,
    };
  }

  // Liste des étudiants de la session active avec leur dernier score — côté teacher
  async getStudentsList() {
    const { rows } = await this.db.query(`
      SELECT
        u.id as user_id,
        u.username,
        u.email,
        u.etu_id,
        e.id as enrollment_id,
        e.container_ip,
        ss.score,
        ss.max_score,
        ss.snapshot_at
      FROM enrollments e
      JOIN users u ON u.id = e.user_id
      JOIN sessions s ON s.id = e.session_id
      LEFT JOIN LATERAL (
        SELECT score, max_score, snapshot_at
        FROM score_snapshots
        WHERE enrollment_id = e.id
        ORDER BY snapshot_at DESC
        LIMIT 1
      ) ss ON true
      WHERE s.active = true
      ORDER BY ss.score DESC NULLS LAST
    `);
    return rows;
  }

  // Détail complet d'un étudiant — toutes les failles — côté teacher
  async getStudentDetail(enrollmentId: number) {
    const { rows: student } = await this.db.query(`
      SELECT u.username, u.email, u.etu_id, e.container_ip
      FROM enrollments e
      JOIN users u ON u.id = e.user_id
      WHERE e.id = $1
    `, [enrollmentId]);

    const { rows: snapshot } = await this.db.query(`
      SELECT score, max_score, snapshot_at
      FROM score_snapshots
      WHERE enrollment_id = $1
      ORDER BY snapshot_at DESC
      LIMIT 1
    `, [enrollmentId]);

    const { rows: vulns } = await this.db.query(`
      SELECT
        v.name,
        v.description,
        v.category,
        v.max_score,
        v.coefficient,
        COALESCE(ar.passed, false) as passed,
        ar.last_checked_at
      FROM vulnerabilities v
      LEFT JOIN attack_results ar
        ON ar.vuln_id = v.id AND ar.enrollment_id = $1
      ORDER BY v.category, v.name
    `, [enrollmentId]);

    return {
      student: student[0] ?? null,
      score: snapshot[0] ?? null,
      vulnerabilities: vulns,
    };
  }
}