import json
from langchain_core.prompts import PromptTemplate
from langchain_google_vertexai import ChatVertexAI

class RouterAgent:
    def __init__(self, llm):
        self.llm = llm
        self.template = PromptTemplate.from_template("""
            Eres el Orquestador de Contexto de Donchevas-v2. 
            Tu tarea es clasificar la consulta del usuario en uno de los siguientes DOMINIOS:

            - "FAMILIA": Consultas sobre Tatiana, Sebastian, Leandro, Pablo o Luciana.
            - "ACADEMICO": Consultas sobre cursos de GCP, Azure, Big Data o el Máster de IA.
            - "PROFESIONAL": Consultas sobre el CV de Christian Molina, experiencia en Ayesa o portafolio.
            - "GENERAL": Saludos o temas que no encajan en los anteriores.

            Responde ÚNICAMENTE un JSON con esta estructura:
            {{
                "dominio": "NOMBRE_DEL_DOMINIO",
                "razon": "Breve explicación de la elección"
            }}

            Consulta: {consulta}
        """)

    def clasificar(self, consulta):
        # Invocamos al modelo para decidir el flujo
        prompt = self.template.format(consulta=consulta)
        respuesta_raw = self.llm.invoke(prompt).content
        # Limpiamos el formato markdown de la respuesta si existe
        respuesta_json = respuesta_raw.replace("```json", "").replace("```", "").strip()
        return json.loads(respuesta_json)