// Run migrations on the local SQLite database
import { runMigrations } from "../src/lib/db/schema";

(async () => {
  try {
    await runMigrations();
    console.log("✅ Migrations applied successfully");
    process.exit(0);
  } catch (e) {
    console.error("❌ Migration failed:", e);
    process.exit(1);
  }
})();
