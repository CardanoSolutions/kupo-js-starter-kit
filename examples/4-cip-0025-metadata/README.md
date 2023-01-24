## Example 4 - Collect CIP-0025's NFT Minting Metadata

In this 4th example, we show yet-another-pattern scheme for Kupo (only available in v2.4.0+): metadata tag. We'll use it to synchronize all transactions from the origin that carry some metadata with tag `721`.

Then, we'll fetch results (utxos) and concurrently, as we receive result, trigger another query to fetch the actual metadata associated with the underlying transaction. This way, we demonstrate how the server can work in a highly concurrent fashion and how we can use Kupo to quickly index transaction metadata.

Because filtering by metadata tag is only available for syncing (and not for querying), we can't reuse the database from the examples 2 and 3, so we'll need to build a new index. Worry not, it should be quick enough. Metadata tags can be specified between curly braces as such: `{721}`. So, synchronizing from origin gives us the following starting options:

```
kupo \
  --node-socket /path/to/cardano-node/node.socket \
  --node-config /path/to/cardano-node/config.json \
  --workdir example-4.db \
  --since "origin" \
  --match "{721}"
```

> **Note**
>
> Because we do not anticipate _too many_ results here (few thousands), we do
> not bother with the `--defer-db-indexes` flag in this scenario. So we don't
> need to restart the database.

---

```
yarn example-4
```
