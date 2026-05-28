import { Injectable, OnApplicationBootstrap, Logger } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { check_ssh_password } from './checks/check_ssh_password';

const CHECK_REGISTRY: Record<string, (ip: string) => Promise<boolean>> = {
  check_ssh_password,
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
      SELECT id, check_fn FROM vulnerabilities
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
    }
  }
}