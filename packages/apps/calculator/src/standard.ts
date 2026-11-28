/**
 * Source: legacy-win7/src/modules/apps/calc.js, Vt.methods and bt.buttons.
 * This slice reproduces Standard mode only (source modes also include scientific,
 * programmer and statistics). Buttons and 16-digit entry cap are source-derived.
 */
export type StandardOperator = "+" | "-" | "*" | "/";
export type StandardFunction = "negate" | "sqrt" | "percent" | "reciproc";
export type StandardCommand =
  "backspace" | "clearEntry" | "clearAll" |
  "memoryClear" | "memoryRecall" | "memoryStore" |
  "memoryAdd" | "memorySubtract" | "equals";
export type StandardButton =
  | { label: string; type: "digit"; colSpan?: true }
  | { label: "."; type: "decimal" }
  | { label: string; type: "op"; op: StandardOperator }
  | { label: string; type: "func"; action: StandardFunction }
  | { label: string; type: "command"; action: StandardCommand; rowSpan?: true };

export const STANDARD_BUTTONS: readonly StandardButton[] = [
  {label:"MC",type:"command",action:"memoryClear"},
  {label:"MR",type:"command",action:"memoryRecall"},
  {label:"MS",type:"command",action:"memoryStore"},
  {label:"M+",type:"command",action:"memoryAdd"},
  {label:"M-",type:"command",action:"memorySubtract"},
  {label:"←",type:"command",action:"backspace"},
  {label:"CE",type:"command",action:"clearEntry"},
  {label:"C",type:"command",action:"clearAll"},
  {label:"±",type:"func",action:"negate"},
  {label:"√",type:"func",action:"sqrt"},
  {label:"7",type:"digit"},{label:"8",type:"digit"},{label:"9",type:"digit"},
  {label:"/",type:"op",op:"/"},{label:"%",type:"func",action:"percent"},
  {label:"4",type:"digit"},{label:"5",type:"digit"},{label:"6",type:"digit"},
  {label:"*",type:"op",op:"*"},{label:"1/x",type:"func",action:"reciproc"},
  {label:"1",type:"digit"},{label:"2",type:"digit"},{label:"3",type:"digit"},
  {label:"-",type:"op",op:"-"},
  {label:"=",type:"command",action:"equals",rowSpan:true},
  {label:"0",type:"digit",colSpan:true},{label:".",type:"decimal"},
  {label:"+",type:"op",op:"+"}
] as const;

export type CalculatorError =
  | "cannot-divide-by-zero" | "result-is-undefined"
  | "invalid-input" | "overflow";

export interface CalculatorStandardSnapshot {
  display: string;
  expression: string;
  error: CalculatorError | null;
  memory: number;
  hasNumberInputted: boolean;
  history: string[];
  digitGrouping: boolean;
}
type Listener = (snapshot: CalculatorStandardSnapshot) => void;
export class StandardCalculator {
  private display = "0";
  private expression = "";
  private error: CalculatorError | null = null;
  private memory = 0;
  private entered = false;
  private previous: number | null = null;
  private operator: StandardOperator | null = null;
  private history: string[] = [];
  private digitGrouping = false;
  private listeners = new Set<Listener>();

