const buildOrderByClause = (sortConfig, fixedColumns, dynamicColumns) => {
  if (!sortConfig.id || !sortConfig.order) {
    return {
      orderBy: "ORDER BY c.client_id DESC",
      join: "",
    };
  }

  const { id, order } = sortConfig;
  const direction = order.toUpperCase();

  const fixedColumn = fixedColumns.find((col) => col.id === id);
  if (fixedColumn) {
    switch (id) {
      case "serial_number":
        return {
          orderBy: `ORDER BY c.serial_number ${direction}`,
          join: "",
        };
      case "created_at":
        return {
          orderBy: `ORDER BY c.created_at ${direction}`,
          join: "",
        };
      case "handler":
        return {
          orderBy: `ORDER BY u.first_name ${direction}`,
          join: `
          LEFT JOIN ClientUser cu ON cu.client_id = c.client_id 
          LEFT JOIN User u ON u.user_id = cu.user_id`,
        };
      default:
        return {
          orderBy: "ORDER BY c.client_id DESC",
          join: "",
        };
    }
  }

  const dynamicColumn = dynamicColumns.find((col) => col.column_id === id);
  if (dynamicColumn) {
    const type = dynamicColumn?.field_type;

    if (type === "alert") {
      return {
        orderBy: `ORDER BY (
            CASE 
              WHEN JSON_VALID(cv_sort.row_value) 
              THEN JSON_UNQUOTE(JSON_EXTRACT(cv_sort.row_value, '$.date'))
              ELSE NULL
            END IS NULL
          ),
          STR_TO_DATE(
            CASE 
              WHEN JSON_VALID(cv_sort.row_value) 
              THEN JSON_UNQUOTE(JSON_EXTRACT(cv_sort.row_value, '$.date'))
              ELSE NULL
            END,
            '%Y-%m-%d'
          )  ${direction}`,
        join: `
          LEFT JOIN (
            SELECT client_id, MAX(row_value) AS row_value
            FROM ClientCustomValue
            WHERE column_id = '${id}'
            GROUP BY client_id
          ) cv_sort ON cv_sort.client_id = c.client_id
          `,
      };
    } else {
      return {
        orderBy: `ORDER BY cv_sort.row_value ${direction}`,
        //   join: `
        //   LEFT JOIN ClientCustomValue cv_sort
        //     ON cv_sort.client_id = c.client_id
        //     AND cv_sort.column_id = '${id}'
        // `,
        join: `
          LEFT JOIN (
            SELECT client_id, MAX(row_value) AS row_value
            FROM ClientCustomValue
            WHERE column_id = '${id}'
            GROUP BY client_id
          ) cv_sort ON cv_sort.client_id = c.client_id
          `,
      };
    }
  }

  return {
    orderBy: "ORDER BY c.client_id DESC",
    join: "",
  };
};

module.exports = buildOrderByClause;
