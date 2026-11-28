import {describe,expect,it} from "vitest";
import {
  SOURCE_DESKTOP_DEFAULT_SORT,sourceNextDesktopSort,sourceSortDesktopItems
} from "./sourceDesktopSort";
import {DesktopPositionStore} from "./desktopPositions";

const examples=[
  {id:"c",label:"Zebra.txt",size:5,type:"txt",mtime:100},
  {id:"a",label:"Alpha folder",size:0,type:"directory",mtime:300},
  {id:"b",label:"Beta.png",size:20,type:"png",mtime:200}
];
describe("final source Desktop Sort by menu",()=>{
  it("sorts original four keys, preserves stable ties and direction semantics",()=>{
    expect(sourceSortDesktopItems(examples,SOURCE_DESKTOP_DEFAULT_SORT).map(x=>x.id))
      .toEqual(["a","b","c"]);
    expect(sourceSortDesktopItems(examples,{key:"size",asc:false}).map(x=>x.id))
      .toEqual(["b","c","a"]);
    expect(sourceSortDesktopItems(examples,{key:"type",asc:true}).map(x=>x.id))
      .toEqual(["a","b","c"]);
    expect(sourceSortDesktopItems(examples,{key:"date",asc:false}).map(x=>x.id))
      .toEqual(["a","b","c"]);
    expect(sourceSortDesktopItems([
      {id:"x",label:"Same"},{id:"y",label:"Same"}
    ],{key:"name",asc:false}).map(x=>x.id)).toEqual(["x","y"]);
    expect(sourceNextDesktopSort(SOURCE_DESKTOP_DEFAULT_SORT,"name"))
      .toEqual({key:"name",asc:false});
    expect(sourceNextDesktopSort({key:"name",asc:false},"size"))
      .toEqual({key:"size",asc:true});
  });
  it("positions sorted icon keys in source column/row order and persists it",()=>{
    const saved=new Map<string,string>();
    const store=new DesktopPositionStore({
      getItem:k=>saved.get(k)??null,
      setItem:(k,v)=>{saved.set(k,v);}
    });
    const area={width:800,height:480};
    store.arrange(["b","a","c"],area);
    expect(store.placement("b",0,area)).toEqual({x:0,y:0});
    expect(store.placement("a",1,area)).toEqual({x:0,y:80});
    expect(store.placement("c",2,area)).toEqual({x:0,y:160});
    expect(new DesktopPositionStore({
      getItem:k=>saved.get(k)??null,setItem:()=>{}
    }).placement("a",1,area)).toEqual({x:0,y:80});
  });
});
