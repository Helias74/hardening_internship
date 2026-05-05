import { Module } from '@nestjs/common';
import { AdminGuard } from './admin.guard';
import { TokenGuard } from './token.guard';
import { AuthController } from './auth.controller';
import { DatabaseModule } from '../database/database.module';

@Module({
    imports: [DatabaseModule],
    controllers: [AuthController],
    providers: [AdminGuard, TokenGuard],
    exports: [AdminGuard, TokenGuard],
})
export class AuthModule {}