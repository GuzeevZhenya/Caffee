import { mkdirSync, writeFileSync } from "node:fs";
import { extname } from "node:path";
import { fileURLToPath } from "node:url";

const UPLOAD_DIR = fileURLToPath(new URL("../../../../data/uploads/menu", import.meta.url));
const MAX_BYTES = 2_000_000;
const TYPES: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

export function menuUploadDir(): string {
  return UPLOAD_DIR;
}

export async function saveMenuPhoto(itemId: string, file: File): Promise<string> {
  const ext = TYPES[file.type] ?? (file.name ? extname(file.name).toLowerCase() : "");
  if (!ext || ![ ".jpg", ".jpeg", ".png", ".webp" ].includes(ext)) {
    throw new Error("unsupported_type");
  }
  if (file.size > MAX_BYTES) {
    throw new Error("too_large");
  }
  const safeExt = ext === ".jpeg" ? ".jpg" : ext;
  const bytes = new Uint8Array(await file.arrayBuffer());
  mkdirSync(UPLOAD_DIR, { recursive: true });
  const filename = `${itemId.replace(/[^a-zA-Z0-9_-]/g, "")}${safeExt}`;
  writeFileSync(`${UPLOAD_DIR}/${filename}`, bytes);
  return `/api/uploads/menu/${filename}?v=${Date.now()}`;
}
