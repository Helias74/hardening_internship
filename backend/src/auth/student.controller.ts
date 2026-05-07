import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { TokenGuard } from './token.guard';

@Controller('student')
export class StudentController {

    @Get('me')
    @UseGuards(TokenGuard)
    getMe(@Req() req: Request) {
        return req['student'];
    }
}