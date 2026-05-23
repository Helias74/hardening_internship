import { Controller, Post, Delete, Param, UseGuards } from '@nestjs/common';
import { ContainersService } from './containers.service';
import { AdminGuard } from '../auth/admin.guard';

@Controller('containers')
export class ContainersController {
  constructor(private containersService: ContainersService) {}

  // Route de test — sans enrollment
  @Post('test/start')
  @UseGuards(AdminGuard)
  async testStart() {
    const ip = await this.containersService.createContainerTest();
    return { ip };
  }

  // POST /containers/:enrollmentId/start — crée et démarre un conteneur
  @Post(':enrollmentId/start')
  @UseGuards(AdminGuard)
  async start(@Param('enrollmentId') enrollmentId: string) {
    const ip = await this.containersService.createContainer(Number(enrollmentId));
    return { ip };
  }

  // DELETE /containers/:containerId — arrête et supprime un conteneur
  @Delete(':containerId')
  @UseGuards(AdminGuard)
  async stop(@Param('containerId') containerId: string) {
    await this.containersService.stopContainer(containerId);
    return { success: true };
  }
}