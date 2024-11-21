import { cloudinaryConfig } from '@users/config/cloudinary';
import { databaseConnection } from '@users/database';

const initialize = (): void => {
  cloudinaryConfig();
  databaseConnection();
};

initialize();
