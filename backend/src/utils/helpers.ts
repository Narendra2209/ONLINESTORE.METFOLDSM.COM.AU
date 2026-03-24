import slugify from 'slugify';
import crypto from 'crypto';

export const generateSlug = (text: string): string => {
  return slugify(text, { lower: true, strict: true, trim: true });
};

export const generateOrderNumber = (): string => {
  const year = new Date().getFullYear();
  const random = crypto.randomInt(10000, 99999);
  return `MET-${year}-${random}`;
};

export const generateSKU = (parts: string[]): string => {
  return parts
    .map((p) => p.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6))
    .join('-');
};

export const roundPrice = (value: number): number => {
  return Math.round(value * 100) / 100;
};

export const calculateGST = (amount: number, rate = 0.1): number => {
  return roundPrice(amount * rate);
};

export const parsePaginationQuery = (query: { page?: string; limit?: string }) => {
  const page = Math.max(1, parseInt(query.page || '1', 10));
  const limit = Math.min(100, Math.max(1, parseInt(query.limit || '20', 10)));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};
