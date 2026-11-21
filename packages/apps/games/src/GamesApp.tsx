import {useState} from "react";
import {legacySourceIconArtwork} from "@windows-os/assets";
import {SourceListView} from "@windows-os/ui/listview";
import {SourceWin7HistoryNav} from "@windows-os/ui/navigation";
import type {ThemeId} from "@windows-os/contracts";
import {SOURCE_GAMES_PATH,SOURCE_ONLINE_GAMES,sourceOfflineGames} from "./model";
import "./GamesApp.css";

export interface GamesAppProps {
  theme?:ThemeId;
  /** Enabled only when a native React game runtime actually exists. */
  isPlayable?(id:string):boolean;
  onLaunchGame?(id:string):void;
}

/** Source games.js 24d9 => Computer with hoistedPath "shell:games";
 * source computer.js pane-games renders the installed game list and
 * an explicitly empty online section. This is the initial *library*
 * slice, not a claim that unported gameplay engines exist.
 */
export function GamesApp({theme="win7",isPlayable,onLaunchGame}:GamesAppProps){
  const [offlineExpanded,setOfflineExpanded]=useState(true);
  const [onlineExpanded,setOnlineExpanded]=useState(true);
  const offline=sourceOfflineGames(id=>
    Boolean(isPlayable?.(id)&&onLaunchGame));
  return <section className="windows-games" data-test-games-root=""
    data-source-path={SOURCE_GAMES_PATH}>
    <header className="windows-games__addressbar">
      {theme==="win7"?
        <SourceWin7HistoryNav canGoBack={false} canGoForward={false}
          onBack={()=>{}} onForward={()=>{}} ariaLabel="Games history"/>:null}
      <div className="windows-games__address-location">
        <img src={legacySourceIconArtwork("games").src}
          alt="" width={18} height={18}/>
        <span>Games</span>
      </div>
    </header>
    <div className="windows-games__toolbar">
      <button type="button" disabled>Organize</button>
      <button type="button" disabled>Views</button>
    </div>
    <div className="windows-games__body computer__pane-games">
      <section className="windows-games__group">
        <h2>
          <button type="button" aria-expanded={offlineExpanded}
            onClick={()=>setOfflineExpanded(open=>!open)}
            data-test-games-offline-toggle="">
            <span aria-hidden="true">{offlineExpanded?"▾":"▸"}</span>
            Games ({offline.length})
          </button>
        </h2>
        {offlineExpanded&&<SourceListView variant="tiles"
          className="windows-games__tiles" testId="offline-games">
          {offline.map(game=><button type="button"
            key={game.id} data-test-offline-game={game.id}
            className="windows-games__game"
            disabled={!game.available}
            title={game.available?undefined:
              "Original game engine is not yet migrated"}
            onClick={()=>onLaunchGame?.(game.id)}>
            <img src={legacySourceIconArtwork(game.iconKey).src}
              alt="" width={40} height={40}/>
            <span><strong>{game.label}</strong>
              <small>{game.publisher}</small>
            </span>
          </button>)}
        </SourceListView>}
      </section>
      <section className="windows-games__group">
        <h2><button type="button" aria-expanded={onlineExpanded}
          onClick={()=>setOnlineExpanded(open=>!open)}
          data-test-games-online-toggle="">
          <span aria-hidden="true">{onlineExpanded?"▾":"▸"}</span>
          Online games ({SOURCE_ONLINE_GAMES.length})
        </button></h2>
        {onlineExpanded&&<SourceListView variant="tiles"
          className="windows-games__tiles" testId="online-games">
          {SOURCE_ONLINE_GAMES.map(()=>null)}
        </SourceListView>}
      </section>
    </div>
  </section>;
}
