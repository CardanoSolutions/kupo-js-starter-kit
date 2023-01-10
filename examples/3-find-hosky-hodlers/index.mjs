import fetch from 'node-fetch';
import StreamArray from 'stream-json/streamers/StreamArray.js';
import { showDog } from './banner.mjs';

// If you're running through Demeter, use the 'Public URL' from the console.
const SERVER_URL = "http://localhost:1442";

// Network slot length, in seconds. Ideally we would fetch that from network
// parameters but it is really unlikely to change.
const SLOT_LENGTH = 1;

// Note that we're not using the mainnet's policy for $HOSKY, since the
// examples are built with for preview network. Fortunately, there's a
// test replica of $HOSKY on preview as $HOSKYt.
//
// See also: https://preview.cexplorer.io/asset/asset1a3nunt82avxyga9mardu76nd6s69nt56en2fl7
const HOSKYt_POLICY_ID = "065270479316f1d92e00f7f9f095ebeaac9d009c878dc35ce36d3404";
const HOSKYt_ASSET_NAME = Buffer.from("HOSKYt").toString("hex");

// See API reference at: https://cardanosolutions.github.io/kupo/#operation/sampleCheckpoints
async function fetchTip() {
  const response = await fetch(`${SERVER_URL}/checkpoints`);
  const checkpoints = await response.json();
  // Note: checkpoints are ordered by descending slots, so the first item is always the tip
  return checkpoints[0];
}

async function main() {
  // Figure out what was the slot 24h ago using `created_after`.
  //
  // Here we also provide the flag `unspent` to get only unspent results from
  // the API. Note that this is necessary even if we've specified
  // `--prune-utxo` because spent outputs are only removed after a certain
  // delay -- when it is actually safe to remove them.
  //
  // Read more about this on https://cardanosolutions.github.io/kupo/#section/Rollbacks-and-chain-forks
  const tip = await fetchTip();
  const queryParams = [
    "unspent",
    `created_after=${tip.slot_no - 24*60*60*SLOT_LENGTH}`,
  ].join("&");

  // See API reference at: https://cardanosolutions.github.io/kupo/#operation/getMatches
  const response = await fetch(`${SERVER_URL}/matches/${HOSKYt_POLICY_ID}.${HOSKYt_ASSET_NAME}?${queryParams}`);

  // Because the response can be large, we'll use streaming. We can do this
  // because behind the scene, Kupo is also streaming results to clients, which
  // makes it possible to:
  //
  // (1) start processing results immediately
  // (2) process the response in constant memory(*)
  //
  // > (*) Though we'll accumulate holders in a growing `Set`
  const pipeline = response.body.pipe(StreamArray.withParser());
  return new Promise(resolve => {
    let holders = new Set();

    // Since the server streams the response to us, we can start printing out
    // the results as we receive them. We use a `Set` just to make sure we do
    // not print the same address twice.
    pipeline.on('data', chunk => {
      const { address } = chunk.value;
      if (!holders.has(address)) {
        holders.add(address);
        console.log(address);
      }
    });

    pipeline.on('end', () => resolve(holders.size));
  });
}

showDog();
console.log(`↳ ${await main()} new $HOSKYt holder(s) over the past 24H.`);
