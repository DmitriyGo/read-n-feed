export interface IFileStorageService {
  saveFile(
    fileBuffer: Buffer,
    filename: string,
    mimeType: string,
  ): Promise<string>;
  getFile(filePath: string): Promise<Buffer>;
  deleteFile(filePath: string): Promise<void>;
  getFileUrl(filePath: string): Promise<string>;
  generateChecksum?(fileBuffer: Buffer): string;
}
