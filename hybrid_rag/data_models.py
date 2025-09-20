from pydantic import BaseModel, Field
from typing import List

class Risk(BaseModel):
    risk_level: str
    description: str

class DocumentAnalysis(BaseModel):
    simplified_text: str
    risks: List[Risk]
    document_health_score: int = Field(..., ge=0, le=100)

class ProcessResponse(DocumentAnalysis):
    session_id: str
    original_text: str

class QARequest(BaseModel):
    session_id: str
    question: str

class QAResponse(BaseModel):
    answer: str

class TranslationRequest(BaseModel):
    text: str
    target_language: str

class TranslationResponse(BaseModel):
    translated_text: str

