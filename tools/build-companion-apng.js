// Assemble Blender's RGBA PNG frame sequences into dependency-free APNG files.
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const SOURCE = path.join(ROOT, "art", "companion-anim-frames");
const OUTPUT = path.join(ROOT, "art", "companion-anim");
const SIGNATURE = Buffer.from([137,80,78,71,13,10,26,10]);

const crcTable = new Uint32Array(256);
for(let n=0;n<256;n++){
  let c=n;
  for(let k=0;k<8;k++) c=(c&1) ? (0xedb88320^(c>>>1)) : (c>>>1);
  crcTable[n]=c>>>0;
}
function crc32(buffer){
  let c=0xffffffff;
  for(const byte of buffer)c=crcTable[(c^byte)&255]^(c>>>8);
  return (c^0xffffffff)>>>0;
}
function chunk(type,data){
  const name=Buffer.from(type,"ascii"), length=Buffer.alloc(4), crc=Buffer.alloc(4);
  length.writeUInt32BE(data.length); crc.writeUInt32BE(crc32(Buffer.concat([name,data])));
  return Buffer.concat([length,name,data,crc]);
}
function parsePng(file){
  const data=fs.readFileSync(file);
  if(!data.subarray(0,8).equals(SIGNATURE))throw new Error(`${file}: not a PNG`);
  const chunks=[]; let offset=8;
  while(offset<data.length){
    const length=data.readUInt32BE(offset), type=data.toString("ascii",offset+4,offset+8);
    chunks.push({type,data:data.subarray(offset+8,offset+8+length)});
    offset+=12+length;
    if(type==="IEND")break;
  }
  const ihdr=chunks.find(c=>c.type==="IHDR").data;
  return {width:ihdr.readUInt32BE(0),height:ihdr.readUInt32BE(4),ihdr,
    ancillary:chunks.filter(c=>!["IHDR","IDAT","IEND"].includes(c.type)),
    idat:Buffer.concat(chunks.filter(c=>c.type==="IDAT").map(c=>c.data))};
}
function u32(...values){const b=Buffer.alloc(values.length*4);values.forEach((v,i)=>b.writeUInt32BE(v>>>0,i*4));return b;}
function frameControl(sequence,width,height){
  const data=Buffer.alloc(26);
  data.writeUInt32BE(sequence,0); data.writeUInt32BE(width,4); data.writeUInt32BE(height,8);
  data.writeUInt32BE(0,12); data.writeUInt32BE(0,16);
  data.writeUInt16BE(1,20); data.writeUInt16BE(12,22); // Pixel timeline: 12 fps.
  data[24]=0; data[25]=0;
  return data;
}
function build(name){
  const folder=path.join(SOURCE,name);
  const files=fs.readdirSync(folder).filter(file=>file.endsWith(".png")).sort().map(file=>path.join(folder,file));
  if(files.length<2)throw new Error(`${name}: needs at least two frames`);
  const frames=files.map(parsePng), first=frames[0];
  if(frames.some(frame=>frame.width!==first.width||frame.height!==first.height))throw new Error(`${name}: frame size mismatch`);
  const out=[SIGNATURE,chunk("IHDR",first.ihdr)];
  for(const item of first.ancillary)if(!["acTL","fcTL","fdAT"].includes(item.type))out.push(chunk(item.type,item.data));
  out.push(chunk("acTL",u32(frames.length,0)));
  let sequence=0;
  frames.forEach((frame,index)=>{
    out.push(chunk("fcTL",frameControl(sequence++,first.width,first.height)));
    if(index===0)out.push(chunk("IDAT",frame.idat));
    else out.push(chunk("fdAT",Buffer.concat([u32(sequence++),frame.idat])));
  });
  out.push(chunk("IEND",Buffer.alloc(0)));
  const destination=path.join(OUTPUT,`${name}.png`);
  fs.writeFileSync(destination,Buffer.concat(out));
  console.log(`${name}: ${frames.length} frames, ${Math.round(fs.statSync(destination).size/1024)} KiB`);
}

fs.mkdirSync(OUTPUT,{recursive:true});
for(const name of fs.readdirSync(SOURCE).filter(name=>fs.statSync(path.join(SOURCE,name)).isDirectory()).sort())build(name);
