## Example 2 - Aggregating TVL in scripts

In this second example, we'll look at the entire chain and use Kupo to aggregate the total value locked in scripts on the preview network. For that, synchronizing from the beginning of the chain will be necessary. In fact we could choose to synchronize only from the beginning of the Alonzo era, but since we're on the preview network that's synonymous (the preview network starts in the Alonzo era!).

> **Note**
>
> Because it's often useful to skip entire eras when synchronizing -- should you know that you only care about features introduced after a certain point -- Kupo's user manual provides [era boundaries](https://cardanosolutions.github.io/kupo/#section/Era-boundaries) for all known major networks.

Also, since we know that we'll be looking specifically for scripts address, we will match on patterns of the form `*/*` which represents the _"new"_ addresses introduced in the Shelley era. Patterns does not allow us to express "only script addresses" just yet; so we'll have to do some post-processing on top.

This gives us roughly the following options:

```
kupo \
  --node-socket /path/to/cardano-node/node.socket \
  --node-config /path/to/cardano-node/config.json \
  --since "origin" \
  --match "*/*" \
  --prune-utxo \
  --defer-db-indexes \
  --workdir db-example-2
```

Note that, if you're running this example through [demeter.run](https://demeter.run),
you only need to report the `--since` and `--match` options and enable the two switches
for pruning the UTxO and deferring database indexes.

> **Note**
>
> Deferring database indexes is a nice little trick when building an index from
> scratch that allows reducing the overall synchronization time by a factor 2
> to 3. Once synchronized, it suffices to (and **you must!) restart the
> server** without the flag to automatically build the query indexes that makes
> querying faster.

Once synchronized, we'll be able to query all UTxOs, filter out non-script addresses, and calculate
the current TVL. Note that pruning the UTxO is essential here as we do not want to keep spent outputs
around.

---

Like for the first example, you can run it by doing as follows; it'll raise a
warning if the index is not yet fully synchronized with the network tip.

```
yarn example-2
```
