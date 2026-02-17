import json
from langchain_core.prompts import PromptTemplate

class RouterAgent:
    def __init__(self, llm):
        self.llm = llm
        self.template = PromptTemplate.from_template("""
            Eres el Orquestador de Donchevas-v2. Tu misión es clasificar la consulta.
            
            REGLA DE ORO: Si la consulta es ambigua (ej: "y el menor", "quién más", "cuánto"), 
            MANTÉN el dominio anterior.

            DOMINIOS DISPONIBLES:
            - "FAMILIA": Datos de Tatiana, Sebastian, Leandro o Pablo.
            - "PROFESIONAL": Experiencia en Ayesa, proyectos y presupuestos ($).
            - "ACADEMICO": Cursos de IA, GCP, Azure y el Máster.

            DOMINIO ANTERIOR: {dominio_previo}
            CONSULTA ACTUAL: {consulta}

            Responde ÚNICAMENTE un JSON:
            {{
                "dominio": "NOMBRE_DEL_DOMINIO",
                "razon": "Explicación breve"
            }}
        """)

    def clasificar(self, consulta, dominio_previo):
        prompt = self.template.format(consulta=consulta, dominio_previo=dominio_previo)
        respuesta_raw = self.llm.invoke(prompt).content
        respuesta_json = respuesta_raw.replace("```json", "").replace("```", "").strip()
        return json.loads(respuesta_json)