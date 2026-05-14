const createCompanyUserQuery = () => {
  return `
    INSERT INTO CompanyUser (
      company_id,
      user_id,
      is_owner,
      created_at,
      updated_at
    ) VALUES (?, ?, ?, ?, ?)
  `;
};

const removeCompanyUserQuery = () => {
  return `
    DELETE FROM CompanyUser WHERE user_id = ? AND company_id = ?
  `;
};

const getAllCompanyUsersQuery = () => {
  return `
    SELECT 
    cu.user_id,
    COALESCE(u.first_name, '') AS first_name,
    COALESCE(u.last_name, '') AS last_name,
    u.email,
    cu.is_owner
FROM CompanyUser cu
LEFT JOIN User u
ON cu.user_id = u.user_id
WHERE company_id = ?
  `;
};

module.exports = {
  removeCompanyUserQuery,
  createCompanyUserQuery,
  getAllCompanyUsersQuery,
};
