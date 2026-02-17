import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.graph import definir_grafo
from langchain_google_vertexai import ChatVertexAI

# 1. Inicialización de la App
app = FastAPI(title="Donchevas-v2 Orchestrator API")

# 2. Configuración de CORS
# Permite que tu Frontend en Vercel se comunique con este Backend en Cloud Run
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 3. Configuración de Variables de Entorno y Modelos
# Estos valores fueron validados en tu despliegue de europe-west1
PROJECT_ID = os.getenv("GCP_PROJECT_ID", "iagen-gcp-cwmi")
LOCATION = os.getenv("GCP_LOCATION", "us-west1")
# Corpus ID que contiene tu CV, Familia y Cursos
CORPUS_ID = "projects/iagen-gcp-cwmi/locations/us-west1/ragCorpora/4532873024948404224"

# Inicializamos el LLM y el Grafo de Agentes (LangGraph)
llm = ChatVertexAI(model="gemini-2.0-flash-lite", project=PROJECT_ID, location=LOCATION)
grafo_donchevas = definir_grafo(llm, CORPUS_ID)

# 4. Memoria de Contexto de Sesión (Lógica para evitar errores de presupuesto vs familia)
# Esta variable guarda el último dominio clasificado por el Router
contexto_estado = {"dominio": "GENERAL"}

@app.get("/")
async def root():
    return {"status": "Donchevas-v2 está operativo", "location": "europe-west1"}

@app.post("/chat")
async def chat(request: dict):
    """
    Endpoint principal que recibe la consulta del usuario.
    Espera un JSON: {"prompt": "pregunta"}
    """
    try:
        consulta_usuario = request.get("prompt", "")
        
        # Ejecutamos el flujo de agentes pasando el dominio previo para mantener el contexto
        # Esto soluciona el error donde "y el menor" se confundía con Sebastian
        inputs = {
            "consulta": consulta_usuario,
            "dominio": contexto_estado["dominio"]
        }
        
        # Invocación del grafo compilado
        resultado = grafo_donchevas.invoke(inputs)
        
        # Actualizamos el estado global con el dominio detectado en esta interacción
        contexto_estado["dominio"] = resultado.get("dominio", "GENERAL")
        
        return {
            "respuesta": resultado.get("respuesta", "Lo siento, no pude procesar la consulta."),
            "dominio_detectado": resultado.get("dominio"),
            "status": "success"
        }
        
    except Exception as e:
        print(f"Error en el procesamiento: {str(e)}")
        return {"respuesta": f"Error interno: {str(e)}", "status": "error"}

if __name__ == "__main__":
    import uvicorn
    # Puerto 8080 configurado en tu Dockerfile para Cloud Run
    port = int(os.environ.get("PORT", 8080))
    uvicorn.run(app, host="0.0.0.0", port=port)