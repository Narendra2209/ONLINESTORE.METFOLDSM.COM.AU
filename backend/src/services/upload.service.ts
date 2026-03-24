import { v2 as cloudinary } from 'cloudinary';
import { env } from '../config/env';
import { ApiError } from '../utils/ApiError';

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
});

export const uploadService = {
  async uploadImage(
    fileBuffer: Buffer,
    folder: string = 'products'
  ): Promise<{ url: string; publicId: string }> {
    return new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: `metfold/${folder}`,
            resource_type: 'image',
            transformation: [
              { width: 1200, height: 1200, crop: 'limit', quality: 'auto', format: 'webp' },
            ],
          },
          (error, result) => {
            if (error || !result) {
              reject(new ApiError(500, 'Image upload failed'));
            } else {
              resolve({
                url: result.secure_url,
                publicId: result.public_id,
              });
            }
          }
        )
        .end(fileBuffer);
    });
  },

  async deleteImage(publicId: string): Promise<void> {
    try {
      await cloudinary.uploader.destroy(publicId);
    } catch {
      // Silently fail on delete — image may already be gone
    }
  },
};
