const moment = require("moment/moment");
const csv = require("fast-csv");
const getConnection = require("../db/pool");
const {
  createClientCustomValueQuery,
  updateClientCustomValueQuery,
  bulkUpdateClientCustomValueQuery,
  bulkUpdateClientAlertValueQuery,
} = require("../queries/clientCustomValueQueries");
const {
  getAllClientByGroupIdQuery,
  createClientQuery,
  deleteClientQuery,
  bulkDeleteClientQuery,
  getClientDataByClientIdQuery,
  bulkCreateClientQuery,
  getAllClientByGroupIdCountQuery,
  checkDuplicateQuery,
  softDeleteClientQuery,
  bulkSoftDeleteClientQuery,
  bulkRestoreClientQuery,
  restoreClientQuery,
  getClientIdsByGroupIdQuery,
} = require("../queries/clientQueries");
const {
  createClientUsersQuery,
  deleteClientUsersQuery,
  deleteAllClientUserQuery,
} = require("../queries/clientUserQueries");
const buildWhereClause = require("../utils/filterBuilder");
const buildOrderByClause = require("../utils/sortBuilder");

const ExcelJS = require("exceljs");

const bulkUpdateClient = async (body, opts = {}) => {
  const { batchSize = 10, retries = 5, baseDelayMs = 100 } = opts;

  /**
   * Detect MySQL deadlock / lock wait timeout
   */
  function isMySQLDeadlockError(err) {
    if (!err) return false;
    const deadlockErrnos = [1213, 1205];
    const deadlockCodes = ["ER_LOCK_DEADLOCK", "ER_LOCK_WAIT_TIMEOUT"];
    return (
      deadlockErrnos.includes(err.errno) || deadlockCodes.includes(err.code)
    );
  }

  function sleep(ms) {
    return new Promise((res) => setTimeout(res, ms));
  }

  function chunkArray(arr, size) {
    if (!Array.isArray(arr) || arr.length === 0) return [];
    const out = [];
    for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
    return out;
  }

  const connection = await getConnection();

  try {
    const {
      client_id_list = [],
      add_handler_list = [],
      remove_handler_list = [],
      custom_values = [],
      alert_values = [],
      client_group_id,
    } = body;

    // Quick no-op
    if (
      client_id_list.length === 0 &&
      add_handler_list.length === 0 &&
      remove_handler_list.length === 0 &&
      custom_values.length === 0 &&
      alert_values.length === 0
    ) {
      connection.release();
      return { success: true };
    }

    // Normalize / sort lists by client_id to reduce lock inversion across concurrent writers
    // If items are simple IDs, sort directly; if objects, sort by client_id property.
    const sortedClientIds = Array.from(client_id_list || [])
      .slice()
      .sort();

    const sortByClientId = (a, b) => {
      const aId = a && (a.client_id ?? a);
      const bId = b && (b.client_id ?? b);
      if (aId === bId) return 0;
      return aId < bId ? -1 : 1;
    };

    const sortedCustomValues = (custom_values || [])
      .slice()
      .sort(sortByClientId);
    const sortedAlertValues = (alert_values || []).slice().sort(sortByClientId);
    const sortedAddHandlers = (add_handler_list || [])
      .slice()
      .sort(sortByClientId);
    const sortedRemoveHandlers = (remove_handler_list || [])
      .slice()
      .sort(sortByClientId);

    // Chunk everything by batchSize
    const clientIdChunks = chunkArray(sortedClientIds, batchSize);
    const customValueChunks = chunkArray(sortedCustomValues, batchSize);
    const alertValueChunks = chunkArray(sortedAlertValues, batchSize);
    const addHandlerChunks = chunkArray(sortedAddHandlers, batchSize);
    const removeHandlerChunks = chunkArray(sortedRemoveHandlers, batchSize);

    // Helper to run one SQL (returned by builder) in a short transaction with retry on deadlock
    async function runSqlWithRetry(buildQueryAndParamsForBatch) {
      let attempt = 0;
      while (true) {
        attempt++;
        try {
          const { query, values } = buildQueryAndParamsForBatch();
          // If no query (nothing to do) just return
          if (!query) return null;

          await connection.beginTransaction();
          const [res] = await connection.execute(query, values);
          await connection.commit();
          return res;
        } catch (err) {
          try {
            await connection.rollback();
          } catch (e) {
            // ignore rollback errors
          }

          if (isMySQLDeadlockError(err) && attempt <= retries) {
            // exponential backoff + jitter
            const delay = Math.floor(baseDelayMs * Math.pow(2, attempt - 1));
            const jitter = Math.floor(Math.random() * 100);
            console.warn(
              `Deadlock on attempt ${attempt}. Retrying after ${
                delay + jitter
              }ms.`,
              { code: err.code, errno: err.errno },
            );
            await sleep(delay + jitter);
            continue;
          }

          // attach the SQL if present for debugging and rethrow
          if (err && !err.__failedSql) {
            try {
              const maybe = buildQueryAndParamsForBatch();
              if (maybe && maybe.query) err.__failedSql = maybe.query;
            } catch (e) {
              // ignore
            }
          }
          throw err;
        }
      } // retry loop
    }

    for (let i = 0; i < customValueChunks.length; i++) {
      const batch = customValueChunks[i];
      // buildQuery function must accept the subset batch
      await runSqlWithRetry(() =>
        bulkUpdateClientCustomValueQuery({
          client_id_list: batch.map((b) =>
            typeof b === "object" ? b.client_id : b,
          ),
          custom_values: batch,
          client_group_id,
        }),
      );
    }

    for (let i = 0; i < alertValueChunks.length; i++) {
      const batch = alertValueChunks[i];
      await runSqlWithRetry(() =>
        bulkUpdateClientAlertValueQuery({
          client_id_list: batch.map((b) =>
            typeof b === "object" ? b.client_id : b,
          ),
          alert_values: batch,
          client_group_id,
        }),
      );
    }

    for (let i = 0; i < removeHandlerChunks.length; i++) {
      const batch = removeHandlerChunks[i];
      await runSqlWithRetry(() => {
        const { removeHandlerSql, params } = deleteAllClientUserQuery(batch);
        return { query: removeHandlerSql, values: params };
      });
    }

    for (let i = 0; i < addHandlerChunks.length; i++) {
      const batch = addHandlerChunks[i];
      await runSqlWithRetry(() => {
        const insertHandlerSql = createClientUsersQuery(batch);
        const handlerListValues = batch.flatMap((obj) => [
          obj.client_id,
          obj.user_id,
          new Date(),
          new Date(),
        ]);
        return { query: insertHandlerSql, values: handlerListValues };
      });
    }

    return { success: true };
  } catch (err) {
    console.error("bulkUpdateClient failed", err);
    throw err;
  } finally {
    try {
      connection.release();
    } catch (e) {}
  }
};

