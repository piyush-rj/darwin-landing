import { Pool } from "pg";

const globalForDatabase = globalThis as unknown as { databasePool?: Pool };

export function getDatabasePool() {
    if (!globalForDatabase.databasePool) {
        const connectionString = process.env.DATABASE_URL;
        if (!connectionString) throw new Error("DATABASE_URL is not set");
        globalForDatabase.databasePool = new Pool({ connectionString });
    }
    return globalForDatabase.databasePool;
}
