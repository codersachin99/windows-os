import { describe,expect,it } from "vitest";
import { SOURCE_CAMERA_FORMAT,SOURCE_CAMERA_QUALITY,SOURCE_CAMERA_RESOLUTION,
  SOURCE_CAMERA_TYPES, sourceCameraConstraints,sourceCameraCaptureDimensions } from "./model";

describe("pinned source camera.js capture configuration",()=>{
  it("requests source 1280x720 front/rear facing mode",()=>{
    expect(sourceCameraConstraints(true)).toEqual({
      video:{width:1280,height:720,facingMode:"user"}
    });
    expect(sourceCameraConstraints(false)).toEqual({
      video:{width:1280,height:720,facingMode:"environment"}
    });
  });
  it("preserves source JPEG quality and Save As filter",()=>{
    expect(SOURCE_CAMERA_RESOLUTION).toEqual({width:1280,height:720});
    expect(SOURCE_CAMERA_FORMAT).toBe("JPEG");
    expect(SOURCE_CAMERA_QUALITY).toBe(1);
    expect(SOURCE_CAMERA_TYPES).toEqual([{extension:"jpeg",label:"JPEG file (*.jpeg)"}]);
  });
  it("uses camera track dimensions, with safe video fallback",()=>{
    expect(sourceCameraCaptureDimensions({width:320,height:240},
      {videoWidth:640,videoHeight:480})).toEqual({width:320,height:240});
    expect(sourceCameraCaptureDimensions({width:0,height:0},
      {videoWidth:640,videoHeight:480})).toEqual({width:640,height:480});
    expect(()=>sourceCameraCaptureDimensions({width:0,height:0},
      {videoWidth:0,videoHeight:0})).toThrow("invalid");
    expect(()=>sourceCameraCaptureDimensions({width:20000,height:4},
      {videoWidth:1,videoHeight:1})).toThrow("invalid");
  });
});
