import { Router } from "express";
import { CompaniesController } from "./companies.controller";
import { requireAuth } from "../../shared/middleware/requireAuth";
import { requireCompany } from "../../shared/middleware/requireCompany";
import { requireRole } from "../../shared/middleware/requireRole";
import { validateRequest } from "../../shared/middleware/validateRequest";
import { CreateCompanySchema, UpdateCompanySchema } from "../../shared/validators";

const router = Router();

// Only SUPER_ADMIN can list all companies and create companies
router.get(
  "/",
  requireAuth,
  requireRole("SUPER_ADMIN"),
  CompaniesController.list
);

router.post(
  "/",
  validateRequest(CreateCompanySchema),
  requireAuth,
  requireRole("SUPER_ADMIN"),
  CompaniesController.create
);

// ADMIN: own company. SUPER_ADMIN: must send x-company-id to act on a company
router.get(
  "/me",
  requireAuth,
  requireCompany,
  requireRole("ADMIN"),
  CompaniesController.me
);

router.patch(
  "/me",
  validateRequest(UpdateCompanySchema),
  requireAuth,
  requireCompany,
  requireRole("ADMIN"),
  CompaniesController.update
);

router.patch(
  "/:id",
  validateRequest(UpdateCompanySchema),
  requireAuth,
  requireRole("SUPER_ADMIN"),
  CompaniesController.updateById
);

router.delete(
  "/:id",
  requireAuth,
  requireRole("SUPER_ADMIN"),
  CompaniesController.delete
);

export default router;
