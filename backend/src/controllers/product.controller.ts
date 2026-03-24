import { Request, Response } from 'express';
import { productService } from '../services/product.service';
import { pricingService } from '../services/pricing.service';
import { attributeService } from '../services/attribute.service';
import { uploadService } from '../services/upload.service';
import Product from '../models/Product';
import { ApiResponse } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';
import { catchAsync } from '../utils/catchAsync';
import { AuthRequest } from '../middlewares/auth';

// === PUBLIC ===

export const listProducts = catchAsync(async (req: Request, res: Response) => {
  const result = await productService.list(req.query as any);
  ApiResponse.paginated(res, result.products, result.total, result.page, result.limit);
});

export const getProductBySlug = catchAsync(async (req: Request, res: Response) => {
  const product = await productService.getBySlug(req.params.slug);
  ApiResponse.success({ res, data: product });
});

export const calculatePrice = catchAsync(async (req: AuthRequest, res: Response) => {
  const { selectedAttributes, length, quantity } = req.body;
  const breakdown = await pricingService.calculatePrice({
    productId: req.params.id,
    selectedAttributes,
    length,
    quantity,
    userType: req.user?.userType,
  });
  ApiResponse.success({ res, data: breakdown });
});

// === ADMIN ===

export const listProductsAdmin = catchAsync(async (req: Request, res: Response) => {
  const result = await productService.list(req.query as any, true);
  ApiResponse.paginated(res, result.products, result.total, result.page, result.limit);
});

export const getProductAdmin = catchAsync(async (req: Request, res: Response) => {
  const product = await productService.getByIdAdmin(req.params.id);
  ApiResponse.success({ res, data: product });
});

export const createProduct = catchAsync(async (req: AuthRequest, res: Response) => {
  const product = await productService.create({
    ...req.body,
    createdBy: req.user?._id,
    updatedBy: req.user?._id,
  });
  ApiResponse.created({ res, data: product });
});

export const updateProduct = catchAsync(async (req: AuthRequest, res: Response) => {
  const product = await productService.update(req.params.id, {
    ...req.body,
    updatedBy: req.user?._id,
  });
  ApiResponse.success({ res, data: product });
});

export const updateProductStatus = catchAsync(async (req: Request, res: Response) => {
  const product = await productService.updateStatus(req.params.id, req.body.status);
  ApiResponse.success({ res, data: product });
});

export const deleteProduct = catchAsync(async (req: Request, res: Response) => {
  await productService.delete(req.params.id);
  ApiResponse.success({ res, message: 'Product archived' });
});

export const duplicateProduct = catchAsync(async (req: Request, res: Response) => {
  const product = await productService.duplicate(req.params.id);
  ApiResponse.created({ res, data: product });
});

// === ATTRIBUTES ===

export const listAttributes = catchAsync(async (_req: Request, res: Response) => {
  const attributes = await attributeService.getAll();
  ApiResponse.success({ res, data: attributes });
});

export const getFilterableAttributes = catchAsync(async (_req: Request, res: Response) => {
  const attributes = await attributeService.getFilterable();
  ApiResponse.success({ res, data: attributes });
});

export const createAttribute = catchAsync(async (req: Request, res: Response) => {
  const attribute = await attributeService.create(req.body);
  ApiResponse.created({ res, data: attribute });
});

export const updateAttribute = catchAsync(async (req: Request, res: Response) => {
  const attribute = await attributeService.update(req.params.id, req.body);
  ApiResponse.success({ res, data: attribute });
});

export const deleteAttribute = catchAsync(async (req: Request, res: Response) => {
  await attributeService.delete(req.params.id);
  ApiResponse.success({ res, message: 'Attribute deleted' });
});

// === IMAGE UPLOAD ===

export const uploadProductImages = catchAsync(async (req: Request, res: Response) => {
  const files = req.files as Express.Multer.File[];
  if (!files || files.length === 0) {
    throw new ApiError(400, 'No images provided');
  }

  const product = await Product.findById(req.params.id);
  if (!product) throw new ApiError(404, 'Product not found');

  const uploadResults = await Promise.all(
    files.map((file) => uploadService.uploadImage(file.buffer, 'products'))
  );

  const newImages = uploadResults.map((result, i) => ({
    url: result.url,
    publicId: result.publicId,
    alt: product.name,
    sortOrder: product.images.length + i,
    isDefault: product.images.length === 0 && i === 0,
  }));

  product.images.push(...newImages);
  await product.save();

  ApiResponse.success({ res, message: `${files.length} image(s) uploaded`, data: product.images });
});

export const deleteProductImage = catchAsync(async (req: Request, res: Response) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw new ApiError(404, 'Product not found');

  const imageIndex = product.images.findIndex(
    (img: any) => img._id?.toString() === req.params.imageId
  );
  if (imageIndex === -1) throw new ApiError(404, 'Image not found');

  const image = product.images[imageIndex];

  // Delete from Cloudinary
  if (image.publicId) {
    await uploadService.deleteImage(image.publicId);
  }

  // Remove from array
  product.images.splice(imageIndex, 1);

  // If we deleted the default image, set first remaining as default
  if (image.isDefault && product.images.length > 0) {
    product.images[0].isDefault = true;
  }

  await product.save();

  ApiResponse.success({ res, message: 'Image deleted', data: product.images });
});

// === PRICING RULES ===

export const createPricingRule = catchAsync(async (req: Request, res: Response) => {
  const rule = await pricingService.upsertPricingRule(req.params.id, req.body);
  ApiResponse.created({ res, data: rule });
});

export const simulatePricing = catchAsync(async (req: Request, res: Response) => {
  const breakdown = await pricingService.calculatePrice(req.body);
  ApiResponse.success({ res, data: breakdown });
});
