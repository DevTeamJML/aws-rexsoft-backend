const createClientGroupQuery = () => {
  return `
    INSERT INTO ClientGroup (
      client_group_id,
      company_id, 
      user_id,
      client_group_name, 
      created_at,
      updated_at
    ) VALUES (?, ?, ?, ?, ?, ?)
  `;
};

const updateClientGroupQuery = () => {
  return `
    UPDATE ClientGroup
    SET
      client_group_name = ?,
      updated_at = ?
    WHERE
      client_group_id = ? AND company_id = ?;
  `;
};

const getAllClientGroupsQuery = () => {
  return `
    SELECT 
      g.*,
      COALESCE((
        SELECT JSON_ARRAYAGG(JSON_OBJECT(
          'column_id', cf.column_id,
          'client_group_id', cf.client_group_id,
          'label', cf.label,
          'field_type', cf.field_type,
          'multi_select_dropdown', cf.multi_select_dropdown,
          'has_others', cf.has_others,
          'permission', cf.permission,
          'width', cf.width,
          'is_required', cf.is_required,
          'allow_duplicate', cf.allow_duplicate,
          'options', cf.options,
          'is_system',cf.is_system
        ))
        FROM (
          SELECT * FROM ClientCustomField 
          WHERE client_group_id = g.client_group_id 
          ORDER BY created_at ASC
        ) AS cf
      ), '[]') AS columns
    FROM ClientGroup g
    WHERE g.company_id = ?
  `;
};

// no use
const getClientGroupByIdQuery = () => {
  return `
   SELECT 
      g.*,
      COALESCE((
        SELECT JSON_ARRAYAGG(JSON_OBJECT(
          'column_id', cf.column_id,
          'client_group_id', cf.client_group_id,
          'label', cf.label,
          'field_type', cf.field_type,
          'multi_select_dropdown', cf.multi_select_dropdown,
          'has_others', cf.has_others,
          'permission', cf.permission,
          'width', cf.width,
          'is_required', cf.is_required,
          'allow_duplicate', cf.allow_duplicate,
          'options', cf.options,
          'is_system',cf.is_system
        ))
        FROM (
          SELECT * FROM ClientCustomField 
          WHERE client_group_id = g.client_group_id 
          ORDER BY created_at ASC
        ) AS cf
      ), '[]') AS columns
    FROM ClientGroup g
    WHERE g.client_group_id = ?
  `;
};

const deleteGroupQuery = () => {
  return `
    DELETE FROM ClientGroup 
    WHERE client_group_id = ?
  `;
};

const getAllClientGroupsNameQuery = () => {
  return `
    SELECT 
      g.client_group_id,
      g.client_group_name
    FROM ClientGroup g
    WHERE g.company_id = ?
  `;
};

const getSelectedClientGroupQuery = () => {
  return `
   SELECT 
      g.*,
      COALESCE((
        SELECT JSON_ARRAYAGG(
          JSON_OBJECT(
            'column_id', cf.column_id,
            'client_group_id', cf.client_group_id,
            'label', cf.label,
            'field_type', cf.field_type,
            'multi_select_dropdown', cf.multi_select_dropdown,
            'has_others', cf.has_others,
            'permission', cf.permission,
            'width', cf.width,
            'is_required', cf.is_required,
            'allow_duplicate', cf.allow_duplicate,
            'options', cf.options,
            'is_system', cf.is_system
          )
        )
        FROM (
          SELECT * FROM ClientCustomField 
          WHERE client_group_id = g.client_group_id 
          ORDER BY created_at ASC
        ) AS cf
      ), '[]') AS columns
    FROM ClientGroup g
    WHERE g.client_group_id = ?
  `;
};

//  'filterOptions', COALESCE((
//           SELECT JSON_ARRAYAGG(cvv.row_value)
//           FROM (
//             SELECT DISTINCT cv.row_value
//             FROM ClientCustomValue cv
//             WHERE cv.column_id = cf.column_id
//               AND cv.client_group_id = cf.client_group_id
//               AND cv.row_value IS NOT NULL
//           ) AS cvv
//         ), '[]')

// queries/clientGroup.queries.js

/**
 * Clone ClientGroup (parent)
 * Returns insertId as the new client_group_id
 */
const duplicateClientGroupQuery = () => {
  return `
    INSERT INTO ClientGroup (
      client_group_id,
      company_id,
      client_group_name,
      user_id,
      created_at,
      updated_at
    )
    SELECT
      ?,                              
      company_id,
      CONCAT(client_group_name, ' (Copy)'),
      ?,
      NOW(),
      NOW()
    FROM ClientGroup
    WHERE client_group_id = ?
  `;
};

/**
 * Clone ClientCustomField (children)
 */
const duplicateClientCustomFieldsQuery = () => {
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
    )
    SELECT
      UUID(),           
      ?,                
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
      NOW(),
      NOW()
    FROM ClientCustomField
    WHERE client_group_id = ?
    ORDER BY created_at ASC
  `;
};

module.exports = {
  createClientGroupQuery,
  getClientGroupByIdQuery,
  getAllClientGroupsQuery,
  deleteGroupQuery,
  updateClientGroupQuery,
  getAllClientGroupsNameQuery,
  getSelectedClientGroupQuery,
  duplicateClientCustomFieldsQuery,
  duplicateClientGroupQuery,
};
