const getConnection = require("../db/pool");
const { createClientCustomValueQuery } = require("../queries/clientCustomValueQueries");

const createClientCustomValue = async (body) => {
  const connection = await getConnection();
  try {
    const { client_id, client_custom_field_id, client_group_id, value, options } = body;
    const sql = createClientCustomValueQuery();
    await connection.beginTransaction();
    const [result] = await connection.execute(sql, [
      client_id,
      client_custom_field_id, 
      client_group_id,
      value,
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
  createClientCustomValue,
};
