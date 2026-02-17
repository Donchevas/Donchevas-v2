from vertexai.preview import rag
from langchain_google_vertexai import ChatVertexAI
from langchain_core.messages import HumanMessage

class SpecialistAgent:
    def __init__(self, llm, corpus_id):
        self.llm = llm
        self.corpus_id = corpus_id

    def obtener_respuesta(self, consulta, dominio):
        # 1. Recuperación RAG de documentos (Familia, CV o Cursos)
        config_rag = rag.RagRetrievalConfig(top_k=3)
        respuesta_rag = rag.retrieval_query(
            rag_resources=[rag.RagResource(rag_corpus=self.corpus_id)],
            text=consulta,
            rag_retrieval_config=config_rag
        )
        
        contexto = "\n".join([c.text for c in respuesta_rag.contexts.contexts])

        # 2. Definición de personalidad según el dominio clasificado
        personalidades = {
            "FAMILIA": "Eres Donchevas, asistente cálido de la familia Molina-Valdivia.",
            "ACADEMICO": "Eres un Coach Académico experto en IA y Big Data.",
            "PROFESIONAL": "Eres un Manager Ejecutivo experto en la carrera de Christian Molina."
        }
        
        system_prompt = personalidades.get(dominio, "Eres un asistente útil.")
        
        prompt_final = f"""{system_prompt}
        Usa este contexto para responder:
        {contexto}
        
        Pregunta: {consulta}"""

        return self.llm.invoke(prompt_final).content