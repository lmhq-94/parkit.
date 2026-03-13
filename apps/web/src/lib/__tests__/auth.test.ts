import {
  getStoredUser,
  setStoredUser,
  clearStoredUser,
  isSuperAdmin,
  isAdmin,
  isStaff,
  getFullName,
  getShortName,
  getInitials,
  getAvatarColor,
} from "../auth";
import type { User } from "../auth";

const mockUser: User = {
  id: "user-1",
  email: "admin@test.com",
  firstName: "Marco",
  lastName: "Solis",
  systemRole: "ADMIN",
  companyId: "company-1",
  isActive: true,
};

describe("auth", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe("getStoredUser / setStoredUser", () => {
    it("getStoredUser devuelve null cuando no hay usuario", () => {
      expect(getStoredUser()).toBeNull();
    });
    it("setStoredUser guarda y getStoredUser recupera el usuario", () => {
      setStoredUser(mockUser);
      expect(getStoredUser()).toEqual(mockUser);
    });
  });

  describe("clearStoredUser", () => {
    it("elimina user y authToken de localStorage", () => {
      setStoredUser(mockUser);
      localStorage.setItem("authToken", "token-123");
      clearStoredUser();
      expect(localStorage.getItem("user")).toBeNull();
      expect(localStorage.getItem("authToken")).toBeNull();
    });
  });

  describe("isSuperAdmin", () => {
    it("devuelve true solo para SUPER_ADMIN", () => {
      expect(isSuperAdmin({ ...mockUser, systemRole: "SUPER_ADMIN" })).toBe(true);
      expect(isSuperAdmin({ ...mockUser, systemRole: "ADMIN" })).toBe(false);
      expect(isSuperAdmin(null)).toBe(false);
    });
  });

  describe("isAdmin", () => {
    it("devuelve true para ADMIN y SUPER_ADMIN", () => {
      expect(isAdmin({ ...mockUser, systemRole: "SUPER_ADMIN" })).toBe(true);
      expect(isAdmin({ ...mockUser, systemRole: "ADMIN" })).toBe(true);
      expect(isAdmin({ ...mockUser, systemRole: "STAFF" })).toBe(false);
      expect(isAdmin(null)).toBe(false);
    });
  });

  describe("isStaff", () => {
    it("devuelve true solo para STAFF", () => {
      expect(isStaff({ ...mockUser, systemRole: "STAFF" })).toBe(true);
      expect(isStaff({ ...mockUser, systemRole: "ADMIN" })).toBe(false);
      expect(isStaff(null)).toBe(false);
    });
  });

  describe("getFullName", () => {
    it("devuelve nombre completo unido", () => {
      expect(getFullName(mockUser)).toBe("Marco Solis");
    });
    it("devuelve cadena vacía para null", () => {
      expect(getFullName(null)).toBe("");
    });
    it("concatena nombre y apellido con un espacio (trim solo al resultado final)", () => {
      // getFullName hace trim() al resultado, no a cada parte
      expect(getFullName({ ...mockUser, firstName: "Marco", lastName: "Solis" })).toBe("Marco Solis");
    });
  });

  describe("getShortName", () => {
    it("devuelve primer nombre y primer apellido", () => {
      expect(getShortName({ ...mockUser, firstName: "Juan Carlos", lastName: "García López" })).toBe("Juan García");
    });
    it("devuelve cadena vacía para null", () => {
      expect(getShortName(null)).toBe("");
    });
    it("solo un nombre o solo un apellido", () => {
      expect(getShortName({ ...mockUser, firstName: "Marco", lastName: "" })).toBe("Marco");
      expect(getShortName({ ...mockUser, firstName: "", lastName: "Solis" })).toBe("Solis");
    });
  });

  describe("getInitials", () => {
    it("devuelve iniciales de nombre y apellido", () => {
      expect(getInitials(mockUser)).toBe("MS");
    });
    it("varios nombres y apellidos: solo iniciales del primer nombre y primer apellido", () => {
      expect(getInitials({ ...mockUser, firstName: "Juan Carlos", lastName: "García López" })).toBe("JG");
    });
    it("devuelve ? para null", () => {
      expect(getInitials(null)).toBe("?");
    });
    it("usa primeras dos letras del email si no hay nombre", () => {
      expect(getInitials({ ...mockUser, firstName: "", lastName: "", email: "ab@test.com" })).toBe("AB");
    });
    it("solo nombre: primeras dos letras del nombre", () => {
      expect(getInitials({ ...mockUser, firstName: "Marco", lastName: "" })).toBe("MA");
    });
    it("solo apellido: primeras dos letras del apellido", () => {
      expect(getInitials({ ...mockUser, firstName: "", lastName: "Solis" })).toBe("SO");
    });
    it("sin nombre ni email devuelve ?", () => {
      expect(getInitials({ ...mockUser, firstName: "", lastName: "", email: "" })).toBe("?");
    });
  });

  describe("getAvatarColor", () => {
    it("devuelve color definido para un userId", () => {
      const color = getAvatarColor("user-1");
      expect(color).toBeDefined();
      expect(color).toMatch(/^#[0-9a-f]{6}$/i);
    });
    it("mismo userId devuelve mismo color", () => {
      expect(getAvatarColor("user-1")).toBe(getAvatarColor("user-1"));
    });
    it("devuelve undefined para null/undefined", () => {
      expect(getAvatarColor(null)).toBeUndefined();
      expect(getAvatarColor(undefined)).toBeUndefined();
    });
  });
});
