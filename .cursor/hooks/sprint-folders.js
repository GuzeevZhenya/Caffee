// После закрытия спринта пишет .docs/sprints/NN-changes.md:
// папки из git, кратко что изменилось, относительные ссылки.
// Вход: JSON afterFileEdit на stdin. Секреты (.env) не кладёт.
// Пример: node .cursor/hooks/sprint-folders.js < event.json

const { execFileSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const SPRINT_NOTE = /^(\d{2})-(?!changes\.md$)[a-z0-9-]+\.md$/i;

function posix(value) {
  return String(value).replace(/\\/g, "/");
}

function isSecretPath(value) {
  const text = posix(value);
  const withoutSamples = text.replace(/\.env\.(example|sample|template|dist)\b/gi, "");
  if (/(^|[\/\s"'`=])\.env($|[\/\s"'`.,);])/i.test(withoutSamples)) return true;
  if (/\.env\.(local|production|development|test)\b/i.test(text)) return true;
  if (/(^|\/)(credentials|secrets?)\.(json|yml|yaml|txt)$/i.test(text)) return true;
  return false;
}

function sprintInfo(filePath) {
  const base = path.basename(filePath);
  const match = base.match(SPRINT_NOTE);
  if (!match) return null;
  const normalized = posix(filePath);
  const marker = "/.docs/sprints/";
  const idx = normalized.toLowerCase().lastIndexOf(marker);
  if (idx < 0) return null;
  return {
    number: match[1],
    noteName: base,
    root: path.resolve(filePath.slice(0, idx)),
  };
}

function statusClosed(text) {
  return /Статус:\s*закрыт/i.test(text || "");
}

function shouldWrite(edits) {
  const list = Array.isArray(edits) ? edits : [];
  if (list.length === 0) return false;
  const oldText = list.map((edit) => edit.old_string || "").join("\n");
  const newText = list.map((edit) => edit.new_string || "").join("\n");
  return statusClosed(newText) && !statusClosed(oldText);
}

function actionLabel(code) {
  const text = String(code);
  if (/[?]/.test(text) || /A/.test(text)) return "добавлено";
  if (/D/.test(text)) return "удалено";
  if (/R/.test(text)) return "переименовано";
  return "изменено";
}

function folderOf(relPath) {
  const parts = posix(relPath).split("/").filter(Boolean);
  if (parts.length <= 1) return ".";
  const file = parts[parts.length - 1];
  const dir = parts.slice(0, -1);
  if (dir[0] === "apps" && dir[1] === "web" && dir[2] === "src" && dir[3]) {
    return dir.slice(0, 4).join("/");
  }
  if (dir[0] === "apps" && dir[1]) return dir.slice(0, 2).join("/");
  if (dir[0] === "packages" && dir[1]) return dir.slice(0, 2).join("/");
  if (dir[0] === ".docs" && dir[1]) return dir.slice(0, 2).join("/");
  if (dir[0] === ".cursor" && dir[1]) return dir.slice(0, 2).join("/");
  if (file && dir.length === 0) return ".";
  return dir.slice(0, 2).join("/") || ".";
}

function parsePorcelain(text) {
  const files = [];
  for (const line of String(text).split(/\r?\n/)) {
    if (!line.trim()) continue;
    const code = line.slice(0, 2);
    let rest = line.slice(3).trim();
    if (!rest) continue;
    if (/[RC]/.test(code) && rest.includes(" -> ")) {
      rest = rest.split(" -> ").pop() || rest;
    }
    files.push({ code, rel: posix(rest) });
  }
  return files;
}

function collectGitFiles(root) {
  try {
    const out = execFileSync("git", ["status", "--porcelain", "-u"], {
      cwd: root,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
      windowsHide: true,
    });
    return parsePorcelain(out);
  } catch {
    return [];
  }
}

function groupFolders(files) {
  const groups = new Map();
  for (const file of files) {
    if (isSecretPath(file.rel)) continue;
    if (/(^|\/)\d{2}-changes\.md$/.test(file.rel)) continue;
    const folder = folderOf(file.rel);
    const action = actionLabel(file.code);
    const name = path.posix.basename(file.rel);
    if (!groups.has(folder)) groups.set(folder, []);
    groups.get(folder).push({ action, name });
  }
  return [...groups.entries()].sort(([a], [b]) => a.localeCompare(b, "ru"));
}

function summarize(entries) {
  const byAction = new Map();
  for (const entry of entries) {
    if (!byAction.has(entry.action)) byAction.set(entry.action, []);
    const names = byAction.get(entry.action);
    if (!names.includes(entry.name)) names.push(entry.name);
  }
  return [...byAction.entries()]
    .map(([action, names]) => {
      const shown = names.slice(0, 4);
      const extra = names.length - shown.length;
      const list = extra > 0 ? `${shown.join(", ")} +${extra}` : shown.join(", ");
      return `${action}: ${list}`;
    })
    .join("; ");
}

function folderHref(folder) {
  if (folder === ".") return "../../";
  return `../../${folder}`;
}

function folderLabel(folder) {
  return folder === "." ? "корень" : folder;
}

function renderMarkdown({ number, noteName, groups }) {
  const rows =
    groups.length === 0
      ? "| — | В git не было видимых правок (или всё уже в коммите). |"
      : groups
          .map(
            ([folder, entries]) =>
              `| [${folderLabel(folder)}](${folderHref(folder)}) | ${summarize(entries)} |`,
          )
          .join("\n");

  return [
    `# Папки спринта ${number}`,
    "",
    `Спринт: [${noteName}](${noteName})`,
    "",
    "Снимок `git status` в момент закрытия. Секреты не входят.",
    "",
    "| Папка | Что изменилось |",
    "| --- | --- |",
    rows,
    "",
  ].join("\n");
}

function writeChanges(filePath, edits) {
  const sprint = sprintInfo(filePath);
  if (!sprint || !shouldWrite(edits)) return false;
  const files = collectGitFiles(sprint.root);
  const groups = groupFolders(files);
  const markdown = renderMarkdown({
    number: sprint.number,
    noteName: sprint.noteName,
    groups,
  });
  const outPath = path.join(sprint.root, ".docs", "sprints", `${sprint.number}-changes.md`);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, markdown, "utf8");
  return true;
}

function readStdin() {
  return new Promise((resolve) => {
    let raw = "";
    process.stdin.setEncoding("utf8");
    process.stdin.on("data", (chunk) => {
      raw += chunk;
    });
    process.stdin.on("end", () => resolve(raw));
  });
}

async function main() {
  let input = {};
  try {
    input = JSON.parse((await readStdin()) || "{}");
  } catch {
    input = {};
  }
  const filePath = input.file_path || input.path || "";
  try {
    writeChanges(filePath, input.edits);
  } catch (error) {
    process.stderr.write(`[sprint-folders] ${error instanceof Error ? error.message : error}\n`);
  }
}

module.exports = {
  sprintInfo,
  shouldWrite,
  folderOf,
  groupFolders,
  renderMarkdown,
  isSecretPath,
  writeChanges,
};

if (require.main === module) {
  void main();
}
