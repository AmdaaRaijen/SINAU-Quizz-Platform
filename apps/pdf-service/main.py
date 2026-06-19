from fastapi import FastAPI, UploadFile, File, HTTPException
from markitdown import MarkItDown
import os
import tempfile
import traceback

app = FastAPI(title="PDF to Markdown Service")
md = MarkItDown()

@app.post("/extract")
async def extract_pdf(file: UploadFile = File(...)):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="File must be a PDF")
    
    try:
        # Save uploaded file to a temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
            content = await file.read()
            tmp.write(content)
            tmp_path = tmp.name

        # Convert using markitdown
        result = md.convert(tmp_path)
        
        # Clean up
        os.remove(tmp_path)
        
        return {"markdown": result.text_content}
    except Exception as e:
        error_trace = traceback.format_exc()
        print(f"Extraction error: {error_trace}")
        raise HTTPException(status_code=500, detail=f"Failed to process PDF: {str(e)}\n{error_trace}")

@app.get("/health")
def health_check():
    return {"status": "ok"}
