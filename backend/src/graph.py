from langgraph.graph import StateGraph, END
from src.agents.router import RouterAgent
from src.agents.specialist import SpecialistAgent

def definir_grafo(llm, corpus_id):
    workflow = StateGraph(dict)
    
    router = RouterAgent(llm)
    specialist = SpecialistAgent(llm, corpus_id)

    def nodo_clasificador(state):
        # Recuperamos el dominio de la interacción anterior, por defecto PROFESIONAL
        dominio_previo = state.get("dominio", "PROFESIONAL")
        
        res = router.clasificar(state["consulta"], dominio_previo)
        print(f"--- ROUTER: {dominio_previo} -> {res['dominio']} ---")
        
        return {
            "dominio": res["dominio"], 
            "consulta": state["consulta"]
        }

    def nodo_especialista(state):
        respuesta = specialist.obtener_respuesta(state["consulta"], state["dominio"])
        return {"respuesta": respuesta, "dominio": state["dominio"]}

    workflow.add_node("clasificador", nodo_clasificador)
    workflow.add_node("especialista", nodo_especialista)

    workflow.set_entry_point("clasificador")
    workflow.add_edge("clasificador", "especialista")
    workflow.add_edge("especialista", END)

    return workflow.compile()