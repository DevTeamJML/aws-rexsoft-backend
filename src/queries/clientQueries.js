const bulkCreateClientQuery = (client_list) => {
  const placeholder = Array(client_list.length)
    .fill(`(?, ?, ?, ?, ?, ?)`)
    .join(", ");

  return `
    INSERT INTO Client (
      client_id,
      user_id, 
      client_group_id, 
      company_id,
      created_at,
      updated_at
    ) VALUES ${placeholder}
  `;
};

const createClientQuery = () => {
  return `
    INSERT INTO Client (
      client_id,
      user_id, 
      client_group_id, 
      company_id,
      created_at,
      updated_at
    ) VALUES (?, ?, ?, ?, ?, ?)
  `;
};

const getClientDataByClientIdQuery = () => {
  return `
    SELECT 
        c.*,
        (
            SELECT GROUP_CONCAT(DISTINCT cu.user_id SEPARATOR ', ')
            FROM ClientUser cu
            WHERE cu.client_id = c.client_id
        ) AS handler_id,
        (
            SELECT GROUP_CONCAT(
              DISTINCT CONCAT_WS(' ', u.first_name, u.last_name)
              SEPARATOR ', '
            )
            FROM ClientUser cu
            JOIN User u ON u.user_id = cu.user_id
            WHERE cu.client_id = c.client_id
        ) AS handler_name,
        COALESCE(
            (
                SELECT JSON_ARRAYAGG(JSON_OBJECT(
                    'client_custom_value_id', cv.client_custom_value_id,
                    'client_id', cv.client_id,
                    'column_id', cv.column_id,
                    'client_group_id', cv.client_group_id,
                    'row_value', cv.row_value
                ))
                FROM ClientCustomValue cv
                WHERE cv.client_id = c.client_id
            ),
            '[]'
        ) AS raw
    FROM 
        Client c
    WHERE 
        c.client_id = ?
  `;
};

const getClientIdsByGroupIdQuery = (
  whereClause = "",
  orderByClause = "",
  joinClause = "",
  limit,
  offset,
) => {
  const limitClause =
    typeof limit === "number" && limit > 0 && typeof offset === "number"
      ? `LIMIT ${limit} OFFSET ${offset}`
      : "";

  return `
    SELECT c.client_id
    FROM Client c

    ${joinClause}  

    WHERE 
      c.client_group_id = ?
      ${whereClause}

    ${orderByClause || "ORDER BY c.client_id DESC"}
    ${limitClause}
  `;
};

const getAllClientByGroupIdQuery = (clientIds = []) => {
  const placeholders = clientIds.map(() => "?").join(",");

  return ` SELECT 
        c.*,
        GROUP_CONCAT(DISTINCT cu.user_id) AS handler_id,
        GROUP_CONCAT(DISTINCT CONCAT_WS(' ', u.first_name, u.last_name)) AS handler_name
      FROM Client c
      LEFT JOIN ClientUser cu ON cu.client_id = c.client_id
      LEFT JOIN User u ON u.user_id = cu.user_id
      WHERE c.client_id IN (${placeholders})
      GROUP BY c.client_id`;
};

const getAllClientByGroupIdCountQuery = (whereClause = "") => {
  return `
    SELECT COUNT(*) AS client_count
    FROM Client c
    WHERE c.client_group_id = ?
    ${whereClause}
  `;
};

const deleteClientQuery = () => {
  return `
    DELETE FROM Client WHERE client_id = ? AND client_group_id = ?
  `;
};

const bulkDeleteClientQuery = (client_id_list) => {
  const placeholder = client_id_list.map(() => "?").join(", ");

  return `
    DELETE FROM Client WHERE client_id IN (${placeholder}) AND client_group_id = ?
  `;
};

const checkDuplicateQuery = () => {
  return `
    SELECT COUNT(1) AS count
    FROM ClientCustomValue
    WHERE client_group_id = ?
      AND column_id = ?
      AND row_value = ?
      AND client_id != ?
  `;
};

const softDeleteClientQuery = () => {
  return `
    UPDATE Client 
    SET status = 'archived', updated_at = ?
    WHERE client_id = ? AND client_group_id = ?
  `;
};

const bulkSoftDeleteClientQuery = (client_id_list) => {
  const placeholder = client_id_list.map(() => "?").join(", ");

  return `
    UPDATE Client
    SET status = 'archived', updated_at = ?
    WHERE client_id IN (${placeholder}) AND client_group_id = ?
  `;
};

const restoreClientQuery = () => {
  return `
    UPDATE Client
    SET status = 'active', updated_at = ?
    WHERE client_id = ? AND client_group_id = ?
  `;
};

const bulkRestoreClientQuery = (client_id_list) => {
  const placeholder = client_id_list.map(() => "?").join(", ");

  return `
    UPDATE Client
    SET status = 'active', updated_at = ?
    WHERE client_id IN (${placeholder}) AND client_group_id = ?
  `;
};

module.exports = {
  deleteClientQuery,
  bulkDeleteClientQuery,
  createClientQuery,
  getAllClientByGroupIdQuery,
  getClientDataByClientIdQuery,
  bulkCreateClientQuery,
  getAllClientByGroupIdCountQuery,
  checkDuplicateQuery,
  softDeleteClientQuery,
  bulkSoftDeleteClientQuery,
  restoreClientQuery,
  bulkRestoreClientQuery,
  getClientIdsByGroupIdQuery,
};
