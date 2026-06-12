# Remote Server Context

## Access Method

- Inspected through SSH MCP.
- Connected user: `root`
- Hostname: `vmi1991462.contaboserver.net`
- Working directory on connect: `/root`
- Kernel: `Linux 5.4.0-105-generic x86_64`

## Docker Runtime

- Docker version: `28.1.1`
- Docker Compose version: `v2.32.4`
- Docker service state:
  - enabled
  - active

## Live RMS-Related Containers

Observed with `docker ps -a`:

- `rms-api-server`
  - image: `bao2211/rms-apiserver:latest`
  - status: up for about 4 weeks
  - ports: `0.0.0.0:8080->8080/tcp`
- `rms-sqlserver`
  - image: `mcr.microsoft.com/mssql/server:2025-latest`
  - status: up for about 4 weeks
  - ports: `0.0.0.0:1433->1433/tcp`

Other non-RMS containers are also present on the host, including several MSSQL instances, Portainer, and Oracle XE.

## Live RMS Compose File

Path found on server:

- `/root/docker-compose.yml`

Server-side compose file defines:

- service `db`
  - image `mcr.microsoft.com/mssql/server:2025-latest`
  - container name `rms-sqlserver`
  - external volume `rms_sqlData`
  - network `rms-network`
  - healthcheck using `sqlcmd`
- service `rms-api`
  - image `bao2211/rms-apiserver:latest`
  - container name `rms-api-server`
  - depends on database health
  - network `rms-network`
  - connection string configured as `Server=db;...`

## Important Runtime Mismatch

The live API container does not exactly match the compose file contents:

- `/root/docker-compose.yml` says API should use `ConnectionStrings__DefaultConnection=Server=db;...`
- Actual running `rms-api-server` container environment uses `Server=rms-sqlserver;...`

This means the currently running container was either:

- started with a different compose revision,
- recreated manually, or
- modified after the compose file currently on disk was written.

## Network Topology

- Network present: `rms-network`
- API container on `rms-network`:
  - IP `172.24.0.3`
- SQL container on both:
  - `rms-network` IP `172.24.0.2`
  - default `bridge` IP `172.17.0.4`

Important detail:

- `docker inspect` shows `rms-sqlserver` attached to both `bridge` and `rms-network`.
- `docker inspect` shows `rms-api-server` attached to `rms-network` only.
- `docker network inspect rms-network` confirms both RMS containers are attached to the shared custom bridge network.

## Compose State Observation

- `docker compose -f /root/docker-compose.yml ps` returned no managed services.

Operational implication:

- the containers currently running on the server are not being tracked by the current compose project metadata for `/root/docker-compose.yml`, even though their names and images match the expected stack.

## RMS Volumes

Relevant Docker volumes on the host include:

- `rms_sqlData`
- `rms-test_sqlData`
- `rms-tests_sqlData`
- `rms-testss_sqlData`
- `root_sqlData`

The live SQL container mount uses:

- volume `rms_sqlData`
- destination `/var/opt/mssql`

## HTTP Reachability From The Server

- `http://localhost:8080/api/Category` returned HTTP `200`
- `http://localhost:8080/swagger/index.html` returned HTTP `404`

Operational implication:

- API service is responding locally on port `8080`.
- Swagger is not currently available at the expected UI path, despite several repo docs referencing `/swagger`.

## Listening Ports On Host

Observed host listeners include:

- `1433` for SQL Server container
- `8080` for RMS API container
- `8000`, `9000`, `9443` for Portainer

## Firewall Snapshot

- UFW is active.
- Relevant open ports/rules observed:
  - `1433` allowed from anywhere
  - `9443` allowed from anywhere
  - forwarding rules exist for Portainer and several database containers

## Recent RMS Logs

API logs show:

- repeated successful CORS preflight handling
- active requests from `http://127.0.0.1:4173`
- successful EF Core queries against `Bill`, `User`, and `Order`

SQL logs show:

- SQL Server started successfully
- `webQLQuanAn` database startup activity
- historical delete/recreate events for `webQLQuanAn`

## Server-Side Backup Artifacts

Relevant files and directories found in `/root`:

- `/root/docker-compose.yml`
- `/root/docker-full-backup-20260313`
- `/root/docker-full-backup-20260313.tar.gz`
- `/root/docker_backups`

The backup directory includes RMS container and network metadata, plus archived RMS SQL volume data.