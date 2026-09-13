import zlib from "node:zlib";

export interface ZipFileItem {
  filename: string;
  content: string | Uint8Array | Buffer;
}

// Pre-computed CRC32 lookup table
const crcTable: Uint32Array = (() => {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[i] = c;
  }
  return table;
})();

function calculateCrc32(buf: Buffer): number {
  let crc = 0 ^ -1;
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ crcTable[(crc ^ buf[i]) & 0xff];
  }
  return (crc ^ -1) >>> 0;
}

/**
 * Creates a valid, standard ZIP archive without external dependencies using Node.js built-in zlib.
 */
export async function createZipArchive(files: ZipFileItem[]): Promise<Buffer> {
  const localHeaders: Buffer[] = [];
  const centralDirHeaders: Buffer[] = [];
  let offset = 0;

  // Standard DOS timestamp (current time)
  const now = new Date();
  const dosTime =
    ((now.getHours() & 0x1f) << 11) |
    ((now.getMinutes() & 0x3f) << 5) |
    ((Math.floor(now.getSeconds() / 2) & 0x1f));
  const dosDate =
    (((now.getFullYear() - 1980) & 0x7f) << 9) |
    (((now.getMonth() + 1) & 0x0f) << 5) |
    (now.getDate() & 0x1f);

  for (const file of files) {
    const rawBuffer =
      typeof file.content === "string"
        ? Buffer.from(file.content, "utf-8")
        : Buffer.isBuffer(file.content)
        ? file.content
        : Buffer.from(file.content);

    const nameBuffer = Buffer.from(file.filename, "utf-8");
    const crc = calculateCrc32(rawBuffer);
    const uncompressedSize = rawBuffer.length;

    // Deflate compression
    const compressedData = zlib.deflateRawSync(rawBuffer, { level: 6 });
    const compressedSize = compressedData.length;

    // Local file header (30 bytes + filename)
    const localHeader = Buffer.alloc(30 + nameBuffer.length);
    localHeader.writeUInt32LE(0x04034b50, 0); // Local header signature
    localHeader.writeUInt16LE(20, 4); // Version needed (2.0)
    localHeader.writeUInt16LE(0x0800, 6); // UTF-8 filename flag
    localHeader.writeUInt16LE(8, 8); // Deflate compression method
    localHeader.writeUInt16LE(dosTime, 10);
    localHeader.writeUInt16LE(dosDate, 12);
    localHeader.writeUInt32LE(crc, 14);
    localHeader.writeUInt32LE(compressedSize, 18);
    localHeader.writeUInt32LE(uncompressedSize, 22);
    localHeader.writeUInt16LE(nameBuffer.length, 26);
    localHeader.writeUInt16LE(0, 28); // Extra field length
    nameBuffer.copy(localHeader, 30);

    const localEntry = Buffer.concat([localHeader, compressedData]);
    localHeaders.push(localEntry);

    // Central directory header (46 bytes + filename)
    const cdHeader = Buffer.alloc(46 + nameBuffer.length);
    cdHeader.writeUInt32LE(0x02014b50, 0); // Central directory signature
    cdHeader.writeUInt16LE(0x0314, 4); // Version made by (Unix 2.0)
    cdHeader.writeUInt16LE(20, 6); // Version needed
    cdHeader.writeUInt16LE(0x0800, 8); // UTF-8 flag
    cdHeader.writeUInt16LE(8, 10); // Deflate method
    cdHeader.writeUInt16LE(dosTime, 12);
    cdHeader.writeUInt16LE(dosDate, 14);
    cdHeader.writeUInt32LE(crc, 16);
    cdHeader.writeUInt32LE(compressedSize, 20);
    cdHeader.writeUInt32LE(uncompressedSize, 24);
    cdHeader.writeUInt16LE(nameBuffer.length, 28);
    cdHeader.writeUInt16LE(0, 30); // Extra field length
    cdHeader.writeUInt16LE(0, 32); // File comment length
    cdHeader.writeUInt16LE(0, 34); // Disk number start
    cdHeader.writeUInt16LE(0, 36); // Internal attributes
    cdHeader.writeUInt32LE(0o100644 << 16, 38); // External file attributes (regular file)
    cdHeader.writeUInt32LE(offset, 42); // Relative offset of local header
    nameBuffer.copy(cdHeader, 46);

    centralDirHeaders.push(cdHeader);

    offset += localEntry.length;
  }

  const centralDirBuffer = Buffer.concat(centralDirHeaders);
  const cdSize = centralDirBuffer.length;
  const cdOffset = offset;

  // End of central directory record (22 bytes)
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0); // EOCD signature
  eocd.writeUInt16LE(0, 4); // Disk number
  eocd.writeUInt16LE(0, 6); // Disk with CD start
  eocd.writeUInt16LE(files.length, 8); // Records on this disk
  eocd.writeUInt16LE(files.length, 10); // Total records
  eocd.writeUInt32LE(cdSize, 12); // Central directory size
  eocd.writeUInt32LE(cdOffset, 16); // Central directory offset
  eocd.writeUInt16LE(0, 20); // Comment length

  return Buffer.concat([...localHeaders, centralDirBuffer, eocd]);
}
