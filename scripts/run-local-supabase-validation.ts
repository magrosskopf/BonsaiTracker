import { spawn } from "node:child_process";
import net from "node:net";
import { rm } from "node:fs/promises";
import path from "node:path";

import EmbeddedPostgres from "embedded-postgres";

const defaultDatabaseUrl =
  "postgresql://postgres:postgres@127.0.0.1:54322/postgres";
const defaultPort = 5432;
const defaultDatabaseName = "postgres";
const defaultDatabaseUser = "postgres";

type LocalDatabaseConfig = {
  databaseName: string;
  databaseUrl: URL;
  hostname: string;
  password: string;
  port: number;
  username: string;
};

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

function getLocalDatabaseConfig(): LocalDatabaseConfig {
  const databaseUrl = getDatabaseUrl();

  return {
    databaseName: databaseUrl.pathname.replace(/^\//, "") || defaultDatabaseName,
    databaseUrl,
    hostname: databaseUrl.hostname,
    password: decodeURIComponent(databaseUrl.password || defaultDatabaseUser),
    port: Number(databaseUrl.port || String(defaultPort)),
    username: decodeURIComponent(databaseUrl.username || defaultDatabaseUser),
  };
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

function toErrorMessage(messageOrError: unknown) {
  if (messageOrError instanceof Error) {
    return messageOrError.message;
  }

  return String(messageOrError);
}

function writeOutputLine(
  stream: Pick<NodeJS.WriteStream, "write">,
  message: string,
) {
  stream.write(message.endsWith("\n") ? message : `${message}\n`);
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

function getValidationEnvironment(databaseUrl: URL) {
  return {
    ...process.env,
    DATABASE_URL: databaseUrl.toString(),
  };
}

function createEmbeddedPostgres(
  dataDir: string,
  port: number,
  username: string,
  password: string,
) {
  return new EmbeddedPostgres({
    databaseDir: dataDir,
    onError: (messageOrError: unknown) => {
      writeOutputLine(process.stderr, toErrorMessage(messageOrError));
    },
    onLog: (message: string) => {
      if (process.env.DEBUG_LOCAL_SUPABASE_VALIDATION === "1") {
        writeOutputLine(process.stdout, message);
      }
    },
    password,
    persistent: false,
    port,
    user: username,
  });
}

async function startEmbeddedPostgres(config: LocalDatabaseConfig) {
  const dataDir = path.join(
    process.cwd(),
    ".runtime",
    `embedded-postgres-${config.port}`,
  );

  console.log(
    `No local database is listening on ${config.hostname}:${config.port}. Starting EmbeddedPostgres for validation...`,
  );

  await rm(dataDir, { force: true, recursive: true });

  const embeddedPostgres = createEmbeddedPostgres(
    dataDir,
    config.port,
    config.username,
    config.password,
  );

  await embeddedPostgres.initialise();
  await embeddedPostgres.start();

  if (config.databaseName !== defaultDatabaseName) {
    await embeddedPostgres.createDatabase(config.databaseName);
  }

  return embeddedPostgres;
}

async function main() {
  const config = getLocalDatabaseConfig();

  if (!isLocalHost(config.hostname)) {
    fail(
      "Refusing to bootstrap validation against a non-local database target. Use a local 127.0.0.1 or localhost DATABASE_URL.",
    );
  }

  const env = getValidationEnvironment(config.databaseUrl);

  let embeddedPostgres: EmbeddedPostgres | undefined;

  if (!(await canConnect(config.hostname, config.port))) {
    embeddedPostgres = await startEmbeddedPostgres(config);
  } else {
    console.log(
      `Using the existing local database listener on ${config.hostname}:${config.port} for Supabase validation.`,
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
  writeOutputLine(process.stderr, toErrorMessage(error));
  process.exit(1);
});
