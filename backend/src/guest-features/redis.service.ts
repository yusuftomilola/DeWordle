// /* eslint-disable @typescript-eslint/no-unused-vars */
// import {
//   Injectable,
//   Inject,
//   InternalServerErrorException,
// } from '@nestjs/common';
// import { CACHE_MANAGER } from '@nestjs/cache-manager';
// import { DatabaseErrorException } from '../common/exceptions/database-error.exception';

// @Injectable()
// export class RedisService {
//   constructor(@Inject(CACHE_MANAGER) private cacheManager: any) {}

//   // ✅ Store guest session with 10-min expiry
//   async setGuestSession(guestId: string) {
//     try {
//       await this.cacheManager.set(`guest_session:${guestId}`, 'active', 600); // TTL: 10 mins
//     } catch (error) {
//       throw new DatabaseErrorException(
//         'Failed to store guest session in Redis',
//       );
//     }
//   }

//   // ✅ Retrieve guest session and RENEW TTL on each request
//   async getGuestSession(guestId: string): Promise<string | null> {
//     try {
//       const session = (await this.cacheManager.get(
//         `guest_session:${guestId}`,
//       )) as string | null;

//       if (session) {
//         // 🔄 Session exists → Renew TTL
//         await this.cacheManager.set(`guest_session:${guestId}`, 'active', 600);
//       }

//       return session;
//     } catch (error) {
//       throw new DatabaseErrorException(
//         'Failed to retrieve guest session from Redis',
//       );
//     }
//   }

//   // ✅ Delete guest session (cleanup after expiry)
//   async deleteGuestSession(guestId: string) {
//     try {
//       await this.cacheManager.del(`guest_session:${guestId}`);
//     } catch (error) {
//       throw new DatabaseErrorException(
//         'Failed to delete guest session from Redis',
//       );
//     }
//   }
// }
