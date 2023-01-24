import fetch from 'node-fetch';
import { bech32 } from 'bech32';
import StreamArray from 'stream-json/streamers/StreamArray.js';

// If you're running through Demeter, use the 'Public URL' from the console.
const SERVER_URL = "http://localhost:1442";

// See API reference at: https://cardanosolutions.github.io/kupo/#operation/getMetadata
// See also: https://cips.cardano.org/cips/cip25
async function fetchMetadata(slotNo, transactionId) {
  let response;
  try {
    response = await fetch(`${SERVER_URL}/metadata/${slotNo}?transaction_id=${transactionId}`);
  } catch(e) {
    return fetchMetadata(slotNo, transactionId)
  }

  const metadata = await response.json();

  // Metadata comes as a JSON description of the underlying CBOR binary structure.
  // So it is a bit clunk to process here, but it becomes clearer with an example:
  //
  // [
  //    {
  //       "schema": {
  //           "721": {
  //               "map": [{
  //                  "k": { "string": "<some-policy-id-in-base16>" },
  //                  "v": {
  //                      "map": [
  //                          {
  //                              "k": { "string": "<some-asset-name>" },
  //                              "v": { "map": "..." }
  //                          },
  //                          {
  //                              "k": { "string": "<some-asset-name>" },
  //                              "v": { "map": "..." }
  //                          },
  //                          ...
  //                      ]
  //                  }
  //               }]
  //           }
  //       }
  //    }
  // ]
  try {
    const schema = metadata[0].schema[721];
    const policyId = (schema.map[0].k.string || schema.map[0].k.bytes).substr(0, 8);
    const assets = schema.map[0].v.map.map(obj => obj.k.string).slice(0, 10);

    return JSON.stringify(`${policyId} → ${assets}`);
  } catch(err) {
    return null
  }
}

async function main() {
  // See API reference at: https://cardanosolutions.github.io/kupo/#operation/getMatches
  //
  // Here we provide the flag `?unspent` to get only unspent results from the
  // API. Note that this is necessary even if we've specified `--prune-utxo`
  // because spent outputs are only removed after a certain delay -- when it is
  // actually safe to remove them.
  //
  // Read more about this on https://cardanosolutions.github.io/kupo/#section/Rollbacks-and-chain-forks
  const response = await fetch(`${SERVER_URL}/matches`);

  // As for the other example, we want to leverage streaming as much as
  // possible and fetch associated metadata as we receive matches.
  //
  // However, to avoid fetching the same metadata twice, we'll build a little
  // concurrent worker to do this for us.
  const pipeline = response.body.pipe(StreamArray.withParser());
  return new Promise(resolve => {
    const metadata = new Map();

    pipeline.on('data', chunk => {
      const transactionId = chunk.value.transaction_id;
      if (!metadata.has(transactionId)) {
        const slotNo = chunk.value.created_at.slot_no;
        metadata.set(
          transactionId,
          fetchMetadata(slotNo, transactionId).then(metadata => metadata ? console.log(metadata) : undefined)
        );
      }
    });

    pipeline.on('end', resolve);
  });
}

await main();
