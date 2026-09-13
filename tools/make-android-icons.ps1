# Иконки Android (mipmap-*) из icons/icon-512.png и icons/maskable-512.png, сплэш из art/logo.png
Add-Type -AssemblyName System.Drawing
$root = Join-Path $PSScriptRoot ".."
$res = Join-Path $root "android\app\src\main\res"
$legacy = [System.Drawing.Image]::FromFile((Join-Path $root "icons\icon-512.png"))
$mask = [System.Drawing.Image]::FromFile((Join-Path $root "icons\icon-512.png"))
function Save([System.Drawing.Image]$img, [int]$size, [string]$path) {
  $b = New-Object System.Drawing.Bitmap $size, $size
  $g = [System.Drawing.Graphics]::FromImage($b); $g.InterpolationMode = "HighQualityBicubic"; $g.SmoothingMode = "HighQuality"
  $g.DrawImage($img, 0, 0, $size, $size); $g.Dispose(); $b.Save($path, [System.Drawing.Imaging.ImageFormat]::Png); $b.Dispose()
}
$dp = @{ "mdpi" = 1; "hdpi" = 1.5; "xhdpi" = 2; "xxhdpi" = 3; "xxxhdpi" = 4 }
foreach ($k in $dp.Keys) {
  $dir = Join-Path $res "mipmap-$k"; New-Item -ItemType Directory -Force $dir | Out-Null
  Save $legacy ([int](48 * $dp[$k])) (Join-Path $dir "ic_launcher.png")
  Save $legacy ([int](48 * $dp[$k])) (Join-Path $dir "ic_launcher_round.png")
  $fs = [int](108 * $dp[$k]); $fb = New-Object System.Drawing.Bitmap $fs,$fs; $fg = [System.Drawing.Graphics]::FromImage($fb); $fg.InterpolationMode="HighQualityBicubic"; $fg.Clear([System.Drawing.Color]::Transparent)
  $inner = $fs * 0.72; $off = ($fs - $inner) / 2; $fg.DrawImage($mask, $off, $off, $inner, $inner); $fg.Dispose(); $fb.Save((Join-Path $dir "ic_launcher_foreground.png"), [System.Drawing.Imaging.ImageFormat]::Png); $fb.Dispose()
}
# сплэш: угольный фон, логотип по центру
$logo = [System.Drawing.Image]::FromFile((Join-Path $root "art\logo.png"))
$s = 1200; $b = New-Object System.Drawing.Bitmap $s, $s
$g = [System.Drawing.Graphics]::FromImage($b); $g.InterpolationMode = "HighQualityBicubic"
$g.Clear([System.Drawing.ColorTranslator]::FromHtml("#14171C"))
$g.DrawImage($logo, ($s - 420) / 2, ($s - 420) / 2, 420, 420); $g.Dispose()
foreach ($d in @("drawable", "drawable-port-mdpi", "drawable-port-hdpi", "drawable-port-xhdpi", "drawable-port-xxhdpi", "drawable-port-xxxhdpi", "drawable-land-mdpi", "drawable-land-hdpi", "drawable-land-xhdpi", "drawable-land-xxhdpi", "drawable-land-xxxhdpi")) {
  $b.Save((Join-Path (Join-Path $res $d) "splash.png"), [System.Drawing.Imaging.ImageFormat]::Png)
}
$b.Dispose(); $logo.Dispose(); $legacy.Dispose(); $mask.Dispose()
Write-Output "android icons ok"
