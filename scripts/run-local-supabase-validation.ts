import { spawn } from "node:child_process";
import net from "node:net";
import { rm } from "node:fs/promises";
import path from "node:path";

import EmbeddedPostgres from "embedded-postgres";

const defaultDatabaseUrl =
  "postgresql://postgres:postgres@127.0.0.1:54322/postgres";

function fail(message: string): never {
  throw new Error(message);
}

function getDatabaseUrl() {
  const databaseUrl = process.env.DATABASE_URL ?? defaultDatabaseUrl;

  if (databaseUrl.startsWith("prisma+postgres://")) {
    fail(
      "DATABASE_URL must not use prisma+postgres:// for local Supabase validation.",
    );
  }

  if (
    !databaseUrl.startsWith("postgres://") &&
    !databaseUrl.startsWith("postgresql://")
  ) {
    fail("DATABASE_URL must use a direct postgres:// or postgresql:// URL.");
  }

  return new URL(databaseUrl);
}

function isLocalHost(hostname: string) {
  return hostname === "127.0.0.1" || hostname === "localhost";
}

function canConnect(host: string, port: number) {
  return new Promise<boolean>((resolve) => {
    const socket = net.createConnection({ host, port });

    socket.once("connect", () => {
      socket.end();
      resolve(true);
    });

    socket.once("error", () => {
      resolve(false);
    });

    socket.setTimeout(500, () => {
      socket.destroy();
      resolve(false);
    });
  });
}

function runCommand(command: string, args: string[], env: NodeJS.ProcessEnv) {
  return new Promise<void>((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: process.cwd(),
      env,
      stdio: "inherit",
    });

    child.once("error", reject);
    child.once("exit", (code, signal) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(
        new Error(
          `${command} ${args.join(" ")} failed with code ${code ?? "null"}${signal ? ` and signal ${signal}` : ""}.`,
        ),
      );
    });
  });
}

async function main() {
  const databaseUrl = getDatabaseUrl();
  const hostname = databaseUrl.hostname;
  const port = Number(databaseUrl.port || "5432");
  const databaseName = databaseUrl.pathname.replace(/^\//, "") || "postgres";
  const username = decodeURIComponent(databaseUrl.username || "postgres");
  const password = decodeURIComponent(databaseUrl.password || "postgres");

  if (!isLocalHost(hostname)) {
    fail(
      "Refusing to bootstrap validation against a non-local database target. Use a local 127.0.0.1 or localhost DATABASE_URL.",
    );
  }

  const env = {
    ...process.env,
    DATABASE_URL: databaseUrl.toString(),
  };

  let embeddedPostgres: EmbeddedPostgres | undefined;

  if (!(await canConnect(hostname, port))) {
    const dataDir = path.join(
      process.cwd(),
      ".runtime",
      `embedded-postgres-${port}`,
    );

    console.log(
      `No local database is listening on ${hostname}:${port}. Starting EmbeddedPostgres for validation...`,
    );

    await rm(dataDir, { force: true, recursive: true });

    embeddedPostgres = new EmbeddedPostgres({
      databaseDir: dataDir,
      onError: (messageOrError: unknown) => {
        const message =
          messageOrError instanceof Error
            ? messageOrError.message
            : String(messageOrError);

        process.stderr.write(message.endsWith("\n") ? message : `${message}\n`);
      },
      onLog: (message: string) => {
        if (process.env.DEBUG_LOCAL_SUPABASE_VALIDATION === "1") {
          process.stdout.write(message.endsWith("\n") ? message : `${message}\n`);
        }
      },
      password,
      persistent: false,
      port,
      user: username,
    });

    await embeddedPostgres.initialise();
    await embeddedPostgres.start();

    if (databaseName !== "postgres") {
      await embeddedPostgres.createDatabase(databaseName);
    }
  } else {
    console.log(
      `Using the existing local database listener on ${hostname}:${port} for Supabase validation.`,
    );
  }

  try {
    await runCommand("bash", ["scripts/init-local-supabase-db.sh"], env);
    await runCommand("bash", ["scripts/validate-local-supabase-checks.sh"], env);
  } finally {
    if (embeddedPostgres) {
      await embeddedPostgres.stop();
    }
  }
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`${message}\n`);
  process.exit(1);
});
