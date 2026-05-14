// queries/logQueries.js
const insertLeaderQuery = () => `
  INSERT INTO Leader (
    leader_id,
    user_id,
    company_id,
    created_at,
    updated_at

  ) VALUES (?,?,?,?, ?);
`;

const insertLeaderUserQuery = () => `
  INSERT INTO LeaderUser (
    leader_user_id,
    leader_id,
    user_id
  ) VALUES (?, ?, ?);
`;

const updateLeaderQuery = () => `
  UPDATE Leader
  SET
    user_id = ?,
    company_id = ?,
    updated_at = ?
  WHERE leader_id = ?;
`;

const deleteLeaderUsersByLeaderIdQuery = () => `
  DELETE FROM LeaderUser
  WHERE leader_id = ?;
`;

const getAllLeaderQuery = () => `
  SELECT
    l.leader_id,
    l.user_id,
    l.company_id,

    leader_user.first_name AS leader_first_name,
    leader_user.last_name AS leader_last_name,
    lu.user_id AS member_user_id,

    member_user.first_name AS member_first_name,
    member_user.last_name AS member_last_name

  FROM Leader l

  LEFT JOIN User leader_user
    ON leader_user.user_id = l.user_id

  LEFT JOIN LeaderUser lu
    ON lu.leader_id = l.leader_id

  LEFT JOIN User member_user
    ON member_user.user_id = lu.user_id

  WHERE l.company_id = ?
`;

const deleteLeaderQuery = () => `
  DELETE FROM Leader
  WHERE leader_id = ?;
`;

module.exports = {
  insertLeaderQuery,
  insertLeaderUserQuery,
  updateLeaderQuery,
  deleteLeaderUsersByLeaderIdQuery,
  getAllLeaderQuery,
  deleteLeaderQuery
};
