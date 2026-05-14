// services/appointmentService.js

const getConnection = require("../db/pool");
const {
  createAppointmentQuery,
  createAppointmentUserQuery,
  createAppointmentClientQuery,
  getAppointmentsQuery,
  updateAppointmentQuery,
  deleteAppointmentUserByAppointmentIdQuery,
  deleteAppointmentClientByAppointmentIdQuery,
  deleteAppointmentQuery,
  searchClientListInAppointmentQuery,
  getAppointmentsQueryAdmin,
} = require("../queries/appointmentQueries");

// New service
const searchClientListInAppointment = async (body = {}) => {
  const connection = await getConnection();
  try {
    const searchText = (body.searchText || "").toString();
    const company_id = body.company_id;

    try {
      const ftSql = searchClientListInAppointmentQuery();
      const [ftRows] = await connection.execute(ftSql, [
        company_id,
        searchText,
      ]);
      if (ftRows && ftRows.length > 0) {
        return ftRows.map((r) => ({
          client_id: r.client_id,
          client_name: r.client_name || "",
        }));
      }
    } catch (ftErr) {
      console.error("Error : ", ftErr);
    }
  } catch (err) {
    console.error("searchClientListInAppointment error:", err);
    throw err;
  } finally {
    connection.release();
  }
};

const createAppointment = async (body) => {
  const connection = await getConnection();
  try {
    const {
      appointment_id,
      company_id,
      user_id,
      title,
      description,
      venue,
      color,
      status,
      start,
      end,
      members,
      clients,
    } = body;

    const createAppointmentSql = createAppointmentQuery();
    const now = new Date();

    const appointmentValues = [
      appointment_id,
      company_id,
      user_id,
      title,
      description,
      venue,
      color,
      status,
      start,
      end,
      now,
      now,
    ];

    await connection.beginTransaction();
    const [result] = await connection.execute(
      createAppointmentSql,
      appointmentValues
    );

    if (members && members.length > 0) {
      const createAppointmentUserSql = createAppointmentUserQuery(members);
      const appointmentUserValue = members.flatMap((obj, index) => [
        obj.appointment_id,
        obj.user_id,
        new Date(now.getTime() + index * 1000),
        new Date(now.getTime() + index * 1000),
      ]);
      await connection.execute(createAppointmentUserSql, appointmentUserValue);
    }

    if (clients && clients.length > 0) {
      const createAppointmentClientSql = createAppointmentClientQuery(clients);
      const appointmentClientValue = clients.flatMap((obj, index) => [
        obj.appointment_id,
        obj.client_id,
        new Date(now.getTime() + index * 1000),
        new Date(now.getTime() + index * 1000),
      ]);
      await connection.execute(
        createAppointmentClientSql,
        appointmentClientValue
      );
    }

    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    console.error("Error in createAppointment transaction:", error);
    throw error;
  } finally {
    connection.release();
  }
};

const getAppointments = async ({ isAdmin, company_id, user_id }) => {
  const connection = await getConnection();
  try {
    await connection.beginTransaction();

    let sql;
    let params;

    if (isAdmin) {
      sql = getAppointmentsQueryAdmin();
      params = [company_id, company_id];
    } else {
      sql = getAppointmentsQuery();
      params = [company_id, company_id, user_id, user_id];
    }

    const [rows] = await connection.execute(sql, params);

    await connection.commit();
    return rows;
  } catch (error) {
    await connection.rollback();
    console.error("Error in getAppointments service:", error);
    throw error;
  } finally {
    connection.release();
  }
};

const updateAppointment = async (body) => {
  const connection = await getConnection();
  try {
    const {
      appointment_id,
      title,
      description,
      venue,
      color,
      status,
      start,
      end,
      members,
      clients,
    } = body;

    const now = new Date();

    await connection.beginTransaction();

    // update appointment main row
    const updateSql = updateAppointmentQuery();
    const updateParams = [
      title,
      description,
      venue,
      color,
      status,
      start,
      end,
      now,
      appointment_id,
    ];

    const [result] = await connection.execute(updateSql, updateParams);
    if (Array.isArray(members)) {
      const deleteUsersSql = deleteAppointmentUserByAppointmentIdQuery();
      await connection.execute(deleteUsersSql, [appointment_id]);

      if (members.length > 0) {
        const createAppointmentUserSql = createAppointmentUserQuery(members);
        const appointmentUserValue = members.flatMap((obj, index) => [
          obj.appointment_id,
          obj.user_id,
          new Date(now.getTime() + index * 1000),
          new Date(now.getTime() + index * 1000),
        ]);
        await connection.execute(
          createAppointmentUserSql,
          appointmentUserValue
        );
      }
    }

    if (Array.isArray(clients)) {
      const deleteClientsSql = deleteAppointmentClientByAppointmentIdQuery();
      await connection.execute(deleteClientsSql, [appointment_id]);

      if (clients.length > 0) {
        const createAppointmentClientSql =
          createAppointmentClientQuery(clients);
        const appointmentClientValue = clients.flatMap((obj, index) => [
          obj.appointment_id,
          obj.client_id,
          new Date(now.getTime() + index * 1000),
          new Date(now.getTime() + index * 1000),
        ]);
        await connection.execute(
          createAppointmentClientSql,
          appointmentClientValue
        );
      }
    }

    await connection.commit();
    return result[0];
  } catch (error) {
    await connection.rollback();
    console.error("Error in updateAppointment transaction:", error);
    throw error;
  } finally {
    connection.release();
  }
};

const deleteAppointment = async (appointment_id) => {
  const connection = await getConnection();
  try {
    await connection.beginTransaction();
    const deleteAppointmentSql = deleteAppointmentQuery();
    const [result] = await connection.execute(deleteAppointmentSql, [
      appointment_id,
    ]);

    await connection.commit();
    return result[0];
  } catch (error) {
    await connection.rollback();
    console.error("Error in deleteAppointment transaction:", error);
    throw error;
  } finally {
    connection.release();
  }
};

module.exports = {
  searchClientListInAppointment,
  createAppointment,
  getAppointments,
  updateAppointment,
  deleteAppointment,
};