const updateClient = async (body) => {
  const connection = await getConnection();
  try {
    const {
      client_id,
      user_id,
      client_group_id,
      custom_values,
      missing_custom_values,
      handler,
    } = body;

    const createCustomValuesSql = createClientCustomValueQuery(
      missing_custom_values,
    );
    const missingCustomValues = missing_custom_values.flatMap((obj) => [
      obj.client_id,
      obj.column_id,
      obj.client_group_id,
      obj.row_value,
      new Date(),
      new Date(),
    ]);
    const removeHandlerSql = deleteClientUsersQuery();
    const insertHandlerSql = createClientUsersQuery(handler);
    const { query: updateClientSql, values } =
      updateClientCustomValueQuery(custom_values);

    const handlerListValues = handler.flatMap((obj) => [
      obj.client_id,
      obj.user_id,
      new Date(),
      new Date(),
    ]);
    await connection.beginTransaction();
    await connection.execute(removeHandlerSql, [client_id]);
    if (handlerListValues.length > 0) {
      await connection.execute(insertHandlerSql, handlerListValues);
    }
    if (missingCustomValues.length > 0) {
      await connection.execute(createCustomValuesSql, missingCustomValues);
    }

    // const [result] = await connection.execute(updateClientSql, values);
    const [result] = await connection.execute(updateClientSql, values);

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

const bulkCreateClient = async (body) => {
  async function insertInBatches(
    connection,
    data,
    buildQueryFn,
    mapRow,
    batchSize = 1000,
  ) {
    for (let i = 0; i < data.length; i += batchSize) {
      const batch = data.slice(i, i + batchSize);

      const sql = buildQueryFn(batch);

      const values = batch.flatMap(mapRow);

      await connection.execute(sql, values);
    }
  }

  const connection = await getConnection();
  try {
    const { custom_values, client_list, handler } = body;

    await connection.beginTransaction();

    await insertInBatches(
      connection,
      client_list,
      bulkCreateClientQuery,
      (obj) => [
        obj.client_id,
        obj.user_id,
        obj.client_group_id,
        obj.company_id,
        new Date(),
        new Date(),
      ],
      1000,
    );

    //  custom values
    await insertInBatches(
      connection,
      custom_values,
      createClientCustomValueQuery,
      (obj) => [
        obj.client_id,
        obj.column_id,
        obj.client_group_id,
        obj.row_value,
        new Date(),
        new Date(),
      ],
      1000,
    );

    if (handler.length > 0) {
      await insertInBatches(
        connection,
        handler,
        createClientUsersQuery,
        (obj) => [obj.client_id, obj.user_id, new Date(), new Date()],
        1000,
      );
    }

    await connection.commit();
    return { success: true };
  } catch (error) {
    await connection.rollback();
    console.error("Error in transaction:", error);
    throw error;
  } finally {
    connection.release();
  }
};

const createClient = async (body) => {
  const connection = await getConnection();
  try {
    const {
      client_id,
      user_id,
      client_group_id,
      company_id,
      custom_values,
      handler,
    } = body;
    const createClientSql = createClientQuery();
    const clientValues = [
      client_id,
      user_id,
      client_group_id,
      company_id,
      new Date(),
      new Date(),
    ];
    const createCustomValuesSql = createClientCustomValueQuery(custom_values);
    const clientCustomValues = custom_values.flatMap((obj) => [
      obj.client_id,
      obj.column_id,
      obj.client_group_id,
      obj.row_value,
      new Date(),
      new Date(),
    ]);

    const createClientUserSql = createClientUsersQuery(handler);
    const handlerListValues = handler.flatMap((obj) => [
      obj.client_id,
      obj.user_id,
      new Date(),
      new Date(),
    ]);

    await connection.beginTransaction();
    const [result] = await connection.execute(createClientSql, clientValues);
    await connection.execute(createCustomValuesSql, clientCustomValues);
    if (handlerListValues.length > 0) {
      await connection.execute(createClientUserSql, handlerListValues);
    }

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

function mapClientCustomValues(clients, columns, customValues) {
  const grouped = {};

  for (const cv of customValues) {
    if (!grouped[cv.client_id]) grouped[cv.client_id] = [];
    grouped[cv.client_id].push(cv);
  }

  const mappedColumns = {};

  for (fields of columns) {
    const label = fields.label.toLowerCase().split(" ").join("_");
    const type = fields.field_type;
    mappedColumns[fields.column_id] = {
      label: label,
      type: type,
      multi_select_dropdown: fields.multi_select_dropdown,
    };
  }

  return clients.map((client) => {
    const mappedValues = {};
    const custom_values = grouped[client.client_id] || [];
    for (const value of custom_values) {
      const column = mappedColumns[value.column_id];
      if (!column) continue;

      const type = column.type;
      const isMulti = column.multi_select_dropdown;
      const columnName = column.label.toLowerCase().split(" ").join("_");

      if (type === "number") {
        value.row_value = parseFloat(value.row_value);
      } else if (type === "alert") {
        try {
          value.row_value = JSON.parse(value.row_value);
        } catch {
          value.row_value = { date: "", is_complete: false };
        }
      } else if (type === "dropdown" && isMulti) {
        try {
          const parsed = JSON.parse(value.row_value);

          if (Array.isArray(parsed)) {
            value.row_value = parsed.map((v) => v);
          } else {
            value.row_value = [];
          }
        } catch {
          value.row_value = [];
        }
      }

      if (columnName) {
        mappedValues[columnName] = value.row_value;
      }
    }

    mappedValues["serial_number"] = client.serial_number;
    mappedValues["client_id"] = client.client_id;

    const handler_name = client.handler_name
      ? client.handler_name.split(", ")
      : [];
    const handler_id = client.handler_id ? client.handler_id.split(", ") : [];

    const handlers = handler_name
      .map((name, index) => ({
        label: name,
        value: handler_id[index],
      }))
      .filter((item) => item.label && item.value);

    return {
      ...client,
      id: client.client_id,
      handler_id: client.handler_id ? client.handler_id : "",
      handler_name: client.handler_name ? client.handler_name : "",
      handler: handlers,
      raw: custom_values,
      mapped: mappedValues,
    };
  });
}

function mapSingleClientCustomValues(client, columns) {
  const mappedColumns = {};

  for (const field of columns) {
    if (!field.column_id) continue;

    const label = field.label
      ? field.label.toLowerCase().split(" ").join("_")
      : "";

    mappedColumns[field.column_id] = {
      label,
      type: field.field_type || "text",
      isMulti: !!field.multi_select_dropdown,
    };
  }

  const mappedValues = {};
  let custom_values = [];

  try {
    custom_values = JSON.parse(client.raw);
    if (!Array.isArray(custom_values)) custom_values = [];
  } catch (error) {
    console.error("Error parsing client raw data:", error);
    custom_values = [];
  }

  for (const value of custom_values) {
    if (!value.column_id) continue;

    const columnInfo = mappedColumns[value.column_id];
    if (!columnInfo) continue;

    const { type, label: columnName, isMulti } = columnInfo;

    // Normalize by type
    if (type === "number") {
      value.row_value = parseFloat(value.row_value) || 0;
    } else if (type === "alert") {
      try {
        value.row_value = JSON.parse(value.row_value);
      } catch {
        value.row_value = { date: "", is_complete: false };
      }
    } else if (type === "dropdown" && isMulti) {
      // Inline multi-select dropdown normalization
      try {
        const parsed = JSON.parse(value.row_value);

        if (Array.isArray(parsed)) {
          value.row_value = parsed.map((v) => v);
        } else {
          value.row_value = [];
        }
      } catch {
        value.row_value = [];
      }
    }

    if (columnName) {
      mappedValues[columnName] = value.row_value;
    }
  }

  mappedValues.serial_number = client.serial_number || "";
  mappedValues.client_id = client.client_id || "";

  const handler_name = client.handler_name
    ? client.handler_name.split(", ")
    : [];
  const handler_id = client.handler_id ? client.handler_id.split(", ") : [];

  const handlers = handler_name
    .map((name, index) => ({
      label: name || "",
      value: handler_id[index] || "",
    }))
    .filter((item) => item.label && item.value);

  return {
    ...client,
    handler_id: client.handler_id || "",
    handler_name: client.handler_name || "",
    handler: handlers,
    raw: custom_values,
    mapped: mappedValues,
  };
}

const getClientDataByClientId = async (body) => {
  const connection = await getConnection();
  try {
    const { client_id, columns } = body;
    const getClientSql = getClientDataByClientIdQuery();
    await connection.beginTransaction();
    const [result] = await connection.execute(getClientSql, [client_id]);
    const processedResult = mapSingleClientCustomValues(result[0], columns);

    await connection.commit();
    return processedResult;
  } catch (error) {
    await connection.rollback();
    console.error("Error in transaction:", error);
    throw error;
  } finally {
    connection.release();
  }
};

const getAllClientByGroupId = async (body) => {
  const connection = await getConnection();

  try {
    const {
      client_group_id,
      columns,
      fixedColumns,
      pagination = {},
      filters = [],
      searchText = "",
      sortConfig = {},
      user_id = null,
      isAdmin = false,
      hasPermission = false,
      isArchivedPage = false,
    } = body;

    const hasPagination =
      pagination &&
      Number.isInteger(pagination.currentPage) &&
      Number.isInteger(pagination.pageSize) &&
      pagination.pageSize > 0;

    const pageSize = hasPagination ? pagination.pageSize : undefined;
    const currentPage = hasPagination ? pagination.currentPage : undefined;
    const offset = hasPagination ? (currentPage - 1) * pageSize : undefined;

    const { whereClause, params } = buildWhereClause(
      filters,
      columns,
      fixedColumns,
      searchText,
    );

    const { orderBy, join } = buildOrderByClause(
      sortConfig,
      fixedColumns,
      columns,
    );

    // Access control
    let accessClause = "";
    const accessParams = [];

    if (!isAdmin && !hasPermission) {
      accessClause = `
        AND (
          -- own clients
          c.user_id = ?

          -- shared directly
          OR c.client_id IN (
            SELECT cu.client_id
            FROM ClientUser cu
            WHERE cu.user_id = ?
          )

          -- clients owned by leader members
          OR c.user_id IN (
            SELECT lu.user_id
            FROM Leader l
            INNER JOIN LeaderUser lu
              ON lu.leader_id = l.leader_id
            WHERE l.user_id = ?
          )

          -- shared clients of leader members
          OR c.client_id IN (
            SELECT cu.client_id
            FROM ClientUser cu
            WHERE cu.user_id IN (
              SELECT lu.user_id
              FROM Leader l
              INNER JOIN LeaderUser lu
                ON lu.leader_id = l.leader_id
              WHERE l.user_id = ?
            )
          )
        )
      `;

      accessParams.push(user_id, user_id, user_id, user_id);
    }

    const pageControlClause = isArchivedPage
      ? `AND c.status = "archived"`
      : `AND c.status = "active"`;

    const finalWhereClause = `${whereClause} ${accessClause} ${pageControlClause}`;

    const getIdsSql = getClientIdsByGroupIdQuery(
      finalWhereClause,
      orderBy,
      join,
      pageSize,
      offset,
    );

    await connection.beginTransaction();

    const [idRows] = await connection.execute(getIdsSql, [
      client_group_id,
      ...params,
      ...accessParams,
    ]);

    // console.log("ID : ", idRows.length);

    const clientIds = idRows.map((r) => r.client_id);

    if (clientIds.length === 0) {
      await connection.commit();

      return {
        data: [],
        pagination: hasPagination
          ? {
              currentPage,
              totalPages: 0,
              totalItems: 0,
              pageSize,
            }
          : {
              currentPage: 1,
              totalPages: 1,
              totalItems: 0,
              pageSize: 0,
            },
      };
    }

    const getClientSql = getAllClientByGroupIdQuery(clientIds);

    const countSql = getAllClientByGroupIdCountQuery(finalWhereClause);

    const queryParams = [client_group_id, ...params, ...accessParams];

    // const [clients] = await connection.execute(getClientSql, queryParams);
    const [clients] = await connection.execute(getClientSql, clientIds);

    const [countResult] = await connection.execute(countSql, queryParams);

    const totalItems = countResult[0].client_count;

    // console.log("CLIENTS : ", clients.length);

    let customValues = [];

    if (clients.length > 0) {
      const clientIds = clients.map((c) => c.client_id);

      const placeholders = clientIds.map(() => "?").join(",");

      const [cvRows] = await connection.execute(
        `
        SELECT *
        FROM ClientCustomValue
        WHERE client_id IN (${placeholders})
        `,
        clientIds,
      );

      customValues = cvRows;

      // console.log("Value : ", cvRows.length);
    }

    const clientMap = new Map(clients.map((c) => [c.client_id, c]));

    const orderedClients = clientIds.map((id) => clientMap.get(id));

    const processedResult = mapClientCustomValues(
      orderedClients,
      columns,
      customValues,
    );

    await connection.commit();

    return {
      data: processedResult,
      pagination: hasPagination
        ? {
            currentPage,
            totalPages: Math.ceil(totalItems / pageSize),
            totalItems,
            pageSize,
          }
        : {
            currentPage: 1,
            totalPages: 1,
            totalItems,
            pageSize: totalItems,
          },
    };
  } catch (error) {
    await connection.rollback();
    console.error("Error in transaction:", error);
    throw error;
  } finally {
    connection.release();
  }
};

const getAllClientByGroupIdCount = async (body) => {
  const connection = await getConnection();
  try {
    const { client_group_id } = body;
    const getClientSql = getAllClientByGroupIdCountQuery();
    await connection.beginTransaction();
    const [result] = await connection.execute(getClientSql, [client_group_id]);
    await connection.commit();
    const response = result[0] || 0;
    return response;
  } catch (error) {
    await connection.rollback();
    console.error("Error in transaction:", error);
    throw error;
  } finally {
    connection.release();
  }
};

const deleteClient = async (body) => {
  const connection = await getConnection();
  try {
    const { client_group_id, client_id } = body;
    const deleteClientSql = deleteClientQuery();
    await connection.beginTransaction();
    const [result] = await connection.execute(deleteClientSql, [
      client_id,
      client_group_id,
    ]);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    console.error("Error in delete transaction:", error);
    throw error;
  } finally {
    connection.release();
  }
};

const bulkDeleteClient = async (body) => {
  const connection = await getConnection();
  try {
    const { client_group_id, client_id_list } = body;
    const deleteClientSql = bulkDeleteClientQuery(client_id_list);
    const placeholder = [...client_id_list, client_group_id];
    await connection.beginTransaction();
    const [result] = await connection.execute(deleteClientSql, placeholder);
    // console.log(result);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    console.error("Error in bulk delete transaction:", error);
    throw error;
  } finally {
    connection.release();
  }
};

async function checkDuplicate({
  client_group_id,
  column_id,
  row_value,
  client_id,
}) {
  const connection = await getConnection();
  // console.log(client_id)
  try {
    await connection.beginTransaction();

    const sql = checkDuplicateQuery();

    const [rows] = await connection.execute(sql, [
      client_group_id,
      column_id,
      row_value,
      client_id,
    ]);

    await connection.commit();

    const count = rows && rows[0] && rows[0].count ? Number(rows[0].count) : 0;
    return { isDuplicate: count > 0 };
  } catch (err) {
    await connection.rollback();
    console.error("clientsService.checkDuplicate error:", err);
    throw err;
  } finally {
    connection.release();
  }
}

async function archiveClient(client_id, client_group_id) {
  const connection = await getConnection();
  try {
    const sql = softDeleteClientQuery();
    await connection.execute(sql, [new Date(), client_id, client_group_id]);
  } finally {
    connection.release();
  }
}

async function bulkArchiveClients(client_id_list, client_group_id) {
  const connection = await getConnection();
  try {
    const sql = bulkSoftDeleteClientQuery(client_id_list);
    await connection.execute(sql, [
      new Date(),
      ...client_id_list,
      client_group_id,
    ]);
  } finally {
    connection.release();
  }
}

async function restoreClient({ client_id, client_group_id }) {
  const connection = await getConnection();
  try {
    const sql = restoreClientQuery();
    await connection.execute(sql, [new Date(), client_id, client_group_id]);
    return true;
  } catch (err) {
    console.error("restoreClient error:", err);
    throw err;
  } finally {
    connection.release();
  }
}

async function bulkRestoreClients({ client_id_list, client_group_id }) {
  const connection = await getConnection();
  try {
    const sql = bulkRestoreClientQuery(client_id_list);

    await connection.execute(sql, [
      new Date(),
      ...client_id_list,
      client_group_id,
    ]);

    return true;
  } catch (err) {
    console.error("bulkRestoreClients error:", err);
    throw err;
  } finally {
    connection.release();
  }
}

const exportClientsCSV = async (req, res) => {
  const connection = await getConnection();
  const rawConnection = connection.connection;

  try {
    if (!req.body.payload) {
      return res.status(400).json({ message: "Missing payload" });
    }

    const body = JSON.parse(req.body.payload);

    const {
      client_group_name,
      client_group_id,
      columns = [],
      fixedColumns = [],
      filters = [],
      searchText = "",
      sortConfig = {},
      user_id,
      isAdmin,
      hasPermission,
      isArchivedPage,
    } = body;

    // ===== NORMALIZE FIXED =====
    const processedFixColumns = fixedColumns.map((item) => ({
      ...item,
      isFixed: true,
    }));

    const allColumns = [...processedFixColumns, ...columns];

    // ===== WHERE =====
    const { whereClause, params } = buildWhereClause(
      filters,
      allColumns,
      fixedColumns,
      searchText,
    );

    const { orderBy, join } = buildOrderByClause(
      sortConfig,
      fixedColumns,
      allColumns,
    );

    let accessClause = "";
    const accessParams = [];

    if (!isAdmin && !hasPermission) {
      accessClause = `
    AND (
      c.user_id = ?

      OR c.client_id IN (
        SELECT cu.client_id
        FROM ClientUser cu
        WHERE cu.user_id = ?
      )

      OR c.user_id IN (
        SELECT lu.user_id
        FROM Leader l
        INNER JOIN LeaderUser lu
          ON lu.leader_id = l.leader_id
        WHERE l.user_id = ?
      )

      OR c.client_id IN (
        SELECT cu.client_id
        FROM ClientUser cu
        WHERE cu.user_id IN (
          SELECT lu.user_id
          FROM Leader l
          INNER JOIN LeaderUser lu
            ON lu.leader_id = l.leader_id
          WHERE l.user_id = ?
        )
      )
    )
  `;

      accessParams.push(user_id, user_id, user_id, user_id);
    }

    const statusClause = isArchivedPage ? `AND c.status = "archived"` : ``;

    const finalWhereClause = `
      c.client_group_id = ?
      ${whereClause}
      ${accessClause}
      ${statusClause}
    `;

    const dynamicIds = columns.map((c) => `'${c.column_id}'`).join(",");

    const selectParts = allColumns
      .map((col) => {
        const id = col.key || col.id;

        if (
          id === "handler" ||
          id === "handler_name" ||
          id === "user_id" ||
          col.label === "Handler" ||
          col.label === "Created By"
        ) {
          return `
            GROUP_CONCAT(
              DISTINCT CONCAT_WS(' ', u.first_name, u.last_name)
            ) AS \`${col.label}\`
          `;
        }

        if (col.isFixed) {
          if (!id) return null;
          if (id === "created_at") {
            return `DATE_FORMAT(c.created_at, '%Y-%m-%d') AS \`${col.label}\``;
          }
          return `c.${id} AS \`${col.label}\``;
        }

        if (!col.column_id) return null;

        if (col.field_type === "alert") {
          return `
            MAX(CASE 
              WHEN cv.column_id = '${col.column_id}' 
              AND JSON_VALID(cv.row_value)
              THEN JSON_UNQUOTE(JSON_EXTRACT(cv.row_value, '$.date'))
              ELSE NULL
            END) AS \`${col.label}\`
          `;
        }

        return `
          MAX(CASE 
            WHEN cv.column_id = '${col.column_id}' 
            THEN cv.row_value 
          END) AS \`${col.label}\`
        `;
      })
      .filter(Boolean);

    const sql = `
      SELECT 
        ${selectParts.join(",\n")}

      FROM Client c
      ${join || ""}

      LEFT JOIN ClientUser cu ON cu.client_id = c.client_id
      LEFT JOIN User u ON u.user_id = cu.user_id
      LEFT JOIN ClientCustomValue cv 
        ON cv.client_id = c.client_id
        ${dynamicIds ? `AND cv.column_id IN (${dynamicIds})` : ""}

      WHERE ${finalWhereClause}

      GROUP BY c.client_id
      ${orderBy || "ORDER BY c.client_id"}
    `;

    // ===== HEADERS =====
    const headers = allColumns.map((col) => col.label);

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );

    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${client_group_name}_${moment().format(
        "YYYY-MM-DD",
      )}.xlsx`,
    );

    res.flushHeaders && res.flushHeaders();

    // ===== EXCEL STREAM =====
    const workbook = new ExcelJS.stream.xlsx.WorkbookWriter({
      stream: res,
    });

    const worksheet = workbook.addWorksheet("Clients");

    // Set columns
    worksheet.columns = headers.map((header) => ({
      header,
      key: header,
      width: 25,
    }));

    const queryStream = rawConnection
      .query(sql, [client_group_id, ...params, ...accessParams])
      .stream({ highWaterMark: 1000 });

    queryStream.on("data", (row) => {
      worksheet.addRow(row).commit(); // important
    });

    queryStream.on("end", async () => {
      await worksheet.commit();
      await workbook.commit();
      connection.release();
    });

    queryStream.on("error", async (err) => {
      console.error("Query error:", err);
      connection.release();
      res.end();
    });
  } catch (err) {
    connection.release();
    console.error(err);

    if (!res.headersSent) {
      res.status(500).json({ message: "Export failed" });
    } else {
      res.end();
    }
  }
};

// const exportClientsCSV = async (req, res) => {
//   const connection = await getConnection();
//   const rawConnection = connection.connection;

//   try {
//     if (!req.body.payload) {
//       return res.status(400).json({ message: "Missing payload" });
//     }

//     const body = JSON.parse(req.body.payload);

//     const {
//       client_group_name,
//       client_group_id,
//       columns = [], // dynamic
//       fixedColumns = [], // fixed
//       filters = [],
//       searchText = "",
//       sortConfig = {},
//       user_id,
//       isAdmin,
//       hasPermission,
//       isArchivedPage,
//     } = body;

//     // ===== NORMALIZE FIXED =====
//     const processedFixColumns = fixedColumns.map((item) => ({
//       ...item,
//       isFixed: true,
//     }));

//     const allColumns = [...processedFixColumns, ...columns];

//     // ===== WHERE =====
//     const { whereClause, params } = buildWhereClause(
//       filters,
//       allColumns,
//       fixedColumns,
//       searchText,
//     );

//     const { orderBy, join } = buildOrderByClause(
//       sortConfig,
//       fixedColumns,
//       allColumns,
//     );

//     let accessClause = "";
//     const accessParams = [];

//     if (!isAdmin && !hasPermission) {
//       accessClause = `
//         AND (
//           c.user_id = ?
//           OR c.client_id IN (
//             SELECT cu.client_id
//             FROM ClientUser cu
//             WHERE cu.user_id = ?
//           )
//         )
//       `;
//       accessParams.push(user_id, user_id);
//     }

//     const statusClause = isArchivedPage ? `AND c.status = "archived"` : ``;

//     const finalWhereClause = `
//       c.client_group_id = ?
//       ${whereClause}
//       ${accessClause}
//       ${statusClause}
//     `;

//     const dynamicIds = columns.map((c) => `'${c.column_id}'`).join(",");

//     const selectParts = allColumns
//       .map((col) => {
//         const id = col.key || col.id;

//         if (
//           id === "handler" ||
//           id === "handler_name" ||
//           id === "user_id" ||
//           col.label === "Handler" ||
//           col.label === "Created By"
//         ) {
//           return `
//             GROUP_CONCAT(
//               DISTINCT CONCAT_WS(' ', u.first_name, u.last_name)
//             ) AS \`${col.label}\`
//         `;
//         }

//         if (col.isFixed) {
//           if (!id) return null;
//           if (id === "created_at") {
//             return `DATE_FORMAT(c.created_at, '%Y-%m-%d') AS \`${col.label}\``;
//           }
//           return `c.${id} AS \`${col.label}\``;
//         }

//         if (!col.column_id) return null;

//         if (col.field_type === "alert") {
//           return `
//             MAX(CASE
//               WHEN cv.column_id = '${col.column_id}'
//               AND JSON_VALID(cv.row_value)
//               THEN JSON_UNQUOTE(JSON_EXTRACT(cv.row_value, '$.date'))
//               ELSE NULL
//             END) AS \`${col.label}\`
//           `;
//         }

//         return `
//           MAX(CASE
//             WHEN cv.column_id = '${col.column_id}'
//             THEN cv.row_value
//           END) AS \`${col.label}\`
//         `;
//       })
//       .filter(Boolean); // remove nulls

//     const sql = `
//       SELECT
//         ${selectParts.join(",\n")}

//       FROM Client c
//       ${join || ""}

//       LEFT JOIN ClientUser cu ON cu.client_id = c.client_id
//       LEFT JOIN User u ON u.user_id = cu.user_id
//       LEFT JOIN ClientCustomValue cv
//         ON cv.client_id = c.client_id
//         ${dynamicIds ? `AND cv.column_id IN (${dynamicIds})` : ""}

//       WHERE ${finalWhereClause}

//       GROUP BY c.client_id
//       ${orderBy || "ORDER BY c.client_id"}
//     `;

//     // ===== HEADERS =====
//     const headers = allColumns.map((col) => col.label);

//     res.setHeader(
//       "Content-Type",
//       "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
//     );

//     res.setHeader(
//       "Content-Disposition",
//       `attachment; filename=${client_group_name}_${moment().format(
//         "YYYY-MM-DD",
//       )}.xlsx`,
//     );

//     res.flushHeaders && res.flushHeaders();

//     const csvStream = csv.format({ headers });
//     csvStream.pipe(res);

//     // ===== STREAM =====
//     const queryStream = rawConnection
//       .query(sql, [client_group_id, ...params, ...accessParams])
//       .stream({ highWaterMark: 1000 });

//     queryStream.on("data", (row) => {
//       csvStream.write(row);
//     });

//     queryStream.on("end", () => {
//       csvStream.end();
//     });

//     queryStream.on("error", (err) => {
//       console.error("Query error:", err);
//       res.end();
//     });

//     csvStream.on("finish", () => {
//       connection.release();
//     });
//   } catch (err) {
//     connection.release();
//     console.error(err);

//     if (!res.headersSent) {
//       res.status(500).json({ message: "Export failed" });
//     } else {
//       res.end();
//     }
//   }
// };

module.exports = {
  bulkUpdateClient,
  updateClient,
  bulkCreateClient,
  createClient,
  getAllClientByGroupId,
  deleteClient,
  bulkDeleteClient,
  getClientDataByClientId,
  getAllClientByGroupIdCount,
  checkDuplicate,
  archiveClient,
  bulkArchiveClients,
  restoreClient,
  bulkRestoreClients,
  exportClientsCSV,
};
