package io.github.teninz.shadowfox.ui

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel

@Composable
fun App(vm: AppModel = viewModel()) {
    val st by vm.state.collectAsStateWithLifecycle()
    ShadowFoxTheme(dark = st.set.theme != "light") {
        val p = P
        Scaffold(
            containerColor = p.ground,
            topBar = { TopBar(vm) },
            bottomBar = { Tabs(vm) },
        ) { pad ->
            Box(Modifier.fillMaxSize().padding(pad)) {
                when (val s = vm.screen) {
                    is Screen.Home -> HomeScreen(vm)
                    is Screen.Learn -> LearnScreen(vm)
                    is Screen.Cards -> CardsScreen(vm, s.words)
                    is Screen.Test -> TestScreen(vm)
                    is Screen.Quiz -> QuizScreen(vm, s.session)
                    is Screen.Results -> ResultsScreen(vm, s.session)
                    is Screen.Road -> Placeholder("В дороге", "Голосовой режим переносится на нативный сервис — будет работать с выключенным экраном.")
                    is Screen.Words -> WordsScreen(vm)
                }
                vm.toast?.let { msg ->
                    Box(Modifier.align(Alignment.BottomCenter).padding(bottom = 16.dp).clip(RoundedCornerShape(99.dp)).background(p.ink).padding(horizontal = 16.dp, vertical = 10.dp)) {
                        Text(msg, color = p.ground, fontSize = 14.sp, fontWeight = FontWeight.Medium)
                    }
                }
            }
        }
    }
}

@Composable
private fun TopBar(vm: AppModel) {
    val p = P
    Row(Modifier.fillMaxWidth().background(p.ground).statusBarsPadding().padding(horizontal = 18.dp, vertical = 10.dp), verticalAlignment = Alignment.CenterVertically) {
        androidx.compose.foundation.Image(androidx.compose.ui.res.painterResource(io.github.teninz.shadowfox.R.mipmap.ic_launcher), contentDescription = null, modifier = Modifier.size(40.dp))
        Spacer(Modifier.width(10.dp))
        Text("ShadowFox", style = MaterialTheme.typography.displaySmall.copy(fontSize = 22.sp), color = p.ink)
        Spacer(Modifier.width(8.dp))
        Text("ENG", Modifier.clip(RoundedCornerShape(6.dp)).background(p.accent).padding(horizontal = 7.dp, vertical = 2.dp), color = p.accentInk, fontSize = 11.sp, fontWeight = FontWeight.Bold)
        Spacer(Modifier.weight(1f))
        IconButton(onClick = { vm.showToast("Настройки — в следующей сборке") }) { Icon(Icons.Outlined.Settings, contentDescription = "Настройки", tint = p.muted) }
    }
}

@Composable
private fun Tabs(vm: AppModel) {
    val p = P
    val items = listOf(Triple("home", "Сегодня", Icons.Outlined.Home), Triple("learn", "Учить", Icons.Outlined.MenuBook), Triple("test", "Проверка", Icons.Outlined.CheckBox), Triple("road", "В дороге", Icons.Outlined.Headphones), Triple("words", "Слова", Icons.Outlined.List))
    NavigationBar(containerColor = p.surface, contentColor = p.muted) {
        items.forEach { (key, label, icon) ->
            val selected = vm.screen.tab == key
            NavigationBarItem(
                selected = selected,
                onClick = { vm.go(when (key) { "home" -> Screen.Home; "learn" -> Screen.Learn; "test" -> Screen.Test; "road" -> Screen.Road; else -> Screen.Words }) },
                icon = { Icon(icon, contentDescription = label) },
                label = { Text(label, fontSize = 11.sp) },
                colors = NavigationBarItemDefaults.colors(selectedIconColor = p.accent, selectedTextColor = p.accent, indicatorColor = p.accentSoft, unselectedIconColor = p.muted, unselectedTextColor = p.muted),
            )
        }
    }
}

@Composable
fun Placeholder(title: String, text: String) {
    Column(Modifier.padding(16.dp)) { Card { Eyebrow(title); Spacer(Modifier.height(8.dp)); Text(text, color = P.muted) } }
}
