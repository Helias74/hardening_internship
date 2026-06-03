import { Injectable, OnApplicationBootstrap, Logger } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { check_ssh_password } from './checks/check_ssh_password';
import { check_unused_ports } from './checks/check_unused_ports';

const CHECK_REGISTRY: Record<string, (ip: string) => Promise<boolean>> = {
  check_ssh_password,
  check_unused_ports,
};

const ROBOT_INTERVAL_MS = 30_000;

@Injectable()
export class RobotService implements OnApplicationBootstrap {
  private readonly logger = new Logger(RobotService.name);

  constructor(private readonly db: DatabaseService) {}

  onApplicationBootstrap() {
    this.logger.log('Robot démarré');
    void this.runCycle();
    setInterval(() => void this.runCycle(), ROBOT_INTERVAL_MS);
  }

  private async runCycle(): Promise<void> {
    const { rows: enrollments } = await this.db.query(`
      SELECT e.id, e.container_ip
      FROM enrollments e
      JOIN sessions s ON s.id = e.session_id
      WHERE s.active = true
        AND e.container_ip IS NOT NULL
    `);

    const { rows: vulnerabilities } = await this.db.query(`
      SELECT id, check_fn, max_score, coefficient FROM vulnerabilities
    `);

    if (enrollments.length === 0) return;

    for (const enrollment of enrollments) {
      for (const vuln of vulnerabilities) {
        const checkFn = CHECK_REGISTRY[vuln.check_fn];
        if (!checkFn) {
          this.logger.warn(`Fonction "${vuln.check_fn}" introuvable dans le registre`);
          continue;
        }

        let passed = false;
        try {
          passed = await checkFn(enrollment.container_ip);
        } catch (err) {
          this.logger.error(`Erreur check "${vuln.check_fn}" : ${err.message}`);
        }

        await this.db.query(`
          INSERT INTO attack_results (enrollment_id, vuln_id, passed, last_checked_at)
          VALUES ($1, $2, $3, NOW())
          ON CONFLICT (enrollment_id, vuln_id)
          DO UPDATE SET passed = EXCLUDED.passed, last_checked_at = EXCLUDED.last_checked_at
        `, [enrollment.id, vuln.id, passed]);

        this.logger.debug(`enrollment=${enrollment.id} | ${vuln.check_fn} | ${passed ? '✓' : '✗'}`);
      }

      await this.computeAndSaveScore(enrollment.id, vulnerabilities);
    }
  }

  private async computeAndSaveScore(
    enrollmentId: number,
    vulnerabilities: { id: number; max_score: number; coefficient: number }[],
  ): Promise<void> {
    const { rows: results } = await this.db.query(`
      SELECT vuln_id, passed FROM attack_results
      WHERE enrollment_id = $1
    `, [enrollmentId]);

    const passedSet = new Set(
      results.filter(r => r.passed).map(r => r.vuln_id),
    );

    let score = 0;
    let maxScore = 0;

    for (const vuln of vulnerabilities) {
      const points = vuln.max_score * vuln.coefficient;
      maxScore += points;
      if (passedSet.has(vuln.id)) {
        score += points;
      }
    }

    await this.db.query(`
      INSERT INTO score_snapshots (enrollment_id, score, max_score, snapshot_at)
      VALUES ($1, $2, $3, NOW())
    `, [enrollmentId, Math.round(score), Math.round(maxScore)]);

    this.logger.debug(`enrollment=${enrollmentId} | score=${Math.round(score)}/${Math.round(maxScore)}`);
  }
}