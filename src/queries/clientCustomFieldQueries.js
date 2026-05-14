const createClientCustomFieldQuery = (columns) => {
  const placeholder = columns
    .map(() => `(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .join(", ");

  return `
    INSERT INTO ClientCustomField (
      column_id,
      client_group_id,
      label,  
      field_type, 
      multi_select_dropdown,
      has_others,
      permission,
      width,
      is_required,
      allow_duplicate,
      options, 
      is_system,
      created_at, 
      updated_at
    ) VALUES ${placeholder}
  `;
};

const updateClientCustomFieldQuery = () => {
  return `UPDATE ClientCustomField SET
          label = ?, field_type = ?, multi_select_dropdown = ?, has_others = ?,permission = ?, width = ?, is_required = ?, allow_duplicate = ?, options = ?, updated_at = ?
         WHERE column_id = ? AND client_group_id = ?`;
};

const deleteCustomFieldsByGroupQuery = () => {
  return `DELETE FROM ClientCustomField WHERE client_group_id = ?;`;
};

const deleteCustomFieldQuery = (columns) => {
  const placeholders = columns.map(() => "?").join(", ");
  return `DELETE FROM ClientCustomField WHERE column_id IN (${placeholders}) AND client_group_id = ?`;
};
module.exports = {
  createClientCustomFieldQuery,
  updateClientCustomFieldQuery,
  deleteCustomFieldsByGroupQuery,
  deleteCustomFieldQuery,
};
