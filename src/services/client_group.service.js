const { v4 } = require("uuid");
const getConnection = require("../db/pool");
const {
  createClientCustomFieldQuery,
  updateClientCustomFieldQuery,
  deleteCustomFieldQuery,
} = require("../queries/clientCustomFieldQueries");
const {
  createClientGroupQuery,
  getClientGroupByIdQuery,
  getAllClientGroupsQuery,
  deleteGroupQuery,
  updateClientGroupQuery,
  getAllClientGroupsNameQuery,
  getSelectedClientGroupQuery,
  duplicateClientGroupQuery,
  duplicateClientCustomFieldsQuery,
} = require("../queries/clientGroupQueries");

const duplicateClientGroup = async ({ client_group_id, user_id }) => {
  const connection = await getConnection();

  try {
    await connection.beginTransaction();

    const newClientGroupId = v4();
    await connection.execute(duplicateClientGroupQuery(), [
      newClientGroupId,
      user_id,
      client_group_id,
    ]);

    await connection.execute(duplicateClientCustomFieldsQuery(), [
      newClientGroupId,
      client_group_id,
    ]);

    const [result] = await connection.execute(getSelectedClientGroupQuery(), [
      newClientGroupId,
    ]);

    const parseResult = result[0]
      ? {
          ...result[0],
          columns: JSON.parse(result[0].columns).map((item) => {
            return item;
          }),
        }
      : {};

    await connection.commit();
    return parseResult;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

const createClientGroup = async (body) => {
  const connection = await getConnection();
  try {
    const { client_group_id, company_id, user_id, client_group_name, columns } =
      body;
    const createClientGroupSql = createClientGroupQuery();
    const createCustomFieldSql = createClientCustomFieldQuery(columns);
    const clientGroupValues = [
      client_group_id,
      company_id,
      user_id,
      client_group_name,
      new Date(),
      new Date(),
    ];

    const now = Date.now();

    const customFieldValues = columns.flatMap((obj, index) => [
      obj.column_id,
      client_group_id,
      obj.label,
      obj.field_type,
      obj.multi_select_dropdown,
      obj.has_others,
      obj.permission,
      obj.width,
      obj.is_required,
      obj.allow_duplicate,
      obj.options,
      obj.is_system ?? 0,
      new Date(now + index * 1000),
      new Date(now + index * 1000),
    ]);

    await connection.beginTransaction();
    const [result] = await connection.execute(
      createClientGroupSql,
      clientGroupValues
    );
    await connection.execute(createCustomFieldSql, customFieldValues);
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

const updateClientGroup = async (body) => {
  const connection = await getConnection();
  try {
    const { client_group_id, company_id, client_group_name, columns } = body;

    const updateGroupSQL = updateClientGroupQuery();
    const updateGroupValues = [
      client_group_name,
      new Date(),
      client_group_id,
      company_id,
    ];

    const now = new Date();

    await connection.beginTransaction();

    // Update the client group name
    await connection.execute(updateGroupSQL, updateGroupValues);

    const [existingColumns] = await connection.execute(
      `SELECT column_id FROM ClientCustomField WHERE client_group_id = ?`,
      [client_group_id]
    );

    const existingColumnIds = existingColumns.map((c) => c.column_id); // [a, b, c]
    const incomingColumnIds = columns.map((c) => c.column_id); //[a, b, d]

    // Determine which to insert, update, or delete
    const toInsert = columns.filter(
      (c) => !existingColumnIds.includes(c.column_id)
    );
    const toUpdate = columns.filter((c) =>
      existingColumnIds.includes(c.column_id)
    );
    const toDelete = existingColumnIds.filter(
      (id) => !incomingColumnIds.includes(id)
    );
    // Insert new columns
    if (toInsert.length > 0) {
      const insertCustomFieldSql = createClientCustomFieldQuery(toInsert);

      const values = toInsert.flatMap((c, index) => [
        c.column_id,
        client_group_id,
        c.label,
        c.field_type,
        c.multi_select_dropdown,
        c.has_others,
        c.permission,
        c.width,
        c.is_required,
        c.allow_duplicate,
        JSON.stringify(c.options || []),
        c.is_system ?? 0,
        new Date(now + index * 1000),
        new Date(now + index * 1000),
      ]);

      await connection.execute(insertCustomFieldSql, values);
    }

    // Update existing columns
    if (toUpdate.length > 0) {
      for (const c of toUpdate) {
        const toUpdateValues = [
          c.label,
          c.field_type,
          c.multi_select_dropdown,
          c.has_others,
          c.permission,
          c.width,
          c.is_required,
          c.allow_duplicate,
          c.options,
          now,
          c.column_id,
          client_group_id,
        ];

        const updateCustomFieldSql = updateClientCustomFieldQuery();
        await connection.execute(updateCustomFieldSql, toUpdateValues);
      }
    }

    // Delete removed columns
    if (toDelete.length > 0) {
      const deleteCustomFieldSql = deleteCustomFieldQuery(toDelete);
      await connection.execute(deleteCustomFieldSql, [
        ...toDelete,
        client_group_id,
      ]);
    }

    await connection.commit();
    return { success: true };
  } catch (err) {
    await connection.rollback();
    console.error("Update error:", err);
    throw err;
  } finally {
    connection.release();
  }
};

const getAllClientGroups = async (company_id) => {
  const connection = await getConnection();
  try {
    const getAllClientGroupSql = getAllClientGroupsQuery();
    await connection.beginTransaction();
    const [result] = await connection.execute(getAllClientGroupSql, [
      company_id,
    ]);
    const parseResult = result.map((item) => {
      const customFields = JSON.parse(item.columns);
      const parsedCustomFields = customFields.map((field) => {
        return {
          ...field,
          options: JSON.parse(field.options),
        };
      });
      return {
        ...item,
        columns: parsedCustomFields,
      };
    });

    await connection.commit();
    return parseResult;
  } catch (error) {
    await connection.rollback();
    console.error("Error in transaction:", error);
    throw error;
  } finally {
    connection.release();
  }
};

const getClientGroupById = async (body) => {
  const connection = await getConnection();
  try {
    const { client_group_id } = body;
    const getClientGroupByIdSql = getClientGroupByIdQuery();
    await connection.beginTransaction();
    const [result] = await connection.execute(getClientGroupByIdSql, [
      client_group_id,
    ]);
    const parseResult = result.map((item) => {
      return {
        ...item,
        columns: JSON.parse(item.columns),
      };
    });
    await connection.commit();
    return parseResult[0];
  } catch (error) {
    await connection.rollback();
    console.error("Error in transaction:", error);
    throw error;
  } finally {
    connection.release();
  }
};

const deleteGroupById = async (client_group_id) => {
  const connection = await getConnection();
  try {
    const deleteGroupByIdSql = deleteGroupQuery();
    await connection.beginTransaction();
    const [result] = await connection.execute(deleteGroupByIdSql, [
      client_group_id,
    ]);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    console.error("Error in transaction:", error);
    throw error;
  } finally {
    connection.release();
  }
};

const getAllClientGroupsName = async (company_id) => {
  const connection = await getConnection();
  try {
    const getAllClientGroupNamesSql = getAllClientGroupsNameQuery();
    await connection.beginTransaction();
    const [result] = await connection.execute(getAllClientGroupNamesSql, [
      company_id,
    ]);

    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    console.error("Error in transaction:", error);
    throw error;
  } finally {
    connection.release();
  }
};

const getSelectedClientGroup = async (client_group_id) => {
  const connection = await getConnection();
  try {
    const getSelectedClientGroupSql = getSelectedClientGroupQuery();
    await connection.beginTransaction();
    const [result] = await connection.execute(getSelectedClientGroupSql, [
      client_group_id,
    ]);
    const parseResult = result[0]
      ? {
          ...result[0],
          columns: JSON.parse(result[0].columns).map((item) => {
            // return { ...item, filterOptions: JSON.parse(item.filterOptions) };
            return item;
          }),
        }
      : {};

    await connection.commit();
    return parseResult;
  } catch (error) {
    await connection.rollback();
    console.error("Error in transaction:", error);
    throw error;
  } finally {
    connection.release();
  }
};

module.exports = {
  updateClientGroup,
  createClientGroup,
  getClientGroupById,
  getAllClientGroups,
  deleteGroupById,
  getAllClientGroupsName,
  getSelectedClientGroup,
  duplicateClientGroup,
};
