// Генерирует покадровую карту опорных точек эталонной пятисекундной цепочки.
const fs=require("fs"),path=require("path");
const FPS=20,COUNT=100,STEP=1000/FPS;
const clamp=value=>Math.max(0,Math.min(1,value));
const smooth=value=>{const t=clamp(value);return t*t*(3-2*t);};
const between=(frame,start,end)=>smooth((frame-start)/(end-start));
const round=value=>Math.round(value*1000)/1000;
function phase(frame){
  if(frame<16)return "idle";if(frame<28)return "notice";if(frame<40)return "focus";
  if(frame<58)return "rise";if(frame<70)return "happy_hold";if(frame<88)return "settle";return "idle_return";
}
function liftAt(frame){
  if(frame<28)return 0;if(frame<54)return between(frame,28,54);if(frame<68)return 1;return 1-between(frame,68,99);
}
function delayedLift(frame,start,end,settleStart){
  if(frame<start)return 0;if(frame<end)return between(frame,start,end);if(frame<settleStart)return 1;return 1-between(frame,settleStart,99);
}
const frames=Array.from({length:COUNT},(_,frame)=>{
  const lift=liftAt(frame), headFollow=delayedLift(frame,31,57,71), tailFollow=delayedLift(frame,37,62,75), eyeFocus=delayedLift(frame,16,34,72);
  const breath=Math.sin(2*Math.PI*frame/99), notice=frame>=16&&frame<=39?Math.sin(Math.PI*(frame-16)/23):0;
  const blink=frame>=18&&frame<=22?Math.sin(Math.PI*(frame-18)/4):0;
  return {
    frame,timeMs:frame*STEP,phase:phase(frame),
    pose:{
      bodyY:round(-0.65*breath-2.2*lift),chestScaleY:round(1+0.008*breath+0.035*lift),
      headX:round(1.2*notice+2.6*headFollow),headY:round(-0.45*breath-11.5*headFollow),headAngle:round(-1.5*notice-5.5*headFollow),
      eyeX:round(1.8*eyeFocus),eyeY:round(-2.1*lift),eyelid:round(blink),smile:round(0.8*lift),
      leftEarAngle:round(-5*notice-4*lift),rightEarAngle:round(2.5*notice-3*lift),
      tailLift:round(9*tailFollow+0.6*breath),scarfLift:round(6.5*delayedLift(frame,42,64,78)),leafAngle:round(-7*delayedLift(frame,39,60,76))
    }
  };
});
const keys=Object.keys(frames[0].pose);
for(const key of keys)if(frames[0].pose[key]!==frames.at(-1).pose[key])throw Error(`${key}: первый и последний кадры не совпадают`);
for(let index=1;index<frames.length;index++)for(const key of keys){
  const delta=Math.abs(frames[index].pose[key]-frames[index-1].pose[key]);
  if(delta>2.5)throw Error(`${key}: скачок ${delta} между кадрами ${index-1} и ${index}`);
}
const plan={id:"reference-idle-notice-happy",version:1,fps:FPS,frameCount:COUNT,durationMs:COUNT*STEP,canvas:{width:256,height:256,safeMargin:16},frames};
const target=path.join(__dirname,"companion-source","reference-chain-v1.motion.json");
fs.writeFileSync(target,JSON.stringify(plan));
console.log(`План движения: ${COUNT} кадров, ${FPS} FPS, ${plan.durationMs} мс → ${path.relative(process.cwd(),target)}`);
