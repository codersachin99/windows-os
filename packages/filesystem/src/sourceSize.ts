/** Original webpack 4cca.getSizeFrom from pinned legacy-win7@4e63290.
 * Blob a3edd490a0f4e23052f2a3a74a694c8991911c56, export "i".
 * Keep original binary 1024 threshold, plural "bytes" and one decimal.
 * Input comes from nonnegative integer Guest VFS file lengths.
 */
export function sourceSizeFromBytes(bytes:number):string{
  const units=["bytes","KB","MB","GB","TB"];
  if(bytes===0)return "0 bytes";
  const index=Math.floor(Math.log(bytes)/Math.log(1024));
  return index===0
    ?`${bytes} ${units[index]}`
    :`${(bytes/Math.pow(1024,index)).toFixed(1)} ${units[index]}`;
}
