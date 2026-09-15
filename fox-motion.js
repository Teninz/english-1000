// Ровные 20 FPS без накопления ошибки setInterval. Подключается к покадровым атласам лисы v2.
const FoxMotion = (() => {
  const DEFAULT_FPS = 20;
  function frameAt(elapsedMs, frameCount, fps=DEFAULT_FPS, loop=false) {
    if(!Number.isFinite(elapsedMs)||elapsedMs<0||!Number.isSafeInteger(frameCount)||frameCount<1||!Number.isFinite(fps)||fps<=0)throw Error("Некорректная шкала анимации");
    const duration=frameCount*1000/fps;
    const time=loop?elapsedMs%duration:Math.min(elapsedMs,Math.max(0,duration-0.001));
    return Math.min(frameCount-1,Math.floor(time*fps/1000));
  }
  class Clock {
    constructor({fps=DEFAULT_FPS,onFrame=()=>{},onEnd=()=>{},raf=callback=>requestAnimationFrame(callback),caf=id=>cancelAnimationFrame(id),now=()=>performance.now()}={}) {
      this.fps=fps;this.onFrame=onFrame;this.onEnd=onEnd;this.raf=raf;this.caf=caf;this.now=now;
      this.running=false;this.ticket=0;this.startedAt=0;this.pausedAt=0;this.lastTickAt=null;this.lastFrame=-1;this.frameCount=0;this.loop=false;this.dropped=0;this.maxGapMs=0;
      this.tick=this.tick.bind(this);
    }
    play(frameCount,{loop=false,offsetMs=0}={}) {
      this.stop();this.frameCount=frameCount;this.loop=loop;this.running=true;this.startedAt=this.now()-Math.max(0,offsetMs);this.lastFrame=-1;this.lastTickAt=null;this.dropped=0;this.maxGapMs=0;this.ticket=this.raf(this.tick);return this;
    }
    tick(now) {
      if(!this.running)return;
      if(this.lastTickAt!==null)this.maxGapMs=Math.max(this.maxGapMs,now-this.lastTickAt);this.lastTickAt=now;
      const elapsed=Math.max(0,now-this.startedAt), frame=frameAt(elapsed,this.frameCount,this.fps,this.loop);
      if(frame!==this.lastFrame){
        if(!this.loop&&this.lastFrame>=0&&frame>this.lastFrame+1)this.dropped+=frame-this.lastFrame-1;
        this.lastFrame=frame;this.onFrame(frame,{elapsed,dropped:this.dropped,maxGapMs:this.maxGapMs});
      }
      const duration=this.frameCount*1000/this.fps;
      if(!this.loop&&elapsed>=duration){this.running=false;this.ticket=0;this.onEnd({duration,dropped:this.dropped,maxGapMs:this.maxGapMs});return;}
      this.ticket=this.raf(this.tick);
    }
    pause() {
      if(!this.running)return;this.pausedAt=this.now();this.running=false;this.lastTickAt=null;if(this.ticket)this.caf(this.ticket);this.ticket=0;
    }
    resume() {
      if(this.running||!this.pausedAt||!this.frameCount)return;this.startedAt+=this.now()-this.pausedAt;this.pausedAt=0;this.running=true;this.ticket=this.raf(this.tick);
    }
    stop() {
      if(this.ticket)this.caf(this.ticket);this.running=false;this.ticket=0;this.pausedAt=0;this.lastFrame=-1;
    }
  }
  async function preload(src) {
    const image=new Image();image.decoding="async";image.src=src;
    if(image.decode)await image.decode();else await new Promise((resolve,reject)=>{image.onload=resolve;image.onerror=reject;});
    return image;
  }
  return {DEFAULT_FPS,frameAt,Clock,preload};
})();
if(typeof module!=="undefined")module.exports=FoxMotion;
