import { ParsedUrlQuery } from 'querystring';

export interface PaginationParams {
  page: number;
  pageSize: number;
  rowCount?: number;
  pageCount?: number;
}

const defaultParams: PaginationParams = { page: 1, pageSize: 10 };

const parseParams = (query: ParsedUrlQuery): PaginationParams => {
  const params: PaginationParams = { ...defaultParams };

  if (typeof query.page === 'string' && query.page.length) {
    const parsedPage = parseInt(query.page, 10);

    if (parsedPage > 0) {
      params.page = parsedPage;
    }
  }

  if (typeof query.pageSize === 'string' && query.pageSize.length) {
    const parsedPageSize = parseInt(query.pageSize, 10);

    if (parsedPageSize > 0) {
      params.pageSize = parsedPageSize;
    }
  }

  return params;
};

export const generatePagination = (
  rowCount: number,
  query: ParsedUrlQuery,
): [PaginationParams, number, number] => {
  const params = parseParams(query);
  const { page, pageSize } = params;
  const pageCount = Math.ceil(rowCount / pageSize);

  return [
    {
      page,
      pageSize,
      rowCount,
      pageCount,
    },
    pageSize,
    (page - 1) * pageSize,
  ];
};
