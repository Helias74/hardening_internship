import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class AdminGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();

        // Récupère le header Authorization
        const authHeader = request.headers.authorization || '';

        // Isole la partie base64 après "Basic "
        const b64 = authHeader.split(' ')[1] || '';

        // Décode base64 → "username:password"
        const decoded = Buffer.from(b64, 'base64').toString();
        const [user, pass] = decoded.split(':');

        // Compare avec les variables d'environnement
        if (
            user === process.env.ADMIN_USERNAME &&
            pass === process.env.ADMIN_PASSWORD
        ) {
            return true; // OK → on laisse passer
        }

        // KO → popup login dans le navigateur
        throw new UnauthorizedException({
            message: 'Accès non autorisé',
            headers: { 'WWW-Authenticate': 'Basic realm="Admin TP Hardening"' },
        });
    }
}