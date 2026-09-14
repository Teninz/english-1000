package io.github.teninz.shadowfox.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Flag
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import io.github.teninz.shadowfox.data.Dictionary
import io.github.teninz.shadowfox.data.Srs
import io.github.teninz.shadowfox.data.Word

private val MODES = listOf(
    Triple("mc", "Выбор перевода", "Английское слово — выбери русский перевод из четырёх"),
    Triple("rev", "Обратный выбор", "Русское слово — выбери английское"),
    Triple("type", "Написание", "Напиши английское слово по переводу. Самый строгий режим"),
    Triple("listen", "На слух", "Слово произносится — узнай его среди четырёх похожих"),
    Triple("pron", "Произношение", "Скажи слово в микрофон — приложение проверит, узнаваемо ли оно"),
    Triple("pairs", "Пары", "Соедини пять английских слов с их переводами"),
    Triple("gap", "Пропуск в предложении", "Вставь слово в реальный пример из карточки"),
    Triple("exam", "Экзамен", "20 вопросов, все режимы вперемешку. Итог в процентах"),
)
private fun modeIcon(m: String): ImageVector = when (m) { "mc" -> Icons.Outlined.ViewAgenda; "rev" -> Icons.Outlined.SwapVert; "type" -> Icons.Outlined.Keyboard; "listen" -> Icons.AutoMirrored.Outlined.VolumeUp; "pron" -> Icons.Outlined.Mic; "pairs" -> Icons.Outlined.GridView; "gap" -> Icons.Outlined.ShortText; else -> Icons.Outlined.WorkspacePremium }

@Composable
fun TestScreen(vm: AppModel) {
    val p = P
    val st by vm.state.collectAsStateWithLifecycle()
    val due = vm.store.due(vm.words).size; val started = vm.store.started(vm.words).size; val hard = st.hard.size
    Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(16.dp), verticalArrangement = Arrangement.spacedBy(14.dp)) {
        Card {
            Eyebrow("Какие слова проверяем"); Spacer(Modifier.height(10.dp))
            Row(Modifier.fillMaxWidth().clip(RoundedCornerShape(12.dp)).background(p.surface2).padding(4.dp), horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                listOf("due" to "Повтор · $due", "all" to "Начатые · $started", "hard" to "Сложные · $hard", "level" to "Уровень").forEach { (k, l) ->
                    val on = vm.testScope == k
                    Box(Modifier.weight(1f).clip(RoundedCornerShape(9.dp)).background(if (on) p.surface else androidx.compose.ui.graphics.Color.Transparent).clickable { vm.testScope = k }.padding(vertical = 9.dp), contentAlignment = Alignment.Center) {
                        Text(l, fontSize = 12.sp, fontWeight = FontWeight.SemiBold, color = if (on) p.ink else p.muted, maxLines = 1) }
                }
            }
            if (vm.testScope == "level") { Spacer(Modifier.height(12.dp)); LevelTiles(vm, vm.testLevel) { vm.testLevel = it } }
        }
        MODES.forEach { (m, title, desc) -> ModeCard(modeIcon(m), title, desc, dim = m == "pron" && !vm.stt.available()) { vm.launchTest(m) } }
    }
}

