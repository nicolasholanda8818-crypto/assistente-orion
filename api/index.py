import sys
import os

# Adiciona a raiz do projeto ao path para importar o app FastAPI corretamente
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from main import app

# Exporta o app para o ambiente Serverless da Vercel
app = app
