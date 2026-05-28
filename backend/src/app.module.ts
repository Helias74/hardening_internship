import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { ContainersModule } from './containers/containers.module';
import { SessionsModule } from './sessions/sessions.module';
import { RobotModule } from './robot/robot.module';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../.env',
    }),
    DatabaseModule,
    AuthModule,
    ContainersModule,
    SessionsModule,
    RobotModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}