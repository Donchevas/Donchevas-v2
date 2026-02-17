import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware # IMPORTANTE
from src.graph import definir_grafo
from langchain_google_vertexai import ChatVertexAI

app = FastAPI()

# Configuración de CORS para permitir conexiones externas
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # En producción puedes poner tu URL de Vercel
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

PROJECT_ID = os.getenv("GCP_PROJECT_ID")
CORPUS_ID = "projects/iagen-gcp-cwmi/locations/us-west1/ragCorpora/4532873024948404224"

llm = ChatVertexAI(model="gemini-2.0-flash-lite", project=PROJECT_ID)
grafo_donchevas = definir_grafo(llm, CORPUS_ID)

@app.post("/chat")
async def chat(request: dict):
    # 'prompt' es la llave que usamos en la prueba de PowerShell
    resultado = grafo_donchevas.invoke({"consulta": request["prompt"]})
    return {"respuesta": resultado["respuesta"]}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8080)