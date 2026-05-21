$ErrorActionPreference = "Stop"

Write-Host "Stopping containers and removing local vector database volumes..."
docker compose down -v
Write-Host "Reset complete. Run .\start.ps1 to rebuild and start again."
