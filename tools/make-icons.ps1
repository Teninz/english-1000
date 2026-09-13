# Иконки и логотип из рисунка лисы (art/shadowfox.png). Без рисунка — запасной вариант с буквами.
Add-Type -AssemblyName System.Drawing
$root = Join-Path $PSScriptRoot ".."
$out = Join-Path $root "icons"; New-Item -ItemType Directory -Force $out | Out-Null
$artDir = Join-Path $root "art"; New-Item -ItemType Directory -Force $artDir | Out-Null
$src = Join-Path $artDir "shadowfox.png"
$bg = [System.Drawing.ColorTranslator]::FromHtml("#14171C")
$orange = [System.Drawing.ColorTranslator]::FromHtml("#E8853A")

function RoundRect([float]$x,[float]$y,[float]$w,[float]$h,[float]$r){
  $gp = New-Object System.Drawing.Drawing2D.GraphicsPath
  $gp.AddArc($x,$y,$r,$r,180,90); $gp.AddArc($x+$w-$r,$y,$r,$r,270,90); $gp.AddArc($x+$w-$r,$y+$h-$r,$r,$r,0,90); $gp.AddArc($x,$y+$h-$r,$r,$r,90,90); $gp.CloseFigure(); return $gp
}
function NewCanvas([int]$size){ $b = New-Object System.Drawing.Bitmap $size,$size; $g=[System.Drawing.Graphics]::FromImage($b); $g.SmoothingMode="HighQuality"; $g.InterpolationMode="HighQualityBicubic"; $g.PixelOffsetMode="HighQuality"; $g.Clear([System.Drawing.Color]::Transparent); return @($b,$g) }

if (Test-Path $src) {
  $img = [System.Drawing.Image]::FromFile($src)
  # голова лисы: квадрат примерно от (190,20) стороной 560 на рисунке 1024px; масштабируем под фактический размер
  $k = $img.Width / 1024.0
  $crop = New-Object System.Drawing.Rectangle ([int](190*$k)), ([int](20*$k)), ([int](560*$k)), ([int](560*$k))
  # для маленькой круглой аватарки берём кадр ближе к морде: глаз и нос в центре, кончики ушей можно обрезать
  $face = New-Object System.Drawing.Rectangle ([int](210*$k)), ([int](110*$k)), ([int](470*$k)), ([int](470*$k))
  foreach ($spec in @(@(192,$false),@(512,$false),@(192,$true),@(512,$true))) {
    $size=$spec[0]; $mask=$spec[1]; $b,$g = NewCanvas $size
    if ($mask) { $g.Clear($bg) } else { $g.FillPath((New-Object System.Drawing.SolidBrush $bg),(RoundRect 0 0 $size $size ($size*0.22))) }
    $pad = if ($mask) { $size*0.12 } else { $size*0.06 }
    $dst = New-Object System.Drawing.RectangleF $pad,$pad,($size-2*$pad),($size-2*$pad)
    $g.DrawImage($img,$dst,(New-Object System.Drawing.RectangleF $crop.X,$crop.Y,$crop.Width,$crop.Height),[System.Drawing.GraphicsUnit]::Pixel)
    $name = if ($mask) { "maskable-$size.png" } else { "icon-$size.png" }
    $b.Save((Join-Path $out $name)); $g.Dispose(); $b.Dispose()
  }
  $img.Dispose(); Write-Output "Иконки собраны из art/shadowfox.png"
} else {
  foreach ($spec in @(@(192,$false),@(512,$false),@(192,$true),@(512,$true))) {
    $size=$spec[0]; $mask=$spec[1]; $b,$g = NewCanvas $size
    if ($mask) { $g.Clear($bg) } else { $g.FillPath((New-Object System.Drawing.SolidBrush $bg),(RoundRect 0 0 $size $size ($size*0.22))) }
    $font = New-Object System.Drawing.Font("Georgia",[float]($size*0.34),[System.Drawing.FontStyle]::Bold,[System.Drawing.GraphicsUnit]::Pixel)
    $fmt = New-Object System.Drawing.StringFormat; $fmt.Alignment="Center"; $fmt.LineAlignment="Center"
    $g.DrawString("SF",$font,(New-Object System.Drawing.SolidBrush $orange),(New-Object System.Drawing.RectangleF 0,0,$size,$size),$fmt)
    $name = if ($mask) { "maskable-$size.png" } else { "icon-$size.png" }
    $b.Save((Join-Path $out $name)); $g.Dispose(); $b.Dispose()
  }
  Write-Output "art/shadowfox.png не найден — сделан запасной вариант с буквами SF"
}
Get-ChildItem $out | Select-Object Name, Length
