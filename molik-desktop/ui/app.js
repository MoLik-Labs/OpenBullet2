"use strict";
const el = (id) => document.getElementById(id);
const invoke = window.__TAURI__?.core?.invoke;
const localOnly = document.documentElement.dataset.mode === "public";
const web = !localOnly && !invoke && ["http:", "https:"].includes(location.protocol);
let current = null;
let busy = false;
const historyRows = [];

function record(kind, result) {
    const row = document.createElement("li");
    const title = document.createElement("strong");
    const time = document.createElement("span");
    title.textContent = `${kind} · ${result}`;
    time.textContent = new Date().toLocaleTimeString();
    row.append(title, time);
    historyRows.unshift(row);
    historyRows.length = Math.min(historyRows.length, 20);
    drawHistory();
}
function drawHistory() {
    el("no-events").hidden = historyRows.length !== 0;
    el("clear").disabled = historyRows.length === 0;
    el("events").replaceChildren(...historyRows);
}
el("clear").addEventListener("click", () => {
    historyRows.length = 0;
    drawHistory();
});

function drawFindings() {
    const query = el("filter").value.trim().toLowerCase();
    const visible = (current?.findings ?? []).filter((f) =>
        `${f.name} ${f.reason}`.toLowerCase().includes(query),
    );
    el("findings").replaceChildren(
        ...visible.map((f) => {
            const row = document.createElement("li");
            const name = document.createElement("code");
            const reason = document.createElement("span");
            name.textContent = f.name;
            reason.textContent = f.reason;
            row.append(name, reason);
            return row;
        }),
    );
    el("empty").textContent =
        query && !visible.length ? "No matching findings." : "";
}
function render(report) {
    current = report;
    el("verdict").textContent = report?.verdict ?? "Not attached";
    el("verdict").dataset.state = report?.verdict ?? "";
    el("version").textContent = report
        ? (report.version ?? "Unavailable")
        : "—";
    el("checked").textContent = report?.checked ?? "—";
    el("count").textContent = !report
        ? "No report"
        : report.verdict === "Incomplete"
          ? "Incomplete check"
          : `${report.issues} issues`;
    el("detail").textContent = report
        ? report.detail ||
          `${report.excluded} excluded · ${report.findings.length} of ${report.issues} findings shown`
        : "No package report available.";
    el("filter").value = "";
    el("filter").disabled = !report?.findings.length;
    drawFindings();
}
el("filter").addEventListener("input", drawFindings);

async function inspect(choose = false) {
    if (busy) return;
    busy = true;
    el("choose").disabled = el("refresh").disabled = true;
    el("message").textContent = choose
        ? "Waiting for a folder selection…"
        : "Reading package metadata…";
    try {
        let report;
        if (invoke) {
            const result = await invoke(
                choose ? "choose_package" : "refresh_package",
            );
            if (result === null) {
                el("message").textContent =
                    "Selection cancelled. No changes made.";
                return;
            }
            report = JSON.parse(result);
        } else {
            const response = await fetch("./cgi-bin/report", {
                cache: "no-store",
                signal: AbortSignal.timeout(15000),
            });
            if (!response.ok)
                throw new Error("The report service is unavailable.");
            report = await response.json();
        }
        render(report);
        if (report) record("Inspection", report.verdict);
        el("message").textContent = report
            ? "Inspection finished. No files changed."
            : "No release attached. Mount a package on the host and refresh.";
    } catch (error) {
        if (!invoke) render(null);
        el("message").textContent =
            `Inspection failed: ${String(error)}${current ? " Showing the previous report." : ""}`;
    } finally {
        busy = false;
        el("choose").disabled = !invoke;
        el("refresh").disabled = !web && !current;
    }
}
el("edition").textContent = invoke ? "TAURI / LOCAL" : localOnly ? "BROWSER / LOCAL" : "WEB / RUST";
el("choose").hidden = !invoke;
el("choose").disabled = !invoke;
el("choose").addEventListener("click", () => inspect(true));
el("refresh").addEventListener("click", () => inspect());
if (invoke) el("message").textContent = "Choose a package folder to begin.";
else if (web) inspect();
else
    el("message").textContent =
        "Open the desktop app or start the workspace web host.";

async function verify() {
    const file = el("local-file").files[0];
    const expected = el("expected").value.trim().toLowerCase();
    const status = el("digest-status");
    el("digest").textContent = "";
    if (!file) {
        status.textContent = "Choose a file first.";
        return;
    }
    if (file.size > 32 * 1024 * 1024) {
        status.textContent = "File exceeds the 32 MiB limit.";
        return;
    }
    if (expected && !/^[a-f0-9]{64}$/.test(expected)) {
        status.textContent =
            "Expected checksum must contain 64 hexadecimal characters.";
        return;
    }
    if (!window.crypto?.subtle) {
        status.textContent =
            "Use HTTPS, localhost or the native app for secure hashing.";
        return;
    }
    el("verify").disabled =
        el("expected").disabled =
        el("local-file").disabled =
            true;
    status.textContent = "Calculating SHA-256…";
    try {
        const bytes = await window.crypto.subtle.digest(
            "SHA-256",
            await file.arrayBuffer(),
        );
        const digest = Array.from(new Uint8Array(bytes), (n) =>
            n.toString(16).padStart(2, "0"),
        ).join("");
        const result = !expected
            ? "Calculated"
            : expected === digest
              ? "Match"
              : "Mismatch";
        el("digest").textContent = digest;
        status.textContent = result;
        record("File integrity", result);
    } catch {
        status.textContent = "Cannot read or hash this file.";
    } finally {
        el("verify").disabled =
            el("expected").disabled =
            el("local-file").disabled =
                false;
    }
}
for (const id of ["expected", "local-file"])
    el(id).addEventListener("input", () => {
        el("digest").textContent = "";
        el("digest-status").textContent = "Ready for a new check.";
    });
el("verify").addEventListener("click", verify);

// Persist only allowlisted presentation values, never reports or inspected file names.
const options = {
    accent: ["mint", "azure", "amber"],
    density: ["comfortable", "compact"],
};
for (const [key, values] of Object.entries(options)) {
    const control = el(key);
    let saved;
    try {
        saved = window.localStorage.getItem(`molik.workspace.${key}`);
    } catch {
        /* optional storage */
    }
    control.value = values.includes(saved) ? saved : values[0];
    document.documentElement.dataset[key] = control.value;
    control.addEventListener("change", () => {
        if (!values.includes(control.value)) return;
        document.documentElement.dataset[key] = control.value;
        try {
            window.localStorage.setItem(
                `molik.workspace.${key}`,
                control.value,
            );
            el("prefs-status").textContent = "Saved on this device.";
        } catch {
            el("prefs-status").textContent = "Applied for this session only.";
        }
    });
}
const pages = [...(localOnly ? [] : ["inspection"]), "compare", "integrity", "activity", "appearance"];
function route(focus) {
    const id = pages.includes(location.hash.slice(1))
        ? location.hash.slice(1)
        : pages[0];
    for (const page of pages) el(page).hidden = page !== id;
    for (const link of document.querySelectorAll("nav a")) {
        if (link.hash === `#${id}`) link.setAttribute("aria-current", "page");
        else link.removeAttribute("aria-current");
    }
    const title = el(id).querySelector("h1");
    el("breadcrumb").textContent = title.textContent;
    if (focus) title.focus();
}
window.addEventListener("hashchange", () => route(true));
route(false);
