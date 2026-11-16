import {sourcePrograms} from "@windows-os/filesystem";

/** Pinned legacy-win7 5401: Games is a shell virtual folder, NOT the
 * Guest Start Menu/Programs/Games directory of .lnk shortcuts.
 * games.js 24d9 hoists a Computer session to this exact source URI.
 */
export const SOURCE_GAMES_PATH="shell:games" as const;

export interface SourceOfflineGame {
  readonly id:string;
  readonly label:string;
  readonly publisher:string;
  readonly iconKey:string;
  readonly available:boolean;
}

/** Pinned c170 installed game manifest. Only actually migrated game
 * runtimes should be flagged available by the caller. Never claim a
 * playable game based merely on a .exe virtual stub or a game tile.
 */
export function sourceOfflineGames(
  isPlayable:(id:string)=>boolean=()=>false
):readonly SourceOfflineGame[]{
  return sourcePrograms.filter(program=>program.kind==="game"&&
    Boolean(program.installPath)).map(program=>({
      id:program.id,
      label:program.name,
      publisher:program.publisher??"",
      iconKey:program.id,
      available:isPlayable(program.id)
    }));
}

/** Pinned computer.js pane-games resets onlineGames=[] after optional
 * fetch; don't fabricate network catalog entries or externally launch
 * unverified games in the migration. */
export const SOURCE_ONLINE_GAMES:readonly never[]=Object.freeze([]);
