import { PdfExtractor } from "./pdf-extractor.interface";

export class MarkItDownApiExtractor implements PdfExtractor {
  async extract(fileBuffer: Buffer, fileName: string) {
    const formData = new FormData();
    formData.append("file", new Blob([new Uint8Array(fileBuffer)]), fileName);

    const pdfServiceUrl = process.env.PDF_SERVICE_URL || "http://pdf-service:8000";

    const response = await fetch(`${pdfServiceUrl}/extract`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Gagal mengekstrak PDF di microservice");
    }

    const data = await response.json();
    return { markdown: data.markdown };
  }
}
