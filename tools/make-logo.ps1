# Логотип для шапки: лис (art/shadowfox-front.png) выглядывает из круга палитры,
# круг плавно растворяется кверху. Результат — art/logo.png 512×512 с прозрачностью.
Add-Type -AssemblyName System.Drawing
$root = Join-Path $PSScriptRoot ".."
$src = Join-Path $root "art\shadowfox-front.png"
$dst = Join-Path $root "art\logo.png"
if (-not (Test-Path $src)) { throw "Нет файла $src" }

$size = 512
$cx = 256; $cy = 318; $r = 196          # круг в нижней части холста
$charcoal = [System.Drawing.ColorTranslator]::FromHtml("#1F232B")
$orange   = [System.Drawing.ColorTranslator]::FromHtml("#E8853A")

$bmp = New-Object System.Drawing.Bitmap $size,$size
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode="HighQuality"; $g.InterpolationMode="HighQualityBicubic"; $g.PixelOffsetMode="HighQuality"; $g.CompositingQuality="HighQuality"
$g.Clear([System.Drawing.Color]::Transparent)

# вертикальный градиент: прозрачно у верха круга → плотно к середине
function FadeBrush([System.Drawing.Color]$c) {
  $b = New-Object System.Drawing.Drawing2D.LinearGradientBrush (New-Object System.Drawing.PointF 0,($cy-$r)), (New-Object System.Drawing.PointF 0,($cy+$r)), ([System.Drawing.Color]::FromArgb(0,$c)), $c
  $blend = New-Object System.Drawing.Drawing2D.ColorBlend
  $blend.Colors = @([System.Drawing.Color]::FromArgb(0,$c), [System.Drawing.Color]::FromArgb(40,$c), [System.Drawing.Color]::FromArgb(235,$c), $c)
  $blend.Positions = @([float]0, [float]0.22, [float]0.6, [float]1)
  $b.InterpolationColors = $blend; return $b
}
$disc = New-Object System.Drawing.Drawing2D.GraphicsPath; $disc.AddEllipse($cx-$r, $cy-$r, 2*$r, 2*$r)
$g.FillPath((FadeBrush $charcoal), $disc)
$pen = New-Object System.Drawing.Pen (FadeBrush $orange), 10
$g.DrawEllipse($pen, $cx-$r+5, $cy-$r+5, 2*$r-10, 2*$r-10)

# лис: масштабируем так, чтобы голова была над кругом, тело — внутри. Ниже центра круга виден только круг.
$img = [System.Drawing.Image]::FromFile($src)
$k = 0.56                                   # 1200px → ~670px; голова ~300px
$artCenterX = 600; $artTopY = 150            # центр лиса и верх ушей на исходном рисунке
$ox = $cx - $artCenterX*$k; $oy = 36 - $artTopY*$k
$clip = New-Object System.Drawing.Region $disc
$band = New-Object System.Drawing.Rectangle ($cx-$r), 0, (2*$r), $cy
$clip.Union($band)
$g.SetClip($clip, [System.Drawing.Drawing2D.CombineMode]::Replace)
$g.DrawImage($img, (New-Object System.Drawing.RectangleF $ox, $oy, ($img.Width*$k), ($img.Height*$k)))
$g.ResetClip()

$g.Dispose(); $bmp.Save($dst, [System.Drawing.Imaging.ImageFormat]::Png); $bmp.Dispose(); $img.Dispose()
Write-Output "art/logo.png готов"
