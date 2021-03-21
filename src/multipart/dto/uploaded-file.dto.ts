export class UploadedFile {
  constructor(data: Partial<UploadedFile>) {
    Object.assign(this, data);
  }

  public readonly filename: string;
  public readonly fileSize: number;
  public readonly mimetype: string;
  public readonly encoding: string;
  public readonly extname: string;
}
