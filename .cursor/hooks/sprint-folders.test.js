// Проверка sprint-folders.js: ловит закрытие спринта, не трогает секреты.
// Запуск: node .cursor/hooks/sprint-folders.test.js

const {
  sprintInfo,
  shouldWrite,
  folderOf,
  groupFolders,
  renderMarkdown,
  isSecretPath,
} = require("./sprint-folders.js");

const cases = [];

function check(name, ok) {
  cases.push({ name, ok });
  console.log(`${ok ? "ok" : "FAIL"} ${name}`);
}

check(
  "sprint-note",
  sprintInfo("d:/Cursor/Caffee/.docs/sprints/07-ui-fixes.md")?.number === "07",
);
check("skip-changes", sprintInfo("d:/Cursor/Caffee/.docs/sprints/07-changes.md") === null);
check("skip-readme", sprintInfo("d:/Cursor/Caffee/.docs/sprints/README.md") === null);

check(
  "close-write",
  shouldWrite([{ old_string: "", new_string: "- Статус: закрыт\n" }]) === true,
);
check(
  "already-closed",
  shouldWrite([{ old_string: "- Статус: закрыт\n", new_string: "- Статус: закрыт\nправка" }]) ===
    false,
);
check(
  "still-open",
  shouldWrite([{ old_string: "- Статус: открыт\n", new_string: "- Статус: открыт, не выполнен\n" }]) ===
    false,
);
check("empty-edits", shouldWrite([]) === false);

check("web-folder", folderOf("apps/web/src/pages/about/ui/AboutPage.tsx") === "apps/web/src/pages");
check("bot-folder", folderOf("apps/bot/src/index.ts") === "apps/bot");
check("root-file", folderOf("AGENTS.md") === ".");

check("secret-env", isSecretPath(".env") === true);
check("example-ok", isSecretPath(".env.example") === false);

const grouped = groupFolders([
  { code: "??", rel: "apps/bot/src/format.ts" },
  { code: " M", rel: "apps/bot/src/index.ts" },
  { code: " M", rel: ".env" },
]);
check("drop-secret", grouped.length === 1 && grouped[0][0] === "apps/bot");

const md = renderMarkdown({
  number: "09",
  noteName: "09-bot.md",
  groups: grouped,
});
check("link", md.includes("[apps/bot](../../apps/bot)") && md.includes("[09-bot.md](09-bot.md)"));

const failed = cases.filter((item) => !item.ok).length;
process.exit(failed ? 1 : 0);
