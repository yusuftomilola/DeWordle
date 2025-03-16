import { Injectable, Inject } from '@nestjs/common';
import {
  ObjectLiteral,
  Repository,
  FindOptionsWhere,
  FindOptionsOrder,
} from 'typeorm';
import { Request } from 'express';
import { REQUEST } from '@nestjs/core';
import { paginated } from '../interfaces/pagination-interface';
import { PaginationQueryDto } from 'src/common/pagination/dto/pagination-query-dto.dto';

@Injectable()
export class PaginationService {
  constructor(
    @Inject(REQUEST)
    private readonly request: Request,
  ) {}

  public async paginationQuery<T extends ObjectLiteral>(
    paginatedQueryDto: PaginationQueryDto,
    repository: Repository<T>,
  ): Promise<paginated<T>> {
    const { limit = 10, page = 1, sort, filter } = paginatedQueryDto;

    // Handle sorting with correct type
    const order: FindOptionsOrder<T> = {};
    if (sort) {
      const isDescending = sort.startsWith('-');
      const columnName = isDescending ? sort.substring(1) : sort;
      (order as any)[columnName] = isDescending ? 'DESC' : 'ASC'; // Type assertion to match FindOptionsOrder<T>
    }

    // Prepare filtering options
    const where: FindOptionsWhere<T>[] | undefined = filter
      ? [
          { name: filter } as unknown as FindOptionsWhere<T>,
          { description: filter } as unknown as FindOptionsWhere<T>,
        ]
      : undefined;

    // Fetch paginated results
    const [result, totalItems] = await repository.findAndCount({
      where,
      order,
      skip: limit * (page - 1),
      take: limit,
    });

    const totalPages = Math.ceil(totalItems / limit);
    const currentPage = page;
    const nextPage = page < totalPages ? page + 1 : totalPages;
    const previousPage = page > 1 ? page - 1 : 1;

    // Construct base URL
    const baseUrl = `${this.request.protocol}://${this.request.headers.host}`;
    const newUrl = new URL(this.request.url, baseUrl);

    // Construct paginated response
    const finalResponse: paginated<T> = {
      data: result,
      meta: {
        itemsPerPage: limit,
        totalItemsPerPage: totalItems,
        currentPage: page,
        totalPages: totalPages,
      },
      links: {
        firstPage: `${newUrl.origin}${newUrl.pathname}?limit=${limit}&page=1`,
        lastPage: `${newUrl.origin}${newUrl.pathname}?limit=${limit}&page=${totalPages}`,
        currentPage: `${newUrl.origin}${newUrl.pathname}?limit=${limit}&page=${currentPage}`,
        previousPage: `${newUrl.origin}${newUrl.pathname}?limit=${limit}&page=${previousPage}`,
        nextPage: `${newUrl.origin}${newUrl.pathname}?limit=${limit}&page=${nextPage}`,
      },
    };

    return finalResponse;
  }
}
