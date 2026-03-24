import { Response } from 'express';

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface ApiResponseOptions<T> {
  res: Response;
  statusCode?: number;
  message?: string;
  data?: T;
  meta?: PaginationMeta;
}

export class ApiResponse {
  static success<T>({ res, statusCode = 200, message = 'Success', data, meta }: ApiResponseOptions<T>) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
      ...(meta && { meta }),
    });
  }

  static created<T>({ res, message = 'Created successfully', data }: ApiResponseOptions<T>) {
    return res.status(201).json({
      success: true,
      message,
      data,
    });
  }

  static noContent(res: Response) {
    return res.status(204).send();
  }

  static paginated<T>(
    res: Response,
    data: T[],
    total: number,
    page: number,
    limit: number,
    message = 'Success'
  ) {
    return res.status(200).json({
      success: true,
      message,
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  }
}
