from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
import os
import io
import uuid
from google.cloud import translate_v2 as translate
# --- PDF Generation Imports (Updated) ---
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.lib.colors import red, orange, green, black
# --- End of Updated Imports ---
import firebase_admin
from firebase_admin import credentials, firestore
import json
import fitz  # PyMuPDF
from dotenv import load_dotenv
import pickle
import networkx as nx

# --- Google AI Imports ---
import google.generativeai as genai

# Import our modular components from the hybrid_rag package
from hybrid_rag.data_models import (
    DocumentAnalysis, ProcessResponse, QARequest, QAResponse,
    TranslationRequest, TranslationResponse, Risk
)
from hybrid_rag.vector_retriever import VectorStore
from hybrid_rag.graph_builder import extract_graph_from_text
from hybrid_rag.query_router import route_query

# --- Initial Configuration ---
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = "google-cloud-key.json"
load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY not found in .env file.")
genai.configure(api_key=GEMINI_API_KEY)

# Initialize Firebase
cred = credentials.Certificate("google-cloud-key.json")
try:
    with open("google-cloud-key.json", "r") as f:
        PROJECT_ID = json.load(f)["project_id"]
except (FileNotFoundError, KeyError) as e:
    raise ValueError(f"Could not determine project_id from credentials file: {e}")

firebase_admin.initialize_app(cred, {'projectId': PROJECT_ID})
db = firestore.client()
translate_client = translate.Client()

# --- FastAPI App Initialization ---
app = FastAPI(
    title="AI Legal Document Simplifier API",
    description="API with Hybrid RAG and Firestore integration."
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Core API Logic (No changes here) ---

def get_google_ai_analysis(text: str) -> DocumentAnalysis:
    model = genai.GenerativeModel("gemini-1.5-pro-latest")
    prompt = f"""
    Analyze the following legal document text. Provide a response as a single, valid JSON object with three keys: "simplified_text", "risks", and "document_health_score".
    1. "simplified_text": An "Explain Like I'm 15" summary of the key findings. This should be a conversational summary from an AI Assistant, using markdown for formatting.
    2. "risks": A list of potential risks. Each item in the list should be an object with "risk_level" (High, Medium, or Low) and a "description" of the risk.
    3. "document_health_score": An integer score from 0 to 100 representing the document's overall health.

    Legal Text: --- {text[:15000]} ---
    """
    try:
        response = model.generate_content(prompt)
        cleaned_json_str = response.text.strip().replace('```json', '').replace('```', '')
        return DocumentAnalysis.model_validate_json(cleaned_json_str)
    except Exception as e:
        error_detail = f"Failed to get or parse analysis from AI model. Raw error: {e}"
        print(f"CRITICAL ERROR during Google AI call: {error_detail}")
        raise HTTPException(status_code=500, detail=error_detail)

@app.post("/process-document", response_model=ProcessResponse)
async def process_document(file: UploadFile = File(...)):
    contents = await file.read()
    text = "".join(page.get_text() for page in fitz.open(stream=contents, filetype="pdf"))

    if not text.strip():
        raise HTTPException(status_code=400, detail="PDF contains no text.")

    analysis = get_google_ai_analysis(text)
    
    vector_store = VectorStore(text)
    knowledge_graph = extract_graph_from_text(text)
    
    session_id = str(uuid.uuid4())
    session_doc_ref = db.collection('sessions').document(session_id)
    session_doc_ref.set({
        'original_text': text,
        'analysis': analysis.model_dump(),
        'vector_store': pickle.dumps(vector_store),
        'knowledge_graph': pickle.dumps(knowledge_graph)
    })
    
    return ProcessResponse(session_id=session_id, original_text=text, **analysis.model_dump())

@app.post("/qa", response_model=QAResponse)
async def question_answer(request: QARequest):
    session_doc = db.collection('sessions').document(request.session_id).get()
    if not session_doc.exists:
        raise HTTPException(status_code=404, detail="Session not found.")
    
    session_data = session_doc.to_dict()
    route = route_query(request.question)
    print(f"Routing query to: {route}")

    if route == "vector":
        vector_store: VectorStore = pickle.loads(session_data['vector_store'])
        context_chunks = vector_store.search(request.question, k=3)
        context = "\n---\n".join(context_chunks)
        
        prompt = f"""You are a helpful legal assistant. Answer the following question based ONLY on the provided context. If the answer is not in the context, say "The answer is not found in the provided document excerpts."

        Context: --- {context} ---
        Question: {request.question}
        """
        model = genai.GenerativeModel("gemini-1.5-pro-latest")
        response = model.generate_content(prompt)
        answer = response.text

    elif route == "graph":
        knowledge_graph: nx.Graph = pickle.loads(session_data['knowledge_graph'])
        related_nodes = [n for n in knowledge_graph.nodes() if request.question.lower() in n.lower()]
        
        if not related_nodes:
            answer = "I couldn't find any specific entities in the knowledge graph related to your question."
        else:
            answer = f"Based on the knowledge graph, your question relates to: {', '.join(related_nodes)}. You may want to ask a more specific question about their relationships."
    else:
        answer = "Could not determine the best way to answer your question."

    return QAResponse(answer=answer)

@app.post("/translate", response_model=TranslationResponse)
def translate_text(request: TranslationRequest):
    result = translate_client.translate(request.text, target_language=request.target_language)
    return TranslationResponse(translated_text=result['translatedText'])

@app.post("/export", summary="Export analysis as a PDF report")
async def export_report(analysis: DocumentAnalysis):
    pdf_buffer = create_analysis_pdf(analysis)
    return StreamingResponse(
        pdf_buffer, media_type='application/pdf',
        headers={'Content-Disposition': 'attachment; filename="Analysis_Report.pdf"'}
    )

# --- PDF Generation Function (Updated with Formatting Fix) ---

def create_analysis_pdf(analysis: DocumentAnalysis):
    """Creates a formatted PDF report with text wrapping."""
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter, leftMargin=inch, rightMargin=inch, topMargin=inch, bottomMargin=inch)
    
    styles = getSampleStyleSheet()
    story = []

    # Title
    story.append(Paragraph("AI Legal Document Analysis Report", styles['h1']))
    story.append(Spacer(1, 0.25 * inch))

    # Simplified Summary
    story.append(Paragraph("Simplified Summary", styles['h2']))
    # Clean the summary text by removing markdown and splitting into paragraphs
    cleaned_summary = analysis.simplified_text.replace('**', '')
    summary_paragraphs = [p.strip() for p in cleaned_summary.split('\n') if p.strip()]
    for para_text in summary_paragraphs:
        story.append(Paragraph(para_text, styles['BodyText']))
        story.append(Spacer(1, 0.1 * inch))
    
    story.append(Spacer(1, 0.25 * inch))

    # Identified Risks
    story.append(Paragraph("Identified Risks", styles['h2']))
    
    risk_colors = {"High": "red", "Medium": "orange", "Low": "green"}
    for risk in analysis.risks:
        risk_color = risk_colors.get(risk.risk_level, "black")
        # Create a paragraph for the risk title with color
        risk_title = Paragraph(f"<font color='{risk_color}'>● {risk.risk_level} Risk:</font>", styles['BodyText'])
        story.append(risk_title)
        
        # Create a paragraph for the risk description with indentation
        risk_description = Paragraph(risk.description, styles['BodyText'])
        risk_description.leftIndent = 0.25 * inch
        story.append(risk_description)
        story.append(Spacer(1, 0.2 * inch))
        
    doc.build(story)
    buffer.seek(0)
    return buffer

