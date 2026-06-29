// Seed initial data (symptoms, remedies are static and don't need seeding)
import { runMigrations } from "../src/lib/db/schema";
import { DEFAULT_REMEDIES } from "../src/lib/local/remedies-data";

(async () => {
  try {
    await runMigrations();
    console.log(`✅ DB initialized. ${DEFAULT_REMEDIES.length} remedies ready.`);
    console.log("Default symptoms available: 20 (Neurological, General, Respiratory, etc.)");
    console.log("\nStart the app with: npm run dev");
    process.exit(0);
  } catch (e) {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  }
})();
