from langgraph.graph import StateGraph, END
from src.agents.router import RouterAgent
from src.agents.specialist import SpecialistAgent

def definir_grafo(llm, corpus_id):
    # Definimos el estado del grafo (similar a tu lab)
    workflow = StateGraph(dict)
    
    router = RouterAgent(llm)
    specialist = SpecialistAgent(llm, corpus_id)

    # Nodo 1: Clasificación
    def nodo_clasificador(state):
        print(f"--- CLASIFICANDO CONSULTA ---")
        clasificacion = router.clasificar(state["consulta"])
        return {"dominio": clasificacion["dominio"], "consulta": state["consulta"]}

    # Nodo 2: Respuesta Especializada
    def nodo_especialista(state):
        print(f"--- EJECUTANDO AGENTE: {state['dominio']} ---")
        respuesta = specialist.obtener_respuesta(state["consulta"], state["dominio"])
        return {"respuesta": respuesta}

    # Construcción del Grafo
    workflow.add_node("clasificador", nodo_clasificador)
    workflow.add_node("especialista", nodo_especialista)

    workflow.set_entry_point("clasificador")
    workflow.add_edge("clasificador", "especialista")
    workflow.add_edge("especialista", END)

    return workflow.compile()