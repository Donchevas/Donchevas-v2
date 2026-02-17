import json
from langchain_core.prompts import PromptTemplate

class RouterAgent:
    def __init__(self, llm):
        self.llm = llm
        self.template = PromptTemplate.from_template("""
            Eres el Orquestador de Donchevas-v2. Tu misión es clasificar la consulta actual.
            
            REGLA DE ORO DE CONTEXTO: 
            Si la consulta es corta o ambigua (ej: "y el menor", "quién más", "cuánto costó", "dónde trabaja"), 
            MANTÉN el dominio anterior. Solo cambia si el usuario introduce un tema claramente distinto.

            DOMINIOS DISPONIBLES:
            - "FAMILIA": Datos de Tatiana, Sebastian, Leandro o Pablo Molina.
            - "PROFESIONAL": Experiencia en Ayesa, proyectos, presupuestos e inversión.
            - "ACADEMICO": Cursos de IA, certificaciones de GCP/Azure y el Máster.

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