const express = require("express");
const roleController = require("../../controllers/role.controller");

const router = express.Router();

/**
 * GET /api/roles?company_id=...
 * Retrieve all roles for a company
 */
router.get("/roles", roleController.getAllRoles);

/**
 * GET /api/roles/get-role?role_id=...
 * Retrieve one role (permissions + members)
 */
router.get("/get-role", roleController.getRoleById);

/**
 * POST /api/roles/create
 * Create a new role
 */
router.post("/create", roleController.createRole);

/**
 * POST /api/roles/update
 * Update a role (role_id inside req.body)
 */
router.post("/update", roleController.updateRole);

router.get("/get-user-role", roleController.getRolesForUser);

router.post("/delete", roleController.deleteRole);

module.exports = router;
