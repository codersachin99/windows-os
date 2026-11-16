import {legacyCardArtwork} from "@windows-os/assets";
import {
  SOURCE_CARD_SUITS,type SourceCard
} from "./sourceCards";
export const SOURCE_CARD_SPRITE_WIDTH=73;
export const SOURCE_CARD_SPRITE_HEIGHT=98;
export const SOURCE_CARD_COLUMNS=13;
export const SOURCE_CARD_ROWS=5;
export const SOURCE_CARD_BACK_ROW=4;
export const SOURCE_CARD_EMPTY_COLUMN=3;
export type SourceCardBack=0|1|2;
export interface SourceCardSpriteStyle{
  width:string;height:string;backgroundImage:string;
  backgroundSize:string;backgroundPosition:string;
}
/** Exact original cards-spritesheet.f136d9d3.webp: 949x490=13*73
 * by 5*98. Source 5ea1 builds one CSS background-sprite per card.
 * Suit rows: clubs, diamonds, hearts, spades; final row: three
 * patterned backs + empty slot, confirmed on the pinned source image.
 */
export function sourceCardSpriteStyle(
  card:SourceCard|null,
  width:number,back:SourceCardBack=0
):SourceCardSpriteStyle{
  if(!Number.isFinite(width)||width<=0)throw Error("Invalid source card width");
  const height=Math.round(width*SOURCE_CARD_SPRITE_HEIGHT/SOURCE_CARD_SPRITE_WIDTH);
  const col=card?.faceUp?card.rank-1:card?back:SOURCE_CARD_EMPTY_COLUMN;
  const row=card?.faceUp?SOURCE_CARD_SUITS.indexOf(card.suit):SOURCE_CARD_BACK_ROW;
  return {
    width:width+"px",height:height+"px",
    backgroundImage:`url("${legacyCardArtwork.spritesheet}")`,
    backgroundSize:`${width*SOURCE_CARD_COLUMNS}px ${height*SOURCE_CARD_ROWS}px`,
    backgroundPosition:`${-col*width}px ${-row*height}px`
  };
}
