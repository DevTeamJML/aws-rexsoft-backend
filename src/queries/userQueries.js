const getUserByIdQuery = () => {
  return `
    SELECT user_id, first_name, last_name FROM User WHERE user_id = ?
  `;
};

const createUserQuery = () => {
  return `
    INSERT INTO User (
      user_id,
      first_name, 
      last_name, 
      email, 
      created_at, 
      updated_at
    ) VALUES (?, ?, ?, ?, ?, ?)
  `;
};

/**
 * Build a query to select users by a list of user ids.
 * Usage:
 *   const sql = getUserByIdsQuery(ids.length);
 *   const [rows] = await connection.execute(sql, ids);
 */
const getUserByIdsQuery = (numIds) => {
  if (!numIds || numIds <= 0) {
    return `SELECT user_id, first_name, last_name, email FROM User WHERE 0 = 1;`;
  }
  const placeholders = new Array(numIds).fill("?").join(",");
  return `SELECT user_id, first_name, last_name, email FROM User WHERE user_id IN (${placeholders});`;
};

const updateUserQuery = () => `
  UPDATE User
  SET first_name = ?, last_name = ?, email = ?, updated_at = ?
  WHERE user_id = ?
`;

module.exports = {
  getUserByIdQuery,
  createUserQuery,
  getUserByIdsQuery,
  updateUserQuery
};
