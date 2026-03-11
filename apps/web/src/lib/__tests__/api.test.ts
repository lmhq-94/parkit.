import axios from "axios";
import { getApiErrorMessage } from "../api";

jest.mock("axios", () => ({
  ...jest.requireActual("axios"),
  isAxiosError: jest.fn(),
}));

const isAxiosErrorMock = axios.isAxiosError as jest.Mock;

describe("getApiErrorMessage", () => {
  it("extrae message del response.data cuando es string", () => {
    const err = Object.assign(new Error("Network"), {
      response: { data: { message: "Email already in use" } },
    });
    isAxiosErrorMock.mockReturnValue(true);
    expect(getApiErrorMessage(err)).toBe("Email already in use");
  });

  it("usa errors como string cuando message no está", () => {
    const err = Object.assign(new Error("Network"), {
      response: { data: { errors: "Validation failed" } },
    });
    isAxiosErrorMock.mockReturnValue(true);
    expect(getApiErrorMessage(err)).toBe("Validation failed");
  });

  it("devuelve 'Validation failed' cuando errors es objeto", () => {
    const err = Object.assign(new Error("Network"), {
      response: { data: { errors: { field: ["invalid"] } } },
    });
    isAxiosErrorMock.mockReturnValue(true);
    expect(getApiErrorMessage(err)).toBe("Validation failed");
  });

  it("devuelve error.message para Error estándar", () => {
    isAxiosErrorMock.mockReturnValue(false);
    expect(getApiErrorMessage(new Error("Something broke"))).toBe("Something broke");
  });

  it("devuelve 'Request failed' para valores inesperados", () => {
    isAxiosErrorMock.mockReturnValue(false);
    expect(getApiErrorMessage("string")).toBe("Request failed");
  });
});
