package io.github.teninz.shadowfox.ui

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import io.github.teninz.shadowfox.data.Srs
import java.time.LocalDate
import java.time.format.TextStyle
import java.util.Locale

fun plural(n: Int, one: String, few: String, many: String): String { val m10 = n % 10; val m100 = n % 100; return "$n " + if (m10 == 1 && m100 != 11) one else if (m10 in 2..4 && (m100 < 12 || m100 > 14)) few else many }

@Composable
fun HomeScreen(vm: AppModel) {
    val p = P
    val st by vm.state.collectAsStateWithLifecycle()
    val store = vm.store
    val d = st.days[Srs.today()]
    val n = d?.n ?: 0
    val due = store.due(vm.words).size
    val started = store.started(vm.words)
    val known = started.count { store.status(it) >= 2 }
    val acc = if ((d?.q ?: 0) > 0) (100 * d!!.ok / d.q) else null
    val date = LocalDate.now(); val dateStr = date.dayOfWeek.getDisplayName(TextStyle.SHORT, Locale("ru")).replaceFirstChar { it.uppercase() } + ", " + date.dayOfMonth + " " + date.month.getDisplayName(TextStyle.FULL, Locale("ru")).let { m -> m.replace(Regex("ь$"), "я").replace(Regex("й$"), "я").replace(Regex("т$"), "та") }

    Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(16.dp), verticalArrangement = Arrangement.spacedBy(14.dp)) {
        Card {
            Row(verticalAlignment = Alignment.Top) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Box(Modifier.size(74.dp), contentAlignment = Alignment.Center) {
                        val frac = (n.toFloat() / st.set.goal).coerceIn(0f, 1f)
                        Canvas(Modifier.fillMaxSize()) {
                            drawArc(p.surface2, -90f, 360f, false, style = Stroke(8.dp.toPx(), cap = StrokeCap.Round))
                            drawArc(p.amber, -90f, 360f * frac, false, style = Stroke(8.dp.toPx(), cap = StrokeCap.Round))
                        }
                        Text("$n/${st.set.goal}", fontWeight = FontWeight.SemiBold, fontSize = 15.sp, color = p.ink)
                    }
                    Text("новых", fontSize = 12.sp, color = p.muted)
                }
                Spacer(Modifier.width(14.dp))
                Column(Modifier.weight(1f)) {
                    Eyebrow(dateStr)
                    Spacer(Modifier.height(4.dp))
                    Text(if (n >= st.set.goal) "Цель выполнена" else plural(st.set.goal - n, "новое слово", "новых слова", "новых слов") + " осталось", style = MaterialTheme.typography.titleLarge, color = p.ink)
                    Spacer(Modifier.height(8.dp))
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        Chip("🔥 " + plural(st.streak.n, "день", "дня", "дней"), if (st.streak.n > 0) "warn" else "")
                        if (acc != null) Chip("точность $acc%", if (acc >= 80) "good" else "")
                    }
                }
            }
        }
        Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
            PrimaryButton("Учить новые", Modifier.weight(1f), enabled = store.unstarted(vm.words).isNotEmpty()) { vm.go(Screen.Learn) }
            if (due > 0) PrimaryButton("Повторить · $due", Modifier.weight(1f)) { vm.startReview() } else SecondaryButton("Повторить", Modifier.weight(1f)) { vm.showToast("Пока нечего повторять") }
        }
        Card {
            Row { Eyebrow("Путь к тысяче"); Spacer(Modifier.weight(1f)); Text("$known / 1000", fontSize = 13.sp, color = p.muted) }
            Spacer(Modifier.height(10.dp)); Bar(known / 1000f); Spacer(Modifier.height(12.dp))
            Row(horizontalArrangement = Arrangement.spacedBy(14.dp)) {
                Legend(1, "учу · ${started.count { store.status(it) == 1 }}"); Legend(2, "знаю · ${started.count { store.status(it) == 2 }}"); Legend(3, "закреплено · ${started.count { store.status(it) == 3 }}")
            }
            Spacer(Modifier.height(4.dp)); Legend(0, "впереди · ${1000 - started.size}")
        }
        Card {
            Row { Eyebrow("Последние 14 дней"); Spacer(Modifier.weight(1f)); Text("слов в день", fontSize = 12.sp, color = p.muted) }
            Spacer(Modifier.height(12.dp))
            Row(Modifier.height(44.dp), horizontalArrangement = Arrangement.spacedBy(4.dp), verticalAlignment = Alignment.Bottom) {
                for (k in 0 until 14) { val ds = Srs.addDays(Srs.today(), k - 13); val r = st.days[ds]; val v = if (r != null) r.n + r.q else 0
                    val h = if (v > 0) (14 + minOf(86, v * 4)) else 6
                    Box(Modifier.weight(1f).height((44 * h / 100).dp).background(if (v > 0) p.accent else p.surface2, RoundedCornerShape(3.dp))) }
            }
        }
    }
}

@Composable private fun Legend(status: Int, text: String) { Row(verticalAlignment = Alignment.CenterVertically) { Dot(status); Spacer(Modifier.width(6.dp)); Text(text, fontSize = 12.sp, color = P.muted) } }
