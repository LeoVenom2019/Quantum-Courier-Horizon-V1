Add-Type -AssemblyName System.Drawing
$imgPath = "d:\PROJETOS\QCH\public\images\battle\void_battle_bg.jpeg"
$outPath = "d:\PROJETOS\QCH\public\images\battle\void_battle_bg.png"
if (Test-Path $imgPath) {
    $img = [System.Drawing.Image]::FromFile($imgPath)
    $img.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $img.Dispose()
    Write-Host "Conversion successful: $outPath"
} else {
    Write-Host "Error: Source image not found at $imgPath"
}
