// queries/roleQueries.js

const getRolesWithMemberCountQuery = () => {
  return `
    SELECT
      r.role_id,
      r.role_name,
      r.color,
      r.description,
      r.is_system,
      r.created_at,
      r.updated_at,
      COALESCE(COUNT(ur.user_id), 0) AS member_count
    FROM Role r
    LEFT JOIN UserRole ur ON ur.role_id = r.role_id
    WHERE r.company_id = ?
    GROUP BY
      r.role_id, r.role_name, r.color, r.description, r.is_system, r.created_at, r.updated_at
    ORDER BY r.role_name;
  `;
};

const getRoleByIdQuery = () => {
  return `
    SELECT
      role_id,
      company_id,
      role_name,
      color,
      description,
      is_system,
      created_at,
      updated_at
    FROM Role
    WHERE role_id = ?
    LIMIT 1;
  `;
};

const getRolePermissionsQuery = () => {
  return `
    SELECT p.permission_id, p.\`key\`
    FROM RolePermission rp
    JOIN Permission p ON p.permission_id = rp.permission_id
    WHERE rp.role_id = ? AND rp.allowed = 1;
  `;
};

const getRoleMembersQuery = () => {
  return `
    SELECT u.user_id, u.first_name, u.last_name, u.email
    FROM UserRole ur
    JOIN User u ON u.user_id = ur.user_id
    WHERE ur.role_id = ?;
  `;
};

const insertRoleQuery = () => {
  return `
    INSERT INTO Role (
      role_id,
      company_id,
      role_name,
      color,
      description,
      is_system,
      created_at,
      updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?);
  `;
};

const insertRolePermissionQuery = () => {
  return `
    INSERT INTO RolePermission (role_id, permission_id, allowed)
    VALUES (?, ?, ?);
  `;
};

const deleteRolePermissionsQuery = () => {
  return `
    DELETE FROM RolePermission WHERE role_id = ?;
  `;
};


const insertUserRoleQuery = () => {
  return `
    INSERT INTO UserRole (user_role_id, user_id, role_id, assigned_at)
    VALUES (?, ?, ?, ?);
  `;
};

const deleteUserRoleQuery = () => {
  return `
    DELETE FROM UserRole WHERE user_id = ? AND role_id = ?;
  `;
};

const updateRoleQuery = () => {
  return `
    UPDATE Role
    SET role_name = ?, color = ?, description = ?, updated_at = ?
    WHERE role_id = ?;
  `;
};

const getUserRolesWithPermissionsQuery = () => {
  return `
    SELECT
      r.role_id,
      r.company_id,
      r.role_name,
      r.color,
      r.description,
      r.is_system,
      r.created_at,
      r.updated_at,
      GROUP_CONCAT(DISTINCT p.\`key\` ORDER BY p.\`key\` SEPARATOR ',') AS permissions
    FROM Role r
      INNER JOIN UserRole ur ON ur.role_id = r.role_id
      LEFT JOIN RolePermission rp ON rp.role_id = r.role_id
      LEFT JOIN Permission p ON p.permission_id = rp.permission_id
    WHERE ur.user_id = ? AND r.company_id = ?
    GROUP BY r.role_id;
  `;
};

const deleteRoleQuery = () => `
  DELETE FROM Role
  WHERE role_id = ?;
`;

module.exports = {
  deleteRoleQuery,
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
};
