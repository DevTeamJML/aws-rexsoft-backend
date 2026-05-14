const createClientCustomValueQuery = (custom_values) => {
  const placeholder = Array(custom_values.length)
    .fill(`(?, ?, ?, ?, ?, ?)`)
    .join(", ");
  return `
    INSERT INTO ClientCustomValue (
      client_id,
      column_id, 
      client_group_id,
      row_value, 
      created_at, 
      updated_at
    ) VALUES ${placeholder}
  `;
};
const updateClientCustomValueQuery = (custom_values = []) => {
  let rowValueCases = "";
  let updatedAtCases = "";
  let whereConditions = "";

  const rowValueParams = [];
  const updatedAtParams = [];
  const whereParams = [];

  custom_values.forEach(({ client_id, column_id, row_value }, index) => {
    // CASE for row_value
    rowValueCases += `WHEN client_id = ? AND column_id = ? THEN ? `;
    rowValueParams.push(client_id, column_id, row_value ?? "");

    // CASE for updated_at
    updatedAtCases += `WHEN client_id = ? AND column_id = ? THEN NOW() `;
    updatedAtParams.push(client_id, column_id);

    whereConditions += `(client_id = ? AND column_id = ?)`;
    whereParams.push(client_id, column_id);

    if (index !== custom_values.length - 1) {
      whereConditions += " OR ";
    }
  });

  return {
    query: `
      UPDATE ClientCustomValue
      SET
        row_value = CASE ${rowValueCases} ELSE row_value END,
        updated_at = CASE ${updatedAtCases} ELSE updated_at END
      WHERE ${whereConditions};
    `,
    values: [...rowValueParams, ...updatedAtParams, ...whereParams],
  };
};

const bulkUpdateClientAlertValueQuery = ({
  client_id_list,
  alert_values,
  client_group_id,
}) => {
  const valuesPlaceholder = alert_values
    .map(() => "(?, ?, ?, ?, NOW(), NOW())")
    .join(", ");

  const values = alert_values.flatMap(({ client_id, column_id, row_value }) => [
    client_id,
    column_id,
    client_group_id,
    row_value ?? "",
  ]);

  return {
    query: `
      INSERT INTO ClientCustomValue (client_id, column_id, client_group_id, row_value, created_at, updated_at)
      VALUES ${valuesPlaceholder}
      ON DUPLICATE KEY UPDATE 
        row_value = VALUES(row_value),
        updated_at = NOW()
    `,
    values,
  };
};

// const bulkUpdateClientCustomValueQuery = ({
//   client_id_list,
//   custom_values,
//   client_group_id,
// }) => {
//   const clientIdPlaceholder = client_id_list.map(() => "?").join(", ");
//   let rowValueCases = "";
//   let updatedAtCases = "";
//   const rowValueParams = [];
//   const updatedAtParams = [];

//   custom_values.forEach(({ column_id, row_value }, index) => {
//     rowValueCases += `WHEN column_id = ? THEN ? `;
//     updatedAtCases += `WHEN column_id = ? THEN NOW() `;

//     // Add values for each block
//     rowValueParams.push(column_id, row_value ?? "");
//     updatedAtParams.push(column_id);
//   });

//   return {
//     query: `
//      UPDATE ClientCustomValue SET
//       row_value = CASE ${rowValueCases} ELSE row_value END,
//       updated_at = CASE ${updatedAtCases} ELSE updated_at END
//     WHERE client_id IN (${clientIdPlaceholder})
//     AND client_group_id = ?
//   `,
//     values: [
//       ...rowValueParams,
//       ...updatedAtParams,
//       ...client_id_list,
//       client_group_id,
//     ],
//   };
// };

const bulkUpdateClientCustomValueQuery = ({
  client_id_list,
  custom_values,
  client_group_id,
}) => {
  const valuesPlaceholder = client_id_list
    .map(() => custom_values.map(() => "(?, ?, ?, ?, ?, ?)").join(", "))
    .join(", ");

  const values = [];

  client_id_list.forEach((client_id) => {
    custom_values.forEach(({ column_id, row_value }) => {
      values.push(
        client_id,
        column_id,
        client_group_id,
        row_value ?? "",
        new Date(),
        new Date(),
      );
    });
  });

  return {
    query: `
      INSERT INTO ClientCustomValue (client_id, column_id, client_group_id, row_value, created_at, updated_at)
      VALUES ${valuesPlaceholder}
      ON DUPLICATE KEY UPDATE 
        row_value = VALUES(row_value),
        updated_at = NOW()
    `,
    values,
  };
};

module.exports = {
  createClientCustomValueQuery,
  updateClientCustomValueQuery,
  bulkUpdateClientCustomValueQuery,
  bulkUpdateClientAlertValueQuery,
};
