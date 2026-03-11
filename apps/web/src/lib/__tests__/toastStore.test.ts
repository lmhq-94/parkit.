import { act, renderHook } from "@testing-library/react";
import { useToastStore, useToast } from "../toastStore";

describe("toastStore", () => {
  beforeEach(() => {
    useToastStore.setState({ toasts: [] });
    jest.useFakeTimers();
  });
  afterEach(() => {
    jest.useRealTimers();
  });

  describe("useToastStore", () => {
    it("add agrega un toast y remove lo quita", () => {
      act(() => {
        useToastStore.getState().add("success", "Guardado");
      });
      expect(useToastStore.getState().toasts).toHaveLength(1);
      const id = useToastStore.getState().toasts[0].id;
      expect(useToastStore.getState().toasts[0].message).toBe("Guardado");
      expect(useToastStore.getState().toasts[0].type).toBe("success");

      act(() => {
        useToastStore.getState().remove(id);
      });
      expect(useToastStore.getState().toasts).toHaveLength(0);
    });

    it("limita a MAX_TOASTS (3) mostrando los más recientes", () => {
      act(() => {
        useToastStore.getState().add("info", "1");
        useToastStore.getState().add("info", "2");
        useToastStore.getState().add("info", "3");
        useToastStore.getState().add("info", "4");
      });
      expect(useToastStore.getState().toasts).toHaveLength(3);
      const messages = useToastStore.getState().toasts.map((t) => t.message);
      expect(messages).toEqual(["2", "3", "4"]);
    });
  });

  describe("useToast", () => {
    it("showSuccess añade toast de tipo success", () => {
      const { result } = renderHook(() => useToast());
      act(() => {
        result.current.showSuccess("Listo");
      });
      expect(useToastStore.getState().toasts[0].type).toBe("success");
      expect(useToastStore.getState().toasts[0].message).toBe("Listo");
    });
    it("showError añade toast de tipo error", () => {
      const { result } = renderHook(() => useToast());
      act(() => {
        result.current.showError("Error");
      });
      expect(useToastStore.getState().toasts[0].type).toBe("error");
    });
    it("showInfo añade toast de tipo info", () => {
      const { result } = renderHook(() => useToast());
      act(() => {
        result.current.showInfo("Info");
      });
      expect(useToastStore.getState().toasts[0].type).toBe("info");
    });
  });
});
