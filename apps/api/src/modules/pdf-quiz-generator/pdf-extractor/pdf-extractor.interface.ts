export interface PdfExtractor {
  extract(fileBuffer: Buffer, fileName: string): Promise<{ markdown: string }>;
}
