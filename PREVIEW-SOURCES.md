# Our Masjid Preview Source Backup

This archive was created from the source tree used by the current Replit Preview.

## Mobile App Preview

- Preview artifact: Our Masjid
- Workflow: `artifacts/mobile: expo`
- Workflow command: `pnpm --filter @workspace/mobile run dev`
- Package and Expo configuration: `artifacts/mobile/package.json`, `artifacts/mobile/app.json`, `artifacts/mobile/metro.config.js`
- Application source: `artifacts/mobile/app/`
- Shared mobile source: `artifacts/mobile/components/`, `artifacts/mobile/constants/`, `artifacts/mobile/hooks/`, `artifacts/mobile/lib/`
- Mobile images and logos: `artifacts/mobile/assets/`

## Admin Panel Preview

- Preview artifact: Our Masjid Admin
- Preview path: `/admin-panel/`
- Workflow: `artifacts/admin-panel: Admin Panel`
- Workflow command: `export PORT=5000 BASE_PATH=/admin-panel/ && pnpm --filter @workspace/admin-panel run dev`
- Package and Vite configuration: `artifacts/admin-panel/package.json`, `artifacts/admin-panel/vite.config.ts`
- Application source: `artifacts/admin-panel/src/`
- Admin public assets: `artifacts/admin-panel/public/`

## Backend and shared source

- API server: `artifacts/api-server/`
- Shared API client/specification/database libraries: `lib/`
- Workspace package/configuration files: root `package.json`, `pnpm-lock.yaml`, `pnpm-workspace.yaml`, TypeScript config files, `.npmrc`, and `config/replit.example`
- Project assets: `attached_assets/`

## Secret handling

Environment files, private keys, service-role credentials, API key values, and the original `.replit` environment-value section were not included. The source files that reference environment variable names are retained; their values must be supplied at runtime through the workspace environment/secrets system.
