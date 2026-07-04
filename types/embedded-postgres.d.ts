declare module "embedded-postgres" {
  export interface EmbeddedPostgresOptions {
    authMethod?: "scram-sha-256" | "password" | "md5";
    createPostgresUser?: boolean;
    databaseDir?: string;
    initdbFlags?: string[];
    onError?: (messageOrError: unknown) => void;
    onLog?: (message: string) => void;
    password?: string;
    persistent?: boolean;
    port?: number;
    postgresFlags?: string[];
    user?: string;
  }

  export default class EmbeddedPostgres {
    constructor(options?: EmbeddedPostgresOptions);
    initialise(): Promise<void>;
    start(): Promise<void>;
    stop(): Promise<void>;
    createDatabase(name: string): Promise<void>;
    dropDatabase(name: string): Promise<void>;
  }
}
