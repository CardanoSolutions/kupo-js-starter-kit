# <img src="https://raw.githubusercontent.com/CardanoSolutions/kupo/master/docs/kupo.png" height=120 /> Kupo (JavaScript) Starter Kit

## Pre-requisites

To run the examples in this tutorial, you'll need [yarn](https://yarnpkg.com/)
(or `npm`, or `pnpm`) installed and a few JavaScript libraries.

Make sure to install dependencies by running:

```
yarn
```

Then, `Kupo` will be needed (obviously!)

### Option #1: Manual Setup

Follow the instruction on [Kupo's user manual: Installation](https://cardanosolutions.github.io/kupo/#section/Installation).

### Option #2: Demeter.run

If you don't want to install and run Kupo yourself, you can use the [Demeter.run](https://demeter.run) platform to create a cloud environment with access to common Cardano infrastructure.

The following button will open this repo in a private, web-based VSCode IDE with access to a shared Cardano Node and Kupo.

[![Run in Cardano Workspace](https://demeter.run/code/badge.svg)](https://demeter.run/code/?repository=https://github.com/CardanoSolutions/kupo-starter-kit.git&template=nodejs)

## Getting Started

As a reminder, you can always refer to [Kupo's user manual](https://cardanosolutions.github.io/kupo/) for details and reference.

> **Note**
>
> We'll only interact with the **preview** network in this tutorial; so make sure to pick the right configurations files and
> to check information on preview networks should you cross-check with an explorer.

### Example 1 - Watching a single output

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
  --since "4725274.13c1f69913564b37c5c9241bba77eb5b9af63bb2d8d930fc4c36219383209c1c" \
  --match "0@60eb97c0b6f83c433dbecd371ff8e14b697b1b0c87377dd80421dddd59baeaae" \
  --workdir db-example-1
```

Note that, if you're running this example through [demeter.run](https://demeter.run),
you only need to report the `--since` and `--match` options; the rest is handled for you.

> **Warning**
>
> Do not specify (or enable in Demeter) `--prune-utxo`; since we want to know when the output
> is spent, we need Kupo to keep the spent output indexed and not remove it!

From there, we can poll the Kupo server's API for our output, until the field
`spent_at` is no longer `null`.

The code in [`src/example_1.mjs`](./src/example_1.mjs) does just that, you can run it via:

```
yarn run example-1
```

### Example 2 - Aggregating TVL in scripts

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
> Deferring database indexes is a nice little trick when building an index from scratch
> that allows reducing the overall synchronization time by a factor 2 to 3. Once synchronized,
> it suffices to restart the server without the flag to automatically build the query indexes
> that makes querying faster.

Once synchronized, we'll be able to query all UTxOs, filter out non-script addresses, and calculate
the current TVL. Note that pruning the UTxO is essential here as we do not want to keep spent outputs
around.

The example script in [`src/example_2.mjs`](./src/example_2.mjs) will do just that. It'll also raise a warning if the index is not yet fully synchronized with the network tip.

Like for _Example 1_, you can run it by doing:

```
yarn run example-2
```
