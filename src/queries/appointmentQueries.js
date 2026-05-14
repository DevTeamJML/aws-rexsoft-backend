const searchClientListInAppointmentQuery = () => {
  return `
   SELECT DISTINCT
    c.client_id,
    cv.row_value AS client_name
    FROM ClientCustomValue cv
    JOIN ClientCustomField cf
    ON cf.column_id = cv.column_id
    AND cf.is_system = 1
    JOIN Client c
    ON c.client_id = cv.client_id
    WHERE c.company_id = ?
    AND MATCH(cv.row_value) AGAINST (? IN NATURAL LANGUAGE MODE);
    `;
};

const createAppointmentQuery = () => {
  return `
    INSERT INTO Appointment (
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
      created_at,
      updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
};

const createAppointmentUserQuery = (users) => {
  const placeholder = users.map(() => `(?, ?, ?, ?)`).join(", ");

  return `
    INSERT INTO AppointmentUser (
      appointment_id,
      user_id,
      created_at,
      updated_at
    ) VALUES ${placeholder}
  `;
};

const createAppointmentClientQuery = (clients) => {
  const placeholder = clients.map(() => `(?, ?, ?, ?)`).join(", ");

  return `
    INSERT INTO AppointmentClient (
      appointment_id,
      client_id,
      created_at,
      updated_at
    ) VALUES ${placeholder}
  `;
};

const getAppointmentsQueryAdmin = () => {
  return `
    SELECT
        a.*,

        -- Members
        COALESCE(
            (
                SELECT JSON_ARRAYAGG(
                    JSON_OBJECT(
                        'user_id', au.user_id,
                        'name', u.first_name,
                        'email', u.email
                    )
                )
                FROM AppointmentUser au
                JOIN \`User\` u ON u.user_id = au.user_id
                WHERE au.appointment_id = a.appointment_id
            ),
            JSON_ARRAY()
        ) AS members,

        -- Clients
        COALESCE(
          (
            SELECT JSON_ARRAYAGG(
              JSON_OBJECT(
                'client_id', ac.client_id,
                'client_name', (
                  SELECT cv2.row_value
                  FROM ClientCustomValue cv2
                  JOIN ClientCustomField cf2 ON cf2.column_id = cv2.column_id
                  JOIN Client c2 ON c2.client_id = cv2.client_id
                  WHERE cv2.client_id = ac.client_id
                    AND cf2.is_system = 1
                    AND c2.company_id = ?
                  ORDER BY cv2.client_custom_value_id ASC
                  LIMIT 1
                )
              )
            )
            FROM AppointmentClient ac
            WHERE ac.appointment_id = a.appointment_id
          ),
          JSON_ARRAY()
        ) AS clients

    FROM Appointment a
    WHERE a.company_id = ?
    ORDER BY a.start ASC;
  `;
};

// queries/appointmentQueries.js
const getAppointmentsQuery = () => {
  return `
    SELECT
        a.*,

        -- Members
        COALESCE(
            (
                SELECT JSON_ARRAYAGG(
                    JSON_OBJECT(
                        'user_id', au.user_id,
                        'name', u.first_name,
                        'email', u.email
                    )
                )
                FROM AppointmentUser au
                JOIN \`User\` u ON u.user_id = au.user_id
                WHERE au.appointment_id = a.appointment_id
            ),
            JSON_ARRAY()
        ) AS members,

        -- Clients
        COALESCE(
  (
    SELECT JSON_ARRAYAGG(
      JSON_OBJECT(
        'client_id', ac.client_id,
        'client_name', (
          -- pick single client name (the first matching cv.row_value)
          SELECT cv2.row_value
          FROM ClientCustomValue cv2
          JOIN ClientCustomField cf2 ON cf2.column_id = cv2.column_id
          JOIN Client c2 ON c2.client_id = cv2.client_id
          WHERE cv2.client_id = ac.client_id
            AND cf2.is_system = 1        
            AND c2.company_id = ?         
          ORDER BY cv2.client_custom_value_id ASC
          LIMIT 1
        )
      )
    )
    FROM AppointmentClient ac
    WHERE ac.appointment_id = a.appointment_id
  ),
  JSON_ARRAY()
) AS clients

    FROM Appointment a
    WHERE a.company_id = ?
    AND (
        a.user_id = ? OR
        EXISTS (
            SELECT 1
            FROM AppointmentUser au
            WHERE au.appointment_id = a.appointment_id
            AND au.user_id = ?
        )
    )
    ORDER BY a.start ASC;

  `;
};

const updateAppointmentQuery = () => {
  // update allowed fields: title, description, venue, color, status, start, end, updated_at, user_id, company_id optionally
  return `
    UPDATE Appointment
    SET
      title = ?,
      description = ?,
      venue = ?,
      color = ?,
      status = ?,
      start = ?,
      end = ?,
      updated_at = ?
    WHERE appointment_id = ?
  `;
};

const deleteAppointmentUserByAppointmentIdQuery = () => {
  return `
    DELETE FROM AppointmentUser
    WHERE appointment_id = ?
  `;
};

const deleteAppointmentClientByAppointmentIdQuery = () => {
  return `
    DELETE FROM AppointmentClient
    WHERE appointment_id = ?
  `;
};

const deleteAppointmentQuery = () => {
  return `
    DELETE FROM Appointment
    WHERE appointment_id = ?
  `;
};

module.exports = {
  getAppointmentsQueryAdmin,
  searchClientListInAppointmentQuery,
  createAppointmentQuery,
  createAppointmentUserQuery,
  createAppointmentClientQuery,
  getAppointmentsQuery,
  deleteAppointmentQuery,
  deleteAppointmentUserByAppointmentIdQuery,
  deleteAppointmentClientByAppointmentIdQuery,
  updateAppointmentQuery,
};
