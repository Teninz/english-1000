# Иконки приложения из логотипа (art/logo.png — лис в растворяющемся круге): PWA и магазин.
# Обычная: угольный скруглённый квадрат + логотип; maskable: угольный фон, логотип в безопасной зоне.
Add-Type -AssemblyName System.Drawing
$root = Join-Path $PSScriptRoot ".."
$out = Join-Path $root "icons"; New-Item -ItemType Directory -Force $out | Out-Null
$src = Join-Path $root "art\logo.png"
if (-not (Test-Path $src)) { throw "make-logo.ps1 first" }
$logo = [System.Drawing.Image]::FromFile($src)
$bg = [System.Drawing.ColorTranslator]::FromHtml("#14171C")

function RoundRect([float]$x,[float]$y,[float]$w,[float]$h,[float]$r){
  $gp = New-Object System.Drawing.Drawing2D.GraphicsPath
  $gp.AddArc($x,$y,$r,$r,180,90); $gp.AddArc($x+$w-$r,$y,$r,$r,270,90); $gp.AddArc($x+$w-$r,$y+$h-$r,$r,$r,0,90); $gp.AddArc($x,$y+$h-$r,$r,$r,90,90); $gp.CloseFigure(); return $gp
}
function Make([int]$size, [bool]$mask, [string]$path) {
  $b = New-Object System.Drawing.Bitmap $size,$size
  $g = [System.Drawing.Graphics]::FromImage($b); $g.SmoothingMode="HighQuality"; $g.InterpolationMode="HighQualityBicubic"; $g.PixelOffsetMode="HighQuality"
  $g.Clear([System.Drawing.Color]::Transparent)
  if ($mask) { $g.Clear($bg) } else { $g.FillPath((New-Object System.Drawing.SolidBrush $bg), (RoundRect 0 0 $size $size ($size*0.22))) }
  $k = if ($mask) { 0.66 } else { 0.92 }
  $s = $size * $k; $o = ($size - $s) / 2
  $g.DrawImage($logo, (New-Object System.Drawing.RectangleF $o, $o, $s, $s))
  $g.Dispose(); $b.Save($path, [System.Drawing.Imaging.ImageFormat]::Png); $b.Dispose()
}
Make 192 $false (Join-Path $out "icon-192.png")
Make 512 $false (Join-Path $out "icon-512.png")
Make 192 $true  (Join-Path $out "maskable-192.png")
Make 512 $true  (Join-Path $out "maskable-512.png")
$logo.Dispose()
Get-ChildItem $out | Select-Object Name, Length
