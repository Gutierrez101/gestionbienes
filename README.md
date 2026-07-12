# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## MITRE ATT&CK Audit Support

The backend now records MITRE ATT&CK metadata in the `AuditoriaLog` model:

- `mitre_tactic`
- `mitre_technique`

This metadata is populated for:

- successful and failed login attempts (`Credential Access - T1110`)
- user creation events (`Persistence - T1136`)
- CRUD requests from middleware (mapped by HTTP method)

The audit chain API endpoint now returns these fields alongside the blockchain-style `previous_hash` and `hash` values.
