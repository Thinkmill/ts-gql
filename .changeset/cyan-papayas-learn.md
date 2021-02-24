---
"@ts-gql/compiler": patch
---

Stopped removing invalid files when running the watcher. This isn't really solving an issue with ts-gql but attempting to fix https://github.com/Thinkmill/ts-gql/issues/52 where files are deleted and tools don't expect them to be deleted and then the process exits.
