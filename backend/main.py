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

# Configuración validada en tu proyecto
PROJECT_ID = "iagen-gcp-cwmi"
CORPUS_ID = "projects/iagen-gcp-cwmi/locations/us-west1/ragCorpora/4532873024948404224"

# Usamos el modelo optimizado que ya tienes funcionando
llm = ChatVertexAI(model="gemini-2.0-flash-lite", project=PROJECT_ID)
grafo_donchevas = definir_grafo(llm, CORPUS_ID)

# PERSISTENCIA DE CONTEXTO (Esto evita que el bot se vuelva 'flojo')
memoria_contexto = {"ultimo_dominio": "PROFESIONAL"}

@app.post("/chat")
async def chat(request: dict):
    try:
        pregunta = request.get("prompt", "")
        
        # Invocamos el grafo con el dominio que recordamos
        inputs = {
            "consulta": pregunta, 
            "dominio": memoria_contexto["ultimo_dominio"]
        }
        
        resultado = grafo_donchevas.invoke(inputs)
        
        # ACTUALIZAMOS LA MEMORIA: Ahora el bot sabe en qué dominio se quedó
        memoria_contexto["ultimo_dominio"] = resultado["dominio"]
        
        return {
            "respuesta": resultado["respuesta"],
            "dominio": resultado["dominio"]
        }
    except Exception as e:
        print(f"Error crítico: {str(e)}")
        return {"respuesta": "Hubo un error en mi procesamiento. Reintenta, Christian."}

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8080))
    uvicorn.run(app, host="0.0.0.0", port=port)