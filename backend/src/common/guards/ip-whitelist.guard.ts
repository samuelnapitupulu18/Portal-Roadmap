import { CanActivate, ExecutionContext, ForbiddenException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

@Injectable()
export class IpWhitelistGuard implements CanActivate {
  private readonly logger = new Logger(IpWhitelistGuard.name);
  private readonly allowedIps: string[];

  constructor(private readonly configService: ConfigService) {
    this.allowedIps = this.configService
      .get<string>('ALLOWED_IP_WHITELIST', '127.0.0.1,::1')
      .split(',')
      .map((ip) => ip.trim());
  }

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const clientIp = this.extractClientIp(request);

    if (!this.isIpAllowed(clientIp)) {
      this.logger.warn(`Blocked request from IP: ${clientIp}`);
      throw new ForbiddenException(`Access denied. IP ${clientIp} not allowed.`);
    }

    return true;
  }

  private extractClientIp(request: Request): string {
    const forwarded = request.headers['x-forwarded-for'];
    if (forwarded) return (Array.isArray(forwarded) ? forwarded[0] : forwarded.split(',')[0]).trim();
    return request.ip || request.socket.remoteAddress || 'unknown';
  }

  private isIpAllowed(clientIp: string): boolean {
    const normalizedIp = clientIp.replace(/^::ffff:/, '');
    return this.allowedIps.some((allowed) => {
      if (allowed.includes('/')) return this.isIpInCidr(normalizedIp, allowed);
      return normalizedIp === allowed || clientIp === allowed;
    });
  }

  private isIpInCidr(ip: string, cidr: string): boolean {
    try {
      const [range, bits] = cidr.split('/');
      const mask = ~(2 ** (32 - parseInt(bits, 10)) - 1);
      const ipNum = this.ipToNumber(ip);
      const rangeNum = this.ipToNumber(range);

      if (ipNum === null || rangeNum === null) return false;
      return (ipNum & mask) === (rangeNum & mask);
    } catch {
      return false;
    }
  }

  private ipToNumber(ip: string): number | null {
    const parts = ip.split('.');
    if (parts.length !== 4) return null;
    return parts.reduce((acc, octet) => {
      const num = parseInt(octet, 10);
      if (isNaN(num) || num < 0 || num > 255) return null as any;
      return (acc << 8) + num;
    }, 0);
  }
}
