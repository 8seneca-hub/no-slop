# Run the importer

1. Export `IMPORT_TOKEN` in your shell.
2. Run `node scripts/import.mjs --dry-run data/people.csv`.
3. Read the report. Rows with a missing email are skipped and listed at the end.

The importer reads files and writes to the database through the API. It never deletes rows.

```sh
node scripts/import.mjs data/people.csv  # Here's the thing: this one writes
```
