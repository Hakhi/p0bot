from playwright.sync_api import sync_playwright
from urllib.parse import urlsplit

with sync_playwright() as p:
    # Hubungkan ke Microsoft Edge yang sudah berjalan
    browser = p.chromium.connect_over_cdp(
        "http://127.0.0.1:9222"
    )

    print("Berhasil terhubung ke Edge!")

    # Ambil context dan daftar tab
    context = browser.contexts[0]

    for i, page in enumerate(context.pages):
        print(f"Tab {i}: {page.url}")

    # Cocokkan domain agar tab tetap ditemukan dari menu/route mana pun.
    target_host = "new-apktss.pln.co.id"

    page = next(
        (tab for tab in context.pages if urlsplit(tab.url).hostname == target_host),
        None
    )

    if page:
        print("Tab target ditemukan:", page.url)
        page.get_by_role("button", name="Buat Transaksi").click()

        if urlsplit(page.url).path.rstrip("/") != "/home/penugasan-khusus":
            page.get_by_role("link", name="Penugasan Khusus").click()

        nama_tugas = page.locator("#namaTugas")
        print("URL saat ini:", page.url)
        
        nama_tugas.click()
        nama_tugas.locator('option[value="4"]').wait_for(
            state="attached",
            timeout=10000
        )
        nama_tugas.select_option(value="4")
        page.get_by_role("textbox", name="Keterangan").fill("piket kehandalan yantek ULP ")
        page.get_by_role("button", name="Ex: Cari nama regu").click()
        page.get_by_role("searchbox").fill("moa")
        page.get_by_role("option", name="SAUMLAKI 5").click()
    else:
        raise RuntimeError("Tab target tidak ditemukan.")