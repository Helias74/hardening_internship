import { Controller, Post, Get, Body, Req, Res, UnauthorizedException, UseGuards } from '@nestjs/common';
import type { Request, Response } from 'express';
import { AdminGuard } from './admin.guard';

@Controller('auth')
export class AuthController {

    @Post('login')
    login(@Body() body: { username: string, password: string }, @Req() req: Request) {
        const username = body.username;
        const password = body.password;

        if (
            username === process.env.ADMIN_USERNAME &&
            password === process.env.ADMIN_PASSWORD
        ) {
            (req.session as any).isAdmin = true;
            return { success: true };
        }

        throw new UnauthorizedException('Credentials invalides');
    }

    @Get('verify')
    verify(@Req() req: Request) {
        if ((req.session as any).isAdmin) {
            return { authenticated: true };
        }
        throw new UnauthorizedException('Non authentifié');
    }

    // POST /auth/logout — détruit la session
    @Post('logout')
    logout(@Req() req: Request) {
        req.session.destroy(() => {});
        return { success: true };
    }
}