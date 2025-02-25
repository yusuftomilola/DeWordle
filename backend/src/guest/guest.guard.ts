import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { GuestService } from './guest.service';

@Injectable()
export class GuestGuard implements CanActivate {
  constructor(private readonly guestService: GuestService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const guestId = this.extractGuestId(request);

    if (!guestId) {
      throw new UnauthorizedException('Guest ID is missing');
    }

    const isValid = this.guestService.validateGuest(guestId);

    if (!isValid) {
      throw new ForbiddenException('Guest session has expired');
    }

    // Add guest ID to request for controllers to use
    request.guestId = guestId;
    return true;
  }

  private extractGuestId(request: any): string | null {
    // extract from Authorization header
    const authHeader = request.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.split(' ')[1];
    }

    // extract from query parameter
    if (request.query && request.query.guestId) {
      return request.query.guestId;
    }

    // extract from request body
    if (request.body && request.body.guestId) {
      return request.body.guestId;
    }

    return null;
  }
}
