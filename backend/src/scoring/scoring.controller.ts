import { Controller, Get, Param, ParseIntPipe, Req, UseGuards } from '@nestjs/common';
import { ScoringService } from './scoring.service';
import { TokenGuard } from '../auth/token.guard';
import { AdminGuard } from '../auth/admin.guard';

@Controller('scoring')
export class ScoringController {
  constructor(private readonly scoringService: ScoringService) {}

  // GET /scoring/student/me — étudiant authentifié par token
  @Get('student/me')
  @UseGuards(TokenGuard)
  async getMyScore(@Req() req: any) {
    const enrollmentId = req.student.enrollment_id;
    return this.scoringService.getStudentScore(enrollmentId);
  }

  // GET /scoring/admin/students — liste des étudiants avec score
  @Get('admin/students')
  @UseGuards(AdminGuard)
  async getStudentsList() {
    return this.scoringService.getStudentsList();
  }

  // GET /scoring/admin/students/:enrollmentId — détail d'un étudiant
  @Get('admin/students/:enrollmentId')
  @UseGuards(AdminGuard)
  async getStudentDetail(@Param('enrollmentId', ParseIntPipe) enrollmentId: number) {
    return this.scoringService.getStudentDetail(enrollmentId);
  }
}