from __future__ import annotations

import base64
import binascii
import json
import logging
import mimetypes
import re
import unicodedata
from collections import Counter
from io import BytesIO
from pathlib import Path
from uuid import uuid4

from app.core.config import settings
from app.db import repositories
from app.orion_files.models import (
    OrionFileAnalysisResponse,
    OrionFileRecord,
    OrionFilesStatus,
    OrionFileUploadResponse,
)

LOGGER = logging.getLogger(__name__)
USER_ID_PATTERN = re.compile(r"^[A-Za-z0-9_.-]{1,64}$")
SAFE_NAME_PATTERN = re.compile(r"[^a-zA-Z0-9_.-]+")
TEXT_EXTENSIONS = {".txt", ".md", ".csv", ".json"}
IMAGE_EXTENSIONS = {".bmp", ".gif", ".jpeg", ".jpg", ".png", ".webp"}
DOCUMENT_EXTENSIONS = {".doc", ".docx", ".pdf", ".xls", ".xlsx"}
STOP_WORDS = {
    "a",
    "agora",
    "ao",
    "aos",
    "as",
    "com",
    "da",
    "das",
    "de",
    "do",
    "dos",
    "e",
    "em",
    "esse",
    "esta",
    "isso",
    "na",
    "nas",
    "no",
    "nos",
    "o",
    "os",
    "para",
    "por",
    "que",
    "um",
    "uma",
}


