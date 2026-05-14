// services/role.service.js
const { v4: uuidv4 } = require("uuid");
const getConnection = require("../db/pool");


const {
  getRolesWithMemberCountQuery,
  getRoleByIdQuery,
  getRolePermissionsQuery,
  getRoleMembersQuery,
  insertRoleQuery,
  insertRolePermissionQuery,
  deleteRolePermissionsQuery,
  insertUserRoleQuery,
  deleteUserRoleQuery,
  updateRoleQuery,
  getUserRolesWithPermissionsQuery,
  deleteRoleQuery,
} = require("../queries/roleQueries");

const { getPermissionsByKeysQuery } = require("../queries/permissionQueries");
const { getUserByIdsQuery } = require("../queries/userQueries");


async function addUserToRole({ user_id, role_id, assignedAt = new Date() }) {
  const connection = await getConnection();

  const userRoleId = uuidv4();
  const insertSql = insertUserRoleQuery();
  try {
    await connection.execute(insertSql, [
      userRoleId,
      user_id,
      role_id,
      assignedAt,
    ]);

    return userRoleId;
  } catch (err) {
    console.error("Insert error:", err);
    throw err;
  } finally {
    connection.release();
  }
}

async function getAllRoles({ company_id }) {
  const connection = await getConnection();
  try {
    const sql = getRolesWithMemberCountQuery();
    const [rows] = await connection.execute(sql, [company_id]);
    return rows;
  } catch (err) {
    console.error("getAllRoles error:", err);
    throw err;
  } finally {
    connection.release();
  }
}

async function getRoleById(role_id) {
  const connection = await getConnection();
  try {
    // Role basic data
    const roleSql = getRoleByIdQuery();
    const [roleRows] = await connection.execute(roleSql, [role_id]);
    const role = roleRows[0];
    if (!role) return null;

    // Permissions (return as array of keys)
    const permSql = getRolePermissionsQuery();
    const [permRows] = await connection.execute(permSql, [role_id]);
    const permissions = permRows.map((r) => r.key);

    // Members (user objects)
    const memberSql = getRoleMembersQuery();
    const [memberRows] = await connection.execute(memberSql, [role_id]);

    return {
      ...role,
      permissions,
      members: memberRows,
    };
  } catch (err) {
    console.error("getRoleById error:", err);
    throw err;
  } finally {
    connection.release();
  }
}


async function createRole(payload) {
  const connection = await getConnection();
  const roleId = uuidv4();
  try {
    const {
      company_id,
      name,
      color = null,
      is_system = 0,
      description = null,
      permissions = null,
      members = null,
    } = payload;

    if (!company_id || !name) {
      throw new Error("company_id and name are required to create a role");
    }

    await connection.beginTransaction();

    const insertRoleSql = insertRoleQuery();
    await connection.execute(insertRoleSql, [
      roleId,
      company_id,
      name,
      color,
      description,
      is_system, 
      new Date(),
      new Date(),
    ]);

    if (Array.isArray(permissions)) {

      if (permissions.length > 0) {
        const permSql = getPermissionsByKeysQuery(permissions.length);
        const [permRows] = await connection.execute(permSql, permissions);
        const foundKeys = new Set(permRows.map((p) => p.key));
        const missing = permissions.filter((k) => !foundKeys.has(k));
        if (missing.length > 0) {
          throw new Error(`Invalid permission keys: ${missing.join(", ")}`);
        }

        const insertRolePermSql = insertRolePermissionQuery();
        for (const p of permRows) {
          await connection.execute(insertRolePermSql, [
            roleId,
            p.permission_id,
            1,
          ]);
        }
      } 
    }

    if (Array.isArray(members) && members.length > 0) {
      // Normalize user ids
      const userIds = members
        .map((m) => (typeof m === "string" ? m : m.user_id || m.id))
        .filter(Boolean);
      if (userIds.length > 0) {
        const userSql = getUserByIdsQuery(userIds.length);
        const [userRows] = await connection.execute(userSql, userIds);
        const foundUserIds = new Set(userRows.map((u) => u.user_id));
        const invalidUsers = userIds.filter((id) => !foundUserIds.has(id));
        if (invalidUsers.length > 0) {
          throw new Error(
            `Invalid member user ids: ${invalidUsers.join(", ")}`
          );
        }

        const insertUserRoleSql = insertUserRoleQuery();
        for (const uid of userIds) {
          const urId = uuidv4();
          await connection.execute(insertUserRoleSql, [
            urId,
            uid,
            roleId,
            new Date(),
          ]);
        }
      }
    }

    await connection.commit();

    const createdRole = await getRoleById(roleId);
    return createdRole;
  } catch (err) {
    await connection.rollback();
    console.error("createRole error:", err);
    throw err;
  } finally {
    connection.release();
  }
}

