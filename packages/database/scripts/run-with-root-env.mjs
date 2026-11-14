// Запускает prisma / сид / проверку с переменными из корневого .env.
// Пример: node scripts/run-with-root-env.mjs prisma db push
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

function withSsl(url) {
  if (!url || /[?&]sslmode=/.test(url)) return url;
  return `${url}${url.includes("?") ? "&" : "?"}sslmode=require`;
}

/** :6543 часто закрыт; session pooler :5432 с этой сети открыт. .env не трогаем. */
function preferReachablePooler(env) {
  const databaseUrl = env.DATABASE_URL?.trim() ?? "";
  const directUrl = env.DIRECT_URL?.trim() ?? "";
  if (/:6543\b/.test(databaseUrl) && /:5432\b/.test(directUrl)) {
    env.DATABASE_URL = withSsl(directUrl);
  } else if (databaseUrl) {
    env.DATABASE_URL = withSsl(databaseUrl);
  }
  if (directUrl) env.DIRECT_URL = withSsl(directUrl);
}

const here = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(here, "..");
const envFile = resolve(here, "../../../.env");

if (!existsSync(envFile)) {
  console.error(
    "В корне репозитория нет файла окружения. Скопируйте .env.example и вставьте строки подключения Supabase: DATABASE_URL и DIRECT_URL.",
  );
  process.exit(1);
}

process.loadEnvFile(envFile);

function passwordLen(name) {
  const value = (process.env[name] ?? "").trim();
  const match = value.match(/^postgres(?:ql)?:\/\/([^@]*)@/i);
  if (!match) return "n/a";
  const userinfo = match[1] ?? "";
  const colon = userinfo.indexOf(":");
  const password = colon >= 0 ? userinfo.slice(colon + 1) : "";
  const port = (value.match(/:(\d+)\//) || [])[1] || "?";
  return `chars=${password.length} port=${port}`;
}

console.log(`file-on-disk DATABASE_URL ${passwordLen("DATABASE_URL")}`);
console.log(`file-on-disk DIRECT_URL ${passwordLen("DIRECT_URL")}`);

preferReachablePooler(process.env);

const CHECKED_KEYS = [
  "DATABASE_URL",
  "DIRECT_URL",
  "SUPABASE_URL",
  "SUPABASE_ANON_KEY",
  "VITE_SUPABASE_URL",
  "VITE_SUPABASE_ANON_KEY",
];

function keyState(name) {
  const value = process.env[name]?.trim() ?? "";
  if (value.length === 0) return "empty";
  if (/\[[A-Z0-9_-]+\]/.test(value) || value.includes("eyJhbGciOi...") || value.endsWith("...")) {
    return "template";
  }
  return "set";
}

function urlShape(name) {
  const value = (process.env[name] ?? "").trim();
  const match = value.match(/^(postgres(?:ql)?:\/\/)([^@]*)@([^/?#]*)(.*)$/);
  if (!match) return `unmasked len=${value.length}`;
  const userinfo = match[2] ?? "";
  const colon = userinfo.indexOf(":");
  const user = colon >= 0 ? userinfo.slice(0, colon) : userinfo;
  const password = colon >= 0 ? userinfo.slice(colon + 1) : "";
  const userMask = user.startsWith("postgres.")
    ? "postgres.<ref>"
    : user === "postgres"
      ? "postgres"
      : "other-user";
  const special = [...new Set([...password].filter((char) => !/[A-Za-z0-9]/.test(char)))].map(
    (char) => `U+${char.codePointAt(0).toString(16).toUpperCase()}`,
  );
  return `${match[1]}${userMask}:***${password.length}@${match[3]}${match[4]} special=${special.join(",") || "none"}`;
}

for (const name of CHECKED_KEYS) {
  const state = keyState(name);
  const shape = name.endsWith("_URL") && state === "set" ? ` ${urlShape(name)}` : "";
  console.log(`${name}=${state}${shape}`);
}

if (keyState("DATABASE_URL") !== "set" || keyState("DIRECT_URL") !== "set") {
  console.error(
    "Нужны живые DATABASE_URL и DIRECT_URL. Это не Project URL: Supabase → Project Settings → Database → Connection string, URI, порты 6543 и 5432.",
  );
  process.exit(1);
}

const require = createRequire(resolve(packageRoot, "package.json"));
const [command, ...args] = process.argv.slice(2);

function runNode(nodeArgs) {
  const result = spawnSync(process.execPath, nodeArgs, {
    cwd: packageRoot,
    stdio: "inherit",
    env: process.env,
  });
  process.exit(result.status ?? 1);
}

if (command === "prisma") {
  runNode([require.resolve("prisma/build/index.js"), ...args]);
}

if (command === "seed" || command === "status") {
  const file = command === "seed" ? "seed.ts" : "status.ts";
  runNode(["--import", "tsx", file]);
}

if (command === "diag") {
  const raw = process.env.DIRECT_URL?.trim() ?? "";
  try {
    const parsed = new URL(raw.replace(/^postgres(?:ql)?:/i, "http:"));
    const user = decodeURIComponent(parsed.username);
    let decodedPassLen = 0;
    let decodeOk = false;
    try {
      decodedPassLen = decodeURIComponent(parsed.password).length;
      decodeOk = true;
    } catch {
      decodeOk = false;
    }
    console.log(
      [
        `user=${user.startsWith("postgres.") ? "postgres.<ref>" : user}`,
        `userDot=${user.includes(".")}`,
        `passRawLen=${parsed.password.length}`,
        `passDecodedLen=${decodedPassLen}`,
        `decodeOk=${decodeOk}`,
        `ssl=${parsed.searchParams.get("sslmode") || "none"}`,
        `hostPort=${parsed.port}`,
      ].join(" "),
    );
  } catch (error) {
    console.error("diag-parse-failed", error instanceof Error ? error.message : error);
    process.exit(1);
  }
  runNode(["--import", "tsx", "diag.ts"]);
}

console.error("Ожидалась команда: prisma | seed | status | diag");
process.exit(1);
