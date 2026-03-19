param(
    [Parameter(Mandatory = $true)]
    [string]$GatewayBaseUrl,

    [string]$HealthPath = '/api/health',

    [int]$TimeoutSec = 20,

    [int[]]$BlockStatusCodes = @(403, 406),

    [switch]$FailIfAnyNotBlocked,

    [switch]$VerboseResponses
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Get-StatusCodeFromException {
    param([System.Exception]$Exception)

    if ($null -eq $Exception) {
        return $null
    }

    if ($null -ne $Exception.Response -and $null -ne $Exception.Response.StatusCode) {
        try {
            return [int]$Exception.Response.StatusCode
        }
        catch {
            return $null
        }
    }

    return $null
}

function Invoke-WafProbe {
    param(
        [string]$Name,
        [string]$Method,
        [string]$Path,
        [string]$Query,
        [hashtable]$Headers,
        [string]$Body,
        [string]$ContentType
    )

    $base = $GatewayBaseUrl.TrimEnd('/')
    $url = "$base$Path"
    if (-not [string]::IsNullOrWhiteSpace($Query)) {
        $url = "${url}?$Query"
    }

    $invokeParams = @{
        Uri         = $url
        Method      = $Method
        TimeoutSec  = $TimeoutSec
        UseBasicParsing = $true
    }

    if ($null -ne $Headers -and $Headers.Count -gt 0) {
        $invokeParams.Headers = $Headers
    }

    if (-not [string]::IsNullOrEmpty($Body)) {
        $invokeParams.Body = $Body
        if (-not [string]::IsNullOrEmpty($ContentType)) {
            $invokeParams.ContentType = $ContentType
        }
    }

    $statusCode = $null
    $ok = $false
    $responseText = ''
    $errorText = ''

    try {
        $resp = Invoke-WebRequest @invokeParams
        $statusCode = [int]$resp.StatusCode
        $ok = $true
        $responseText = [string]$resp.Content
    }
    catch {
        $statusCode = Get-StatusCodeFromException -Exception $_.Exception
        $errorText = [string]$_.Exception.Message
    }

    $isBlocked = $false
    if ($null -ne $statusCode -and $BlockStatusCodes -contains $statusCode) {
        $isBlocked = $true
    }

    [PSCustomObject]@{
        TestName      = $Name
        Method        = $Method
        Url           = $url
        StatusCode    = $statusCode
        IsBlocked     = $isBlocked
        RequestOk     = $ok
        Error         = $errorText
        ResponseShort = if ($VerboseResponses) { $responseText } else { '' }
    }
}

Write-Host ''
Write-Host '=== WAF Security Smoke Test ===' -ForegroundColor Cyan
Write-Host "Gateway: $($GatewayBaseUrl.TrimEnd('/'))" -ForegroundColor Cyan
Write-Host "Expected block status: $($BlockStatusCodes -join ', ')" -ForegroundColor Cyan
Write-Host ''

$tests = @(
    @{
        Name   = 'SQLi in query string'
        Method = 'GET'
        Path   = $HealthPath
        Query  = 'q=' + [uri]::EscapeDataString("' OR 1=1--")
    },
    @{
        Name   = 'XSS in query string'
        Method = 'GET'
        Path   = $HealthPath
        Query  = 'q=' + [uri]::EscapeDataString('<script>alert(1)</script>')
    },
    @{
        Name   = 'Path traversal pattern'
        Method = 'GET'
        Path   = $HealthPath
        Query  = 'file=' + [uri]::EscapeDataString('../../../../etc/passwd')
    },
    @{
        Name   = 'Command injection pattern'
        Method = 'GET'
        Path   = $HealthPath
        Query  = 'cmd=' + [uri]::EscapeDataString('cat /etc/passwd; id')
    },
    @{
        Name    = 'Header-based XSS payload'
        Method  = 'GET'
        Path    = $HealthPath
        Headers = @{ 'User-Agent' = '<script>alert(1)</script>' }
    },
    @{
        Name        = 'SQLi in JSON body'
        Method      = 'POST'
        Path        = '/api/auth/login'
        Body        = '{"email":"admin'' OR 1=1--","password":"x"}'
        ContentType = 'application/json'
    }
)

$results = New-Object System.Collections.Generic.List[object]

foreach ($test in $tests) {
    $query = if ($test.ContainsKey('Query')) { $test['Query'] } else { $null }
    $headers = if ($test.ContainsKey('Headers')) { $test['Headers'] } else { $null }
    $body = if ($test.ContainsKey('Body')) { $test['Body'] } else { $null }
    $contentType = if ($test.ContainsKey('ContentType')) { $test['ContentType'] } else { $null }

    $probeParams = @{
        Name        = $test.Name
        Method      = $test.Method
        Path        = $test.Path
        Query       = $query
        Headers     = $headers
        Body        = $body
        ContentType = $contentType
    }

    $result = Invoke-WafProbe @probeParams

    $results.Add($result)

    $color = if ($result.IsBlocked) { 'Green' } else { 'Yellow' }
    $codeText = if ($null -eq $result.StatusCode) { 'n/a' } else { [string]$result.StatusCode }
    $blockLabel = if ($result.IsBlocked) { 'BLOCKED' } else { 'NOT BLOCKED' }
    Write-Host ("[{0}] {1} -> HTTP {2}" -f $blockLabel, $result.TestName, $codeText) -ForegroundColor $color

    if (-not [string]::IsNullOrWhiteSpace($result.Error)) {
        Write-Host "  Error: $($result.Error)" -ForegroundColor DarkGray
    }
}

Write-Host ''
Write-Host '=== Summary ===' -ForegroundColor Cyan

$blockedCount = ($results | Where-Object { $_.IsBlocked }).Count
$notBlockedCount = $results.Count - $blockedCount

$results |
    Select-Object TestName, Method, StatusCode, IsBlocked |
    Format-Table -AutoSize

Write-Host ''
Write-Host "Blocked: $blockedCount / $($results.Count)" -ForegroundColor Cyan
Write-Host "Not blocked: $notBlockedCount / $($results.Count)" -ForegroundColor Cyan

if ($FailIfAnyNotBlocked -and $notBlockedCount -gt 0) {
    Write-Error 'At least one malicious payload was not blocked by the WAF.'
    exit 1
}

exit 0
