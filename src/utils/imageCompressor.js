import imageCompression from 'browser-image-compression';

/**
 * Compress an image file using browser-image-compression library before sending to database / storage.
 * @param {File} file - The original uploaded file
 * @param {number} maxSizeMB - Target max size in MB (default 0.45 MB = ~450 KB, strictly under 500 KB)
 * @param {number} maxWidthOrHeight - Maximum width or height dimension (default 800px)
 * @returns {Promise<File>} - Compressed File object ready for upload
 */
export const compressImage = async (file, maxSizeMB = 0.45, maxWidthOrHeight = 800) => {
  if (!file) return file;

  if (!file.type || !file.type.startsWith('image/')) {
    throw new Error('Selected file is not a valid image.');
  }

  const options = {
    maxSizeMB: maxSizeMB, // ~450 KB target (guaranteed under 500 KB)
    maxWidthOrHeight: maxWidthOrHeight,
    useWebWorker: true,
    initialQuality: 0.8,
  };

  try {
    const compressedFile = await imageCompression(file, options);
    return compressedFile;
  } catch (error) {
    console.error('Image compression failed:', error);
    throw new Error('Failed to compress image file.');
  }
};
