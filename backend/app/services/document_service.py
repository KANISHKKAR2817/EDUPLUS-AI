import os
from typing import Tuple
from pypdf import PdfReader
from docx import Document

def extract_text_from_file(file_path: str, file_type: str) -> Tuple[str, str]:
    """
    Extracts text from PDF, DOCX, or TXT study materials.
    Returns (extracted_text, status_message).
    """
    if not os.path.exists(file_path):
        return "", "File does not exist."

    extracted_text = ""
    file_type = file_type.lower()

    try:
        if file_type == "pdf":
            reader = PdfReader(file_path)
            pages_text = []
            for i, page in enumerate(reader.pages):
                text = page.extract_text()
                if text:
                    pages_text.append(f"--- Page {i+1} ---\n{text}")
            extracted_text = "\n\n".join(pages_text)
            if not extracted_text.strip():
                return "", "Scanned or empty PDF detected; no machine-readable text found."

        elif file_type in ["docx", "doc"]:
            doc = Document(file_path)
            paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]
            extracted_text = "\n\n".join(paragraphs)

        elif file_type in ["txt", "text"]:
            with open(file_path, "r", encoding="utf-8", errors="replace") as f:
                extracted_text = f.read()

        else:
            return "", f"Unsupported file extension: {file_type}. Supported: PDF, DOCX, TXT."

        return extracted_text, "Success"

    except Exception as e:
        return "", f"Error reading document: {str(e)}"
