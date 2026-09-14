package io.github.teninz.shadowfox.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.VolumeUp

/** Карточка-блок в стиле приложения. */
@Composable
fun Card(modifier: Modifier = Modifier, onClick: (() -> Unit)? = null, content: @Composable ColumnScope.() -> Unit) {
    val p = P
    Column(
        modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(16.dp))
            .background(p.surface)
            .border(1.dp, p.line.copy(alpha = .6f), RoundedCornerShape(16.dp))
            .let { if (onClick != null) it.clickable(onClick = onClick) else it }
            .padding(16.dp),
        content = content,
    )
}

@Composable
fun Eyebrow(text: String) = Text(text.uppercase(), style = androidx.compose.material3.MaterialTheme.typography.labelSmall, color = P.muted)

/** Главная кнопка: градиент шарфа, ребро снизу. */
@Composable
fun PrimaryButton(text: String, modifier: Modifier = Modifier, enabled: Boolean = true, huge: Boolean = false, onClick: () -> Unit) {
    val p = P
    Box(
        modifier
            .fillMaxWidth()
            .height(if (huge) 72.dp else 50.dp)
            .clip(RoundedCornerShape(14.dp))
            .background(Brush.linearGradient(listOf(p.accent, p.accentDeep)))
            .let { if (enabled) it.clickable(onClick = onClick) else it.background(Color.Black.copy(alpha = .35f)) },
        contentAlignment = Alignment.Center,
    ) { Text(text, color = p.accentInk, fontWeight = FontWeight.SemiBold, fontSize = if (huge) 20.sp else 16.sp) }
}

@Composable
fun SecondaryButton(text: String, modifier: Modifier = Modifier, onClick: () -> Unit) {
    val p = P
    Box(modifier.fillMaxWidth().height(50.dp).clip(RoundedCornerShape(14.dp)).background(p.surface2).clickable(onClick = onClick), contentAlignment = Alignment.Center) {
        Text(text, color = p.ink, fontWeight = FontWeight.SemiBold)
    }
}

@Composable
fun Chip(text: String, tone: String = "", modifier: Modifier = Modifier) {
    val p = P
    val (bg, fg) = when (tone) { "good" -> p.goodSoft to p.good; "warn" -> p.warnSoft to p.leaf; "accent" -> p.accentSoft to p.accentDeep; else -> p.surface2 to p.muted }
    Text(text, modifier.clip(RoundedCornerShape(99.dp)).background(bg).padding(horizontal = 10.dp, vertical = 5.dp), color = fg, fontSize = 12.sp, fontWeight = FontWeight.SemiBold)
}

@Composable
fun Bar(fraction: Float, modifier: Modifier = Modifier, good: Boolean = false) {
    val p = P
    Box(modifier.fillMaxWidth().height(8.dp).clip(RoundedCornerShape(99.dp)).background(p.surface2)) {
        Box(Modifier.fillMaxWidth(fraction.coerceIn(0f, 1f)).fillMaxHeight().clip(RoundedCornerShape(99.dp)).background(if (good) p.good else Brush.horizontalGradient(listOf(p.accentDeep, p.accent)).let { p.accent }))
    }
}

@Composable
fun Dot(status: Int) {
    val p = P
    val c = when (status) { 1 -> p.leaf; 2 -> p.accent; 3 -> p.good; else -> p.faint }
    Box(Modifier.size(8.dp).clip(CircleShape).background(c))
}

@Composable
fun SpeakButton(onClick: () -> Unit, big: Boolean = false) {
    val p = P
    Box(Modifier.size(if (big) 88.dp else 52.dp).clip(CircleShape).background(p.accentSoft).border(1.dp, p.line, CircleShape).clickable(onClick = onClick), contentAlignment = Alignment.Center) {
        androidx.compose.material3.Icon(Icons.AutoMirrored.Filled.VolumeUp, contentDescription = "Озвучить", tint = p.accentDeep, modifier = Modifier.size(if (big) 40.dp else 26.dp))
    }
}
