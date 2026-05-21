# API Examples

OpenAPI docs are available at <http://localhost:8000/docs> when the backend is
running.

## Health

```powershell
Invoke-RestMethod http://localhost:8000/health
```

## Start Ingestion

```powershell
Invoke-RestMethod `
  -Method Post `
  -Uri http://localhost:8000/ingest `
  -ContentType "application/json" `
  -Body '{"folder_path":"/documents","force_reindex":false}'
```

## Ask A Question

```powershell
Invoke-RestMethod `
  -Method Post `
  -Uri http://localhost:8000/chat `
  -ContentType "application/json" `
  -Body '{"question":"What is the spacing effect?"}'
```

## Clear The Vector Store

```powershell
Invoke-RestMethod -Method Delete http://localhost:8000/documents
```