/** Карточка режима: зона иконки | оранжевый разделитель | текст на тёплой подложке. */
@Composable
fun ModeCard(icon: ImageVector, title: String, desc: String, dim: Boolean = false, selected: Boolean = false, onClick: () -> Unit) {
    val p = P
    Row(Modifier.fillMaxWidth().clip(RoundedCornerShape(16.dp)).background(p.surface).border(if (selected) 2.dp else 1.dp, if (selected) p.accent else p.line.copy(alpha = .6f), RoundedCornerShape(16.dp)).clickable(onClick = onClick).let { if (dim) it.alpha(.5f) else it }, verticalAlignment = Alignment.CenterVertically) {
        Box(Modifier.padding(start = 16.dp, end = 14.dp, top = 14.dp, bottom = 14.dp).size(42.dp).clip(RoundedCornerShape(12.dp)).background(p.accentSoft).border(1.dp, p.accent.copy(alpha = .25f), RoundedCornerShape(12.dp)), contentAlignment = Alignment.Center) { Icon(icon, contentDescription = null, tint = p.accentDeep) }
        Column(Modifier.weight(1f).fillMaxHeight().background(androidx.compose.ui.graphics.Brush.horizontalGradient(listOf(p.accent.copy(alpha = .18f), p.accent.copy(alpha = .04f)))).border(width = 0.dp, color = androidx.compose.ui.graphics.Color.Transparent).drawDivider(p.accent).padding(start = 14.dp, end = 16.dp, top = 12.dp, bottom = 12.dp)) {
            Text(title, fontWeight = FontWeight.SemiBold, color = p.ink); Text(desc, fontSize = 13.sp, color = p.muted)
        }
    }
}
private fun Modifier.drawDivider(c: androidx.compose.ui.graphics.Color) = this.then(Modifier.drawBehindDivider(c))
private fun Modifier.drawBehindDivider(c: androidx.compose.ui.graphics.Color) = androidx.compose.ui.draw.drawBehind(this) { drawRect(c, size = androidx.compose.ui.geometry.Size(2.dp.toPx(), size.height)) }
private fun Modifier.alpha(a: Float) = androidx.compose.ui.draw.alpha(this, a)

@Composable
fun WordsScreen(vm: AppModel) {
    val p = P
    val st by vm.state.collectAsStateWithLifecycle()
    var query by remember { mutableStateOf("") }
    var hardOnly by remember { mutableStateOf(false) }
    var open by remember { mutableStateOf(-1) }
    var sheet by remember { mutableStateOf<Word?>(null) }
    val q = norm(query)
    Column(Modifier.fillMaxSize().padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
        OutlinedTextField(query, { query = it }, Modifier.fillMaxWidth(), placeholder = { Text("Поиск по английскому или русскому") }, singleLine = true, shape = RoundedCornerShape(12.dp))
        Row(Modifier.fillMaxWidth().clip(RoundedCornerShape(12.dp)).background(p.surface2).padding(4.dp), horizontalArrangement = Arrangement.spacedBy(4.dp)) {
            listOf(false to "Все уровни", true to "Сложные · ${st.hard.size}").forEach { (h, l) -> val on = hardOnly == h
                Box(Modifier.weight(1f).clip(RoundedCornerShape(9.dp)).background(if (on) p.surface else androidx.compose.ui.graphics.Color.Transparent).clickable { hardOnly = h }.padding(vertical = 9.dp), contentAlignment = Alignment.Center) { Text(l, fontSize = 13.sp, fontWeight = FontWeight.SemiBold, color = if (on) p.ink else p.muted) } }
        }
        LazyColumn(verticalArrangement = Arrangement.spacedBy(10.dp)) {
            if (q.isNotEmpty() || hardOnly) {
                val base = if (hardOnly) vm.store.hardList(vm.words) else vm.words
                val hits = base.filter { q.isEmpty() || norm(it.en).contains(q) || norm(it.ru).contains(q) }.take(120)
                if (hits.isEmpty()) item { Text(if (hardOnly && q.isEmpty()) "Сложных слов пока нет — флажок есть на обороте карточки, в карточке слова и после ошибки в проверке" else "Ничего не найдено", Modifier.fillMaxWidth().padding(30.dp), color = p.muted, textAlign = androidx.compose.ui.text.style.TextAlign.Center) }
                items(hits.size) { i -> WordRow(vm, hits[i]) { sheet = hits[i] } }
            } else items(20) { l ->
                val ids = vm.words.filter { it.level == l }; val known = ids.count { vm.store.status(it) >= 2 }; val startedN = ids.count { st.w.containsKey(it.en) }
                Column(Modifier.fillMaxWidth().clip(RoundedCornerShape(16.dp)).background(p.surface).border(1.dp, p.line.copy(alpha = .6f), RoundedCornerShape(16.dp))) {
                    Row(Modifier.fillMaxWidth().clickable { open = if (open == l) -1 else l }.padding(14.dp, 14.dp), verticalAlignment = Alignment.CenterVertically) {
                        Text("${l + 1}", Modifier.width(34.dp), fontFamily = WordFont, fontSize = 20.sp, fontWeight = FontWeight.SemiBold, color = p.accent)
                        Column(Modifier.weight(1f)) { Text(Dictionary.levelNames[l], fontWeight = FontWeight.SemiBold, color = p.ink); Spacer(Modifier.height(6.dp)); Bar(known / 50f, Modifier.height(5.dp)) }
                        Spacer(Modifier.width(10.dp)); Text("$known/50", fontSize = 12.sp, color = p.muted)
                    }
                    if (open == l) {
                        if (startedN > 0) Row(Modifier.fillMaxWidth().padding(horizontal = 16.dp, vertical = 8.dp), verticalAlignment = Alignment.CenterVertically) { Text("Начато $startedN · знаю $known", fontSize = 13.sp, color = p.muted); Spacer(Modifier.weight(1f))
                            TextButton(onClick = { vm.store.resetLevel(l, vm.words); vm.showToast("Уровень сброшен") }) { Text("Сбросить уровень", color = p.bad, fontSize = 13.sp) } }
                        ids.forEach { w -> WordRow(vm, w) { sheet = w } }
                    }
                }
            }
        }
    }
    sheet?.let { w -> WordSheet(vm, w) { sheet = null } }
}

