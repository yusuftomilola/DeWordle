import { Body, Controller, Get, Put, Request, UseGuards } from '@nestjs/common';
import type { Request as ExpressRequest } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-guard.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorators';
import { DIGEST_PLACEHOLDERS } from './digest-template';
import { UpdateDigestTemplateDto } from './digest.dto';
import { DigestService } from './digest.service';

@Controller('admin/digest')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class DigestController {
  constructor(private readonly digest: DigestService) {}

  @Get('template')
  async getTemplate() {
    return {
      ...(await this.digest.getTemplate()),
      placeholders: DIGEST_PLACEHOLDERS,
    };
  }

  @Put('template')
  updateTemplate(
    @Body() dto: UpdateDigestTemplateDto,
    @Request() req: ExpressRequest & { user: { email: string } },
  ) {
    return this.digest.updateTemplate(dto.subject, dto.bodyHtml, req.user.email);
  }
}
