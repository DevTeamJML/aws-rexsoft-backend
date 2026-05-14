const getConnection = require("../db/pool");
const { createClientCustomFieldQuery } = require("../queries/clientCustomFieldQueries");

const createClientCustomField = async (body) => {
  const connection = await getConnection();
  try {
    const { client_group_id, name, field_type, options, is_system = 0 } = body;
    const sql = createClientCustomFieldQuery();
    await connection.beginTransaction();
    const [result] = await connection.execute(sql, [
      client_group_id,
      name,
      field_type,
      options,
      is_system,
      new Date(),
      new Date(),
    ]);
    await connection.commit();
    return result[0];
  } catch (error) {
    await connection.rollback();
    console.error("Error in transaction:", error);
    throw error;
  } finally {
    connection.release();
  }
};

module.exports = {
  createClientCustomField,
};
