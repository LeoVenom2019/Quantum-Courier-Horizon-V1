$settingsPath = "$env:LOCALAPPDATA\Packages\Microsoft.WindowsTerminal_8wekyb3d8bbwe\LocalState\settings.json"
$settings = Get-Content -Raw $settingsPath | ConvertFrom-Json
$pwshProfile = $settings.profiles.list | Where-Object { $_.source -eq "Windows.Terminal.PowershellCore" -or ($_.name -match "PowerShell" -and $_.commandline -match "pwsh") } | Select-Object -First 1

if (-not $pwshProfile) {
    # Sometimes it's just added with name "PowerShell" and no source, or simply "pwsh"
    $pwshProfile = $settings.profiles.list | Where-Object { $_.name -eq "PowerShell" -or $_.commandline -match "pwsh" } | Select-Object -First 1
}

if ($pwshProfile) {
    $settings.defaultProfile = $pwshProfile.guid
    $settings | ConvertTo-Json -Depth 10 | Set-Content $settingsPath
    Write-Output "Default profile updated to $($pwshProfile.name) ($($pwshProfile.guid))"
} else {
    Write-Output "PowerShell 7 profile not found in Windows Terminal settings."
}
