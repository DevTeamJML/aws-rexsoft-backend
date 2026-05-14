const createInvitationQuery = () => {
  return `
    INSERT INTO Invitation (
      invitation_id,
      company_id,
      first_name,
      email,
      is_admin,
      status,
      created_at,
      updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;
};

const getInvitationByIdQuery = () => {
  return `
   SELECT 
      i.*,
        c.company_name,
        u.user_id,
            CASE 
            WHEN u.user_id IS NOT NULL THEN TRUE
            ELSE FALSE
        END AS user_exists
    FROM Invitation i
    JOIN Company c 
        ON i.company_id = c.company_id
    LEFT JOIN User u
        ON u.email = i.email
    WHERE i.invitation_id = ?
  `;
};

const removeInvitationQuery = () => {
  return `
    DELETE FROM Invitation WHERE invitation_id = ?
  `;
};

const rejectInvitationQuery = () => {
  return `
    UPDATE Invitation SET status = 'reject' WHERE invitation_id = ?
  `;
};

const resendInvitationQuery = () => {
  return `
    UPDATE Invitation SET status = 'pending' WHERE invitation_id = ?
  `;
};

const getAllInvitationAndUserQuery = () => {
  return `
   SELECT 
        u.user_id AS id,
        u.first_name,
        u.last_name,
        u.email,
        'active' AS status
    FROM CompanyUser cu
    JOIN User u
        ON cu.user_id = u.user_id
    WHERE cu.company_id = ?
    AND is_owner != 1
    UNION ALL
    SELECT 
        i.invitation_id AS id,
        i.first_name,
        NULL AS last_name,
        i.email,
        'pending' AS status
    FROM Invitation i
    WHERE i.company_id = ?;

  `;
};

// SELECT 
//         u.user_id AS id,
//         u.first_name,
//         u.last_name,
//         u.email,
//         'active' AS status
//     FROM CompanyUser cu
//     JOIN User u
//         ON cu.user_id = u.user_id
//     WHERE cu.company_id = ?
//     AND is_owner != 1
//     UNION ALL
//     SELECT 
//         i.invitation_id AS id,
//         i.first_name,
//         NULL AS last_name,
//         i.email,
//         'pending' AS status
//     FROM Invitation i
//     LEFT JOIN User u
//         ON i.email = u.email
//     WHERE i.company_id = ?
//       AND u.user_id IS NULL;


module.exports = {
  getAllInvitationAndUserQuery,
  getInvitationByIdQuery,
  createInvitationQuery,
  removeInvitationQuery,
  rejectInvitationQuery,
  resendInvitationQuery,
};
