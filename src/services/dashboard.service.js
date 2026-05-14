// services/dashboard.service.js
const getConnection = require("../db/pool");
const {
  getUpcomingAppointmentsAdminQuery,
  getUpcomingAppointmentsQuery,
  getDashboardActivityLogsQuery,
} = require("../queries/dashboardQueries");

const getDashboardSummary = async ({ isAdmin, company_id, user_id }) => {
  const connection = await getConnection();

  try {
    await connection.beginTransaction();

    let apptSql;
    let apptParams;

    if (isAdmin) {
      apptSql = getUpcomingAppointmentsAdminQuery();
      apptParams = [company_id];
    } else {
      apptSql = getUpcomingAppointmentsQuery();
      apptParams = [company_id, user_id, user_id];
    }

    const [appointments] = await connection.execute(apptSql, apptParams);
    
    const logsSql = getDashboardActivityLogsQuery();
    const [logsRaw] = await connection.execute(logsSql, [
      company_id,
      user_id,
    ]);

    await connection.commit();

    return {
      upcomingAppointments: appointments,
      activityLogs: logsRaw,
    };
  } catch (error) {
    await connection.rollback();
    console.error("Error in getDashboardSummary service:", error);
    throw error;
  } finally {
    connection.release();
  }
};


module.exports = {
  getDashboardSummary,
};
