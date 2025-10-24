Param(
  [string]$Phase = "phase",
  [string]$Message = "chore(${Phase}): apply execution changes"
)
$ErrorActionPreference = "Stop"

if (-not $env:GIT_BRANCH) { $env:GIT_BRANCH = "master" }
if (-not $env:GIT_AUTHOR_NAME) { $env:GIT_AUTHOR_NAME = "AuditOrbit Bot" }
if (-not $env:GIT_AUTHOR_EMAIL) { $env:GIT_AUTHOR_EMAIL = "bot@auditorbit.local" }

git rev-parse --is-inside-work-tree | Out-Null

# ensure branch
git fetch --all --prune 2>$null | Out-Null
git show-ref --verify --quiet ("refs/heads/" + $env:GIT_BRANCH) | Out-Null
$branchExists = $LASTEXITCODE -eq 0
if (-not $branchExists) { git checkout -b $env:GIT_BRANCH } else { git checkout $env:GIT_BRANCH | Out-Null }

# remote wiring
$hasOrigin = ($null -ne (git remote get-url origin 2>$null))
$ghOk = $false; try { gh auth status | Out-Null; $ghOk = $true } catch {}
if (-not $hasOrigin) {
  if ($ghOk -and $env:GIT_REMOTE_URL) {
    git remote add origin $env:GIT_REMOTE_URL
  } elseif ($env:GIT_REMOTE_URL -and $env:GIT_PAT) {
    $u = [System.Uri]$env:GIT_REMOTE_URL
    $origin = "https://$($env:GIT_PAT)@{0}{1}" -f $u.Authority, $u.AbsolutePath
    git remote add origin $origin
  }
  $hasOrigin = ($null -ne (git remote get-url origin 2>$null))
}

git config user.name  $env:GIT_AUTHOR_NAME
git config user.email $env:GIT_AUTHOR_EMAIL

git add -A
$iso = (Get-Date).ToString("s")
git commit -m "$Message - $iso" 2>$null

# safe pull (skip if no remote or no upstream yet)
$canPull = $hasOrigin -and ($(git ls-remote --heads origin $env:GIT_BRANCH).Length -gt 0)
if ($canPull) { git pull --rebase origin $env:GIT_BRANCH }

git push -u origin $env:GIT_BRANCH
Write-Host "Pushed to $($env:GIT_BRANCH) successfully."
