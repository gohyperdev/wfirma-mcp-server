import "dotenv/config";
import { WFirmaClient } from "./wfirma-client.js";

async function main() {
  try {
    const client = new WFirmaClient();
    console.log("Auth method:", process.env.WFIRMA_APP_KEY ? "API Key" : "Basic Auth");
    console.log("Connecting to wFirma API...\n");

    const result = await client.find("expenses", undefined, undefined, undefined, 3);
    console.log("OK! Response:\n");
    console.log(JSON.stringify(result, null, 2));
  } catch (e) {
    console.error("Error:", e instanceof Error ? e.message : e);
    process.exit(1);
  }
}

main();
