// // search.repository.ts
// import { Injectable } from '@nestjs/common';
// import { InjectRepository } from '@nestjs/typeorm';
// import { Repository, EntityManager } from 'typeorm';
// import { SearchEntity } from './search.entity';
// import { SearchResultDto } from '../../search-result.dto/search-result.dto';
// import { SearchQueryDto } from '../../search-query.dto/search-query.dto';

// @Injectable()
// export class SearchRepository {
//   constructor(
//     @InjectRepository(SearchEntity)
//     private readonly repository: Repository<SearchEntity>,
//     private readonly entityManager: EntityManager,
//   ) {}

//   async search(searchQueryDto: SearchQueryDto): Promise<SearchResultDto<SearchEntity>> {
//     const { query, tags, startDate, endDate, contributedBy, page = 1, limit = 20, sortBy = 'relevance', sortOrder = 'desc' } = searchQueryDto;

//     const qb = this.repository.createQueryBuilder('entity');

//     if (query) {
//       qb.where("entity.title ILIKE :query OR entity.content ILIKE :query", { query: `%${query}%` });
//     }

//     if (tags && tags.length > 0) {
//       qb.andWhere('entity.tags && :tags', { tags });
//     }
//     if (startDate) {
//       qb.andWhere('entity.createdAt >= :startDate', { startDate });
//     }
//     if (endDate) {
//       qb.andWhere('entity.createdAt <= :endDate', { endDate });
//     }
//     if (contributedBy) {
//       qb.andWhere('entity.userId = :contributedBy', { contributedBy });
//     }

//     if (query) {
//       qb.orderBy("entity.relevance", sortOrder);
//     } else {
//       qb.orderBy("entity.createdAt", sortOrder);
//     }

//     const total = await qb.getCount();
//     qb.skip((page - 1) * limit).take(limit);

//     const items = await qb.getMany();

//     return { items, total, page, limit, hasNext: page * limit < total };
//   }
// }