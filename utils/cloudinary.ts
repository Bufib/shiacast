import { Cloudinary } from "@cloudinary/url-gen/index";

export const CLOUD_NAME = "dcl4xe1vw";
export const cld = new Cloudinary({
  cloud: { cloudName: CLOUD_NAME },
  url: { secure: true },
});

// HLS stream URL helper (sp_auto → adaptive streaming)
export const hlsUrl = (
publicId: string,
opts?: { streamingProfile?: string }
) => `https://res.cloudinary.com/${CLOUD_NAME}/video/upload/${opts?.streamingProfile ?? 'sp_auto'}/${publicId}.m3u8`;