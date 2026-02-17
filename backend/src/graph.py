from langgraph.graph import StateGraph, END
from src.agents.router import RouterAgent
from src.agents.specialist import SpecialistAgent

def definir_grafo(llm, corpus_id):
    # El estado ahora persiste el 'dominio'
    workflow = StateGraph(dict)
    
    router = RouterAgent(llm)
    specialist = SpecialistAgent(llm, corpus_id)

    def nodo_clasificador(state):
        # Recuperamos el dominio de la interacción anterior
        dominio_previo = state.get("dominio", "GENERAL")
        
        print(f"--- CLASIFICANDO. PREVIO: {dominio_previo} ---")
        res = router.clasificar(state["consulta"], dominio_previo)
        
        return {
            "dominio": res["dominio"], 
            "consulta": state["consulta"]
        }

    def nodo_especialista(state):
        print(f"--- EJECUTANDO ESPECIALISTA: {state['dominio']} ---")
        respuesta = specialist.obtener_respuesta(state["consulta"], state["dominio"])
        # Retornamos la respuesta y MANTENEMOS el dominio en el estado
        return {"respuesta": respuesta, "dominio": state["dominio"]}

    workflow.add_node("clasificador", nodo_clasificador)
    workflow.add_node("especialista", nodo_especialista)

    workflow.set_entry_point("clasificador")
    workflow.add_edge("clasificador", "especialista")
    workflow.add_edge("especialista", END)

    return workflow.compile()