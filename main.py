import os
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Request
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse
from core.agent import OrionAgent

app = FastAPI(title="Orion AI System")

# Garante a criação de pastas estáticas se não existirem
os.makedirs("static/css", exist_ok=True)
os.makedirs("static/js", exist_ok=True)
os.makedirs("templates", exist_ok=True)

# Monta arquivos estáticos e templates HTML
app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

# Inicializa o Agente do Orion
orion = OrionAgent()

@app.get("/", response_class=HTMLResponse)
async def get_index(request: Request):
    """Renderiza a página principal do Orion."""
    return templates.TemplateResponse("index.html", {"request": request})

@app.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: str):
    """Canal em tempo real via WebSocket entre o Frontend e o Orion."""
    await websocket.accept()
    try:
        while True:
            # Recebe a mensagem do usuário via JS
            user_msg = await websocket.receive_text()
            
            # Processa a mensagem no cérebro com histórico
            response = orion.process_message(session_id=client_id, user_message=user_msg)
            
            # Envia a resposta de volta ao usuário em tempo real
            await websocket.send_text(response)

    except WebSocketDisconnect:
        print(f"Cliente {client_id} desconectado.")
