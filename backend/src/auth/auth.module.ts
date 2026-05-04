// backend/src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { AdminGuard } from './admin.guard';
import { TokenGuard } from './token.guard';
import { DatabaseModule } from '../database/database.module';

@Module({
    imports: [DatabaseModule],
    providers: [AdminGuard, TokenGuard],
    exports: [AdminGuard, TokenGuard],
})
export class AuthModule {}