class OrionFilesService:
    def status(self) -> OrionFilesStatus:
        return OrionFilesStatus(
            status="ready",
            storage_backend=settings.file_storage_backend,
            storage_path=str(settings.file_storage_root),
            max_upload_bytes=settings.file_upload_max_bytes,
            allowed_extensions=sorted(settings.file_allowed_extensions),
            blocked_extensions=sorted(settings.file_blocked_extensions),
            restrictions=[
                "per-user-storage",
                "path-traversal-blocked",
                "dangerous-extensions-blocked",
                "uploaded-files-not-executed",
                "ocr-optional",
            ],
        )

    async def save_upload(
        self,
        *,
        upload,
        user_id: str,
        category: str = "geral",
        description: str | None = None,
    ) -> OrionFileUploadResponse:
        filename = upload.filename or "arquivo"
        content = await upload.read(settings.file_upload_max_bytes + 1)
        content_type = upload.content_type or mimetypes.guess_type(filename)[0] or "application/octet-stream"
        record = self.save_bytes(
            content=content,
            user_id=user_id,
            original_name=filename,
            content_type=content_type,
            category=category,
            source="upload",
            description=description,
        )
        LOGGER.info("orion_file_uploaded user=%s file=%s size=%s", user_id, record.id, record.size_bytes)
        return OrionFileUploadResponse(
            file=record,
            message="Arquivo recebido com seguranca. Posso analisar quando voce pedir.",
        )

    def save_camera_photo(
        self,
        *,
        image_data: str,
        user_id: str,
        filename: str,
        category: str = "camera",
        description: str | None = None,
    ) -> OrionFileUploadResponse:
        content_type, content = parse_data_url(image_data)
        record = self.save_bytes(
            content=content,
            user_id=user_id,
            original_name=filename,
            content_type=content_type,
            category=category,
            source="camera",
            description=description,
        )
        LOGGER.info("orion_camera_photo_saved user=%s file=%s size=%s", user_id, record.id, record.size_bytes)
        return OrionFileUploadResponse(
            file=record,
            message="Foto salva. Posso observar os detalhes basicos agora.",
        )

    def save_bytes(
        self,
        *,
        content: bytes,
        user_id: str,
        original_name: str,
        content_type: str,
        category: str,
        source: str,
        description: str | None = None,
    ) -> OrionFileRecord:
        validate_user_id(user_id)
        validate_size(content)
        extension = validate_extension(original_name, content_type)
        file_id = uuid4().hex
        safe_name = secure_filename(original_name, extension)
        relative_path = Path("users") / user_id / f"{file_id}_{safe_name}"
        target_path = resolve_storage_path(relative_path)
        target_path.parent.mkdir(parents=True, exist_ok=True)
        target_path.write_bytes(content)

        record = repositories.create_file_record(
            file_id=file_id,
            user_id=user_id,
            original_name=Path(original_name).name or safe_name,
            safe_name=safe_name,
            content_type=content_type,
            extension=extension,
            size_bytes=len(content),
            category=safe_category(category),
            source=source,
            storage_path=relative_path.as_posix(),
            description=description,
        )
        return file_record_from_row(record)

    def list_files(self, *, user_id: str, limit: int = 50) -> list[OrionFileRecord]:
        validate_user_id(user_id)
        rows = repositories.list_file_records(user_id, limit=min(max(limit, 1), 100))
        return [file_record_from_row(row) for row in rows]

    def get_file(self, *, file_id: str, user_id: str) -> OrionFileRecord:
        validate_user_id(user_id)
        row = repositories.get_file_record(file_id, user_id)
        if row is None:
            raise FileNotFoundError("Arquivo nao encontrado para este usuario.")
        return file_record_from_row(row)

    def delete_file(self, *, file_id: str, user_id: str) -> OrionFileRecord:
        validate_user_id(user_id)
        row = repositories.delete_file_record(file_id, user_id)
        if row is None:
            raise FileNotFoundError("Arquivo nao encontrado para este usuario.")
        file_path = resolve_storage_path(Path(row["storage_path"]))
        try:
            file_path.unlink(missing_ok=True)
        except OSError:
            LOGGER.warning("orion_file_delete_failed user=%s file=%s path=%s", user_id, file_id, file_path)
        return file_record_from_row(row)

    def analyze_file(
        self,
        *,
        file_id: str,
        user_id: str,
        instructions: str | None = None,
        manual_description: str | None = None,
    ) -> OrionFileAnalysisResponse:
        validate_user_id(user_id)
        row = repositories.get_file_record(file_id, user_id)
        if row is None:
            raise FileNotFoundError("Arquivo nao encontrado para este usuario.")

        file_path = resolve_storage_path(Path(row["storage_path"]))
        if not file_path.exists():
            summary = "O registro existe, mas o arquivo fisico nao foi encontrado no armazenamento local."
            updated = repositories.update_file_analysis(
                file_id=file_id,
                user_id=user_id,
                analysis_status="error",
                summary=summary,
                keywords_json="[]",
                description=manual_description,
            )
            file_record = file_record_from_row(updated or row)
            return OrionFileAnalysisResponse(
                file=file_record,
                summary=summary,
                keywords=[],
                message="Nao consegui abrir o arquivo salvo.",
            )

        content = file_path.read_bytes()
        analysis = analyze_content(
            content=content,
            filename=row["original_name"],
            extension=row["extension"],
            content_type=row["content_type"],
            manual_description=manual_description,
            instructions=instructions,
        )
        updated = repositories.update_file_analysis(
            file_id=file_id,
            user_id=user_id,
            analysis_status=analysis["status"],
            summary=analysis["summary"],
            keywords_json=json.dumps(analysis["keywords"], ensure_ascii=False),
            description=manual_description,
        )
        repositories.upsert_user_summary(
            user_id,
            f"Arquivo {row['original_name']}: {analysis['summary'][:180]}",
            source_type="file",
        )
        for keyword in analysis["keywords"][:5]:
            repositories.upsert_user_memory_fact(user_id, "topic", keyword)

        file_record = file_record_from_row(updated or row)
        LOGGER.info("orion_file_analyzed user=%s file=%s status=%s", user_id, file_id, analysis["status"])
        return OrionFileAnalysisResponse(
            file=file_record,
            summary=analysis["summary"],
            keywords=analysis["keywords"],
            message=build_analysis_message(analysis["status"], analysis["summary"]),
        )


def validate_user_id(user_id: str) -> None:
    if not USER_ID_PATTERN.fullmatch(user_id):
        raise ValueError("Identificador de usuario invalido.")


def validate_size(content: bytes) -> None:
    if not content:
        raise ValueError("Arquivo vazio nao pode ser salvo.")
    if len(content) > settings.file_upload_max_bytes:
        raise ValueError("Arquivo excede o limite de tamanho permitido.")


def validate_extension(original_name: str, content_type: str) -> str:
    guessed_extension = mimetypes.guess_extension(content_type.split(";")[0].strip()) or ""
    extension = Path(original_name).suffix.lower() or guessed_extension.lower()
    if extension == ".jpe":
        extension = ".jpg"
    if extension in settings.file_blocked_extensions:
        raise ValueError("Este tipo de arquivo e bloqueado por seguranca.")
    if extension not in settings.file_allowed_extensions:
        raise ValueError("Tipo de arquivo nao permitido nesta instalacao.")
    return extension


