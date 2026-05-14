

const getFormGraphDatasetQuery = (count) => `
  SELECT
    fs.form_submission_id,
    fqv.form_question_id,
    fqv.answer,
    fqv.created_at,
    fs.user_id
  FROM FormSubmission fs
  JOIN FormAnswer fqv
    ON fs.form_submission_id = fqv.form_submission_id
  WHERE fs.form_template_id = ?
  AND fqv.form_question_id IN (${Array(count).fill("?").join(",")})
`;

 const getGraphDatasetQuery = (count) => {
  const placeholders = Array(count).fill("?").join(", ");

  return `
    SELECT 
      cv.client_id,
      cu.user_id, 
      cv.column_id,
      cv.row_value,
      cv.created_at
    FROM ClientCustomValue cv
    LEFT JOIN ClientUser cu
      ON cu.client_id = cv.client_id
    WHERE cv.column_id IN (${placeholders})
    ORDER BY cv.created_at;
  `;
};


const insertGraphQuery = () => {
  return `
  INSERT INTO Graph (
    company_id,
    user_id,
    graph_source,
    source_id,
    title,
    description,
    chart_type,
    x_axis,
    y_axis,
    series,
    sort_setting,
    date_setting,
    visual_setting,
    viewable_by,
    is_publish
  ) VALUES (
    ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
  );
`;
};

const updateGraphQuery = () => {
  return `
  UPDATE Graph SET
    graph_source = ?,
    source_id = ?,
    title = ?,
    description = ?,
    chart_type = ?,
    x_axis = ?,
    y_axis = ?,
    series = ?,
    sort_setting = ?,
    date_setting = ?,
    visual_setting = ?,
    viewable_by = ?,
    is_publish = ?,
    updated_at = NOW()
  WHERE graph_id = ?
    AND company_id = ?;
`;
};

const getGraphByIdQuery = () => {
  return `
  SELECT
    graph_id,
    company_id,
    user_id,
    graph_source,
    source_id,
    title,
    description,
    chart_type,
    x_axis,
    y_axis,
    series,
    sort_setting,
    date_setting,
    visual_setting,
    viewable_by,
    is_publish,
    created_at,
    updated_at
  FROM Graph
  WHERE graph_id = ?
    AND company_id = ?;
`;
};


const getGraphsBySourceQuery = ({ hasSourceId }) => {
  return `
 SELECT
    graph_id,
    title,
    description,
    chart_type,
    is_publish,
    created_at,
    updated_at
  FROM Graph
  WHERE company_id = ?
    AND graph_source = ?
    ${hasSourceId ? "AND source_id = ?" : ""}
  ORDER BY updated_at DESC
`;
};
const getPublishedGraphQuery = ({ isAdmin }) => {
  return `
    SELECT
      graph_id,
      title,
      chart_type,
      graph_source,
      source_id,
      x_axis,
      y_axis,
      series,
      sort_setting,
      date_setting,
      visual_setting,
      viewable_by
    FROM Graph
    WHERE company_id = ?
      AND is_publish = 1
      ${isAdmin ? "" : "AND JSON_CONTAINS(viewable_by, JSON_ARRAY(?))"}
    ORDER BY created_at DESC
    LIMIT ?
    OFFSET ?;
  `;
};


// AND (
//         viewable_by IS NULL
//         OR JSON_LENGTH(viewable_by) = 0
//         OR JSON_CONTAINS(viewable_by, JSON_ARRAY(?))
//       )

const deleteGraphQuery = () => {
  return `
    DELETE FROM Graph
    WHERE graph_id = ?;
`;
};

module.exports = {
  getFormGraphDatasetQuery,
  getGraphDatasetQuery,
  insertGraphQuery,
  updateGraphQuery,
  getGraphByIdQuery,
  getGraphsBySourceQuery,
  getPublishedGraphQuery,
  deleteGraphQuery
};
