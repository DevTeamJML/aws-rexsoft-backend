// queries/logQueries.js
const insertLogQuery = () => `
  INSERT INTO Log (
    log_id,
    company_id,
    subject_id,
    user_id,
    section,
    action,
    text,
    metadata,
    created_at
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
`;

module.exports = {
  insertLogQuery,
};
