import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { AdminGuard } from '../auth/admin.guard';

@Controller('sessions')
export class SessionsController {
  constructor(private sessionsService: SessionsService) {}

  @Post()
  @UseGuards(AdminGuard)
  create(@Body() body: { name: string }) {
    return this.sessionsService.create(body.name);
  }

  @Get()
  @UseGuards(AdminGuard)
  findAll() {
    return this.sessionsService.findAll();
  }

  @Patch(':id/start')
  @UseGuards(AdminGuard)
  start(@Param('id') id: string) {
    return this.sessionsService.start(Number(id));
  }

  @Patch(':id/stop')
  @UseGuards(AdminGuard)
  stop(@Param('id') id: string) {
    return this.sessionsService.stop(Number(id));
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
  remove(@Param('id') id: string) {
    return this.sessionsService.remove(Number(id));
  }
  @Post(':id/import')
  @UseGuards(AdminGuard)
  async importStudents(
    @Param('id') id: string,
    @Body() body: { csv: string }
    ) {
    return this.sessionsService.importStudents(Number(id), body.csv);
    }
}