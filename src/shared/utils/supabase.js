import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseKey =
  process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || "";

const supabase =
  supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

const getPublicBaseUrl = (req) => {
  const configuredUrl = process.env.PUBLIC_BASE_URL?.replace(/\/$/, "");
  if (configuredUrl) return configuredUrl;

  const host = req?.get ? req.get("host") : null;
  return host ? `https://${host}` : "";
};

const uploadOnSupabase = async (
  localFilePath,
  bucketName = "lume-uploads",
  req = null
) => {
  try {
    if (!localFilePath) return null;

    const filename = `${Date.now()}_${path.basename(localFilePath)}`;
    const fileBuffer = fs.readFileSync(localFilePath);

    if (supabase) {
      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(filename, fileBuffer, {
          contentType: getMimeType(localFilePath),
          upsert: true,
        });

      if (!error && data) {
        if (fs.existsSync(localFilePath)) {
          fs.unlinkSync(localFilePath);
        }

        const { data: publicUrlData } = supabase.storage
          .from(bucketName)
          .getPublicUrl(filename);

        return {
          url: publicUrlData.publicUrl,
          duration: 120,
        };
      } else {
        console.error("Supabase Storage Upload Warning:", error?.message);
      }
    }

    const baseUrl = getPublicBaseUrl(req);
    const cleanFilename = path.basename(localFilePath);
    const fileUrl = `${baseUrl}/temp/${cleanFilename}`;

    return {
      url: fileUrl,
      duration: 120,
    };
  } catch (error) {
    console.error("Storage upload error:", error.message);
    const cleanFilename = path.basename(localFilePath);
    const baseUrl = getPublicBaseUrl(req);

    return {
      url: `${baseUrl}/temp/${cleanFilename}`,
      duration: 120,
    };
  }
};

function getMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case ".mp4":
      return "video/mp4";
    case ".webm":
      return "video/webm";
    case ".mov":
      return "video/quicktime";
    case ".mkv":
      return "video/x-matroska";
    case ".png":
      return "image/png";
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".webp":
      return "image/webp";
    default:
      return "application/octet-stream";
  }
}

export { uploadOnSupabase };
