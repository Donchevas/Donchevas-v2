import os
from fastapi import FastAPI
from src.graph import definir_grafo
from langchain_google_vertexai import ChatVertexAI

app = FastAPI()

# Configuración desde variables de entorno
PROJECT_ID = os.getenv("GCP_PROJECT_ID")
CORPUS_ID = "projects/iagen-gcp-cwmi/locations/us-west1/ragCorpora/4532873024948404224"

llm = ChatVertexAI(model="gemini-2.0-flash-lite", project=PROJECT_ID)
grafo_donchevas = definir_grafo(llm, CORPUS_ID)

@app.post("/chat")
async def chat(request: dict):
    # request['consulta'] viene del frontend
    resultado = grafo_donchevas.invoke({"consulta": request["prompt"]})
    return {"respuesta": resultado["respuesta"]}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8080)