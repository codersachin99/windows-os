import {afterEach,beforeEach,describe,expect,it,vi} from "vitest";
import {
  SOURCE_SEARCH_DEBOUNCE_MS,sourceCreateDelayedSearch
} from "./sourceDelayedSearch";

describe("pinned webpack 1902 delayed source search",()=>{
  beforeEach(()=>vi.useFakeTimers());
  afterEach(()=>vi.useRealTimers());
  it("uses the source default 300ms for nonempty typing",()=>{
    expect(SOURCE_SEARCH_DEBOUNCE_MS).toBe(300);
    const receive=vi.fn();
    const delayed=sourceCreateDelayedSearch(receive);
    delayed.type("s");
    vi.advanceTimersByTime(299);
    expect(receive).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(receive).toHaveBeenCalledTimes(1);
    expect(receive).toHaveBeenCalledWith("s");
    delayed.cancel();
  });
  it("replaces older scheduled terms with latest input",()=>{
    const receive=vi.fn();
    const delayed=sourceCreateDelayedSearch(receive);
    delayed.type("de");
    vi.advanceTimersByTime(150);
    delayed.type("def");
    vi.advanceTimersByTime(299);
    expect(receive).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(receive).toHaveBeenCalledTimes(1);
    expect(receive).toHaveBeenCalledWith("def");
    delayed.cancel();
  });
  it("publishes clearing immediately and cancels a pending query",()=>{
    const receive=vi.fn();
    const delayed=sourceCreateDelayedSearch(receive);
    delayed.type("pending");
    delayed.type("");
    expect(receive).toHaveBeenCalledTimes(1);
    expect(receive).toHaveBeenCalledWith("");
    vi.advanceTimersByTime(500);
    expect(receive).toHaveBeenCalledTimes(1);
  });
  it("source now() emits only when not equal to last delivered value",()=>{
    const receive=vi.fn();
    const delayed=sourceCreateDelayedSearch(receive);
    delayed.type("first");
    expect(delayed.now("first")).toBe(true);
    expect(delayed.now("first")).toBeUndefined();
    expect(receive).toHaveBeenCalledTimes(1);
    expect(receive).toHaveBeenCalledWith("first");
    vi.runAllTimers();
    expect(receive).toHaveBeenCalledTimes(1);
    expect(delayed.now("second")).toBe(true);
  });
  it("cancels pending delivery when a window unmounts",()=>{
    const receive=vi.fn();
    const delayed=sourceCreateDelayedSearch(receive);
    delayed.type("orphaned");
    delayed.cancel();
    vi.runAllTimers();
    expect(receive).not.toHaveBeenCalled();
  });
});
