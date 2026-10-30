# Notes from the migration

I did not trust the dry run, so I copied the table by hand and diffed it. Eleven rows differed. Nine were trailing spaces; two were real, and both belonged to Linh's team.

We kept the old index for a week. It cost about 3 GB and saved me a rollback at 2am on Tuesday.
