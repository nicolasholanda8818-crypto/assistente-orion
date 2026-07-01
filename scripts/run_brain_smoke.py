import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from app.brain.models import BrainRequest  # noqa: E402
from app.brain.service import BrainService  # noqa: E402

REPORT_PATH = ROOT / "docs" / "brain_smoke_report.json"

SMOKE_CASES = (
    ("greeting", "oi"),
    ("teacher", "me ensina programacao em Python"),
    ("mentor", "quero melhorar meu portfolio para entrevista de emprego"),
    ("web-decision", "qual e a versao mais recente do FastAPI"),
    ("sensitive-web-block", "pesquise meu token secreto"),
    ("feeling", "estou cansado"),
    ("returning", "voltei"),
)


def main() -> int:
    brain = BrainService()
    user_id = "brain-smoke-local"
    conversation_id = "brain-smoke"
    brain.process(BrainRequest(text="Nicolas", user_id=user_id, conversation_id=conversation_id))

    results = []
    for label, text in SMOKE_CASES:
        response = brain.process(BrainRequest(text=text, user_id=user_id, conversation_id=conversation_id))
        results.append(
            {
                "case": label,
                "text": text,
                "intent": response.intent,
                "has_message": bool(response.message),
                "reasoning_state": response.reasoning_state,
                "response_mode": response.response_mode,
                "should_search_web": response.should_search_web,
            }
        )

    report = {
        "status": "passed" if all(item["has_message"] for item in results) else "failed",
        "cases": results,
    }
    REPORT_PATH.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(report, ensure_ascii=False, indent=2))
    return 0 if report["status"] == "passed" else 1


if __name__ == "__main__":
    raise SystemExit(main())
