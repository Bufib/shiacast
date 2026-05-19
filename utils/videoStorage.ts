import { supabase } from "./supabase";

const IMAGE_BUCKET = "images";

function cleanBucketPath(path: string, bucketName?: string): string {
  let cleanPath = path.trim().replace(/\\/g, "/").replace(/^\/+/, "");
  if (bucketName) {
    cleanPath = cleanPath.replace(new RegExp(`^${bucketName}/`), "");
  }
  return cleanPath;
}

function getPublicImageUrl(filename: string): string {
  const cleanFilename = cleanBucketPath(filename, IMAGE_BUCKET);
  const { data } = supabase.storage
    .from(IMAGE_BUCKET)
    .getPublicUrl(cleanFilename);
  return data.publicUrl;
}

function getImageCacheKey(filename: string): string {
  return `${IMAGE_BUCKET}:${cleanBucketPath(filename, IMAGE_BUCKET)}`;
}

export function attachVideoImageUrls<
  T extends { image_filename?: string | null },
>(
  videos: T[],
): (T & { image_url: string | null; image_cache_key: string | null })[] {
  return videos.map((video) => ({
    ...video,
    image_url: video.image_filename
      ? getPublicImageUrl(video.image_filename)
      : null,
    image_cache_key: video.image_filename
      ? getImageCacheKey(video.image_filename)
      : null,
  }));
}
