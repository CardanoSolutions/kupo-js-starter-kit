# <img src="https://raw.githubusercontent.com/CardanoSolutions/kupo/master/docs/kupo.png" height=120 /> Kupo (Node.js) Starter Kit

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

## Examples

As a reminder, you can always refer to [Kupo's user manual](https://cardanosolutions.github.io/kupo/) for details and reference.

> **Note**
>
> We'll only interact with the **preview** network in this tutorial; so make sure to pick the right configurations files and
> to check information on preview networks should you cross-check with an explorer.

### Example 1 - Watching a single output

This example demonstrates how to use Kupo to track a single UTxO entry, by its
output reference. The use case is, for example, to find out when a UTxO was
spent (if it was).

See [examples/1-watch-single-output](./examples/1-watch-single-output#readme).

### Example 2 - Aggregating TVL in scripts

This is a canonical example of aggregating a large amount of data from Kupo
(600k+ results) and how we can leverage streaming.

See [examples/2-aggregate-total-value-locked](./examples/2-aggregate-total-value-locked#readme).

### Example 3 - Find all $HOSKY ~~holders~~ idiots of the past 24h

Another example of aggregating large set of data, but only over a specific period of time using
Kupo's ranges. Here, we're going to look at $HOSKYt holders on `preview`.

See [examples/3-find-hosky-holders](./examples/3-find-hosky-hodlers#readme).

### Example 4 - Collect CIP-0025 media NFT minting metadata

Let's demonstrate how we can pattern on transaction metadata-tag to collect
outputs from transactions minting CIP-0025 compliant NFTS. This example also
shows how to fetch the associated metadata directly from Kupo.

See [examples/4-cip-0025-metadata](./examples/4-cip-0025-metadata#readme).
