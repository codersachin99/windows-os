import {describe,it,expect} from "vitest";
import {StandardCalculator,STANDARD_BUTTONS} from "./standard";

const run=(...buttons:string[])=>{
 const c=new StandardCalculator();
 for(const label of buttons){
  const b=STANDARD_BUTTONS.find(b=>b.label===label);
  if(!b) throw Error("missing button "+label);
  c.press(b);
 }
 return c.snapshot();
};
describe("source calc.js Standard mode controls",()=>{
 it("reuses exact 29-button original order and grid spans",()=>{
   expect(STANDARD_BUTTONS.map(b=>b.label)).toEqual([
     "MC","MR","MS","M+","M-","←","CE","C","±","√",
     "7","8","9","/","%","4","5","6","*","1/x",
     "1","2","3","-","=","0",".","+"
   ]);
   expect(STANDARD_BUTTONS.find(b=>b.label==="=")).toMatchObject({rowSpan:true});
   expect(STANDARD_BUTTONS.find(b=>b.label==="0")).toMatchObject({colSpan:true});
 });
 it("evaluates source Standard operations left-to-right",()=>{
   expect(run("2","+","3","*","4","=").display).toBe("20");
   expect(run("7","-","2","-","1","=").display).toBe("4");
   expect(run("8","/","2","=").display).toBe("4");
   expect(run("9","*","9","=").display).toBe("81");
 });
 it("replaces pending operators and differentiates clear entry from clear all",()=>{
   expect(run("8","+","-","2","=").display).toBe("6");
   expect(run("9","+","3","CE","2","=").display).toBe("11");
   expect(run("9","+","3","C","2","=").display).toBe("2");
 });
 it("implements decimals, negation, backspace and 16-digit limit",()=>{
   expect(run("0",".","2","5","±").display).toBe("-0.25");
   expect(run("1","2","3","←","4").display).toBe("124");
   const c=new StandardCalculator();
   for(const d of "12345678901234567")c.digit(d);
   expect(c.snapshot().display).toBe("1234567890123456");
 });
 it("supports source unary percent/sqrt/reciprocal and error classification",()=>{
   expect(run("9","√").display).toBe("3");
   expect(run("2","5","%").display).toBe("0.25");
   expect(run("4","1/x").display).toBe("0.25");
   expect(run("8","/","0","=").error).toBe("cannot-divide-by-zero");
   expect(run("0","/","0","=").error).toBe("result-is-undefined");
   expect(run("0","1/x").error).toBe("cannot-divide-by-zero");
   expect(run("9","±","√").error).toBe("invalid-input");
   expect(run("0","1/x","C").display).toBe("0");
 });
 it("keeps memory separate from clearing display and retains source history",()=>{
   expect(run("8","MS","C","MR").display).toBe("8");
   expect(run("8","MS","C","2","M+","C","MR").display).toBe("10");
   expect(run("8","MS","C","2","M-","C","MR").display).toBe("6");
   const snap=run("1","+","2","=");
   expect(snap.history).toHaveLength(1);
   expect(snap.display).toBe("3");
 });
 it("notifies subscribers without exposing mutable snapshots",()=>{
   const c=new StandardCalculator();
   const outputs:string[]=[];
   const unsubscribe=c.subscribe(s=>outputs.push(s.display));
   c.digit("4");
   c.decimal();
   c.digit("5");
   c.setGrouping(true);
   expect(outputs).toEqual(["4","4.","4.5","4.5"]);
   c.snapshot().history.push("tamper");
   expect(c.snapshot().history).toEqual([]);
   unsubscribe();c.digit("7");
   expect(outputs).toHaveLength(4);
 });
});
