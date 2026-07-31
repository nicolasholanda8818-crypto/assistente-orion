import os
from pypdf import PdfReader
from duckduckgo_search import DDGS

class OrionTools:
    """
    Ferramentas do Orion: Pesquisa Web em tempo real e Leitura de Documentos PDF.
    """
    
    @staticmethod
    def search_web(query: str, max_results: int = 3) -> str:
        """Realiza busca na web em tempo real gratuitamente."""
        try:
            results = []
            with DDGS() as ddgs:
                for r in ddgs.text(query, max_results=max_results):
                    results.append(f"Título: {r['title']}\nConteúdo: {r['body']}")
            
            if not results:
                return "Nenhum resultado relevante encontrado na web."
            
            return "\n\n".join(results)
        except Exception as e:
            return f"Erro ao realizar pesquisa na web: {str(e)}"

    @staticmethod
    def read_pdf(file_bytes) -> str:
        """Lê o conteúdo de um arquivo PDF carregado pelo usuário."""
        try:
            reader = PdfReader(file_bytes)
            extracted_text = ""
            for page in reader.pages:
                text = page.extract_text()
                if text:
                    extracted_text += text + "\n"
            
            return extracted_text.strip() if extracted_text else "Não foi possível extrair texto do PDF."
        except Exception as e:
            return f"Erro ao processar arquivo PDF: {str(e)}"
