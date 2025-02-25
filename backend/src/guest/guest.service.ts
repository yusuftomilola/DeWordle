import { Injectable, OnModuleInit } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

interface GuestSession {
  id: string;
  expiresAt: Date;
}

@Injectable()
export class GuestService implements OnModuleInit {
  private guestSessions: Map<string, GuestSession> = new Map();
  private readonly EXPIRATION_TIME_MS = 10 * 60 * 1000; // 10 minutes in milliseconds
  private cleanupInterval: NodeJS.Timeout;

  onModuleInit() {
    // Set up periodic cleanup of expired sessions (every minute)
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpiredSessions();
    }, 60000);
  }

  onModuleDestroy() {
    // Clean up the interval when the module is destroyed
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
  }

  private cleanupExpiredSessions() {
    const now = new Date();
    for (const [id, session] of this.guestSessions.entries()) {
      if (session.expiresAt < now) {
        this.guestSessions.delete(id);
      }
    }
  }

  createGuest(): { id: string; expiresAt: Date } {
    const id = uuidv4();
    const expiresAt = new Date(Date.now() + this.EXPIRATION_TIME_MS);

    this.guestSessions.set(id, { id, expiresAt });

    return { id, expiresAt };
  }

  validateGuest(guestId: string): boolean {
    const session = this.guestSessions.get(guestId);

    if (!session) {
      return false;
    }

    if (session.expiresAt < new Date()) {
      this.guestSessions.delete(guestId);
      return false;
    }

    return true;
  }

  refreshGuestSession(guestId: string): { id: string; expiresAt: Date } | null {
    if (!this.validateGuest(guestId)) {
      return null;
    }

    const expiresAt = new Date(Date.now() + this.EXPIRATION_TIME_MS);
    this.guestSessions.set(guestId, { id: guestId, expiresAt });

    return { id: guestId, expiresAt };
  }
}
