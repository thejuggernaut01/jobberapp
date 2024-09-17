import cloudinary, {
  UploadApiErrorResponse,
  UploadApiResponse,
} from 'cloudinary';

// if we allow cloudinary to create a public id, when a user updates
// a file, cloudinary will assign a new id to that file. but if we use our
// public id, the user can update the image multiple times with that same id.
export const upload = async (
  file: string,
  public_id?: string,
  overwrite?: boolean,
  invalidate?: boolean
): Promise<UploadApiResponse | UploadApiErrorResponse | undefined> => {
  try {
    const result = await cloudinary.v2.uploader.upload(file, {
      public_id,
      overwrite,
      invalidate,
      resource_type: 'auto',
    });
    return result;
  } catch (error) {
    // If there's an error, return it (you can log it or handle it differently if needed)
    return error as UploadApiErrorResponse;
  }
};

export const videoUpload = async (
  file: string,
  public_id?: string,
  overwrite?: boolean,
  invalidate?: boolean
): Promise<UploadApiResponse | UploadApiErrorResponse | undefined> => {
  try {
    const result = await cloudinary.v2.uploader.upload(file, {
      public_id,
      overwrite,
      invalidate,
      chunk_size: 50000,
      resource_type: 'video',
    });
    return result;
  } catch (error) {
    // If there's an error, return it (you can log it or handle it differently if needed)
    return error as UploadApiErrorResponse;
  }
};
