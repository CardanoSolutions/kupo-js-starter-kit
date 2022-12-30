import fetch from 'node-fetch';
import { bech32 } from 'bech32';
import StreamArray from 'stream-json/streamers/StreamArray.js';

// If you're running through Demeter, use the 'Public URL' from the console.
const SERVER_URL = "http://127.0.0.1:1442";
const SYNC_TOLERANCE = 300; // ~ 5 minutes on the chain, in slots

// Check whether a (bech32-encoded) address is a script address. The first 4
// bits of the first byte of each address is used to classify each address;
// here we are interested in all addresses that can use a script as a payment
// credential; thus type 1, 3, 5 and 7.
//
// See also: https://github.com/cardano-foundation/CIPs/tree/master/CIP-0019/#shelley-addresses
function isScriptAddress(address) {
  const firstByte = bech32.fromWords(bech32.decode(address, 999).words)[0];
  const addressType = firstByte >> 4;
  return [1,3,5,7].includes(addressType);
}

// Before anything, we want to leave a small warning should the Kupo server not
// be fully synchronized with the network. This is because the information we
// get would be quite innacurate otherwise.
async function warnIfNotSynchronized() {
  // See API reference at: https://cardanosolutions.github.io/kupo/#operation/getHealth
  const response = await fetch(`${SERVER_URL}/health`, { headers: { accept: "application/json" } });
  const health = await response.json();
  const delta = Math.abs(health.most_recent_checkpoint - health.most_recent_node_tip);
  if (delta > SYNC_TOLERANCE) {
    console.error("\u001b[33mWARNING\u001b[0m | The server is not yet synchronized with the chain, results may be inaccurate.");
  }
}

async function main() {
  await warnIfNotSynchronized();

  // See API reference at: https://cardanosolutions.github.io/kupo/#operation/getMatches
  //
  // Here we provide the flag `?unspent` to get only unspent results from the
  // API. Note that this is necessary even if we've specified `--prune-utxo`
  // because spent outputs are only removed after a certain delay -- when it is
  // actually safe to remove them.
  //
  // Read more about this on https://cardanosolutions.github.io/kupo/#section/Rollbacks-and-chain-forks
  const response = await fetch(`${SERVER_URL}/matches?unspent`);

  // Because the response can be huge, we'll use streaming. We can do this
  // because behind the scene, Kupo is also streaming results to clients, which
  // makes it possible to:
  //
  // (1) start processing results immediately
  // (2) process the response in constant memory
  const pipeline = response.body.pipe(StreamArray.withParser());
  const { tvl, countScripts } = await new Promise(resolve => {
    let tvl = 0n;
    let countScripts = 0;
    let count = 0;

    pipeline.on('end', () => {
      process.stderr.cursorTo(0);
      process.stderr.clearLine();
      resolve({ tvl, countScripts });
    });

    pipeline.on('data', chunk => {
      count += 1;

      // Only count the value if it is a script address; we also count
      // the total number of scripts.
      //
      // Note that in Kupo, values are stored as object with two fields:
      //
      // ```json
      // {
      //     "coins": ...,
      //     "assets": ...
      // }
      // ```
      //
      // we could also include all assets locked in scripts, but here we are
      // focusing on Ada and thus only look at 'coins' which holds a number of
      // lovelace. (1.000.000 Lovelace = 1 Ada)
      if (isScriptAddress(chunk.value.address)) {
        countScripts += 1;
        tvl += BigInt(chunk.value.value.coins);
      }

      // At the moment of writing this tutorial, there are ~611K UTxOs on the
      // preview network, so aggregating all of them takes a few seconds.
      //
      // This will make the command show some progress as it goes through all
      // results.
      if (count % 100 === 0) {
        process.stderr.cursorTo(0);
        process.stderr.clearLine();
        process.stderr.write(`${count} outputs processed...`);
      }
    });
  });

  console.log(`${(tvl / 1000000n)}₳ locked in ${countScripts} scripts.`);
}

await main();
