import "dotenv/config";
import { WFirmaClient } from "./wfirma-client.js";

async function main() {
  try {
    const client = new WFirmaClient();
    console.log("Connecting to wFirma API...\n");

    // Count all expenses
    const all = await client.find("expenses", { limit: 1 });
    const allTotal = (all.expenses as Record<string, unknown>)?.parameters;
    console.log("All expenses:", (allTotal as Record<string, string>)?.total);

    // Count JPK-only expenses (in VAT register but not in KPiR)
    const jpk = await client.find("expenses", {
      conditions: [
        { field: "register_vat_book", operator: "eq", value: "1" },
        { field: "register_tax_book", operator: "eq", value: "0" },
      ],
      limit: 1,
    });
    const jpkTotal = (jpk.expenses as Record<string, unknown>)?.parameters;
    console.log("JPK-only (not in KPiR):", (jpkTotal as Record<string, string>)?.total);

    // Show first JPK-only expense
    console.log("\nFirst JPK-only expense:");
    const sample = await client.find("expenses", {
      conditions: [
        { field: "register_vat_book", operator: "eq", value: "1" },
        { field: "register_tax_book", operator: "eq", value: "0" },
      ],
      limit: 1,
    });
    const first = (sample.expenses as Record<string, Record<string, Record<string, string>>>)?.["0"]?.expense;
    if (first) {
      console.log(`  ID: ${first.id}`);
      console.log(`  Number: ${first.fullnumber}`);
      console.log(`  Date: ${first.date}`);
      console.log(`  Brutto: ${first.brutto} ${first.currency}`);
      console.log(`  Description: ${first.description}`);
      console.log(`  Tax book: ${first.register_tax_book}, VAT book: ${first.register_vat_book}`);
    }

    console.log("\nConnection OK!");
  } catch (e) {
    console.error("Error:", e instanceof Error ? e.message : e);
    process.exit(1);
  }
}

main();
