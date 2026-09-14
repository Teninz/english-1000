package io.github.teninz.shadowfox

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.content.pm.ServiceInfo
import android.os.Build
import android.os.IBinder
import android.os.PowerManager
import android.support.v4.media.MediaMetadataCompat
import android.support.v4.media.session.MediaSessionCompat
import android.support.v4.media.session.PlaybackStateCompat
import androidx.core.app.NotificationCompat
import androidx.media.app.NotificationCompat.MediaStyle

/**
 * Фоновый сервис режима «В дороге»: держит процесс живым при погашенном экране,
 * показывает плеер в шторке и на экране блокировки, принимает кнопки наушников.
 * Сами слова читает и слушает JS-часть; сюда она только отдаёт текст для уведомления
 * и получает команды (pause / resume / next / stop) через RoadPlugin.
 */
class RoadService : Service() {
    private var session: MediaSessionCompat? = null
    private var wakeLock: PowerManager.WakeLock? = null
    private var word = "ShadowFox Eng"; private var ru = "Режим «В дороге»"; private var paused = false

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onCreate() {
        super.onCreate()
        val nm = getSystemService(NotificationManager::class.java)
        nm.createNotificationChannel(NotificationChannel(CHANNEL, "В дороге", NotificationManager.IMPORTANCE_LOW).apply { description = "Голосовой режим: управление и текущее слово"; setSound(null, null) })
        session = MediaSessionCompat(this, "ShadowFoxRoad").apply {
            setCallback(object : MediaSessionCompat.Callback() {
                override fun onPlay() { emit("resume") }
                override fun onPause() { emit("pause") }
                override fun onSkipToNext() { emit("next") }
                override fun onStop() { emit("stop") }
            })
            isActive = true
        }
        wakeLock = getSystemService(PowerManager::class.java).newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "shadowfox:road").apply { setReferenceCounted(false); acquire(3 * 60 * 60 * 1000L) }
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        when (intent?.action) {
            ACTION_PAUSE -> { emit(if (paused) "resume" else "pause"); return START_STICKY }
            ACTION_NEXT -> { emit("next"); return START_STICKY }
            ACTION_STOP -> { emit("stop"); stopSelf(); return START_NOT_STICKY }
            ACTION_UPDATE -> { word = intent.getStringExtra("word") ?: word; ru = intent.getStringExtra("ru") ?: ru; paused = intent.getBooleanExtra("paused", paused) }
        }
        val type = if (Build.VERSION.SDK_INT >= 30) ServiceInfo.FOREGROUND_SERVICE_TYPE_MEDIA_PLAYBACK or ServiceInfo.FOREGROUND_SERVICE_TYPE_MICROPHONE else 0
        if (Build.VERSION.SDK_INT >= 29) startForeground(NOTIF_ID, build(), type) else startForeground(NOTIF_ID, build())
        return START_STICKY
    }

    private fun build(): Notification {
        val s = session!!
        s.setMetadata(MediaMetadataCompat.Builder().putString(MediaMetadataCompat.METADATA_KEY_TITLE, word).putString(MediaMetadataCompat.METADATA_KEY_ARTIST, ru).putString(MediaMetadataCompat.METADATA_KEY_ALBUM, "ShadowFox Eng · В дороге").build())
        s.setPlaybackState(PlaybackStateCompat.Builder()
            .setActions(PlaybackStateCompat.ACTION_PLAY or PlaybackStateCompat.ACTION_PAUSE or PlaybackStateCompat.ACTION_PLAY_PAUSE or PlaybackStateCompat.ACTION_SKIP_TO_NEXT or PlaybackStateCompat.ACTION_STOP)
            .setState(if (paused) PlaybackStateCompat.STATE_PAUSED else PlaybackStateCompat.STATE_PLAYING, PlaybackStateCompat.PLAYBACK_POSITION_UNKNOWN, 1f).build())
        fun pi(action: String, code: Int) = PendingIntent.getService(this, code, Intent(this, RoadService::class.java).setAction(action), PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)
        val open = PendingIntent.getActivity(this, 9, Intent(this, MainActivity::class.java).addFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP), PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)
        return NotificationCompat.Builder(this, CHANNEL)
            .setSmallIcon(R.drawable.ic_stat_fox).setContentTitle(word).setContentText(ru).setSubText("В дороге")
            .setContentIntent(open).setOngoing(true).setOnlyAlertOnce(true).setSilent(true)
            .setVisibility(NotificationCompat.VISIBILITY_PUBLIC).setCategory(NotificationCompat.CATEGORY_TRANSPORT)
            .addAction(if (paused) android.R.drawable.ic_media_play else android.R.drawable.ic_media_pause, if (paused) "Продолжить" else "Пауза", pi(ACTION_PAUSE, 1))
            .addAction(android.R.drawable.ic_media_next, "Дальше", pi(ACTION_NEXT, 2))
            .addAction(android.R.drawable.ic_menu_close_clear_cancel, "Стоп", pi(ACTION_STOP, 3))
            .setStyle(MediaStyle().setMediaSession(s.sessionToken).setShowActionsInCompactView(0, 1, 2))
            .build()
    }

    private fun emit(cmd: String) { RoadPlugin.instance?.emitCommand(cmd) }

    override fun onDestroy() {
        wakeLock?.let { if (it.isHeld) it.release() }
        session?.isActive = false; session?.release()
        super.onDestroy()
    }

    companion object {
        const val CHANNEL = "road"; const val NOTIF_ID = 42
        const val ACTION_UPDATE = "io.github.teninz.shadowfox.ROAD_UPDATE"
        const val ACTION_PAUSE = "io.github.teninz.shadowfox.ROAD_PAUSE"
        const val ACTION_NEXT = "io.github.teninz.shadowfox.ROAD_NEXT"
        const val ACTION_STOP = "io.github.teninz.shadowfox.ROAD_STOP"

        fun start(ctx: Context, word: String, ru: String) {
            val i = Intent(ctx, RoadService::class.java).setAction(ACTION_UPDATE).putExtra("word", word).putExtra("ru", ru).putExtra("paused", false)
            if (Build.VERSION.SDK_INT >= 26) ctx.startForegroundService(i) else ctx.startService(i)
        }
        fun update(ctx: Context, word: String, ru: String, paused: Boolean) { ctx.startService(Intent(ctx, RoadService::class.java).setAction(ACTION_UPDATE).putExtra("word", word).putExtra("ru", ru).putExtra("paused", paused)) }
        fun stop(ctx: Context) { ctx.stopService(Intent(ctx, RoadService::class.java)) }
    }
}
