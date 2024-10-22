import cloudinary from 'cloudinary';

import { ENVIRONMENT } from './environment';

export const cloudinaryConfig = (): void => {
  cloudinary.v2.config({
    cloud_name: ENVIRONMENT.DB.CLOUD_NAME,
    api_key: ENVIRONMENT.DB.CLOUD_API_KEY,
    api_secret: ENVIRONMENT.DB.CLOUD_API_SECRET
  });
};
