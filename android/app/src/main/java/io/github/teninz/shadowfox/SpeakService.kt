package io.github.teninz.shadowfox

import android.app.Service
import android.content.Intent
import android.os.IBinder
import android.speech.tts.TextToSpeech
import android.speech.tts.UtteranceProgressListener
import java.util.Locale

/** Озвучка из виджета: английское слово, затем русский перевод — системным синтезатором. */
class SpeakService : Service() {
    private var tts: TextToSpeech? = null

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        val word = intent?.getStringExtra("word") ?: return stopNow()
        val ru = intent.getStringExtra("ru") ?: ""
        tts?.shutdown()
        tts = TextToSpeech(this) { status ->
            if (status != TextToSpeech.SUCCESS) { stopNow(); return@TextToSpeech }
            val t = tts ?: return@TextToSpeech
            t.setOnUtteranceProgressListener(object : UtteranceProgressListener() {
                override fun onStart(id: String?) {}
                override fun onError(id: String?) { stopNow() }
                override fun onDone(id: String?) {
                    if (id == "en" && ru.isNotEmpty()) {
                        t.language = Locale("ru", "RU"); t.setSpeechRate(1.0f)
                        t.speak(ru, TextToSpeech.QUEUE_ADD, null, "ru")
                    } else stopNow()
                }
            })
            t.language = Locale.US; t.setSpeechRate(0.9f)
            t.speak(word, TextToSpeech.QUEUE_FLUSH, null, "en")
        }
        return START_NOT_STICKY
    }

    private fun stopNow(): Int { stopSelf(); return START_NOT_STICKY }

    override fun onDestroy() { tts?.stop(); tts?.shutdown(); tts = null; super.onDestroy() }
}
