// controllers/role.controller.js
const httpStatus = require("http-status");
const catchAsync = require("../utils/catchAsync");
const { roleService } = require("../services");

/**
 * GET /api/roles?company_id=...
 * Returns list of roles for a company (for role-list).
 */
const getAllRoles = catchAsync(async (req, res) => {
  const { company_id } = req.query;

  if (!company_id) {
    return res.status(httpStatus.BAD_REQUEST).send({
      message: "Missing company_id in query parameters",
    });
  }

  const result = await roleService.getAllRoles({ company_id });

  // result expected to be an array of roles, each may include member_count
  res.status(httpStatus.OK).send(result);
});

/**
 * GET /api/roles/:role_id
 * Returns a single role with details (permissions, members, metadata).
 */
const getRoleById = catchAsync(async (req, res) => {
  const { role_id } = req.query;

  if (!role_id) {
    return res.status(httpStatus.BAD_REQUEST).send({
      message: "Missing role_id in path parameters",
    });
  }

  const role = await roleService.getRoleById(role_id);

  if (!role) {
    return res.status(httpStatus.NOT_FOUND).send({ message: "Role not found" });
  }

  res.status(httpStatus.OK).send(role);
});

/**
 * POST /api/roles
 * Creates a new role.
 * Expected body shape:
 * {
 *   company_id: string,
 *   name: string,
 *   color?: string,
 *   description?: string,
 *   permissions?: [ "manage_client", ... ]  // array of permission keys
 *   members?: [{ id, email, ... }]         // optional array of members to assign
 * }
 */
const createRole = catchAsync(async (req, res) => {
  const payload = req.body || {};
  const { company_id, name } = payload;

  if (!company_id || !name) {
    return res.status(httpStatus.BAD_REQUEST).send({
      message: "Missing required fields: company_id and name are required",
    });
  }

  try {
    const newRole = await roleService.createRole(payload);
    // return created role with 201
    res.status(httpStatus.CREATED).send(newRole);
  } catch (err) {
    console.error("Create Role Error:", err);
    // propagate error so catchAsync middleware handles it (or send server error)
    throw err;
  }
});

/**
 * PUT /api/roles/:role_id
 * Updates an existing role (name, color, permissions, members, description).
 * Body similar to createRole.
 */
const updateRole = catchAsync(async (req, res) => {
  const { role_id } = req.body;
  const payload = req.body || {};

  if (!role_id) {
    return res.status(httpStatus.BAD_REQUEST).send({
      message: "Missing role_id in path parameters",
    });
  }

  try {
    const updated = await roleService.updateRole(role_id, payload);
    if (!updated) {
      return res
        .status(httpStatus.NOT_FOUND)
        .send({ message: "Role not found" });
    }
    res.status(httpStatus.OK).send(updated);
  } catch (err) {
    console.error("Update Role Error:", err);
    throw err;
  }
});

const getRolesForUser = catchAsync(async (req, res) => {

  const company_id = req.query.company_id ?? req.body.company_id;
  const user_id = req.query.user_id ?? req.body.user_id;

  if (!company_id || !user_id) {
    return res
      .status(httpStatus.BAD_REQUEST)
      .send({ message: "company_id and user_id are required" });
  }

  const result = await roleService.getRolesForUser({ company_id, user_id });
  res.status(httpStatus.OK).send(result);
});


const deleteRole = catchAsync(async (req, res) => {
  const { role_id } = req.body;

  const deleted = await roleService.deleteRole(role_id);

  if (!deleted) {
    return res.status(404).json({ message: "Role not found" });
  }

  // 204 No Content is common for deletes
  return res.status(204).send();
});

module.exports = {
  getAllRoles,
  getRoleById,
  createRole,
  updateRole,
  getRolesForUser,
  deleteRole
};
