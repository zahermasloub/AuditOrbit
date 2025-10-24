Param(
  [string]$Phase = "phase",
  [string]$Message = "chore(${Phase}): apply execution changes"
)
$ErrorActionPreference = "Stop"

if (-not $env:GIT_BRANCH) { $env:GIT_BRANCH = "master" }
if (-not $env:GIT_AUTHOR_NAME) { $env:GIT_AUTHOR_NAME = "AuditOrbit Bot" }
if (-not $env:GIT_AUTHOR_EMAIL) { $env:GIT_AUTHOR_EMAIL = "bot@auditorbit.local" }

git rev-parse --is-inside-work-tree | Out-Null

git fetch --all --prune | Out-Null
git show-ref --verify --quiet ("refs/heads/" + $env:GIT_BRANCH) | Out-Null
$branchExists = $LASTEXITCODE -eq 0
if (-not $branchExists) {
  $current = (git rev-parse --abbrev-ref HEAD).Trim()
  if ($current -and $current -ne "HEAD") {
    $env:GIT_BRANCH = $current
  } else {
    git checkout -b $env:GIT_BRANCH
  }
}

$ghOk = $false
try { gh auth status | Out-Null; $ghOk = $true } catch {}

if (-not $ghOk -and $env:GIT_REMOTE_URL -and $env:GIT_PAT) {
  git remote remove origin 2>$null
  $u = $env:GIT_REMOTE_URL
  $uri = [System.Uri]$u
  $origin = "https://$($env:GIT_PAT)@{0}{1}" -f $uri.Authority, $uri.AbsolutePath
  git remote add origin $origin
}

git config user.name  $env:GIT_AUTHOR_NAME
git config user.email $env:GIT_AUTHOR_EMAIL

git add -A
$iso = (Get-Date).ToString("s")
git commit -m "$Message - $iso" 2>$null
git pull --rebase origin $env:GIT_BRANCH 2>$null
git push -u origin $env:GIT_BRANCH
Write-Host "Pushed to $($env:GIT_BRANCH) successfully."
