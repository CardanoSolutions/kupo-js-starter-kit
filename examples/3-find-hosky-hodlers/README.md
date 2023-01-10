## Example 3 - Finding all $HOSKYt ~~holders~~ idiots over the past 24h

In this third example, we'll find out who are those that have received some specific asset over the past 24h. More specifically, we'll look at `$HOSKYt` holders on the preview network. There are multiple approaches to this. We could for example index only that specific asset and query all `/matches` again. Yet, since we already have superset of that we built for _Example 2_, we will simply re-use that one and adjust our query.

Indeed, while Kupo uses patterns to filter and index specific data, it also accepts any of those patterns as input query -- even if the query patterns are differently from the indexing patterns! Yet, because our index from _Example 2_ goes over the entire history of the `preview` network, we'll make use of a _time range_ in the query parameters.

### Time Ranges

Kupo supports pagination in the form of time ranges, between points on-chain. For convenience, points can be provided either as (absolute) slot numbers or a combination of a slot number and a block header hash. Ranges are in the form of interval with an (optional) lower bound and (optional) upper bound. Bounds can concern either the `created_at` field or the `spent_at` field. Here, we'll look at all UTxO `created_after` a slot number that is 24h in the past.

> **Warning**
>
> While Kupo allows to specify lower and upper bound as only slot numbers, it
> is usually recommended to utilize full points (with block header hash) to
> perform extra continuity validation. Indeed, when querying a large collection
> by ranges, a rollback of the most recent data of the chain may occur,
> resulting in pages being different from what one has fetched. By using fully
> qualified points, Kupo will warn you if you're fetching a next page that is
> not a continuation of a previous one.

---

You know the drill, you can run this example by typing:

```
yarn example-3
```
