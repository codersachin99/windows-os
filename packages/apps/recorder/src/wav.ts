/** Windows Sound Recorder source conversion (recorder.js -> 0fbc.d) produces WAV.
 * Encode interleaved little-endian PCM, never rename WebM bytes as .wav. */
export interface SourceDecodedAudio {
  readonly numberOfChannels: number;
  readonly length: number;
  readonly sampleRate: number;
  getChannelData(channel: number): Float32Array;
}

export function encodeSourceWave(audio: SourceDecodedAudio): Uint8Array {
  const channels=audio.numberOfChannels;
  const frames=audio.length;
  const rate=audio.sampleRate;
  if(!Number.isSafeInteger(channels)||channels<1||channels>8||
     !Number.isSafeInteger(frames)||frames<1||frames>0x3fffffff||
     !Number.isSafeInteger(rate)||rate<8000||rate>384000){
    throw new Error("Invalid decoded audio dimensions");
  }
  const size=frames*channels*2;
  if(!Number.isSafeInteger(size)||size>0xffffffff-36)
    throw new Error("Audio is too large to export as WAV");
  const result=new Uint8Array(44+size);
  const view=new DataView(result.buffer);
  const tag=(offset:number,value:string)=>{
    for(let i=0;i<value.length;i++)result[offset+i]=value.charCodeAt(i);
  };
  tag(0,"RIFF");view.setUint32(4,36+size,true);tag(8,"WAVE");
  tag(12,"fmt ");view.setUint32(16,16,true);
  view.setUint16(20,1,true); // linear PCM
  view.setUint16(22,channels,true);
  view.setUint32(24,rate,true);
  view.setUint32(28,rate*channels*2,true);
  view.setUint16(32,channels*2,true);
  view.setUint16(34,16,true);
  tag(36,"data");view.setUint32(40,size,true);
  const planes=Array.from({length:channels},(_,channel)=>audio.getChannelData(channel));
  for(let frame=0;frame<frames;frame++){
    for(let channel=0;channel<channels;channel++){
      const sample=Math.max(-1,Math.min(1,planes[channel][frame]||0));
      view.setInt16(44+(frame*channels+channel)*2,
        Math.round(sample<0?sample*32768:sample*32767),true);
    }
  }
  return result;
}

/** Source a146.b formats elapsed recording seconds as a time display. */
export function sourceRecorderTime(seconds:number): string {
  const n=Math.max(0,Math.floor(seconds));
  const two=(value:number)=>String(value).padStart(2,"0");
  return [two(Math.floor(n/3600)),two(Math.floor(n%3600/60)),two(n%60)].join(":");
}
