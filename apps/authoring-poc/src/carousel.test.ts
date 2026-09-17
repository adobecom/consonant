import { afterEach, describe, expect, it, vi } from "vitest";
import { SocialProofCarouselController } from "../../../packages/components/src/social-proof-carousel/social-proof-carousel.js";

class ElementStub extends EventTarget {
  dataset: Record<string, unknown> = {};
  attributes = new Map<string, string>();
  style = { transition: "", transform: "", setProperty: vi.fn() };
  disabled = false;
  closest() {
    return null;
  }
  setAttribute(key: string, value: string) {
    this.attributes.set(key, value);
  }
  removeAttribute(key: string) {
    this.attributes.delete(key);
  }
}
function fixture(initial: string = "0", length = 3) {
  const el = new ElementStub();
  const track = new ElementStub();
  const prev = new ElementStub();
  const next = new ElementStub();
  const slides = Array.from({ length }, () => new ElementStub());
  const dots = Array.from({ length }, () => new ElementStub());
  el.dataset.active = initial;
  return {
    el: Object.assign(el, {
      offsetWidth: 1440,
      querySelector: (selector: string) =>
        selector === ".spc-track"
          ? track
          : selector.includes("prev")
            ? prev
            : next,
      querySelectorAll: (selector: string) =>
        selector === ".spc-slide" ? slides : dots,
    }),
    prev,
    next,
    slides,
    dots,
  };
}
afterEach(() => vi.unstubAllGlobals());
describe("shared carousel lifecycle", () => {
  it("removes all listeners and observers through 100 mount/dispose cycles", () => {
    const disconnect = vi.fn();
    vi.stubGlobal(
      "ResizeObserver",
      class {
        observe() {}
        disconnect = disconnect;
      },
    );
    const { el, next, dots } = fixture();
    for (let i = 0; i < 100; i++) {
      const controller = new SocialProofCarouselController(el);
      const advance = vi.spyOn(controller, "_advance");
      const goTo = vi.spyOn(controller, "_goTo");
      controller.destroy();
      controller.destroy();
      next.dispatchEvent(new Event("click"));
      dots[1].dispatchEvent(new Event("click"));
      el.dispatchEvent(
        Object.assign(new Event("keydown"), { key: "ArrowRight" }),
      );
      expect(advance).not.toHaveBeenCalled();
      expect(goTo).not.toHaveBeenCalled();
    }
    expect(disconnect).toHaveBeenCalledTimes(100);
  });
  it("clamps invalid/restored indexes and handles one/zero slides", () => {
    for (const initial of ["NaN", "999", "-1"]) {
      const { el } = fixture(initial, 1);
      const controller = new SocialProofCarouselController(el);
      expect(controller.activeIndex).toBe(0);
      controller.destroy();
    }
    const { el, next, prev } = fixture("0", 0);
    const controller = new SocialProofCarouselController(el);
    expect(prev.disabled && next.disabled).toBe(true);
    controller.destroy();
  });
  it("does not accumulate navigation after remounting the same element", () => {
    const { el, next, dots } = fixture();
    const old = new SocialProofCarouselController(el);
    old.destroy();
    const current = new SocialProofCarouselController(el);
    next.dispatchEvent(new Event("click"));
    expect(current.activeIndex).toBe(1);
    expect(old.activeIndex).toBe(0);
    expect(dots[1].attributes.get("aria-pressed")).toBe("true");
    current.destroy();
  });
});
