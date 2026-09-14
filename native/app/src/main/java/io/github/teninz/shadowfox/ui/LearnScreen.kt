package io.github.teninz.shadowfox.ui

import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.text.withStyle
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Flag
import androidx.compose.material.icons.outlined.Flag
import androidx.compose.material.icons.outlined.Close
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import io.github.teninz.shadowfox.data.Dictionary
import io.github.teninz.shadowfox.data.Word

/** Сетка 20 уровней с полоской прогресса. */
@Composable
fun LevelTiles(vm: AppModel, current: Int, onPick: (Int) -> Unit) {
    val p = P
    val st by vm.state.collectAsStateWithLifecycle()
    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
        for (row in 0 until 4) Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            for (col in 0 until 5) { val l = row * 5 + col
                val ids = vm.words.filter { it.level == l }; val startedN = ids.count { st.w.containsKey(it.en) }; val known = ids.count { vm.store.status(it) >= 2 }
                val on = l == current
                Column(Modifier.weight(1f).aspectRatio(1f).clip(RoundedCornerShape(12.dp)).background(if (on) p.accentSoft else p.surface2).border(2.dp, if (on) p.accent else androidx.compose.ui.graphics.Color.Transparent, RoundedCornerShape(12.dp)).clickable { if (!on) onPick(l) },
                    horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.Center) {
                    Text("${l + 1}", fontFamily = WordFont, fontSize = 19.sp, fontWeight = FontWeight.SemiBold, color = if (on) p.accent else if (known == 50) p.amber else p.muted)
                    Spacer(Modifier.height(4.dp))
                    Box(Modifier.fillMaxWidth(.6f).height(3.dp).clip(RoundedCornerShape(99.dp)).background(p.line)) { Box(Modifier.fillMaxWidth(startedN / 50f).fillMaxHeight().background(if (known == 50) p.amber else p.accent)) }
                }
            }
        }
        val ids = vm.words.filter { it.level == current }; val startedN = ids.count { st.w.containsKey(it.en) }; val known = ids.count { vm.store.status(it) >= 2 }
        Row(Modifier.padding(top = 4.dp)) { Text("${current + 1}. ${Dictionary.levelNames[current]}", fontWeight = FontWeight.SemiBold, color = p.ink); Spacer(Modifier.weight(1f)); Text(if (startedN > 0) "начато $startedN · знаю $known" else "не начат", fontSize = 13.sp, color = p.muted) }
    }
}

@Composable
fun LearnScreen(vm: AppModel) {
    val p = P
    val st by vm.state.collectAsStateWithLifecycle()
    val level = vm.currentLearnLevel()
    val left = vm.store.unstarted(vm.words).filter { it.level == level }
    Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(16.dp), verticalArrangement = Arrangement.spacedBy(14.dp)) {
        Card {
            Eyebrow("Новые слова"); Spacer(Modifier.height(4.dp))
            Text("Порция из ${minOf(5, left.size).takeIf { it > 0 } ?: 5} слов", style = MaterialTheme.typography.titleLarge, color = p.ink); Spacer(Modifier.height(8.dp))
            Text("Сначала карточки — слово, перевод, пример и озвучка. Потом сразу короткая проверка этой же порции: так слово попадает в память дважды.", fontSize = 13.sp, color = p.muted)
        }
        Card { Eyebrow("Уровень"); Spacer(Modifier.height(10.dp)); LevelTiles(vm, level) { vm.learnLevel = it } }
        PrimaryButton(if (left.isNotEmpty()) "Начать порцию" else "Уровень пройден", enabled = left.isNotEmpty(), huge = true) { vm.go(Screen.Cards(left.take(5))) }
        Text("Сегодня выучено ${st.days[io.github.teninz.shadowfox.data.Srs.today()]?.n ?: 0} из ${st.set.goal}.", Modifier.fillMaxWidth(), textAlign = TextAlign.Center, fontSize = 13.sp, color = p.muted)
    }
}

