import { Request, Response } from 'express';
import { categoryService } from '../services/category.service';
import { ApiResponse } from '../utils/ApiResponse';
import { catchAsync } from '../utils/catchAsync';

export const getCategories = catchAsync(async (req: Request, res: Response) => {
  const flat = req.query.flat === 'true';
  const categories = flat
    ? await categoryService.getAllFlat()
    : await categoryService.getAll();
  ApiResponse.success({ res, data: categories });
});

export const getCategoryBySlug = catchAsync(async (req: Request, res: Response) => {
  const category = await categoryService.getBySlug(req.params.slug);
  ApiResponse.success({ res, data: category });
});

export const createCategory = catchAsync(async (req: Request, res: Response) => {
  const category = await categoryService.create(req.body);
  ApiResponse.created({ res, data: category });
});

export const updateCategory = catchAsync(async (req: Request, res: Response) => {
  const category = await categoryService.update(req.params.id, req.body);
  ApiResponse.success({ res, data: category });
});

export const deleteCategory = catchAsync(async (req: Request, res: Response) => {
  await categoryService.delete(req.params.id);
  ApiResponse.success({ res, message: 'Category deleted' });
});

export const reorderCategories = catchAsync(async (req: Request, res: Response) => {
  await categoryService.reorder(req.body.items);
  ApiResponse.success({ res, message: 'Categories reordered' });
});

export const getAllCategoriesAdmin = catchAsync(async (_req: Request, res: Response) => {
  const categories = await categoryService.getAll(true);
  ApiResponse.success({ res, data: categories });
});
