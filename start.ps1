param(
  [string]$DocumentsPath = ".\sample-data"
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path ".env")) {
  Copy-Item ".env.example" ".env"
}

$resolvedDocuments = Resolve-Path $DocumentsPath
$envContent = Get-Content ".env"
if ($envContent -match "^DOCUMENTS_HOST_PATH=") {
  $envContent `
    -replace "^DOCUMENTS_HOST_PATH=.*", "DOCUMENTS_HOST_PATH=$resolvedDocuments" |
    Set-Content ".env"
} else {
  Add-Content ".env" "DOCUMENTS_HOST_PATH=$resolvedDocuments"
}

Write-Host "Starting Psychology Notes RAG..."
Write-Host "Mounted documents folder: $resolvedDocuments"
docker compose up --build