  snapshot(): CalculatorStandardSnapshot {
    return { display: this.display, expression: this.expression, error:this.error,
      memory:this.memory, hasNumberInputted:this.entered, history:[...this.history],
      digitGrouping:this.digitGrouping };
  }
  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => {this.listeners.delete(listener);};
  }
  private notify(): void {
    const current = this.snapshot();
    for (const listener of this.listeners) listener(current);
  }
  setGrouping(group: boolean): void { this.digitGrouping = group; this.notify(); }
  private fault(kind: CalculatorError): void {
    this.error = kind;
    this.display = "";
    this.entered = false;
  }
  private numberResult(value: number, divideZero = false): boolean {
    if (divideZero) this.fault("cannot-divide-by-zero");
    else if (Number.isNaN(value)) this.fault("invalid-input");
    else if (!Number.isFinite(value)) this.fault("overflow");
    else { this.display = String(value); this.entered = false; return true; }
    return false;
  }
  private calculate(a: number,b: number,op:StandardOperator):boolean {
    if (op === "/" && b === 0) {
      this.fault(a === 0 ? "result-is-undefined" : "cannot-divide-by-zero");
      return false;
    }
    return this.numberResult(op==="+"?a+b:op==="-"?a-b:op==="*"?a*b:a/b);
  }
  digit(value:string):void {
    if (this.error || !/^[0-9]$/.test(value)) return;
    if (this.entered && this.display !== "0") {
      // 16 digits in the original Standard mode, excluding a sign/decimal.
      if (this.display.replace(/[-.]/g,"").length >= 16) return;
      this.display += value;
    } else this.display = value;
    this.entered = true;
    this.notify();
  }
  decimal():void {
    if (this.error) return;
    if (!this.entered || this.display === "0") this.display = "0.";
    else if (!this.display.includes(".")) this.display += ".";
    this.entered = true;
    this.notify();
  }
  setOperator(next:StandardOperator):void {
    if (this.error) return;
    if (this.operator && !this.entered) {
      this.operator = next;
      this.expression = String(this.previous ?? 0) + " " + next;
      this.notify();
      return;
    }
    const value = Number(this.display);
    if (this.operator !== null && this.previous !== null) {
      if (!this.calculate(this.previous,value,this.operator)) {
        this.notify();return;
      }
      this.previous = Number(this.display);
    } else this.previous = value;
    this.operator = next;
    this.expression = (this.expression ? this.expression + " " : "") + value + " " + next;
    this.entered = false;
    this.notify();
  }
  func(action:StandardFunction):void {
    if (this.error) return;
    if (action==="negate") {
      if (!this.entered) return;
      this.display = this.display.startsWith("-") ? this.display.slice(1) : "-" + this.display;
      this.notify();
      return;
    }
    const current = Number(this.display);
    const out = action==="sqrt"?Math.sqrt(current):
      action==="percent"?current/100:current===0?NaN:1/current;
    const text = action==="sqrt"?"sqrt":
      action==="percent"?"percent":"reciproc";
    this.expression = (this.expression ? this.expression + " " : "") + text + "(" + this.display + ")";
    if (action==="reciproc" && current===0) this.fault("cannot-divide-by-zero");
    else this.numberResult(out);
    this.notify();
  }
  command(action:StandardCommand):void {
    const reset=()=>{
      this.display="0";this.expression="";this.error=null;this.entered=false;
      this.previous=null;this.operator=null;
    };
    if (action==="clearAll") reset();
    else if (action==="clearEntry") {
      if (this.error) reset();
      else { this.display="0";this.entered=false; }
    }
    else if (this.error) return;
    else if (action==="backspace") {
      if(this.entered) {
        const text=this.display.length>1?this.display.slice(0,-1):"0";
        this.display=text==="-"?"0":text;
        this.entered=true;
      }
    } else if (action==="memoryClear") this.memory=0;
    else if (action==="memoryStore") this.memory=Number(this.display);
    else if (action==="memoryRecall") this.display=String(this.memory);
    else if (action==="memoryAdd") this.memory+=Number(this.display);
    else if (action==="memorySubtract") this.memory-=Number(this.display);
    else if (action==="equals") {
      const pending=this.expression;
      if (this.operator!==null && this.previous!==null) {
        const current=Number(this.display);
        if (!this.calculate(this.previous,current,this.operator)) {this.notify();return;}
      }
      this.expression="";
      this.previous=null;this.operator=null;
      this.entered=false;
      if (this.history.length>=4096) this.history.shift();
      this.history.push(pending ? pending + " " + this.display : this.display);
    }
    this.notify();
  }
  press(button:StandardButton):void {
    if(button.type==="digit") this.digit(button.label);
    else if(button.type==="decimal") this.decimal();
    else if(button.type==="op") this.setOperator(button.op);
    else if(button.type==="func") this.func(button.action);
    else this.command(button.action);
  }
  reset():void {this.command("clearAll");this.memory=0;this.notify();}
}