async function updateRole(role_id, payload) {
  const connection = await getConnection();
  try {
    await connection.beginTransaction();


    const [existingRows] = await connection.execute(getRoleByIdQuery(), [
      role_id,
    ]);
    const existing = existingRows[0];
    if (!existing) {
      await connection.rollback();
      return null;
    }

    const { name, color, description, permissions, members = null } = payload;


    if (
      name !== undefined ||
      color !== undefined ||
      description !== undefined
    ) {
      const updateSql = updateRoleQuery();
      await connection.execute(updateSql, [
        name !== undefined ? name : existing.role_name,
        color !== undefined ? color : existing.color,
        description !== undefined ? description : existing.description,
        new Date(),
        role_id,
      ]);
    }


    if (permissions !== undefined) {
      const deleteRpSql = deleteRolePermissionsQuery();
      await connection.execute(deleteRpSql, [role_id]);

      if (Array.isArray(permissions) && permissions.length > 0) {
        const permSql = getPermissionsByKeysQuery(permissions.length);
        const [permRows] = await connection.execute(permSql, permissions);
        const foundKeys = new Set(permRows.map((p) => p.key));
        const missing = permissions.filter((k) => !foundKeys.has(k));
        if (missing.length > 0) {
          throw new Error(`Invalid permission keys: ${missing.join(", ")}`);
        }

        const insertRolePermSql = insertRolePermissionQuery();
        for (const p of permRows) {
          await connection.execute(insertRolePermSql, [
            role_id,
            p.permission_id,
            1,
          ]);
        }
      }
    }

   
    if (members !== undefined) {

      const desiredUserIds = Array.isArray(members)
        ? members
            .map((m) => (typeof m === "string" ? m : m.user_id || m.id))
            .filter(Boolean)
        : [];

      // fetch current member user_ids
      const [currentMembersRows] = await connection.execute(
        getRoleMembersQuery(),
        [role_id]
      );
      const currentUserIds = new Set(currentMembersRows.map((r) => r.user_id));

      // validate desired user ids exist (if any)
      if (desiredUserIds.length > 0) {
        const userSql = getUserByIdsQuery(desiredUserIds.length);
        const [userRows] = await connection.execute(userSql, desiredUserIds);
        const foundUserIds = new Set(userRows.map((u) => u.user_id));
        const invalidUsers = desiredUserIds.filter(
          (id) => !foundUserIds.has(id)
        );
        if (invalidUsers.length > 0) {
          throw new Error(
            `Invalid member user ids: ${invalidUsers.join(", ")}`
          );
        }
      }

      const insertUserRoleSql = insertUserRoleQuery();
      const deleteUserRoleSql = deleteUserRoleQuery();

      // Add new members
      for (const uid of desiredUserIds) {
        if (!currentUserIds.has(uid)) {
          const urId = uuidv4();
          await connection.execute(insertUserRoleSql, [
            urId,
            uid,
            role_id,
            new Date(),
          ]);
        }
      }

      // Remove members not desired
      for (const curUid of currentUserIds) {
        if (!desiredUserIds.includes(curUid)) {
          await connection.execute(deleteUserRoleSql, [curUid, role_id]);
        }
      }
    }

    await connection.commit();

    const updatedRole = await getRoleById(role_id);
    return updatedRole;
  } catch (err) {
    await connection.rollback();
    console.error("updateRole error:", err);
    throw err;
  } finally {
    connection.release();
  }
}

async function getRolesForUser({ company_id, user_id }) {
  const connection = await getConnection();
  try {
    if (!company_id || !user_id) {
      throw new Error("company_id and user_id are required");
    }

    const sql = getUserRolesWithPermissionsQuery();
    const [rows] = await connection.execute(sql, [user_id, company_id]);
    // rows: each row.permissions is a comma-separated string or null

    const roles = rows.map((r) => {
      const perms =
        r.permissions && r.permissions.length > 0
          ? r.permissions
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
          : [];
      return {
        role_id: r.role_id,
        company_id: r.company_id,
        role_name: r.role_name,
        color: r.color,
        description: r.description,
        is_system: r.is_system,
        created_at: r.created_at,
        updated_at: r.updated_at,
        permissions: perms,
      };
    });

    // compute effective permissions (union)
    const effectiveSet = new Set();
    for (const role of roles) {
      for (const k of role.permissions) effectiveSet.add(k);
    }
    const effectivePermissions = Array.from(effectiveSet);

    return {
      roles,
      effectivePermissions,
    };
  } catch (err) {
    console.error("getRolesForUser error:", err);
    throw err;
  } finally {
    connection.release();
  }
}

async function deleteRole(role_id) {
  const connection = await getConnection();
  try {
    await connection.beginTransaction();

    const [roleRows] = await connection.execute(getRoleByIdQuery(), [role_id]);
    const role = roleRows[0];
    if (!role) {
      await connection.rollback();
      return false; // caller -> 404
    }

    if (role.is_system === 1) {
      await connection.rollback();
      const err = new Error("Cannot delete system role");
      err.status = 403;
      throw err;
    }

    await connection.execute(deleteRoleQuery(), [role_id]);

    await connection.commit();
    return true;
  } catch (err) {
    await connection.rollback();
    console.error("deleteRole error:", err);
    throw err;
  } finally {
    connection.release();
  }
}

module.exports = {
  deleteRole,
  addUserToRole,
  getAllRoles,
  getRoleById,
  createRole,
  updateRole,
  getRolesForUser,
};
