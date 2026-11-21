/** Exact source camera.js config fields and facing-mode toggle (webpack 2164). */
export const SOURCE_CAMERA_RESOLUTION = {width:1280,height:720} as const;
export const SOURCE_CAMERA_FORMAT = "JPEG" as const;
export const SOURCE_CAMERA_QUALITY = 1 as const;
export const SOURCE_CAMERA_TYPES = [
  {extension:"jpeg",label:"JPEG file (*.jpeg)"}
] as const;

export function sourceCameraConstraints(faceFront:boolean):MediaStreamConstraints{
  return {video:{
    width:SOURCE_CAMERA_RESOLUTION.width,
    height:SOURCE_CAMERA_RESOLUTION.height,
    facingMode:faceFront?"user":"environment"
  }};
}
export function sourceCameraCaptureDimensions(
  settings:{width?:number;height?:number},
  video:{videoWidth:number;videoHeight:number}
):{width:number;height:number}{
  const width=settings.width || video.videoWidth;
  const height=settings.height || video.videoHeight;
  if(!Number.isInteger(width)||!Number.isInteger(height)||
     width<1||height<1||width>16384||height>16384)
    throw new Error("Camera returned invalid dimensions.");
  return {width,height};
}