def safe_category(category: str) -> str:
    normalized = normalize_ascii(category or "geral").lower()
    clean = SAFE_NAME_PATTERN.sub("-", normalized).strip(".-_")
    return clean[:40] or "geral"


def secure_filename(original_name: str, extension: str) -> str:
    name = Path(original_name).name
    stem = Path(name).stem or "arquivo"
    normalized = normalize_ascii(stem)
    clean_stem = SAFE_NAME_PATTERN.sub("-", normalized).strip(".-_")[:72] or "arquivo"
    return f"{clean_stem}{extension}"


def normalize_ascii(value: str) -> str:
    normalized = unicodedata.normalize("NFKD", value)
    return normalized.encode("ascii", "ignore").decode("ascii")


def resolve_storage_path(relative_path: Path) -> Path:
    root = settings.file_storage_root.resolve()
    target = (root / relative_path).resolve()
    if not target.is_relative_to(root):
        raise ValueError("Caminho de arquivo invalido.")
    return target


def parse_data_url(image_data: str) -> tuple[str, bytes]:
    if not image_data.startswith("data:"):
        raise ValueError("Foto deve ser enviada como data URL.")
    header, _, encoded = image_data.partition(",")
    if ";base64" not in header or not encoded:
        raise ValueError("Foto deve estar codificada em base64.")
    content_type = header.removeprefix("data:").split(";", 1)[0] or "image/png"
    if content_type not in {"image/png", "image/jpeg", "image/webp"}:
        raise ValueError("Formato de foto nao permitido.")
    try:
        return content_type, base64.b64decode(encoded, validate=True)
    except (binascii.Error, ValueError) as exc:
        raise ValueError("Foto enviada esta corrompida ou invalida.") from exc


def file_record_from_row(row: dict) -> OrionFileRecord:
    keywords = []
    try:
        keywords = json.loads(row.get("keywords_json") or "[]")
    except json.JSONDecodeError:
        keywords = []
    return OrionFileRecord(
        id=row["id"],
        user_id=row["user_id"],
        original_name=row["original_name"],
        safe_name=row["safe_name"],
        content_type=row["content_type"],
        extension=row["extension"],
        size_bytes=row["size_bytes"],
        category=row["category"],
        source=row["source"],
        analysis_status=row["analysis_status"],
        summary=row.get("summary"),
        keywords=[str(keyword) for keyword in keywords if str(keyword).strip()],
        description=row.get("description"),
        created_at=row["created_at"],
        updated_at=row["updated_at"],
    )


def analyze_content(
    *,
    content: bytes,
    filename: str,
    extension: str,
    content_type: str,
    manual_description: str | None,
    instructions: str | None,
) -> dict:
    if extension in TEXT_EXTENSIONS:
        text = decode_text(content)
        summary = summarize_text(text, filename=filename, instructions=instructions)
        keywords = extract_keywords(text)
        return {
            "status": "ready",
            "summary": append_manual_description(summary, manual_description),
            "keywords": keywords,
        }
    if extension == ".pdf":
        text = extract_pdf_text(content)
        if text:
            summary = summarize_text(text, filename=filename, instructions=instructions)
            keywords = extract_keywords(text)
            return {
                "status": "ready",
                "summary": append_manual_description(summary, manual_description),
                "keywords": keywords,
            }
        summary = (
            "PDF salvo com seguranca. Nao encontrei texto extraivel automaticamente; "
            "PDF escaneado precisa de OCR configurado."
        )
        return {
            "status": "limited",
            "summary": append_manual_description(summary, manual_description),
            "keywords": extract_keywords(filename),
        }
    if extension in IMAGE_EXTENSIONS:
        dimensions = detect_image_dimensions(content)
        base = f"Imagem {content_type} salva com {len(content)} bytes"
        if dimensions:
            base += f" e dimensoes aproximadas de {dimensions[0]}x{dimensions[1]} pixels"
        summary = (
            f"{base}. Consigo guardar, pre-visualizar e receber uma descricao manual. "
            "Leitura automatica de texto em imagem precisa de OCR configurado."
        )
        return {
            "status": "limited",
            "summary": append_manual_description(summary, manual_description),
            "keywords": ["imagem", "camera" if "camera" in filename.lower() else "arquivo"],
        }
    if extension in DOCUMENT_EXTENSIONS:
        summary = (
            f"Documento {extension} salvo com seguranca. Para leitura automatica completa, "
            "configure um extrator compativel ou envie uma versao em PDF/texto."
        )
        return {
            "status": "limited",
            "summary": append_manual_description(summary, manual_description),
            "keywords": extract_keywords(filename),
        }
    summary = "Arquivo salvo e catalogado. Analise automatica completa ainda nao esta disponivel para este tipo."
    return {
        "status": "limited",
        "summary": append_manual_description(summary, manual_description),
        "keywords": extract_keywords(filename),
    }


