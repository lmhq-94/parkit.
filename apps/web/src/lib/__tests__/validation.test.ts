import {
  required,
  email,
  minLength,
  maxLength,
  selectRequired,
  plate,
  phone,
} from "../validation";

const t: (key: string, vars?: Record<string, string | number>) => string = (
  key,
  vars
) => {
  const messages: Record<string, string> = {
    "validation.required": "Este campo es obligatorio.",
    "validation.invalidEmail": "Correo electrónico no válido.",
    "validation.minLength": `Mínimo ${vars?.min ?? "?"} caracteres.`,
    "validation.maxLength": `Máximo ${vars?.max ?? "?"} caracteres.`,
    "validation.selectRequired": "Selecciona una opción.",
    "validation.invalidPlate": "Formato de placa no válido.",
    "validation.invalidPhone": "Formato de teléfono no válido.",
  };
  return messages[key] ?? key;
};

describe("validation", () => {
  describe("required", () => {
    it("devuelve error cuando value es null", () => {
      expect(required(t, null)).toBe("Este campo es obligatorio.");
    });
    it("devuelve error cuando value es undefined", () => {
      expect(required(t, undefined)).toBe("Este campo es obligatorio.");
    });
    it("devuelve error cuando value es string vacío", () => {
      expect(required(t, "")).toBe("Este campo es obligatorio.");
    });
    it("devuelve error cuando value es solo espacios", () => {
      expect(required(t, "   ")).toBe("Este campo es obligatorio.");
    });
    it("devuelve null cuando value tiene contenido", () => {
      expect(required(t, "texto")).toBeNull();
      expect(required(t, " a ")).toBeNull();
    });
  });

  describe("email", () => {
    it("devuelve null para string vacío (opcional)", () => {
      expect(email(t, "")).toBeNull();
      expect(email(t, "   ")).toBeNull();
      expect(email(t, null)).toBeNull();
    });
    it("devuelve null para emails válidos", () => {
      expect(email(t, "a@b.co")).toBeNull();
      expect(email(t, "user@domain.com")).toBeNull();
      expect(email(t, "user.name+tag@sub.domain.org")).toBeNull();
    });
    it("devuelve error para emails inválidos", () => {
      expect(email(t, "invalid")).toBe("Correo electrónico no válido.");
      expect(email(t, "@domain.com")).toBe("Correo electrónico no válido.");
      expect(email(t, "user@")).toBe("Correo electrónico no válido.");
      expect(email(t, "user@.com")).toBe("Correo electrónico no válido.");
    });
  });

  describe("minLength", () => {
    it("devuelve error cuando la longitud es menor que min", () => {
      expect(minLength(t, "ab", 3)).toBe("Mínimo 3 caracteres.");
      expect(minLength(t, "", 1)).toBe("Mínimo 1 caracteres.");
    });
    it("devuelve null cuando la longitud es >= min", () => {
      expect(minLength(t, "abc", 3)).toBeNull();
      expect(minLength(t, "abcd", 3)).toBeNull();
    });
  });

  describe("maxLength", () => {
    it("devuelve error cuando la longitud es mayor que max", () => {
      expect(maxLength(t, "abcd", 3)).toBe("Máximo 3 caracteres.");
    });
    it("devuelve null cuando la longitud es <= max", () => {
      expect(maxLength(t, "ab", 3)).toBeNull();
      expect(maxLength(t, "abc", 3)).toBeNull();
    });
    it("trata null/undefined como string vacío (longitud 0)", () => {
      expect(maxLength(t, null, 5)).toBeNull();
      expect(maxLength(t, undefined, 5)).toBeNull();
    });
  });

  describe("selectRequired", () => {
    it("devuelve error cuando value es null, undefined o vacío", () => {
      expect(selectRequired(t, null)).toBe("Selecciona una opción.");
      expect(selectRequired(t, undefined)).toBe("Selecciona una opción.");
      expect(selectRequired(t, "")).toBe("Selecciona una opción.");
      expect(selectRequired(t, "   ")).toBe("Selecciona una opción.");
    });
    it("devuelve null cuando value tiene contenido", () => {
      expect(selectRequired(t, "opt1")).toBeNull();
    });
  });

  describe("plate", () => {
    it("devuelve null para string vacío (opcional)", () => {
      expect(plate(t, "")).toBeNull();
      expect(plate(t, null)).toBeNull();
    });
    it("devuelve null para placas válidas (3-15 caracteres alfanuméricos)", () => {
      expect(plate(t, "ABC123")).toBeNull();
      expect(plate(t, "ABC-123")).toBeNull();
      expect(plate(t, "123")).toBeNull();
      expect(plate(t, "ABC")).toBeNull();
    });
    it("devuelve error para placas inválidas", () => {
      expect(plate(t, "AB")).toBe("Formato de placa no válido.");
      expect(plate(t, "!!")).toBe("Formato de placa no válido.");
      expect(plate(t, "A".repeat(16))).toBe("Formato de placa no válido.");
    });
  });

  describe("phone", () => {
    it("devuelve null para string vacío (opcional)", () => {
      expect(phone(t, "")).toBeNull();
      expect(phone(t, null)).toBeNull();
    });
    it("devuelve null para teléfonos con 10-15 dígitos", () => {
      expect(phone(t, "50662164040")).toBeNull();
      expect(phone(t, "1234567890")).toBeNull();
      expect(phone(t, "+506 6216-4040")).toBeNull();
    });
    it("devuelve error cuando hay menos de 10 dígitos", () => {
      expect(phone(t, "123456789")).toBe("Formato de teléfono no válido.");
    });
    it("devuelve error cuando hay más de 15 dígitos", () => {
      expect(phone(t, "1234567890123456")).toBe("Formato de teléfono no válido.");
    });
  });
});
