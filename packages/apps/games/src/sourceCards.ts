/** Shared original card-game models from pinned 5ea1 in
 * shared~solitaire~spidersolitaire.js. Both games consume a deck of
 * id/suit/rank/faceUp cards, common alternating-color and last-card
 * utilities. The original ec2b suit ordering and 2f7e shuffle sequence
 * have not both been recovered. The 2f7e shuffle IS source-exact:
 * it copies the deck and swaps each index i with floor(Math.random()*(i+1)).
 * Default suit iteration order from ec2b is still an explicit adapter,
 * not a verified source deck hash.
 */
export type SourceCardSuit="clubs"|"diamonds"|"hearts"|"spades";
export interface SourceCard{
  readonly id:string;
  readonly suit:SourceCardSuit;
  readonly rank:number;
  faceUp:boolean;
}
export const SOURCE_CARD_SUITS:readonly SourceCardSuit[]=[
  "clubs","diamonds","hearts","spades"
];
export const SOURCE_CARD_ACE=1;
export const SOURCE_CARD_KING=13;
export function sourceCardsLast<T>(cards:readonly T[]):T|undefined{
  return cards[cards.length-1];
}
export function sourceCardsDifferentColor(a:SourceCard,b:SourceCard):boolean{
  const red=(suit:SourceCardSuit)=>suit==="diamonds"||suit==="hearts";
  return red(a.suit)!==red(b.suit);
}
/** Deterministic CI injection point. Original 2f7e implements this
 * exact Fisher-Yates loop; only ec2b's suit sequence remains unresolved.
 */
export function sourceCardsDeck(
  random:()=>number=Math.random,
  copies=1
):SourceCard[]{
  const deck:SourceCard[]=[];
  if(!Number.isInteger(copies)||copies<1||copies>8)
    throw Error("Invalid card deck count");
  for(let copy=0;copy<copies;copy++)
    for(const suit of SOURCE_CARD_SUITS)
      for(let rank=SOURCE_CARD_ACE;rank<=SOURCE_CARD_KING;rank++)
        deck.push({id:`${suit}-${rank}-${copy}`,suit,rank,faceUp:false});
  for(let i=deck.length-1;i>0;i--){
    const r=random();
    if(!Number.isFinite(r)||r<0||r>=1)
      throw Error("Invalid card shuffle random");
    const j=Math.floor(r*(i+1));
    [deck[i],deck[j]]=[deck[j],deck[i]];
  }
  return deck;
}
