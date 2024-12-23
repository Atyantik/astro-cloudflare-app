import type { APIRoute } from 'astro';
import {
  constructCdnUrl,
  fileExists,
  uploadFile,
  validateImage,
} from '@utils/r2-storage.util';
import { computeShortHash } from '@utils/hash.util';

type R2Bucket = Env["STORAGE"];

/**
 * Generates a unique key for the file using its hash and name.
 * @param hashHex - The SHA-256 hash of the file.
 * @param fileName - The original name of the file.
 * @returns A unique key string.
 */
function generateKey(hashHex: string, fileName: string): string {
  return `${hashHex}-${fileName}`;
}

/**
 * Handles the upload process of an image.
 * @param formData - The parsed form data from the request.
 * @param storage - The R2 storage binding.
 * @param cdnUrlEnv - The CDN_URL from environment variables.
 * @param mode - The current environment mode.
 * @param requestUrl - The original request URL.
 * @returns The URL of the uploaded image.
 * @throws Error if any step fails.
 */
async function handleUpload(
  formData: FormData,
  storage: R2Bucket,
  cdnUrlEnv: string | undefined,
  mode: string,
  requestUrl: string
): Promise<string> {
  // Validate the image
  const image = validateImage(formData.get('image'));

  // Read the file content as ArrayBuffer
  const arrayBuffer = await image.arrayBuffer();

  // Compute SHA-256 hash
  const hashHex = await computeShortHash(arrayBuffer);

  // Generate unique key
  const key = generateKey(hashHex, image.name);

  // Check if file exists
  const exists = await fileExists(storage, key);

  if (!exists) {
    // Upload the file if it doesn't exist
    await uploadFile(storage, key, arrayBuffer, image.type);
  }

  // Construct the CDN URL
  const imageUrl = constructCdnUrl(mode, cdnUrlEnv, requestUrl, key);

  return imageUrl;
}

/**
 * POST route handler for uploading images to R2.
 */
export const POST: APIRoute = async ({ request, locals }) => {
  const { STORAGE: storage, CDN_URL } = locals.runtime.env;
  const mode = import.meta.env.MODE;
  const requestUrl = request.url;

  try {
    // Parse form data
    const formData = await request.formData();

    // Handle the upload process
    const imageUrl = await handleUpload(
      formData,
      storage,
      CDN_URL,
      mode,
      requestUrl,
    );

    // Respond with the image URL
    return new Response(
      JSON.stringify({ url: imageUrl }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    let errorMessage = 'Failed to upload image. Please try again later.';
    let status = 500;
    if (error instanceof Error) {
      console.error('Error uploading image:', error.message);

      // Determine error type for appropriate response
      status = error.message.includes('No image file') ? 400 : 500;
      errorMessage = status === 400
        ? error.message
        : 'Failed to upload image. Please try again later.';
    }
    

    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
};