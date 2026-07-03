export class WebResponse<T> {
  data?: T;
  error?: string;
  paging?: Paging;
  statusCode?: number;
  message?: string;
}

export class Paging {
  totalPage?: number;
  currentPage?: number;
  pageSize?: number;
  totalItem?: number;
}
