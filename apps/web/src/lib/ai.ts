const AI_ENGINE_URL = process.env.AI_ENGINE_URL ?? "http://localhost:8000";

export class NoFaceDetectedError extends Error {
  constructor() {
    super("No face detected");
    this.name = "NoFaceDetectedError";
  }
}

interface EmbeddingResponse {
  embedding: number[];
  det_score: number;
  bbox: number[];
}

export async function extractEmbedding(file: Blob, filename: string): Promise<EmbeddingResponse> {
  const formData = new FormData();
  formData.append("file", file, filename);

  const res = await fetch(`${AI_ENGINE_URL}/extract-embedding`, {
    method: "POST",
    body: formData,
  });

  if (res.status === 400) {
    throw new NoFaceDetectedError();
  }

  if (!res.ok) {
    throw new Error(`AI engine error: ${res.status} ${await res.text()}`);
  }

  return res.json();
}
