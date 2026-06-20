from pathlib import Path

import pytest
from playwright.sync_api import Browser, Page, expect

from tests.e2e.scenario_app import SCENARIO_PASSWORD

pytestmark = pytest.mark.e2e


def login(page: Page, base_url: str) -> None:
    page.goto(base_url)
    page.get_by_test_id("username").fill("admin")
    page.get_by_test_id("password").fill(SCENARIO_PASSWORD)
    page.get_by_test_id("login-submit").click()
    expect(page.get_by_test_id("user-profile")).to_have_text("Administrador (admin)")
    expect(page.get_by_test_id("socket-status")).to_have_text("conectado")


def test_login_accepts_admin_and_rejects_invalid_credentials(page: Page, e2e_base_url: str) -> None:
    page.goto(e2e_base_url)
    page.get_by_test_id("username").fill("admin")
    page.get_by_test_id("password").fill("incorreta")
    page.get_by_test_id("login-submit").click()
    expect(page.get_by_test_id("login-error")).to_have_text("Invalid credentials")

    page.get_by_test_id("password").fill(SCENARIO_PASSWORD)
    page.get_by_test_id("login-submit").click()
    expect(page.get_by_test_id("user-profile")).to_have_text("Administrador (admin)")


def test_conversation_broadcasts_message(page: Page, e2e_base_url: str) -> None:
    login(page, e2e_base_url)
    page.get_by_test_id("chat-input").fill("Ola, Orion")
    page.get_by_test_id("chat-send").click()
    expect(page.get_by_test_id("chat-feed")).to_contain_text("Ola, Orion")


def test_upload_sends_selected_file(page: Page, e2e_base_url: str, tmp_path: Path) -> None:
    login(page, e2e_base_url)
    upload = tmp_path / "anotacoes.txt"
    upload.write_text("Conteudo local para o cenario E2E.", encoding="utf-8")

    page.get_by_test_id("upload-input").set_input_files(upload)
    page.get_by_test_id("upload-submit").click()
    expect(page.get_by_test_id("upload-status")).to_have_text("anotacoes.txt: stored")


def test_finances_update_balance(page: Page, e2e_base_url: str) -> None:
    login(page, e2e_base_url)
    page.get_by_test_id("finance-amount").fill("1500.00")
    page.get_by_test_id("finance-category").fill("Trabalho")
    page.get_by_test_id("finance-submit").click()
    expect(page.get_by_test_id("finance-balance")).to_have_text("1500.00")

    page.get_by_test_id("finance-kind").select_option("expense")
    page.get_by_test_id("finance-amount").fill("250.00")
    page.get_by_test_id("finance-category").fill("Mercado")
    page.get_by_test_id("finance-submit").click()
    expect(page.get_by_test_id("finance-balance")).to_have_text("1250.00")


def test_multiplayer_syncs_position_between_two_clients(
    browser: Browser,
    page: Page,
    e2e_base_url: str,
) -> None:
    second_context = browser.new_context()
    second_page = second_context.new_page()

    try:
        login(page, e2e_base_url)
        login(second_page, e2e_base_url)

        page.get_by_test_id("position-x").fill("42")
        page.get_by_test_id("position-y").fill("24")
        page.get_by_test_id("position-send").click()

        expect(second_page.get_by_test_id("position-feed")).to_contain_text("Administrador: 42,24")
    finally:
        second_context.close()
