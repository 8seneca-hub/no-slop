# Decision: keep Postgres for the queue

We tried Redis streams for two weeks. Throughput doubled, but we lost jobs twice when a node restarted, and the fix needed a second store for state. Postgres with `SKIP LOCKED` handles our 40 jobs a second and gives us one backup to manage.

Revisit when we pass 500 jobs a second.
