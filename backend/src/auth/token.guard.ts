// backend/src/auth/token.guard.ts
import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class TokenGuard implements CanActivate {
    constructor(private db: DatabaseService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();

        const token = request.query.token;

        if (!token) {
            throw new UnauthorizedException('Token manquant');
        }

        // Vérifie que le token existe en base
        const result = await this.db.query(
            `SELECT u.*, e.id as enrollment_id, e.container_ip
            FROM users u
            LEFT JOIN enrollments e ON e.user_id = u.id
            WHERE u.token = $1`,
            [token]
        );

        if (result.rows.length === 0) {
            throw new UnauthorizedException('Token invalide');
        }

        // Attache l'étudiant à la requête pour les controllers
        request.student = result.rows[0];
        return true;
    }
}