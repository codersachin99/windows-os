import project from "../../../../package.json";
import { legacyArt } from "@windows-os/assets";
import { readSourceAboutLinks, type AboutLinkKey } from "./model";
import "./AboutApp.css";

/** Source window-about: dialog body only; shared WindowFrame owns its
 * centered 520x400 border and source close-only titlebar.
 */
export function AboutApp() {
  const links=readSourceAboutLinks();
  const external=(key:AboutLinkKey,label:string,testId?:string)=>{
    const url=links[key];
    return url ? <a href={url} rel="noopener noreferrer" target="_blank"
        data-test-about={testId} title={label}>{label}</a>
      : <span aria-disabled="true" title={label+" — destination not configured"}
        data-test-about={testId} className="windows-about__unavailable">{label}</span>;
  };
  const credits=links.creditsUrl;
  return <div className="windows-about" data-test-about-dialog="">
    <h2 className="windows-about__brand">
      <img src={legacyArt.win7Brand} width={44} height={44} alt="" draggable={false}/>
      <span className="windows-about__windows">Windows<sup>®</sup> 7</span>
      <span className="windows-about__simulator">Simulator</span>
    </h2>
    <hr className="windows-about__rule"/>
    <div className="windows-about__description">
      <p>{external("url","WindowsOS")}</p>
      <p>Version {project.version}</p>
      <p>Windows 7 Copyright © Microsoft Corporation.</p>
      <p>Legacy Windows OS is a windows web platform to showcase and experience the legacy operating systems with core functionalities.</p>
    </div>
    <nav className="windows-about__links" aria-label="About links">
      {external("privacyUrl","Privacy Policy","privacy")}
      {" - "}
      {external("changelogUrl","Changelog","changelog")}
      {" - "}
      {external("reportIssue","Report bugs","bugs")}
    </nav>
    <div className="windows-about__footer">
      <button type="button" data-test-credits-button="" disabled={!credits}
        title={credits ? "Open credits" : "Credits — destination not configured"}
        onClick={()=>{if(credits)window.open(credits,"_blank","noopener,noreferrer");}}>
        Credits
      </button>
    </div>
  </div>;
}
