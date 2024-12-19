import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({params, request, locals}) => {
  const formData = await request.formData();
  const image = formData.get('image') as File;
  const env = locals.runtime.env;
  const storage = env.MEDIA;

  let imageUrl = '';
  try {
    // Generate a unique key for the file
    const key = `${Date.now()}-${image.name}`;
    console.log(image.size);

    // Convert the file to a Blob
    const blob = await image.arrayBuffer();

    // Upload file to R2
    await storage.put(key, blob, {
      httpMetadata: {
        contentType: image.type,
      },
    });
    const cdnUrl = typeof env.CDN_URL === 'string' ? env.CDN_URL : 'https://example.com';
    imageUrl = new URL(key, cdnUrl).toString();
  } catch (e) {
    console.error(e);
  }
  
  return new Response(
    JSON.stringify({
      url: imageUrl
    })
  )
}