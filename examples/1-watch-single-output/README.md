## Example 1 - Watching a single output

In this example, we want to check when a particular transaction output was spent on chain.

Let's consider [the following output](https://preview.cardanoscan.io/transaction/60eb97c0b6f83c433dbecd371ff8e14b697b1b0c87377dd80421dddd59baeaae?tab=utxo):

```yaml
transaction-id: 60eb97c0b6f83c433dbecd371ff8e14b697b1b0c87377dd80421dddd59baeaae
output-index: 0
```

This output was created in slot `4725297`, so to find out when it was spent, we will:

- Start synchronizing just before that point, so we can index this output and look at every block after.
- Match only this particular output, so we don't need to needlessly index more than necessary.

We'll thus consider the following point:

```yaml
absolute slot number: 4725274
block header hash: 13c1f69913564b37c5c9241bba77eb5b9af63bb2d8d930fc4c36219383209c1c
```

> **Note**
>
> Figuring out which points to synchronize from can be a little tricky. It is possible to run
> Kupo just for the sake of indexing chain points; Kupo then provides a useful interface for
> querying ancestor points in a friendly fashion:
>
> See: [`GET /checkpoints/{slot-no}`](https://cardanosolutions.github.io/kupo/#operation/getCheckpointBySlot)

Put together, we can start our Kupo instance as follows:

```
kupo \
  --node-socket /path/to/cardano-node/node.socket \
  --node-config /path/to/cardano-node/config.json \
  --workdir example-1.db \
  --since "4725274.13c1f69913564b37c5c9241bba77eb5b9af63bb2d8d930fc4c36219383209c1c" \
  --match "0@60eb97c0b6f83c433dbecd371ff8e14b697b1b0c87377dd80421dddd59baeaae"
```

Note that, if you're running this example through [demeter.run](https://demeter.run),
you only need to report the `--since` and `--match` options; the rest is handled for you.

> **Warning**
>
> Do not specify (or enable in Demeter) `--prune-utxo`; since we want to know when the output
> is spent, we need Kupo to keep the spent output indexed and not remove it!

From there, we can poll the Kupo server's API for our output, until the field
`spent_at` is no longer `null`.

---

You can run the example using `yarn` via:

```
yarn example-1
```
