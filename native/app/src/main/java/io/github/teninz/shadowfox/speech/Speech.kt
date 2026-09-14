package io.github.teninz.shadowfox.speech

import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.speech.RecognitionListener
import android.speech.RecognizerIntent
import android.speech.SpeechRecognizer
import android.speech.tts.TextToSpeech
import android.speech.tts.UtteranceProgressListener
import android.speech.tts.Voice
import kotlinx.coroutines.suspendCancellableCoroutine
import kotlinx.coroutines.withTimeoutOrNull
import java.util.Locale
import kotlin.coroutines.resume

/** Озвучка системным синтезатором с ожиданием конца фразы. */
class Tts(context: Context) {
    private var ready = false
    private val pending = mutableListOf<() -> Unit>()
    private val tts = TextToSpeech(context.applicationContext) { status -> ready = status == TextToSpeech.SUCCESS; pending.forEach { it() }; pending.clear() }
    private var seq = 0
    private val waiters = mutableMapOf<String, () -> Unit>()

    init {
        tts.setOnUtteranceProgressListener(object : UtteranceProgressListener() {
            override fun onStart(id: String?) {}
            override fun onDone(id: String?) { waiters.remove(id)?.invoke() }
            @Deprecated("") override fun onError(id: String?) { waiters.remove(id)?.invoke() }
            override fun onError(id: String?, code: Int) { waiters.remove(id)?.invoke() }
        })
    }

    fun voices(lang: String): List<Voice> = try { tts.voices.filter { it.locale.language == lang }.sortedBy { it.name } } catch (e: Exception) { emptyList() }

    suspend fun speak(text: String, lang: String, rate: Float = 1f, voiceName: String? = null) {
        if (text.isBlank()) return
        if (!ready) suspendCancellableCoroutine<Unit> { c -> pending.add { c.resume(Unit) } }
        val locale = if (lang.startsWith("ru")) Locale("ru", "RU") else Locale.US
        val v = voiceName?.let { n -> voices(locale.language).find { it.name == n } }
        if (v != null) tts.voice = v else tts.language = locale
        tts.setSpeechRate(rate * if (lang.startsWith("ru")) 1f else 0.9f)
        val id = "u${seq++}"
        withTimeoutOrNull(2500L + text.length * 120L) {
            suspendCancellableCoroutine<Unit> { c ->
                waiters[id] = { if (c.isActive) c.resume(Unit) }
                c.invokeOnCancellation { waiters.remove(id); tts.stop() }
                tts.speak(text, TextToSpeech.QUEUE_FLUSH, null, id)
            }
        }
    }
    fun stop() { tts.stop(); waiters.clear() }
    fun release() { tts.shutdown() }
}

sealed class SttResult { data class Text(val alts: List<String>) : SttResult(); data class Error(val code: String) : SttResult() }

/** Распознавание речи: один запуск, результат — список вариантов. По таймауту останавливаем, Android отдаёт услышанное. */
class Stt(private val context: Context) {
    fun available() = SpeechRecognizer.isRecognitionAvailable(context)

    suspend fun listen(lang: String, timeoutMs: Long = 8000): SttResult {
        if (!available()) return SttResult.Error("unsupported")
        val rec = SpeechRecognizer.createSpeechRecognizer(context)
        return try {
            withTimeoutOrNull(timeoutMs + 4000) {
                suspendCancellableCoroutine<SttResult> { c ->
                    var done = false
                    fun finish(r: SttResult) { if (!done) { done = true; if (c.isActive) c.resume(r) } }
                    rec.setRecognitionListener(object : RecognitionListener {
                        override fun onResults(b: Bundle?) { finish(SttResult.Text(b?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION) ?: emptyList())) }
                        override fun onError(e: Int) {
                            finish(when (e) {
                                SpeechRecognizer.ERROR_INSUFFICIENT_PERMISSIONS -> SttResult.Error("not-allowed")
                                SpeechRecognizer.ERROR_NETWORK, SpeechRecognizer.ERROR_NETWORK_TIMEOUT -> SttResult.Error("network")
                                else -> SttResult.Text(emptyList())
                            })
                        }
                        override fun onReadyForSpeech(p: Bundle?) {}; override fun onBeginningOfSpeech() {}; override fun onRmsChanged(r: Float) {}
                        override fun onBufferReceived(b: ByteArray?) {}; override fun onEndOfSpeech() {}; override fun onPartialResults(p: Bundle?) {}; override fun onEvent(t: Int, p: Bundle?) {}
                    })
                    val intent = Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH).apply {
                        putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM)
                        putExtra(RecognizerIntent.EXTRA_LANGUAGE, lang)
                        putExtra(RecognizerIntent.EXTRA_MAX_RESULTS, 5)
                        putExtra(RecognizerIntent.EXTRA_PARTIAL_RESULTS, false)
                    }
                    rec.startListening(intent)
                    // по таймауту не бросаем, а останавливаем: результат придёт в onResults/onError
                    android.os.Handler(android.os.Looper.getMainLooper()).postDelayed({ if (!done) rec.stopListening() }, timeoutMs)
                    c.invokeOnCancellation { rec.cancel() }
                }
            } ?: SttResult.Text(emptyList())
        } finally { rec.destroy() }
    }
}
