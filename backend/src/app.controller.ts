import { Controller, Get } from '@nestjs/common';
import { DatabaseService } from './database/database.service';

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
}