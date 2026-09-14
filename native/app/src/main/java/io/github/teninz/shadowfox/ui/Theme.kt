package io.github.teninz.shadowfox.ui

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Typography
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.staticCompositionLocalOf
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.Font
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.sp
import io.github.teninz.shadowfox.R

/** Палитра ShadowFox: уголь меха, ржавый шарф, янтарь глаза, жёлтый лист. */
data class Palette(
    val ground: Color, val surface: Color, val surface2: Color, val line: Color,
    val ink: Color, val muted: Color, val faint: Color,
    val accent: Color, val accentInk: Color, val accentSoft: Color, val accentDeep: Color,
    val amber: Color, val leaf: Color, val good: Color, val goodSoft: Color, val bad: Color, val badSoft: Color, val warn: Color, val warnSoft: Color,
    val dark: Boolean,
)
val NightPalette = Palette(
    ground = Color(0xFF14171C), surface = Color(0xFF1F232B), surface2 = Color(0xFF2A2F39), line = Color(0xFF383E4A),
    ink = Color(0xFFF1ECE3), muted = Color(0xFFA3A8B3), faint = Color(0xFF5F6573),
    accent = Color(0xFFE8853A), accentInk = Color(0xFF1A1007), accentSoft = Color(0xFF3B2515), accentDeep = Color(0xFFF4B070),
    amber = Color(0xFFEFA537), leaf = Color(0xFFF2C230), good = Color(0xFF7BC47F), goodSoft = Color(0xFF1F3323), bad = Color(0xFFE36A5C), badSoft = Color(0xFF3C1F1C), warn = Color(0xFFF2C230), warnSoft = Color(0xFF3C3212),
    dark = true,
)
val DayPalette = Palette(
    ground = Color(0xFFF6F1EA), surface = Color(0xFFFFFFFF), surface2 = Color(0xFFEFE7DC), line = Color(0xFFDDD2C4),
    ink = Color(0xFF1E2229), muted = Color(0xFF6A6F7A), faint = Color(0xFFA9ADB5),
    accent = Color(0xFFD9722E), accentInk = Color(0xFFFFFFFF), accentSoft = Color(0xFFF8E4D3), accentDeep = Color(0xFFA64D22),
    amber = Color(0xFFD48F1F), leaf = Color(0xFFC99A12), good = Color(0xFF2F8F4E), goodSoft = Color(0xFFE1F2E6), bad = Color(0xFFC94F4F), badSoft = Color(0xFFF8E3E1), warn = Color(0xFFC99A12), warnSoft = Color(0xFFFBF0C7),
    dark = false,
)
val LocalPalette = staticCompositionLocalOf { NightPalette }
val P: Palette @Composable get() = LocalPalette.current

val WordFont = FontFamily(Font(R.font.fraunces_semibold, FontWeight.SemiBold))
val UiFont = FontFamily(Font(R.font.golos_regular, FontWeight.Normal), Font(R.font.golos_medium, FontWeight.Medium), Font(R.font.golos_semibold, FontWeight.SemiBold), Font(R.font.golos_bold, FontWeight.Bold))

@Composable
fun ShadowFoxTheme(dark: Boolean, content: @Composable () -> Unit) {
    val p = if (dark) NightPalette else DayPalette
    val scheme = if (dark) darkColorScheme(primary = p.accent, onPrimary = p.accentInk, background = p.ground, surface = p.surface, onBackground = p.ink, onSurface = p.ink, surfaceVariant = p.surface2, outline = p.line, error = p.bad)
                 else lightColorScheme(primary = p.accent, onPrimary = p.accentInk, background = p.ground, surface = p.surface, onBackground = p.ink, onSurface = p.ink, surfaceVariant = p.surface2, outline = p.line, error = p.bad)
    val typography = Typography(
        bodyLarge = TextStyle(fontFamily = UiFont, fontSize = 16.sp, lineHeight = 23.sp),
        bodyMedium = TextStyle(fontFamily = UiFont, fontSize = 14.sp, lineHeight = 20.sp),
        bodySmall = TextStyle(fontFamily = UiFont, fontSize = 12.sp, lineHeight = 17.sp),
        titleLarge = TextStyle(fontFamily = UiFont, fontWeight = FontWeight.SemiBold, fontSize = 20.sp),
        titleMedium = TextStyle(fontFamily = UiFont, fontWeight = FontWeight.SemiBold, fontSize = 16.sp),
        labelLarge = TextStyle(fontFamily = UiFont, fontWeight = FontWeight.SemiBold, fontSize = 15.sp),
        labelSmall = TextStyle(fontFamily = UiFont, fontWeight = FontWeight.SemiBold, fontSize = 11.sp, letterSpacing = 1.sp),
        displayMedium = TextStyle(fontFamily = WordFont, fontWeight = FontWeight.SemiBold, fontSize = 40.sp, lineHeight = 44.sp),
        displaySmall = TextStyle(fontFamily = WordFont, fontWeight = FontWeight.SemiBold, fontSize = 28.sp),
    )
    androidx.compose.runtime.CompositionLocalProvider(LocalPalette provides p) {
        MaterialTheme(colorScheme = scheme, typography = typography, content = content)
    }
}
