# Job Portal (portal_dot)

Aplicação React (Vite + TypeScript) do portal de vagas, servida em `/portal/` no hosting Firebase.

## Desenvolvimento local

Requisitos: Node.js e npm.

```sh
cd apps/clients/portal_dot
npm install
npm run dev
```

O servidor de desenvolvimento usa a porta configurada no `vite.config.ts` (por padrão 8080).

### Firestore

Todas as coleções usadas pelo portal ficam como **subcoleções** de `dotgroup/{id}`:

- `dotgroup/{id}/dot_jobs`
- `dotgroup/{id}/job_applications`
- `dotgroup/{id}/candidates`
- `dotgroup/{id}/suppliers`

Por padrão `{id}` é `default`. Para outro documento raiz, defina no `.env`:

`VITE_DOTGROUP_DOC_ID=seu_id`

Dados antigos nas coleções de topo (`dot_jobs`, etc.) **não** são lidos automaticamente; é preciso migrar para `dotgroup/default/...` (ou o id configurado) se já existirem registros em produção.

## Stack

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## Build

O build gera artefatos em `public/portal/` (raiz do repositório), alinhado ao `firebase.json`.

```sh
npm run build
```
