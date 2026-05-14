// queries/dashboardQueries.js

const getUpcomingAppointmentsAdminQuery = () => {
  return `
    SELECT
      a.appointment_id,
      a.title,
      a.start,
      a.end,
      a.status,
      a.color,

      -- clients (names only)
      COALESCE(
        (
          SELECT JSON_ARRAYAGG(cv.row_value)
          FROM AppointmentClient ac
          JOIN ClientCustomValue cv ON cv.client_id = ac.client_id
          JOIN ClientCustomField cf ON cf.column_id = cv.column_id
          WHERE ac.appointment_id = a.appointment_id
            AND cf.is_system = 1
        ),
        JSON_ARRAY()
      ) AS clients

    FROM Appointment a
    WHERE a.company_id = ?
      AND a.start >= NOW()
      AND a.start <= DATE_ADD(NOW(), INTERVAL 7 DAY)
    ORDER BY a.start ASC
    LIMIT 5;
  `;
};

const getUpcomingAppointmentsQuery = () => {
  return `
    SELECT
      a.appointment_id,
      a.title,
      a.start,
      a.end,
      a.status,
      a.color,

      COALESCE(
        (
          SELECT JSON_ARRAYAGG(cv.row_value)
          FROM AppointmentClient ac
          JOIN ClientCustomValue cv ON cv.client_id = ac.client_id
          JOIN ClientCustomField cf ON cf.column_id = cv.column_id
          WHERE ac.appointment_id = a.appointment_id
            AND cf.is_system = 1
        ),
        JSON_ARRAY()
      ) AS clients

    FROM Appointment a
    WHERE a.company_id = ?
      AND a.start >= NOW()
      AND a.start <= DATE_ADD(NOW(), INTERVAL 7 DAY)
      AND (
        a.user_id = ?
        OR EXISTS (
          SELECT 1
          FROM AppointmentUser au
          WHERE au.appointment_id = a.appointment_id
            AND au.user_id = ?
        )
      )
    ORDER BY a.start ASC
    LIMIT 5;
  `;
};

// queries/dashboardLogQueries.js
const getDashboardActivityLogsQuery = () => {
  return `
    SELECT
      log_id,
      section,
      action,
      text,
      metadata,
      user_id,
      created_at
    FROM \`Log\`
    WHERE company_id = ?
      AND (
        user_id = ?
      )
    ORDER BY created_at DESC
    LIMIT 10;
  `;
};


module.exports = {
  getUpcomingAppointmentsAdminQuery,
  getUpcomingAppointmentsQuery,
  getDashboardActivityLogsQuery
};
