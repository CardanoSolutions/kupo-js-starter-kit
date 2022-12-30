import fetch from 'node-fetch';
import delay from 'delay';

// If you're running through Demeter, use the 'Public URL' from the console.
const SERVER_URL = "http://127.0.0.1:1442";
const TRANSACTION_ID = "60eb97c0b6f83c433dbecd371ff8e14b697b1b0c87377dd80421dddd59baeaae";
const OUTPUT_INDEX = 0;

async function main(found) {
  // See API reference on: https://cardanosolutions.github.io/kupo/#operation/getMatches
  const response = await fetch(`${SERVER_URL}/matches/${OUTPUT_INDEX}@${TRANSACTION_ID}`);

  // We expect either zero or a single result, because we fetch by output reference
  // which uniquely identifies an output.
  const [data] = await response.json();
  if (data == undefined) {
    console.error("Output not yet discovered; retrying in a bit...");
    await delay(1000);
    await main(found);
    return;
  }

  // Display some details about the output already. We could show more such as
  // how much assets is held by this output, or whether or not it has a datum or
  // a inline script.
  if (!found) {
    console.error(`Found output ${OUTPUT_INDEX}@${TRANSACTION_ID}:
  address:     ${data.address}
  created-at:
    slot-no:     ${data.created_at.slot_no}
    header-hash: ${data.created_at.header_hash}
    `);
  }

  // If `spent_at` is null, it means we've discovered the output, but not yet
  // synchronized a block where it was spent, so we loop back an keep searching.
  if (data.spent_at == null) {
    const mostRecentCheckpoint = Number.parseInt(response.headers.get('x-most-recent-checkpoint'), 10);
    console.error(`So far the indexer has seen blocks until slot = ${mostRecentCheckpoint}, but the output wasn't yet spent; retrying in a bit...`);
    await delay(1000);
    await main(true);
    return;
  }

  console.error(`It was spent at:
    slot-no:     ${data.spent_at.slot_no}
    header-hash: ${data.spent_at.header_hash}
  `);
}

await main(false);
