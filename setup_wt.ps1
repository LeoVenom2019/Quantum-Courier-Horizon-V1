$settingsPath = "$env:LOCALAPPDATA\Packages\Microsoft.WindowsTerminal_8wekyb3d8bbwe\LocalState\settings.json"
$settings = Get-Content -Raw $settingsPath | ConvertFrom-Json
$pwshGuid = "{574e775e-4f2a-5b96-ac1e-a2962a402336}"

$exists = $false
foreach ($p in $settings.profiles.list) {
    if ($p.guid -eq $pwshGuid -or $p.commandline -match "pwsh") {
        $exists = $true
        $pwshGuid = $p.guid
        break
    }
}

if (-not $exists) {
    $newProfile = [PSCustomObject]@{
        guid = $pwshGuid
        hidden = $false
        name = "PowerShell 7"
        commandline = "pwsh.exe"
    }
    $settings.profiles.list += $newProfile
}

$settings.defaultProfile = $pwshGuid
$settings | ConvertTo-Json -Depth 10 | Set-Content $settingsPath

$regPath = "HKCU:\Console\%%Startup"
if (!(Test-Path $regPath)) { New-Item -Path $regPath -Force | Out-Null }
Set-ItemProperty -Path $regPath -Name 'DelegationConsole' -Value '{2EACA947-7F5F-4CFA-BA87-8F7FBEEFBE69}' -Type String -Force
Set-ItemProperty -Path $regPath -Name 'DelegationTerminal' -Value '{E12CFF52-A866-4C77-9A90-F570A7AA2C6B}' -Type String -Force

Write-Output "Done"