@Composable
private fun WordRow(vm: AppModel, w: Word, onClick: () -> Unit) {
    val p = P
    val st by vm.state.collectAsStateWithLifecycle()
    Row(Modifier.fillMaxWidth().clickable(onClick = onClick).padding(horizontal = 16.dp, vertical = 11.dp), verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(12.dp)) {
        Dot(vm.store.status(w))
        Row(Modifier.fillMaxWidth(.42f), verticalAlignment = Alignment.CenterVertically) { Text(w.en, fontFamily = WordFont, fontSize = 18.sp, fontWeight = FontWeight.SemiBold, color = p.ink, maxLines = 1); if (st.hard.containsKey(w.en)) Icon(Icons.Filled.Flag, null, Modifier.padding(start = 6.dp).size(12.dp), tint = p.accent) }
        Text(w.ru, fontSize = 14.sp, color = p.muted, maxLines = 1, overflow = androidx.compose.ui.text.style.TextOverflow.Ellipsis)
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun WordSheet(vm: AppModel, w: Word, onClose: () -> Unit) {
    val p = P
    val st by vm.state.collectAsStateWithLifecycle()
    val r = st.w[w.en]; val status = vm.store.status(w)
    ModalBottomSheet(onDismissRequest = onClose, containerColor = p.surface) {
        Column(Modifier.padding(horizontal = 18.dp).padding(bottom = 24.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) { Text((Dictionary.posNames[w.pos] ?: "") + " · уровень ${w.level + 1}", fontSize = 12.sp, color = p.muted); Chip(listOf("не начато", "учу", "знаю", "закреплено")[status], listOf("", "warn", "accent", "good")[status]) }
            Row(verticalAlignment = Alignment.CenterVertically) { Text(w.en, Modifier.weight(1f), style = MaterialTheme.typography.displaySmall, color = p.ink); SpeakButton({ vm.speak(w.en) }) }
            Text(w.ru, fontSize = 22.sp, fontWeight = FontWeight.Medium, color = p.ink)
            Example(w); Text(w.exRu, fontSize = 14.sp, color = p.muted, fontStyle = androidx.compose.ui.text.font.FontStyle.Italic)
            if (r != null) Text("Верно ${r.ok} · ошибок ${r.bad} · следующий показ " + (if (r.box >= 6) "— закреплено" else if (r.due <= Srs.today()) "сегодня" else r.due), fontSize = 13.sp, color = p.muted)
            Row(horizontalArrangement = Arrangement.spacedBy(10.dp), verticalAlignment = Alignment.CenterVertically) {
                SecondaryButton(if (r != null) "Сбросить" else "В изучение", Modifier.weight(1f)) { if (r != null) vm.store.resetWord(w) else vm.store.introduce(w, false); onClose() }
                PrimaryButton("Уже знаю", Modifier.weight(1f)) { vm.store.introduce(w, true); vm.showToast("Отмечено как известное"); onClose() }
                FlagButton(vm, w)
            }
        }
    }
}
