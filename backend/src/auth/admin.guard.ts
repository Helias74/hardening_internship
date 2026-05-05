import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Response } from 'express';

@Injectable()
export class AdminGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        const response: Response = context.switchToHttp().getResponse();

        const authHeader = request.headers.authorization || '';
        const b64 = authHeader.split(' ')[1] || '';
        const decoded = Buffer.from(b64, 'base64').toString();
        const [user, pass] = decoded.split(':');

        if (
            user === process.env.ADMIN_USERNAME &&
            pass === process.env.ADMIN_PASSWORD
        ) {
            return true;
        }

        // Envoie le header directement sur la réponse
        response.set('WWW-Authenticate', 'Basic realm="Admin TP Hardening"');
        response.status(401).send('Accès non autorisé');
        return false;
    }
}