/** Карточки порции: тап переворачивает (3D), «Дальше» → следующая, после порции — мини-проверка. */
@Composable
fun CardsScreen(vm: AppModel, words: List<Word>) {
    val p = P
    var k by remember { mutableStateOf(0) }
    var flipped by remember { mutableStateOf(false) }
    val shown = remember { mutableListOf<Word>() }
    if (k >= words.size) {
        val ids = shown.filter { (vm.store.progress(it)?.box ?: 6) < 6 }
        LaunchedEffect(Unit) { if (ids.isEmpty()) vm.go(Screen.Learn) else vm.go(Screen.Quiz(Session("Проверка порции", "learn", ids.map { Question("mc", it) }, "learn"))) }
        return
    }
    val w = words[k]
    val rot by animateFloatAsState(if (flipped) 180f else 0f, tween(500), label = "flip")
    LaunchedEffect(k) { flipped = false; if (vm.store.s.set.auto) vm.speak(w.en) }
    Column(Modifier.fillMaxSize().padding(16.dp), verticalArrangement = Arrangement.spacedBy(14.dp)) {
        SessionTop(vm, k, words.size) { vm.go(Screen.Learn) }
        Box(Modifier.fillMaxWidth().height(340.dp).graphicsLayer { rotationY = rot; cameraDistance = 12f * density }.clickable { flipped = true }) {
            if (rot <= 90f) Face { Text(Dictionary.posNames[w.pos] ?: w.pos, fontSize = 12.sp, color = p.muted); Text(w.en, style = MaterialTheme.typography.displayMedium, color = p.ink, textAlign = TextAlign.Center); SpeakButton({ vm.speak(w.en) }); Text("нажми, чтобы перевернуть", fontSize = 13.sp, color = p.faint) }
            else Box(Modifier.graphicsLayer { rotationY = 180f }) { Face {
                Text(w.en, style = MaterialTheme.typography.displaySmall, color = p.ink)
                Text(w.ru, fontSize = 22.sp, fontWeight = FontWeight.Medium, color = p.ink, textAlign = TextAlign.Center)
                Example(w); Text(w.exRu, fontSize = 14.sp, color = p.muted, textAlign = TextAlign.Center, fontStyle = androidx.compose.ui.text.font.FontStyle.Italic)
                Row(horizontalArrangement = Arrangement.spacedBy(14.dp)) { SpeakButton({ vm.speak(w.ex) }); FlagButton(vm, w) }
            } }
        }
        Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
            SecondaryButton("Уже знаю", Modifier.weight(1f)) { vm.store.introduce(w, true); k++ }
            PrimaryButton("Дальше", Modifier.weight(1f)) { if (!flipped) flipped = true else { vm.store.introduce(w, false); shown.add(w); k++ } }
        }
    }
}

@Composable
private fun Face(content: @Composable ColumnScope.() -> Unit) {
    Column(Modifier.fillMaxSize().clip(RoundedCornerShape(20.dp)).background(P.surface).border(1.dp, P.line.copy(alpha = .6f), RoundedCornerShape(20.dp)).padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.spacedBy(12.dp, Alignment.CenterVertically), content = content)
}

/** Пример с подсветкой изучаемого слова. */
@Composable
fun Example(w: Word) {
    val p = P
    val m = Dictionary.wordRegex(w.en).find(w.ex)
    val text = androidx.compose.ui.text.buildAnnotatedString {
        if (m == null) append(w.ex) else {
            append(w.ex.substring(0, m.range.first))
            withStyle(androidx.compose.ui.text.SpanStyle(background = p.accentSoft, color = p.accentDeep)) { append(m.value) }
            append(w.ex.substring(m.range.last + 1))
        }
    }
    Text(text, fontSize = 15.sp, color = p.muted, textAlign = TextAlign.Center)
}

@Composable
fun FlagButton(vm: AppModel, w: Word) {
    val p = P
    val st by vm.state.collectAsStateWithLifecycle()
    val on = st.hard.containsKey(w.en)
    Box(Modifier.size(52.dp).clip(androidx.compose.foundation.shape.CircleShape).background(if (on) p.accent else p.surface2).border(1.dp, if (on) p.accent else p.line, androidx.compose.foundation.shape.CircleShape)
        .clickable { val now = vm.store.toggleHard(w); vm.showToast(if (now) "Помечено как сложное" else "Пометка снята") }, contentAlignment = Alignment.Center) {
        androidx.compose.material3.Icon(if (on) Icons.Filled.Flag else Icons.Outlined.Flag, contentDescription = "Сложное слово", tint = if (on) p.accentInk else p.muted)
    }
}

@Composable
fun SessionTop(vm: AppModel, k: Int, n: Int, onExit: () -> Unit) {
    val p = P
    Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(12.dp)) {
        androidx.compose.material3.IconButton(onClick = onExit) { androidx.compose.material3.Icon(Icons.Outlined.Close, contentDescription = "Выйти", tint = p.muted) }
        Bar(k.toFloat() / n, Modifier.weight(1f))
        Text("${k + 1}/$n", fontSize = 13.sp, color = p.muted)
    }
}
