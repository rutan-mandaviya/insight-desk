import { HttpStatus } from '@nestjs/common';

export interface MetaData {
  page?: number;
  limit?: number;
  totalItems?: number;
  totalPages?: number;
  [key: string]: any;
}

export class ApiResponse<T> {
  statusCode: number;
  message: string;
  data?: T | { items: T; meta: MetaData };
}

export function buildResponse<T>(
  statusCode: HttpStatus,
  message: string,
  data?: T,
  meta?: MetaData,
): ApiResponse<T> {
  if (data !== undefined && meta) {
    return { statusCode, message, data: { items: data, meta } };
  }

  if (data !== undefined) {
    return { statusCode, message, data };
  }

  return { statusCode, message };
}
