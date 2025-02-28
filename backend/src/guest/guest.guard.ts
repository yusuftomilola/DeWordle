import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { GuestUserService } from './guest.service';

@Injectable()
export class GuestUserGuard implements CanActivate {
  constructor(private readonly guestService: GuestUserService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const guestId = this.extractGuestId(request);

    if (!guestId) {
      throw new UnauthorizedException('Guest ID is missing');
    }

    const isValid = await this.guestService.validateGuestUser(guestId);

    if (!isValid) {
      throw new ForbiddenException('Guest session has expired');
    }

    // Add guest ID to request for controllers to use
    request.guestId = guestId;
    return true;
  }

  private extractGuestId(request: any): string | null {
    // Try to extract from Authorization header
    const authHeader = request.headers.authorization;
    if (authHeader && authHeader.startsWith('Guest ')) {
      return authHeader.split(' ')[1];
    }

    // Try to extract from query parameter
    if (request.query && request.query.guestId) {
      return request.query.guestId;
    }

    // Try to extract from request body
    if (request.body && request.body.guestId) {
      return request.body.guestId;
    }

    return null;
  }
}
