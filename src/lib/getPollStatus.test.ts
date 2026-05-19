import { describe, expect, it } from "vitest";

import { getPollStatus } from "./getPollStatus";

describe("getPollStatus", () => {
  it("retorna não iniciado", () => {
    expect(
      getPollStatus(
        "2099-01-01T10:00",
        "2099-01-02T10:00"
      )
    ).toBe("não iniciado");
  });

  it("retorna finalizado", () => {
    expect(
      getPollStatus(
        "2020-01-01T10:00",
        "2020-01-02T10:00"
      )
    ).toBe("finalizado");
  });
});