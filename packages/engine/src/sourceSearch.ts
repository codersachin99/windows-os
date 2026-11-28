/**
 * Bytecode-equivalent search primitives from pinned legacy-win7
 * src/modules/apps/cpanel.js webpack 5985.
 *
 * Source 5985 is shared with the original a682 Control Panel task lookup:
 * - Unicode NFD normalization and accent removal
 * - lower-case terms, quoted phrases and key:value filters
 * - word-start matching, including Thai/Myanmar/Khmer/CJK boundaries
 * - name (10), keyword (1), exact/prefix/ordered relevance boosts
 * The source parser records filters but this source search scorer does not
 * consume them: filtering is a separate integration concern.
 */
export const SOURCE_SEARCH_WEIGHT=Object.freeze({Name:10,Keyword:1});
export interface SourceSearchQuery{
  terms:string[];
  filters:Record<string,string>;
}
export interface SourceSearchField{
  text:string;
  weight:number;
}

const sourceBoundary=/[\s!-/:-@[-`{-~\u00a1-\u00bf\u00d7\u00f7\u060c\u061b\u061f\u066a-\u066d\u0964\u0965\u2000-\u206f\u3000-\u303f\uff01-\uff0f\uff1a-\uff20\uff3b-\uff40\uff5b-\uff65]/;
const sourceEastAsian=/[\u0e00-\u0eff\u1000-\u109f\u1780-\u17ff\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff]/;
const sourceTokens=/([a-z]+:)?"([^"]*)"?|(\S+)/g;
const sourceFilter=/^([a-z]+):(.+)$/;

export function sourceNormalizeSearch(text:string):string{
  return text.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();
}

/** Pinned 5985.l: tokenize every quoted term, and record key:value filters.
 * Any repeated filter key takes the last value, as in source.
 */
export function sourceParseSearch(text:string):SourceSearchQuery{
  const parsed:SourceSearchQuery={terms:[],filters:{}};
  const normalized=sourceNormalizeSearch(text);
  // Matchers are module-global in source; use a fresh local regex with
  // identical flags to avoid shared lastIndex between concurrent callers.
  const matcher=new RegExp(sourceTokens.source,"g");
  let match:RegExpExecArray|null;
  while((match=matcher.exec(normalized))!==null){
    const [,prefix,phrase,token]=match;
    const filter=token?.match(sourceFilter);
    if(filter){
      parsed.filters[filter[1]]=filter[2];
    }else if(prefix){
      if(phrase.trim())parsed.filters[prefix.slice(0,-1)]=phrase.trim();
    }else if(phrase!==undefined){
      if(phrase.trim())parsed.terms.push(phrase.trim());
    }else if(token!==undefined){
      parsed.terms.push(token);
    }
  }
  return parsed;
}

function sourceIsWordStart(text:string,index:number):boolean{
  if(index===0)return true;
  return sourceBoundary.test(text[index-1])||
    sourceEastAsian.test(text[index-1])||
    sourceEastAsian.test(text[index]);
}
/** Pinned 5985.d: find first match starting on a recognized source word
 * boundary, from an optional inclusive offset.
 */
export function sourceFindSearchTerm(text:string,term:string,start=0):number{
  let index=text.indexOf(term,start);
  while(index!==-1&&!sourceIsWordStart(text,index))
    index=text.indexOf(term,index+1);
  return index;
}
function sourceOrderedTerms(text:string,terms:readonly string[]):boolean{
  let offset=0;
  for(const term of terms){
    const found=sourceFindSearchTerm(text,term,offset);
    if(found===-1)return false;
    offset=found+term.length;
  }
  return true;
}
/** Pinned 5985.p: score a localized name plus optional task keyword text.
 * Each query term must match at least one field, then the strongest field
 * contributes its original weight. Filters do not contribute to scoring.
 */
export function sourceScoreSearch(
  fields:readonly SourceSearchField[],query:SourceSearchQuery
):number{
  if(query.terms.length===0||fields.length===0)return 0;
  const normalized=fields.map(field=>sourceNormalizeSearch(field.text));
  let score=0;
  for(const term of query.terms){
    const weights=fields.flatMap((field,index)=>
      sourceFindSearchTerm(normalized[index],term)===-1?[]:[field.weight]);
    if(weights.length===0)return 0;
    score+=Math.max(...weights);
  }
  const heading=normalized[0];
  const phrase=query.terms.join(" ");
  if(heading===phrase)score+=1000;
  else if(heading.startsWith(phrase))score+=100;
  else if(sourceOrderedTerms(heading,query.terms))score+=5;
  return score;
}