def decode_text(content: bytes) -> str:
    for encoding in ("utf-8", "utf-8-sig", "latin-1"):
        try:
            return content.decode(encoding)
        except UnicodeDecodeError:
            continue
    return content.decode("utf-8", errors="replace")


def extract_pdf_text(content: bytes) -> str:
    try:
        from pypdf import PdfReader
    except Exception:
        return ""
    try:
        reader = PdfReader(BytesIO(content))
        parts = [page.extract_text() or "" for page in reader.pages[:20]]
    except Exception:
        return ""
    return "\n".join(parts).strip()


def summarize_text(text: str, *, filename: str, instructions: str | None) -> str:
    clean = " ".join(text.split())
    if not clean:
        return f"O arquivo {filename} foi salvo, mas nao encontrei texto legivel para resumir."
    sentences = split_sentences(clean)
    chosen = sentences[:3] if sentences else [clean[:500]]
    summary = " ".join(chosen)
    if len(summary) > 700:
        summary = f"{summary[:697].rstrip()}..."
    prefix = f"Li {filename}. "
    if instructions:
        prefix += f"Pedido considerado: {instructions.strip()[:160]}. "
    return f"{prefix}Resumo: {summary}"


def split_sentences(text: str) -> list[str]:
    raw_sentences = re.split(r"(?<=[.!?])\s+", text)
    return [sentence.strip() for sentence in raw_sentences if len(sentence.strip()) > 20]


def extract_keywords(text: str) -> list[str]:
    normalized = unicodedata.normalize("NFKD", text.lower())
    ascii_text = normalized.encode("ascii", "ignore").decode("ascii")
    tokens = re.findall(r"[a-z0-9]{3,}", ascii_text)
    counter = Counter(token for token in tokens if token not in STOP_WORDS)
    return [word for word, _count in counter.most_common(10)]


def append_manual_description(summary: str, manual_description: str | None) -> str:
    if not manual_description:
        return summary
    return f"{summary} Descricao manual do usuario: {manual_description.strip()[:500]}"


def detect_image_dimensions(content: bytes) -> tuple[int, int] | None:
    if content.startswith(b"\x89PNG\r\n\x1a\n") and len(content) >= 24:
        return int.from_bytes(content[16:20], "big"), int.from_bytes(content[20:24], "big")
    if content[:6] in {b"GIF87a", b"GIF89a"} and len(content) >= 10:
        return int.from_bytes(content[6:8], "little"), int.from_bytes(content[8:10], "little")
    if content.startswith(b"\xff\xd8"):
        return detect_jpeg_dimensions(content)
    return None


def detect_jpeg_dimensions(content: bytes) -> tuple[int, int] | None:
    index = 2
    while index + 9 < len(content):
        if content[index] != 0xFF:
            index += 1
            continue
        marker = content[index + 1]
        length = int.from_bytes(content[index + 2 : index + 4], "big")
        if marker in {0xC0, 0xC1, 0xC2, 0xC3, 0xC5, 0xC6, 0xC7, 0xC9, 0xCA, 0xCB, 0xCD, 0xCE, 0xCF}:
            height = int.from_bytes(content[index + 5 : index + 7], "big")
            width = int.from_bytes(content[index + 7 : index + 9], "big")
            return width, height
        if length < 2:
            break
        index += 2 + length
    return None


def build_analysis_message(status: str, summary: str) -> str:
    if status == "ready":
        return f"Li o arquivo. {summary} Posso explicar, criar um resumo de estudo ou pesquisar fontes atuais."
    if status == "limited":
        return f"Analise basica concluida. {summary} Posso organizar isso e pesquisar referencias se voce autorizar."
    return summary
