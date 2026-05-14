const httpStatus = require("http-status");

const { clientService } = require("../services");
const catchAsync = require("../utils/catchAsync");

const bulkUpdateClient = catchAsync(async (req, res) => {
  const result = await clientService.bulkUpdateClient(req.body);
  res.status(httpStatus.CREATED).send(result);
});

const updateClient = catchAsync(async (req, res) => {
  const result = await clientService.updateClient(req.body);
  res.status(httpStatus.CREATED).send(result);
});

const bulkCreateClient = catchAsync(async (req, res) => {
  const result = await clientService.bulkCreateClient(req.body);
  res.status(httpStatus.CREATED).send(result);
});

const createClient = catchAsync(async (req, res) => {
  const result = await clientService.createClient(req.body);
  res.status(httpStatus.CREATED).send(result);
});

const getAllClients = catchAsync(async (req, res) => {
  const result = await clientService.getAllClientByGroupId(req.body);
  res.status(httpStatus.OK).send(result);
});

const exportClientsCSV = catchAsync(async (req, res) => {
  const result = await clientService.exportClientsCSV(req, res);
});

const getAllClientsCount = catchAsync(async (req, res) => {
  const result = await clientService.getAllClientByGroupIdCount(req.body);
  res.status(httpStatus.OK).send(result);
});

const getClientDataByClientId = catchAsync(async (req, res) => {
  const result = await clientService.getClientDataByClientId(req.body);
  res.status(httpStatus.OK).send(result);
});

const deleteClient = catchAsync(async (req, res) => {
  const result = await clientService.deleteClient(req.body);
  res.status(httpStatus.OK).send(result);
});

const bulkDeleteClient = catchAsync(async (req, res) => {
  const result = await clientService.bulkDeleteClient(req.body);
  res.status(httpStatus.OK).send(result);
});

// GET /clients/check-duplicate
const checkDuplicate = catchAsync(async (req, res) => {
  const { client_group_id, column_id, row_value, client_id } = req.query;
  
  if (!client_group_id || !column_id || row_value === undefined) {
    return res.status(400).json({
      message:
        "Missing required query parameters: client_group_id, column_id, and/or row_value",
    });
  }

  try {
    const result = await clientService.checkDuplicate({
      client_group_id,
      column_id,
      row_value,
      client_id
    });

    // result expected { isDuplicate: boolean }
    return res.status(200).json(result);
  } catch (err) {
    console.error("checkDuplicate error:", err);
    return res
      .status(500)
      .json({ error: err.message || "Internal server error" });
  }
});

/**
 * Archive single client
 * Route example: POST /clients/:client_id/archive
 */
const archiveClient = catchAsync(async (req, res) => {
  const client_id = req.body.client_id;
  const client_group_id = req.body.client_group_id;

  if (!client_id || !client_group_id) {
    return res
      .status(400)
      .json({ message: "client_id and client_group_id are required" });
  }

  await clientService.archiveClient(client_id, client_group_id);

  return res
    .status(200)
    .json({ message: "Client archived successfully", client_id });
});

/**
 * Bulk archive clients
 * Route example: POST /clients/bulk/archive
 * Body: { client_id_list: ["id1", "id2"], client_group_id: "..." }
 */
const bulkArchiveClients = catchAsync(async (req, res) => {
  const client_id_list = req.body.client_id_list;
  const client_group_id = req.body.client_group_id;

  if (!Array.isArray(client_id_list) || client_id_list.length === 0) {
    return res
      .status(400)
      .json({ message: "client_id_list (non-empty array) is required" });
  }
  if (!client_group_id) {
    return res.status(400).json({ message: "client_group_id is required" });
  }

  await clientService.bulkArchiveClients(client_id_list, client_group_id);

  return res.status(200).json({
    message: "Clients archived successfully",
    archivedCount: client_id_list.length,
    client_id_list,
  });
});

/**
 * Restore single client
 * Route example: POST /clients/:client_id/restore
 */
const restoreClient = catchAsync(async (req, res) => {
  const client_id = req.body.client_id;
  const client_group_id = req.body.client_group_id;

  if (!client_id || !client_group_id) {
    return res
      .status(400)
      .json({ message: "client_id and client_group_id are required" });
  }

  await clientService.restoreClient({ client_id, client_group_id });

  return res
    .status(200)
    .json({ message: "Client restored successfully", client_id });
});

/**
 * Bulk restore clients
 * Route example: POST /clients/bulk/restore
 * Body: { client_id_list: ["id1", "id2"], client_group_id: "..." }
 */
const bulkRestoreClients = catchAsync(async (req, res) => {
  const client_id_list = req.body.client_id_list;
  const client_group_id = req.body.client_group_id;

  if (!Array.isArray(client_id_list) || client_id_list.length === 0) {
    return res
      .status(400)
      .json({ message: "client_id_list (non-empty array) is required" });
  }
  if (!client_group_id) {
    return res.status(400).json({ message: "client_group_id is required" });
  }

  await clientService.bulkRestoreClients({
    client_id_list: client_id_list,
    client_group_id,
  });

  return res.status(200).json({
    message: "Clients restored successfully",
    restoredCount: client_id_list.length,
    client_id_list,
  });
});

module.exports = {
  bulkUpdateClient,
  updateClient,
  bulkCreateClient,
  createClient,
  getAllClients,
  deleteClient,
  bulkDeleteClient,
  getClientDataByClientId,
  getAllClientsCount,
  checkDuplicate,
  archiveClient,
  bulkArchiveClients,
  restoreClient,
  bulkRestoreClients,
  exportClientsCSV
};
