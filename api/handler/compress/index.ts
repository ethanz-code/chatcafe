import { Elysia, t } from "elysia";
import sharp from "sharp";
import { resolve } from "path";
import { mkdir, writeFile } from "fs/promises";
import moment from "moment";

interface Config {
  prefix: string;
}

const mediaRoot = "media/compress";

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
  return (bytes / (1024 * 1024)).toFixed(2) + " MB";
}

function percentage(a: number, b: number): string {
  return Math.round((a / b) * 10000) / 100 + "%";
}

type ImageFormat = "png" | "jpeg" | "webp";

function getFormat(mime: string): ImageFormat {
  const map: Record<string, ImageFormat> = {
    "image/png": "png",
    "image/jpeg": "jpeg",
    "image/jpg": "jpeg",
    "image/webp": "webp",
  };
  return map[mime] || "png";
}

async function compressImage(
  buffer: Buffer,
  format: ImageFormat,
  quality: number,
): Promise<Buffer> {
  const instance = sharp(buffer);
  switch (format) {
    case "png":
      return instance.png({ quality, palette: true }).toBuffer();
    case "jpeg":
      return instance.jpeg({ quality }).toBuffer();
    case "webp":
      return instance.webp({ quality }).toBuffer();
    default:
      return instance.png({ quality, palette: true }).toBuffer();
  }
}

export const CompressPlugin = (config: Config) =>
  new Elysia()
    .post(
      `${config.prefix}compress`,
      async ({ body, request }) => {
        const file = body.file as File;
        const quality = Math.min(
          100,
          Math.max(1, parseInt(body.quality as string, 10) || 80),
        );
        const format = getFormat(file.type);
        const buffer = Buffer.from(await file.arrayBuffer());

        const compressed = await compressImage(buffer, format, quality);

        const code = Math.floor(Math.random() * 900000) + 100000;
        const filename = `${moment().unix()}_${code}`;
        const dir = resolve(mediaRoot, format);
        await mkdir(dir, { recursive: true });

        const origPath = resolve(dir, `${filename}.${format}`);
        const compPath = resolve(dir, `${filename}gz.${format}`);
        await writeFile(origPath, new Uint8Array(buffer));
        await writeFile(compPath, new Uint8Array(compressed));

        const host =
          request.headers.get("host") || `localhost:${process.env.PORT || 9091}`;
        const protocol = request.headers.get("x-forwarded-proto") || "http";
        const base = `${protocol}://${host}`;

        const perc = percentage(compressed.length, buffer.length);
        console.log(
          `[${moment().utcOffset(8).format("YYYY-MM-DD HH:mm:ss")}] [${perc}] ${formatFileSize(buffer.length)} -> ${formatFileSize(compressed.length)}`,
        );

        return {
          status: 0,
          message: "success",
          data: {
            uncompression: {
              url: `${base}/${mediaRoot}/${format}/${filename}.${format}`,
              size: formatFileSize(buffer.length),
            },
            compressed: {
              url: `${base}/${mediaRoot}/${format}/${filename}gz.${format}`,
              size: formatFileSize(compressed.length),
            },
            percentage: perc,
          },
        };
      },
      {
        body: t.Object({
          file: t.File(),
          quality: t.Optional(t.String()),
        }),
      },
    );
