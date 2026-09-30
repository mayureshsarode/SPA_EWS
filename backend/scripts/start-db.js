const EmbeddedPostgres = require("embedded-postgres").default;
const path = require("path");
const fs = require("fs");
const net = require("net");
const { execSync } = require("child_process");

const DB_DIR = path.join(__dirname, "../.pgdata");
const PORT = 5433;
const USER = "postgres";
const PASSWORD = "password123";

function checkPortInUse(port) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(800);
    socket.once("connect", () => {
      socket.destroy();
      resolve(true);
    });
    socket.once("timeout", () => {
      socket.destroy();
      resolve(false);
    });
    socket.once("error", () => {
      resolve(false);
    });
    socket.connect(port, "127.0.0.1");
  });
}

async function run() {
  const alreadyRunning = await checkPortInUse(PORT);
  if (alreadyRunning) {
    console.log(`✅ Local PostgreSQL is already running on port ${PORT}`);
    // Keep alive for concurrently
    setInterval(() => {}, 1000 * 60);
    return;
  }

  // If not running, ensure no stale zombie postgres process exists
  try {
    if (process.platform === "win32") {
      execSync("taskkill /f /im postgres.exe 2>nul || exit 0", { stdio: "ignore", shell: true });
    }
  } catch (_) {}

  const pg = new EmbeddedPostgres({
    databaseDir: DB_DIR,
    port: PORT,
    user: USER,
    password: PASSWORD,
    persistent: true,
  });

  const isInitial = !fs.existsSync(DB_DIR);
  if (isInitial) {
    console.log("📦 Initializing local PostgreSQL cluster...");
    await pg.initialise();
  }

  console.log(`🚀 Starting local PostgreSQL on port ${PORT}...`);
  await pg.start();
  console.log(`✅ Local PostgreSQL is ready at postgresql://${USER}:${PASSWORD}@localhost:${PORT}/postgres`);

  const shutdown = async () => {
    console.log("\n🛑 Stopping PostgreSQL...");
    try {
      await pg.stop();
    } catch (e) {
      // Ignore
    }
    process.exit(0);
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);

  setInterval(() => {}, 1000 * 60);
}

run().catch((err) => {
  console.error("❌ Failed to start local PostgreSQL:", err);
  process.exit(1);
});
