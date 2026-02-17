import json
from langchain_core.prompts import PromptTemplate

class RouterAgent:
    def __init__(self, llm):
        self.llm = llm
        self.template = PromptTemplate.from_template("""
            Eres el Orquestador de Donchevas-v2. Tu única misión es clasificar la consulta.

            REGLA DE ORO DE INERCIA:
            Si el usuario hace una pregunta de seguimiento corta o ambigua (ej: "y el menor", "cuánto", "quién más", "en qué fecha"), 
            DEBES MANTENER el dominio anterior ({dominio_previo}). 
            
            Solo cambia de dominio si la pregunta menciona explícitamente conceptos de otro área (ej. nombres de familiares, términos académicos o empresas).

            DOMINIOS:
            - "PROFESIONAL": Proyectos de Christian, presupuestos, Ayesa, Mapfre, Nexa, inversiones ($).
            - "FAMILIA": Datos de Tatiana, hijos (Sebastian, Pablo, Leandro), temas personales.
            - "ACADEMICO": Master de IA, cursos de Azure, GCP, certificaciones.

            CONTEXTO:
            Dominio Anterior: {dominio_previo}
            Pregunta Actual: {consulta}

            Responde estrictamente en JSON:
            {{
                "dominio": "NOMBRE_DEL_DOMINIO",
                "razon": "Breve explicación"
            }}
        """)

    def clasificar(self, consulta, dominio_previo):
        # Limpieza de entrada
        prompt = self.template.format(consulta=consulta, dominio_previo=dominio_previo)
        respuesta_raw = self.llm.invoke(prompt).content
        # Limpieza de markdown por si el LLM lo incluye
        clean_json = respuesta_raw.replace("```json", "").replace("```", "").strip()
        return json.loads(clean_json)