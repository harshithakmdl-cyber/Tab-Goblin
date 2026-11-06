const $ = (id) => document.getElementById(id);
const STORAGE_KEY = "tabGoblinData";

async function getData() {
  const result = await chrome.storage.local.get(STORAGE_KEY);
  return result[STORAGE_KEY] || { kept: [], sessions: [] };
}
async function setData(data) {
  await chrome.storage.local.set({ [STORAGE_KEY]: data });
}
function ageText(timestamp) {
  const minutes = Math.max(0, Math.floor((Date.now() - timestamp) / 60000));
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  return `${Math.floor(hours / 24)} day(s) ago`;
}
function safeTitle(tab) {
  return tab.title || tab.url || "Untitled tab";
}
async function render() {
  const [tabs, data] = await Promise.all([chrome.tabs.query({}), getData()]);
  const sleeping = tabs.filter(t => t.discarded).length;
  $("tabCount").textContent = tabs.length;
  $("sleepCount").textContent = sleeping;
  const mood = tabs.length < 10 ? "Goblin is calm ✨" : tabs.length < 25 ? "Goblin is getting hungry 👀" : "Goblin is stuffed! Feed it tabs 🍽️";
  $("mood").textContent = mood;

  const list = $("tabList");
  list.innerHTML = "";
  const sorted = tabs.slice().sort((a,b) => (a.lastAccessed || 0) - (b.lastAccessed || 0));
  if (!sorted.length) list.innerHTML = '<div class="empty">No open tabs found.</div>';
  sorted.forEach(tab => {
    const card = document.createElement("div");
    card.className = "tab-card";
    const title = document.createElement("div"); title.className = "tab-title"; title.textContent = safeTitle(tab);
    const meta = document.createElement("div"); meta.className = "tab-meta";
    meta.textContent = `${ageText(tab.lastAccessed || Date.now())}${tab.discarded ? " • Sleeping" : ""}`;
    const buttons = document.createElement("div"); buttons.className = "tab-buttons";
    const toggle = document.createElement("button");
    toggle.textContent = tab.discarded ? "Wake tab" : "Put to sleep";
    toggle.disabled = tab.active || tab.pinned || !tab.id;
    toggle.addEventListener("click", async () => {
      try {
        if (tab.discarded) await chrome.tabs.update(tab.id, { active: true });
        else await chrome.tabs.discard(tab.id);
        await render();
      } catch (e) { alert("Chrome could not change this tab. Try another tab."); }
    });
    const keep = document.createElement("button"); keep.className = "keep";
    const isKept = data.kept.includes(tab.id);
    keep.textContent = isKept ? "Unkeep" : "Keep";
    keep.addEventListener("click", async () => {
      const fresh = await getData();
      if (fresh.kept.includes(tab.id)) fresh.kept = fresh.kept.filter(id => id !== tab.id);
      else fresh.kept.push(tab.id);
      await setData(fresh); await render();
    });
    buttons.append(toggle, keep);
    card.append(title, meta, buttons);
    if (isKept) card.style.borderColor = "#d9a1a1";
    list.appendChild(card);
  });

  const sessions = $("sessions"); sessions.innerHTML = "";
  if (!data.sessions.length) sessions.innerHTML = '<div class="empty">No saved sessions yet.</div>';
  data.sessions.forEach((session, index) => {
    const card = document.createElement("div"); card.className = "session-card";
    const name = document.createElement("span"); name.textContent = `${session.name} (${session.tabs.length} tabs)`;
    const actions = document.createElement("div");
    const restore = document.createElement("button"); restore.textContent = "Restore";
    restore.addEventListener("click", () => restoreSession(index));
    const remove = document.createElement("button"); remove.textContent = "Delete";
    remove.addEventListener("click", async () => {
      const fresh = await getData(); fresh.sessions.splice(index, 1); await setData(fresh); render();
    });
    actions.append(restore, remove); card.append(name, actions); sessions.appendChild(card);
  });
}
async function saveSession() {
  const tabs = await chrome.tabs.query({});
  const usable = tabs.filter(t => t.url && !t.url.startsWith("chrome://") && !t.url.startsWith("chrome-extension://"));
  const data = await getData();
  const stamp = new Date().toLocaleString();
  data.sessions.unshift({ name: `Session ${stamp}`, created: Date.now(), tabs: usable.map(t => ({ url:t.url, title:t.title, pinned:!!t.pinned })) });
  data.sessions = data.sessions.slice(0, 10);
  await setData(data); await render();
}
async function restoreSession(index) {
  const data = await getData(); const session = data.sessions[index];
  if (!session) return;
  for (const item of session.tabs) {
    try { await chrome.tabs.create({ url:item.url, pinned:item.pinned, active:false }); } catch (_) {}
  }
  await render();
}
$("refresh").addEventListener("click", render);
$("saveSession").addEventListener("click", saveSession);
$("restoreSession").addEventListener("click", async () => {
  const data = await getData();
  if (!data.sessions.length) { alert("Save a session first."); return; }
  await restoreSession(0);
});
render();
