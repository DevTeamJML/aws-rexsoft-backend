const createClientUsersQuery = (handlerList) => {
  const placeholder = handlerList.map(() => `(?, ?, ?, ?)`).join(", ");
  return `
    INSERT INTO ClientUser (
      client_id,
      user_id,
      created_at,
      updated_at
    ) VALUES ${placeholder}
  `;
};

const deleteClientUsersQuery = () => {
  return `
    DELETE FROM ClientUser WHERE client_id = ?
  `;
};

const removeClientUserQuery = () => {
  return `
    DELETE FROM ClientUser
    WHERE user_id = ?
    AND client_id IN (
      SELECT client_id
      FROM new_crm_database.Client
      WHERE company_id = ?
    );
  `;
};

// const deleteAllClientUserQuery = (removeClientList, removeHandlerList) => {
//   const client_placeholder = removeClientList.map(() => `?`).join(", ");
//   const handler_placeholder = removeHandlerList.map(() => `?`).join(", ");
//   return `
//     DELETE FROM ClientUser WHERE client_id IN (${client_placeholder}) AND user_id IN (${handler_placeholder})
//   `;
// };

const deleteAllClientUserQuery = (pairs) => {
  if (!pairs || pairs.length === 0) return null;

  // Generate placeholders for each pair
  const placeholders = pairs.map(() => `(?, ?)`).join(", ");

  // Final SQL
  const sql = `
    DELETE FROM ClientUser
    WHERE (client_id, user_id) IN (${placeholders})
  `;

  // Flatten parameters: [{client_id, user_id}, ...] => [client_id1, user_id1, ...]
  const params = pairs.flatMap((pair) => [pair.client_id, pair.user_id]);

  return { removeHandlerSql: sql, params };
};

module.exports = {
  createClientUsersQuery,
  deleteClientUsersQuery,
  deleteAllClientUserQuery,
  removeClientUserQuery
};
