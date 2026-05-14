// queries/permissionQueries.js

/**
 * Build a query to select permissions by keys.
 * Usage:
 *   const sql = getPermissionsByKeysQuery(keys.length);
 *   const [rows] = await connection.execute(sql, keys);
 */
const getPermissionsByKeysQuery = (numKeys) => {
  if (!numKeys || numKeys <= 0) {
    // return an empty-safe query (will return no rows)
    return `SELECT permission_id, \`key\` FROM Permission WHERE 0 = 1;`;
  }
  const placeholders = new Array(numKeys).fill("?").join(",");
  return `SELECT permission_id, \`key\` FROM Permission WHERE \`key\` IN (${placeholders});`;
};

module.exports = {
  getPermissionsByKeysQuery,
};
