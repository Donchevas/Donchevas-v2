import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.graph import definir_grafo
from langchain_google_vertexai import ChatVertexAI

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

PROJECT_ID = "iagen-gcp-cwmi"
CORPUS_ID = "projects/iagen-gcp-cwmi/locations/us-west1/ragCorpora/4532873024948404224"

# Modelo validado para tu proyecto de Máster
llm = ChatVertexAI(model="gemini-2.0-flash-lite", project=PROJECT_ID)
grafo_donchevas = definir_grafo(llm, CORPUS_ID)

# MEMORIA DE ESTADO: Evita que el bot sea 'flojo' y pierda el contexto
memoria_contexto = {"ultimo_dominio": "PROFESIONAL"}

@app.post("/chat")
async def chat(request: dict):
    try:
        inputs = {
            "consulta": request.get("prompt", ""), 
            "dominio": memoria_contexto["ultimo_dominio"]
        }
        
        # El grafo ahora sabe de dónde viene la charla
        resultado = grafo_donchevas.invoke(inputs)
        
        # Actualizamos la memoria para la siguiente pregunta
        memoria_contexto["ultimo_dominio"] = resultado["dominio"]
        
        return {
            "respuesta": resultado["respuesta"],
            "dominio": resultado["dominio"]
        }
    except Exception as e:
        return {"respuesta": f"Error de procesamiento: {str(e)}"}

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8080))
    uvicorn.run(app, host="0.0.0.0", port=port)