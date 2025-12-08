import memorialsReducer from "@/redux/memorialsSlice.js";
import { deleteMemorial } from "@/redux/memorialsSlice.js";

describe("memorialsSlice delete flow", () => {
  it("removes memorial by id when deleteMemorial fulfilled", () => {
    const prevState = {
      items: [
        { id: "x", name: "A" },
        { id: "y", name: "B" },
      ],
      loading: false,
      error: null,
    };
    const action = { type: deleteMemorial.fulfilled.type, payload: "x" };
    const next = memorialsReducer(prevState, action);
    expect(next.items.find((m) => m.id === "x")).toBeUndefined();
    expect(next.items.length).toBe(1);
  });
});
