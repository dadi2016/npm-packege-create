type PageInfo = {
  hasNextPage: boolean;
  after: string;
};
export type PaginatedModel<T> = {
  docs: T[];
  total: number;
  pageInfo: PageInfo;
};
