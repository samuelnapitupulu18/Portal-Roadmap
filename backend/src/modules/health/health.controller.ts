import { Controller, Get } from '@nestjs/common';

/**
 * HealthController
 *
 * Simple health check endpoint. Not protected by IP guard
 * so monitoring tools can reach it.
 */
@Controller('health')
export class HealthController {
  @Get()
  check() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'portal-nusa-backend',
      uptime: process.uptime(),
    };
  }
}
