import { Controller, Get, UseGuards } from '@nestjs/common';
import { DatabaseService } from './database/database.service';
import { AdminGuard } from './auth/admin.guard';



@Controller()
export class AppController {
    constructor(private db: DatabaseService) {}

    @Get()
    getHello() {
        return 'Backend is alive !';
    }

    @Get('test-db')
    async testDb() {
        const result = await this.db.query('SELECT NOW()');
        return { connected: true, time: result.rows[0].now };
    }

    @Get('admin')
    @UseGuards(AdminGuard)
    getAdmin() {
        return 'Page admin — accès autorisé';
    }

    @Get('admin/verify')
    @UseGuards(AdminGuard)
    verifyAdmin() {
        return { authenticated: true };
    }
}