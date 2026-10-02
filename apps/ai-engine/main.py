"""FastAPI face-embedding service backed by InsightFace (CPU-only)."""
import logging

import cv2
import numpy as np
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from insightface.app import FaceAnalysis
from pydantic import BaseModel

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("ai-engine")

app = FastAPI(title="Absen AI Engine", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

face_app: FaceAnalysis | None = None


@app.on_event("startup")
def load_model() -> None:
    global face_app
    logger.info("Loading InsightFace buffalo_l model (CPU)...")
    face_app = FaceAnalysis(name="buffalo_l", providers=["CPUExecutionProvider"])
    face_app.prepare(ctx_id=0, det_size=(640, 640))
    logger.info("Model ready.")


class EmbeddingResponse(BaseModel):
    embedding: list[float]
    det_score: float
    bbox: list[float]


@app.get("/health")
def health():
    return {"status": "ok", "model_loaded": face_app is not None}


@app.post("/extract-embedding", response_model=EmbeddingResponse)
async def extract_embedding(file: UploadFile = File(...)):
    if face_app is None:
        raise HTTPException(status_code=503, detail="Model is still loading")

    raw = await file.read()
    if not raw:
        raise HTTPException(status_code=400, detail="Empty file")

    buffer = np.frombuffer(raw, dtype=np.uint8)
    image = cv2.imdecode(buffer, cv2.IMREAD_COLOR)
    if image is None:
        raise HTTPException(status_code=400, detail="Could not decode image")

    faces = face_app.get(image)
    if not faces:
        raise HTTPException(status_code=400, detail="No face detected")

    # Pick the most dominant face (largest bounding box area)
    dominant = max(
        faces,
        key=lambda f: (f.bbox[2] - f.bbox[0]) * (f.bbox[3] - f.bbox[1]),
    )

    return EmbeddingResponse(
        embedding=dominant.normed_embedding.tolist(),
        det_score=float(dominant.det_score),
        bbox=[float(x) for x in dominant.bbox],
    )
