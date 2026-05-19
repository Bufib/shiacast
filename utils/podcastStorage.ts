import { supabase } from "./supabase";

const IMAGE_BUCKET = "images";

function cleanBucketPath(path: string, bucketName?: string): string {
  let cleanPath = path.trim().replace(/\\/g, "/").replace(/^\/+/, "");
  if (bucketName) {
    cleanPath = cleanPath.replace(new RegExp(`^${bucketName}/`), "");
  }
  return cleanPath;
}

export function cleanImagePath(filename: string): string {
  return cleanBucketPath(filename, IMAGE_BUCKET);
}

export function getPublicImageUrl(filename: string): string {
  const cleanFilename = cleanImagePath(filename);
  const { data } = supabase.storage
    .from(IMAGE_BUCKET)
    .getPublicUrl(cleanFilename);
  return data.publicUrl;
}

export function getPublicImageUrls(
  filenames: string[],
): Record<string, string> {
  if (filenames.length === 0) return {};

  const urlMap: Record<string, string> = {};
  filenames.forEach((filename) => {
    urlMap[filename] = getPublicImageUrl(filename);
  });
  return urlMap;
}

export function getImageUrl(filename?: string | null): string | null {
  if (!filename) return null;
  return getPublicImageUrl(filename);
}

export function attachPodcastImageUrls<
  T extends { image_filename?: string | null },
>(podcasts: T[]): (T & { image_url: string | null })[] {
  return podcasts.map((podcast) => ({
    ...podcast,
    image_url: podcast.image_filename
      ? getPublicImageUrl(podcast.image_filename)
      : null,
  }));
}
