# Vivubus App

This README explains how to run and configure the Vivubus Laravel + Vite app in this repository using Docker and the included services.

**Quick summary**
- PHP / Laravel served by `vivubus-app` (PHP-FPM) and `vivubus-web` (nginx) on host port 80.
- MySQL runs as `vivubus-db`.
- Vite dev server runs in `vivubus-node` and is exposed on host port 8383 for frontend hot-reload.

**Prerequisites**
- Docker and Docker Compose (compose v2) installed.
- Git, optional: Node/NPM on host if you prefer running assets locally.

**Ports**
- `http://localhost/` → nginx (container `vivubus-web`) mapped to host port 80.
- `http://localhost:8383/` → Vite dev server (container `vivubus-node`).

**Quick Start (development)**
1. Start all services (build images first time):

```bash
docker compose up --build -d
```

2. Check running containers:

```bash
docker ps
```

3. Open the app in your browser:
- App (Laravel/nginx): `http://localhost/`
- Vite dev server (frontend HMR): `http://localhost:8383/`

Notes: The project `docker-compose.yml` exposes both ports (80 for nginx and 5173 for Vite). If you made the changes to the compose/vite configuration, `vivubus-node` runs `npm install` then `vite --host 0.0.0.0` so HMR is reachable from the host.

**Run artisan / migrations / seeders**
To run artisan commands inside the PHP container:

```bash
docker exec -it vivubus-app php artisan migrate
docker exec -it vivubus-app php artisan db:seed
```

**Frontend development**
The repository uses Vite and React in `resources/js`.
- By default the project starts Vite inside the `vivubus-node` container and exposes it on `5173`.
- To view HMR-enabled frontend, open `http://localhost:5173/`.

If you prefer running frontend on the host (not in container):
1. Install Node + npm on host (if not installed).
2. From the project root, run:

```bash
npm install
npm run dev
```

This will start Vite on the host (also defaulting to port 5173).

**Production / Build**
Build assets for production:

```bash
# either inside node container
docker exec -it vivubus-node npm run build
# or on host
npm run build
```

The built assets will appear in `public/dist` (Laravel uses these files for production).

**Wayfinder plugin note (important)**
This project uses `@laravel/vite-plugin-wayfinder` which by default runs a command that expects the PHP CLI to be available. To make the Node container start reliably in development, the Vite config was modified to skip Wayfinder during `NODE_ENV !== 'production'` (so `php` isn't required inside the Node container).

Recommended ways to handle Wayfinder during development:
- Generate the Wayfinder files from the PHP container when needed:

```bash
# run inside PHP container
docker exec -it vivubus-app php artisan wayfinder:generate --with-form
```

- If you want the Node container to run Wayfinder automatically, you must provide PHP in the Node image (not recommended unless you have a specific need). Another option is to create a separate build step or CI job that runs generation.

**Common troubleshooting**
- Can't access `http://localhost:5173/`:
  - Ensure `vivubus-node` is running: `docker ps | grep vivubus-node`.
  - Check logs: `docker logs vivubus-node --tail 200`.
  - Ensure Vite is bound to `0.0.0.0` (compose `command` sets `--host 0.0.0.0`).
  - If using WSL/Windows, ensure ports are forwarded from WSL to Windows host (or access via the WSL IP).

- Node container exits with `php: not found` (or similar):
  - This happens if Wayfinder runs in dev; see "Wayfinder plugin note" above. Generate Wayfinder from the PHP container instead.

- The site loads but styles or JS appear broken:
  - Ensure assets are built or Vite dev is running.
  - Check browser console for asset or HMR errors and inspect `docker logs vivubus-node`.

**Helpful commands**
- Tail logs:

```bash
docker logs -f vivubus-node
docker logs -f vivubus-web
docker logs -f vivubus-app
```

- Rebuild and restart a service (example `node`):

```bash
docker rm -f vivubus-node || true
docker compose up -d --build node
```

- Run a shell inside a container:

```bash
docker exec -it vivubus-node sh
docker exec -it vivubus-app bash
```

**Notes about node_modules**
The compose file mounts the project into the container which means `node_modules` may be managed either on the host or inside the container. Current compose command runs `npm install` each start to ensure dependencies are installed. For faster iterations, consider:
- Running `npm install` on host and not in the container, OR
- Extending `docker/node/Dockerfile` to run `npm ci` during image build and avoid installing every start.

**If you want me to**
- Add a short `dev-setup.md` that documents how to generate Wayfinder files and local-only tips.
- Update `docker/node/Dockerfile` to cache `node_modules` during the build.
- Re-enable Wayfinder in dev by installing PHP in the Node image (I can implement this change if you prefer).

---

If anything here is missing or you want adjustments (example: run everything on host, or a script that runs migrations + seeds automatically), tell me which direction and I will update the README or create helper scripts.
