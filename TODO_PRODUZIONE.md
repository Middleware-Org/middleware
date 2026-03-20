# TODO messa in produzione (focus qualità + performance)

Checklist operativa limitata a ciò che puoi verificare direttamente in questo repository,
senza introdurre nuovi ambienti e senza attività di deploy/rollback.


Debiti residui (non bloccanti):

- [ ] [P2] Uniformare timeout anche nelle route `app/api/github/*` con `fetch` diretto (`merge`, `merge/check`, `token-expiration`, `image`).
- [ ] [P2] Ridurre il logging di payload errore raw da GitHub in `lib/github/client.ts` mantenendo status/code.
- [ ] [P3] Ridurre complessità dei componenti admin più estesi (`MediaSelector`, `MediaListClient`, `UserListClient`).
- [ ] [P3] Centralizzare i DTO API client/server in un modulo dedicato (`lib/api/types`) per prevenire drift.
