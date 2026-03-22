import { create } from "zustand";

interface CompanyState {
  companyId: string | null;
  setCompanyId: (id: string | null) => void;
}

/**
 * Empresa activa para cabecera `X-Company-Id` (valets sin user.companyId en JWT).
 */
export const useCompanyStore = create<CompanyState>((set) => ({
  companyId: null,
  setCompanyId: (id) => set({ companyId: id }),
}));
