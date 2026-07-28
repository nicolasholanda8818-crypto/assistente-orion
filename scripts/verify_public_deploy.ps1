param(
    [string]$BaseUrl = "https://assistente-orion.onrender.com",
    [string]$ExpectedCacheName = "orion-pwa-v50-orb-identity"
)

$ErrorActionPreference = "Stop"

function Assert-True {
    param(
        [bool]$Condition,
        [string]$Message
    )

    if (-not $Condition) {
        throw $Message
    }
}

function Get-HeaderValue {
    param(
        $Headers,
        [string]$Name
    )

    foreach ($key in $Headers.Keys) {
        if ($key -ieq $Name) {
            return [string]$Headers[$key]
        }
    }

    return ""
}

function Ensure-Contains {
    param(
        [string]$Haystack,
        [string]$Needle,
        [string]$Message
    )

    Assert-True -Condition ($Haystack.Contains($Needle)) -Message $Message
}

$timestamp = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
$cacheBust = "verify=$timestamp"

$rootUri = "$BaseUrl/?$cacheBust"
$serviceWorkerUri = "$BaseUrl/service-worker.js?$cacheBust"
$mainJsUri = "$BaseUrl/assets/js/main.js?$cacheBust"
$indexUri = "$BaseUrl/index.html?$cacheBust"
$statusUri = "$BaseUrl/api/status?$cacheBust"

Write-Host "[1/5] Checking API status..." -ForegroundColor Cyan
$status = Invoke-RestMethod -Uri $statusUri -Method Get
Assert-True -Condition ($status.backend -eq "online") -Message "Backend is not online in /api/status."
Assert-True -Condition ($status.brain.status -eq "ready") -Message "Brain is not ready in /api/status."
Assert-True -Condition ($status.pwa.cache_name -eq $ExpectedCacheName) -Message "Unexpected cache name. Expected '$ExpectedCacheName', got '$($status.pwa.cache_name)'."

Write-Host "[2/5] Checking cache-control for HTML..." -ForegroundColor Cyan
$rootHead = Invoke-WebRequest -Uri $rootUri -Method Head
$rootCacheControl = Get-HeaderValue -Headers $rootHead.Headers -Name "Cache-Control"
Ensure-Contains -Haystack $rootCacheControl -Needle "no-store" -Message "Root HTML missing no-store cache policy."
Ensure-Contains -Haystack $rootCacheControl -Needle "must-revalidate" -Message "Root HTML missing must-revalidate policy."

Write-Host "[3/5] Checking cache-control for service worker..." -ForegroundColor Cyan
$swHead = Invoke-WebRequest -Uri $serviceWorkerUri -Method Head
$swCacheControl = Get-HeaderValue -Headers $swHead.Headers -Name "Cache-Control"
Ensure-Contains -Haystack $swCacheControl -Needle "no-store" -Message "Service worker missing no-store cache policy."
Ensure-Contains -Haystack $swCacheControl -Needle "must-revalidate" -Message "Service worker missing must-revalidate policy."

Write-Host "[4/5] Checking cache-control for main.js..." -ForegroundColor Cyan
$mainHead = Invoke-WebRequest -Uri $mainJsUri -Method Head
$mainCacheControl = Get-HeaderValue -Headers $mainHead.Headers -Name "Cache-Control"
Ensure-Contains -Haystack $mainCacheControl -Needle "no-cache" -Message "main.js missing no-cache policy."
Ensure-Contains -Haystack $mainCacheControl -Needle "must-revalidate" -Message "main.js missing must-revalidate policy."

Write-Host "[5/5] Checking deployed frontend markers..." -ForegroundColor Cyan
$mainBody = Invoke-WebRequest -Uri $mainJsUri -Method Get
Ensure-Contains -Haystack $mainBody.Content -Needle "./portfolio-profile.js" -Message "main.js does not include portfolio-profile module import."
$indexBody = Invoke-WebRequest -Uri $indexUri -Method Get
Ensure-Contains -Haystack $indexBody.Content -Needle "Conheca Nicolas" -Message "index.html does not include updated portfolio voice button label."

Write-Host ""
Write-Host "Public deploy verification passed." -ForegroundColor Green
Write-Host "BaseUrl: $BaseUrl"
Write-Host "CacheName: $($status.pwa.cache_name)"
Write-Host "Root Cache-Control: $rootCacheControl"
Write-Host "SW Cache-Control: $swCacheControl"
Write-Host "main.js Cache-Control: $mainCacheControl"