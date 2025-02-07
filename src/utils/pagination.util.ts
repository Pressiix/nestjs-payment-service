import { PaginationResponse } from '../models/response/pagination.response';
import { DEFAULT_PAGE_SIZE } from '../configs/constants.config';

export class PaginationUtil {
  static getPage(sourceList: any[], page: number): any[] {
    if (page < 0) {
      return [];
    }

    const fromIndex = page * DEFAULT_PAGE_SIZE;
    if (sourceList == null || sourceList.length <= fromIndex) {
      return [];
    }

    return sourceList.slice(fromIndex, Math.min(fromIndex + DEFAULT_PAGE_SIZE, sourceList.length));
  }

  static getPaginationMetadataTokenX(
    dataCount: number,
    requestedPage: number,
    pageSize = DEFAULT_PAGE_SIZE,
  ): PaginationResponse {
    const hasNextPage: boolean = dataCount > (requestedPage + 1) * pageSize;
    const hasPreviousPage: boolean = requestedPage > 0 && dataCount > (requestedPage - 1) * pageSize;

    return {
      currentPage: requestedPage,
      pageSize: pageSize,
      hasNextPage: hasNextPage,
      hasPreviousPage: hasPreviousPage,
    };
  }

  static getPaginationMetadata(
    sourceList: Array<any>,
    requestedPage: number,
    pageSize = DEFAULT_PAGE_SIZE,
  ): PaginationResponse {
    const hasNextPage: boolean = sourceList.length > (requestedPage + 1) * pageSize;
    const hasPreviousPage: boolean = requestedPage > 0 && sourceList.length > (requestedPage - 1) * pageSize;

    return {
      currentPage: requestedPage,
      pageSize: pageSize,
      hasNextPage: hasNextPage,
      hasPreviousPage: hasPreviousPage,
    };
  }

  static hasNextPage(totalRows: number, pageNumber: number, pageSize: number): boolean {
    return totalRows > (pageNumber + 1) * pageSize;
  }

  static hasPreviousPage(totalRows: number, pageNumber: number, pageSize: number): boolean {
    return pageNumber > 0 && totalRows > (pageNumber - 1) * pageSize;
  }
}
