import { Module } from '@nestjs/common';
import { RobotService } from './robot.service';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  providers: [RobotService],
})
export class RobotModule {}