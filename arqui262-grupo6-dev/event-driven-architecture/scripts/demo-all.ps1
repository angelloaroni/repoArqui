# Runs the whole demo sequence. Needs the stack up: docker compose up -d --build
$ErrorActionPreference = "Stop"
Set-Location (Join-Path $PSScriptRoot "..")
$py = if (Get-Command python -ErrorAction SilentlyContinue) { "python" } else { "py" }

$steps = @(
  @("scripts/healthcheck.py", "--wait", "90"),
  @("scripts/reset_demo.py"),
  @("scripts/demo_01_happy_path.py"),
  @("scripts/demo_02_consumer_down.py"),
  @("scripts/demo_03_redelivery.py"),
  @("scripts/demo_04_poison_dlq.py"),
  @("scripts/demo_05_trace.py", "--new"),
  @("scripts/demo_06_outbox.py")
)
foreach ($step in $steps) {
  & $py @step
  if ($LASTEXITCODE -ne 0) { Write-Error "Step failed: $($step -join ' ')"; exit $LASTEXITCODE }
}
