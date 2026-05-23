import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class AdminGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        
        if ((request.session as any).isAdmin) {
            return true;
        }

        throw new UnauthorizedException('Accès non autorisé');
    }
}