import { supabase } from "./supabase";

const AUDIO_BUCKET = "podcasts";
const IMAGE_BUCKET = "images";

const USE_SIGNED_AUDIO_URLS = true;

const AUDIO_SIGNED_URL_EXPIRES_IN_SECONDS = 60 * 60 * 24;
const IMAGE_SIGNED_URL_EXPIRES_IN_SECONDS = 60 * 60 * 24;

function cleanBucketPath(path: string, bucketName?: string): string {
  let cleanPath = path.trim().replace(/\\/g, "/").replace(/^\/+/, "");

  if (bucketName) {
    cleanPath = cleanPath.replace(new RegExp(`^${bucketName}/`), "");
  }

  return cleanPath;
}

export function cleanAudioPath(filename: string): string {
  return cleanBucketPath(filename, AUDIO_BUCKET);
}

export function cleanImagePath(filename: string): string {
  return cleanBucketPath(filename, IMAGE_BUCKET);
}

export function getPublicAudioUrl(filename: string): string {
  const cleanFilename = cleanAudioPath(filename);

  const { data } = supabase.storage
    .from(AUDIO_BUCKET)
    .getPublicUrl(cleanFilename);

  return data.publicUrl;
}

export async function getSignedAudioUrl(
  filename: string,
  expiresInSeconds = AUDIO_SIGNED_URL_EXPIRES_IN_SECONDS,
): Promise<string> {
  const cleanFilename = cleanAudioPath(filename);

  if (!cleanFilename) {
    throw new Error("getSignedAudioUrl requires a non-empty filename.");
  }

  const { data, error } = await supabase.storage
    .from(AUDIO_BUCKET)
    .createSignedUrl(cleanFilename, expiresInSeconds);

  if (error || !data?.signedUrl) {
    throw error ?? new Error("Could not create signed audio URL.");
  }

  return data.signedUrl;
}

export async function getPodcastAudioUrl(filename: string): Promise<string> {
  return USE_SIGNED_AUDIO_URLS
    ? getSignedAudioUrl(filename)
    : getPublicAudioUrl(filename);
}

export async function getSignedImageUrls(
  filenames: string[],
): Promise<Record<string, string>> {
  if (filenames.length === 0) return {};

  const cleanPaths = filenames.map(cleanImagePath);

  const { data, error } = await supabase.storage
    .from(IMAGE_BUCKET)
    .createSignedUrls(cleanPaths, IMAGE_SIGNED_URL_EXPIRES_IN_SECONDS);

  if (error || !data) {
    console.warn("[getSignedImageUrls] error:", error);
    return {};
  }

  const urlMap: Record<string, string> = {};

  data.forEach((item: any, index: number) => {
    const originalFilename = filenames[index];

    if (item.signedUrl) {
      urlMap[originalFilename] = item.signedUrl;
    } else if (item.error) {
      console.warn(
        `[getSignedImageUrls] failed for ${originalFilename}:`,
        item.error,
      );
    }
  });

  return urlMap;
}

export async function getSignedImageUrl(
  filename?: string | null,
): Promise<string | null> {
  if (!filename) return null;

  const urlMap = await getSignedImageUrls([filename]);

  return urlMap[filename] ?? null;
}

export async function attachPodcastImageUrls<
  T extends { image_filename?: string | null },
>(podcasts: T[]): Promise<(T & { image_url: string | null })[]> {
  const imageFilenames = podcasts
    .map((podcast) => podcast.image_filename)
    .filter((filename): filename is string => Boolean(filename));

  const imageUrlMap = await getSignedImageUrls(imageFilenames);

  return podcasts.map((podcast) => ({
    ...podcast,
    image_url: podcast.image_filename
      ? (imageUrlMap[podcast.image_filename] ?? null)
      : null,
  }));
}
