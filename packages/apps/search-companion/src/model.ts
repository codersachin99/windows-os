import { createSourceFindQuery, type SourceFindQuery } from "@windows-os/filesystem";

/** Pinned search-companion.js 7a5f defaults/presets. */
export type CompanionDate = "none" | "week" | "month" | "year" | "between";
export type CompanionSize = "none" | "small" | "medium" | "large" | "specify";
export interface CompanionForm {
  namePattern: string;
  scope: string;
  subfolders: boolean;
  kind: SourceFindQuery["kind"];
  dateChoice: CompanionDate;
  dateFrom: string;
  dateTo: string;
  sizeChoice: CompanionSize;
  sizeBound: "at-least" | "at-most";
  sizeKb: number;
}
function localToday(): string {
  const d = new Date();
  return [d.getFullYear(), String(d.getMonth() + 1).padStart(2,"0"),
    String(d.getDate()).padStart(2,"0")].join("-");
}
export function companionDefaults(initialScope = "", initialNamePattern = ""): CompanionForm {
  const today = localToday();
  return { namePattern: initialNamePattern, scope: initialScope, subfolders:true, kind:"",
    dateChoice:"none", dateFrom:today, dateTo:today, sizeChoice:"none",
    sizeBound:"at-least", sizeKb:0 };
}
export function companionQuery(form: CompanionForm, computerRoot: string): SourceFindQuery {
  const date: SourceFindQuery["date"] = form.dateChoice === "none" ? null
    : form.dateChoice === "between" ? {from:form.dateFrom,to:form.dateTo}
    : form.dateChoice === "week" ? {days:7}
    : form.dateChoice === "month" ? {months:1}
    : {months:12};
  const size: SourceFindQuery["size"] = form.sizeChoice === "none" ? null
    : form.sizeChoice === "small" ? {atLeast:false,kb:100}
    : form.sizeChoice === "medium" ? {atLeast:false,kb:1024}
    : form.sizeChoice === "large" ? {atLeast:true,kb:1024}
    : {atLeast:form.sizeBound==="at-least",kb:form.sizeKb||0};
  return { ...createSourceFindQuery(form.scope || computerRoot), namePattern:form.namePattern,
    subfolders:form.subfolders, kind:form.kind, date, size };
}
