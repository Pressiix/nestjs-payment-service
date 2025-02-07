import { DEFAULT_PAGE_SIZE } from '../../../src/configs/constants.config';
import { PaginationUtil } from '../../../src/utils/pagination.util';

describe('PaginationUtil', () => {
  describe('getPage', () => {
    it.each`
      sourceList                                                                                                               | page
      ${[]}                                                                                                                    | ${-1}
      ${null}                                                                                                                  | ${1}
      ${['1', '2', '3', '4', '5']}                                                                                             | ${1}
      ${['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21']} | ${1}
    `('should return array of source list', ({ sourceList, page }) => {
      const response = PaginationUtil.getPage(sourceList, page);

      const fromIndex = page * DEFAULT_PAGE_SIZE;
      const expected = sourceList?.slice(fromIndex, Math.min(fromIndex + DEFAULT_PAGE_SIZE, sourceList.length)) ?? [];

      expect(expected).toStrictEqual(response);
    });
  });

  describe('getPaginationMetadataTokenX', () => {
    it.each`
      dataCount | requestedPage | pageSize
      ${20}     | ${1}          | ${10}
      ${20}     | ${2}          | ${10}
      ${30}     | ${2}          | ${10}
    `('should return pagination response', ({ dataCount, requestedPage, pageSize }) => {
      const response = PaginationUtil.getPaginationMetadataTokenX(dataCount, requestedPage, pageSize);

      const hasNextPage: boolean = dataCount > (requestedPage + 1) * pageSize;
      const hasPreviousPage: boolean = requestedPage > 0 && dataCount > (requestedPage - 1) * pageSize;
      const expected = {
        currentPage: requestedPage,
        pageSize: pageSize,
        hasNextPage: hasNextPage,
        hasPreviousPage: hasPreviousPage,
      };

      expect(expected).toStrictEqual(response);
    });

    it('should return pagination response when pageSize is null', () => {
      const response = PaginationUtil.getPaginationMetadataTokenX(20, 2);

      const expected = {
        currentPage: 2,
        pageSize: 20,
        hasNextPage: false,
        hasPreviousPage: false,
      };

      expect(expected).toStrictEqual(response);
    });
  });

  describe('getPaginationMetadata', () => {
    it.each`
      sourceList                                                   | requestedPage | pageSize
      ${['1', '2', '3', '4', '5', '6']}                            | ${1}          | ${5}
      ${['1', '2', '3', '4', '5', '6']}                            | ${2}          | ${5}
      ${['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11']} | ${2}          | ${5}
    `('should return pagination response', ({ sourceList, requestedPage, pageSize }) => {
      const response = PaginationUtil.getPaginationMetadata(sourceList, requestedPage, pageSize);

      const hasNextPage: boolean = sourceList.length > (requestedPage + 1) * pageSize;
      const hasPreviousPage: boolean = requestedPage > 0 && sourceList.length > (requestedPage - 1) * pageSize;
      const expected = {
        currentPage: requestedPage,
        pageSize: pageSize,
        hasNextPage: hasNextPage,
        hasPreviousPage: hasPreviousPage,
      };

      expect(expected).toStrictEqual(response);
    });

    it('should return pagination response when pageSize is null', () => {
      const response = PaginationUtil.getPaginationMetadata(['1', '2', '3', '4', '5', '6'], 2);

      const expected = {
        currentPage: 2,
        pageSize: 20,
        hasNextPage: false,
        hasPreviousPage: false,
      };

      expect(expected).toStrictEqual(response);
    });
  });

  describe('hasNextPage', () => {
    it.each`
      totalRows | pageNumber | pageSize
      ${9}      | ${1}       | ${10}
      ${11}     | ${1}       | ${10}
      ${19}     | ${2}       | ${10}
      ${21}     | ${2}       | ${10}
    `('should return value of has next page', ({ totalRows, pageNumber, pageSize }) => {
      const response = PaginationUtil.hasNextPage(totalRows, pageNumber, pageSize);
      const expected = totalRows > (pageNumber + 1) * pageSize;
      expect(expected).toStrictEqual(response);
    });
  });

  describe('hasPreviousPage', () => {
    it.each`
      totalRows | pageNumber | pageSize
      ${9}      | ${1}       | ${10}
      ${11}     | ${2}       | ${10}
      ${19}     | ${1}       | ${20}
      ${21}     | ${2}       | ${20}
    `('should return value of has previous page', ({ totalRows, pageNumber, pageSize }) => {
      const response = PaginationUtil.hasPreviousPage(totalRows, pageNumber, pageSize);
      const expected = pageNumber > 0 && totalRows > (pageNumber - 1) * pageSize;
      expect(expected).toStrictEqual(response);
    });
  });
});
