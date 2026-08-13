import JSZip from "jszip";

export interface ZipFileItem {
  filename: string;
  content: string | Uint8Array | Buffer;
}

export async function createZipArchive(files: ZipFileItem[]): Promise<Buffer> {
  const zip = new JSZip();
  for (const file of files) {
    zip.file(file.filename, file.content);
  }
  const content = await zip.generateAsync({
    type: "nodebuffer",
    compression: "DEFLATE",
    compressionOptions: { level: 6 },
  });
  return content;
}
