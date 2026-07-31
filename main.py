import os
import base64
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Request, UploadFile, File, Form
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse, JSONResponse
from core.agent import OrionAgent

app = FastAPI(title="Orion AI Enterprise Framework")

os.makedirs("static/css", exist_ok=True)
os.makedirs("static/js", exist_ok=True)
os.makedirs("templates", exist_ok=True)

app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

orion = OrionAgent()

@app.get("/", response_class=HTMLResponse)
async def get_index(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@app.post("/upload-pdf/")
async def upload_pdf(file: UploadFile = File(...), session_id: str = Form(...)):
    try:
        pdf_bytes = await file.read()
        pdf_text = orion.router.tools.read_pdf(pdf_bytes)
        res = orion.process_pdf_context(session_id, pdf_text, file.filename)
        return JSONResponse({"status": "success", "response": res["reply"], "thought": res["thought"]})
    except Exception as e:
        return JSONResponse({"status": "error", "message": str(e)}, status_code=500)

@app.post("/upload-image/")
async def upload_image(file: UploadFile = File(...), session_id: str = Form(...), prompt: str = Form("")):
    try:
        img_bytes = await file.read()
        img_b64 = base64.b64encode(img_bytes).decode("utf-8")
        res = orion.process_message(session_id=session_id, user_message=prompt, image_b64=img_b64)
        return JSONResponse({"status": "success", "response": res["reply"], "thought": res["thought"]})
    except Exception as e:
        return JSONResponse({"status": "error", "message": str(e)}, status_code=500)

@app.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: str):
    await websocket.accept()
    try:
        while True:
            user_msg = await websocket.receive_text()
            res = orion.process_message(session_id=client_id, user_message=user_msg)
            await websocket.send_json({"reply": res["reply"], "thought": res["thought"]})
    except WebSocketDisconnect:
        print(f"Cliente {client_id} desconectado.")
