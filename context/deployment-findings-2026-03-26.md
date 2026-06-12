# Deployment Findings

## What The Live Server Actually Uses

- Public production host reached through SSH MCP is `vmi1991462.contaboserver.net`.
- The RMS project is actively running there as:
  - `rms-api-server`
  - `rms-sqlserver`
- Live API image in use is `bao2211/rms-apiserver:latest`.

## Most Important Mismatches

### 1. Repo docs disagree on the target environment

- Some docs/scripts target `46.250.231.129` as the public production host.
- Some docs/scripts and mobile source target `192.168.192.85` and `192.168.192.86`.
- SSH MCP reached the public Contabo host, and that host already runs the RMS stack.

### 2. Image names are inconsistent

Both variants appear in the repository:

- `bao2211/rms-api-server`
- `bao2211/rms-apiserver`

The live server is using:

- `bao2211/rms-apiserver:latest`

### 3. Compose file and live container env differ

- Server compose file says API should connect to `Server=db`.
- Running API container is configured to connect to `Server=rms-sqlserver`.

### 4. Live containers are not tracked by current compose metadata

- `docker compose -f /root/docker-compose.yml ps` returned no running compose-managed services.
- This suggests manual container lifecycle operations or compose metadata drift.

### 5. Workspace does not contain the active compose file

- Repo scripts/docs depend on `docker-compose.yml`.
- No `docker-compose.yml` was found in the workspace during this scan.
- The active compose file currently exists on the server at `/root/docker-compose.yml`.

### 6. Mobile client default URL and request joining are inconsistent

- Source default points to `http://192.168.192.85:8080`.
- Several request sites concatenate `api/...` without a separating slash.
- Existing logs in the repo show malformed URLs like `http://192.168.192.85:8080api/Category`.

## Operational Conclusions

- The live production-like deployment is currently healthy enough to serve `GET /api/Category` on port `8080`.
- The server-side RMS API and SQL Server containers are running and networked together.
- The repository should not be treated as having a single clean deployment path right now.
- If this project needs reproducible deployment, the next hardening step is to bring the live `/root/docker-compose.yml` back into version control and standardize:
  - target host naming
  - image repository naming
  - API base URL handling in mobile/web clients
  - database host naming (`db` vs `rms-sqlserver`)
  - compose-managed lifecycle instead of ad hoc container state