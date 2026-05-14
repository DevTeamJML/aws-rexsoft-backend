const sanitizeBooleanSearch = (str) => {
  return str
    .replace(/[@+\-<>~*()"']/g, " ") // remove special operators
    .replace(/\s+/g, " ") // normalize spaces
    .trim();
};

const buildWhereClause = (
  filters = [],
  columns = [],
  fixedColumns = [],
  globalSearchText = "",
) => {
  const conditions = [];
  const params = [];

  const allColumns = [...fixedColumns, ...columns];

  if (globalSearchText && globalSearchText.trim() !== "") {
    const likeTerm = `${globalSearchText}%`;
    // const fulltextTerm = `+${globalSearchText}*`;
    const cleaned = sanitizeBooleanSearch(globalSearchText);
    const fulltextTerm = cleaned
      .split(" ")
      .filter((word) => word.length > 0)
      .map((word) => `+${word}*`)
      .join(" ");

    const textColumnIds = columns
      .filter((c) =>
        ["short_text", "multiline", "rich_text", "alert"].includes(
          c.field_type,
        ),
      )
      .map((c) => c.column_id);

    const isEmailLike = globalSearchText.includes("@");

    if (isEmailLike) {
      conditions.push(`(
      c.serial_number LIKE ?
      OR c.client_id IN (
        SELECT cu.client_id
        FROM ClientUser cu
        JOIN User u ON u.user_id = cu.user_id
        WHERE CONCAT_WS(' ', u.first_name, u.last_name) LIKE ?
      )
      OR c.client_id IN (
        SELECT ccv.client_id
        FROM ClientCustomValue ccv
        WHERE ccv.column_id IN (${textColumnIds.map(() => "?").join(",")})
        AND ccv.row_value LIKE ?
      )
  )`);

      params.push(likeTerm, likeTerm, ...textColumnIds, globalSearchText);
    } else {
      conditions.push(`(
      c.serial_number LIKE ?
      OR c.client_id IN (
        SELECT cu.client_id
        FROM ClientUser cu
        JOIN User u ON u.user_id = cu.user_id
        WHERE CONCAT_WS(' ', u.first_name, u.last_name) LIKE ?
      )
      OR c.client_id IN (
        SELECT ccv.client_id
        FROM ClientCustomValue ccv
        WHERE ccv.column_id IN (${textColumnIds.map(() => "?").join(",")})
        AND MATCH(ccv.row_value) AGAINST (? IN BOOLEAN MODE)
      )
  )`);

      params.push(likeTerm, likeTerm, ...textColumnIds, fulltextTerm);
    }
  }

  filters.forEach((filter) => {
    if (filter.isGlobalSearch) return;

    const column = allColumns.find(
      (col) =>
        col.column_id === filter.column_id || col.id === filter.column_id,
    );
    if (!column) return;

    const columnType = column.field_type;
    const columnId = column.column_id || column.id;

    switch (columnId) {
      case "serial_number":
        if (filter.searchText?.trim()) {
          conditions.push(`c.serial_number LIKE ?`);
          params.push(`${filter.searchText}%`);
        }

        if (filter.minValue != null) {
          conditions.push(`c.serial_number >= ?`);
          params.push(Number(filter.minValue));
        }

        if (filter.maxValue != null) {
          conditions.push(`c.serial_number <= ?`);
          params.push(Number(filter.maxValue));
        }
        break;

      case "created_at":
        if (filter.startDate) {
          conditions.push(`c.created_at >= ?`);
          params.push(filter.startDate);
        }
        if (filter.endDate) {
          conditions.push(`c.created_at <= ?`);
          params.push(filter.endDate + " 23:59:59");
        }
        break;

      case "handler":
        if (filter.selectedOptions?.length) {
          const placeholders = filter.selectedOptions.map(() => "?").join(",");
          conditions.push(`c.client_id IN (
              SELECT cu.client_id
              FROM ClientUser cu
              JOIN User u ON u.user_id = cu.user_id
              WHERE u.user_id IN (${placeholders})
              )`);

          params.push(...filter.selectedOptions);
        }

        // if (filter.searchText?.trim()) {
        //   conditions.push(`c.client_id IN (
        //     SELECT cu.client_id
        //     FROM ClientUser cu
        //     JOIN User u ON u.user_id = cu.user_id
        //     WHERE CONCAT_WS(' ', u.first_name, u.last_name) LIKE ?
        //   )`);
        //   params.push(`${filter.searchText}%`);
        // }

        if (filter.filterType === "unfilled") {
          conditions.push(`NOT EXISTS (
            SELECT 1 FROM ClientUser cu
            WHERE cu.client_id = c.client_id
          )`);
        }

        if (filter.filterType === "filled") {
          conditions.push(`EXISTS (
            SELECT 1 FROM ClientUser cu
            WHERE cu.client_id = c.client_id
          )`);
        }
        break;

      // =========================
      // DYNAMIC FIELDS
      // =========================
      default:
        if (columnType === "alert") {
          const statusExpr = `
            JSON_EXTRACT(ccv.row_value, '$.is_complete')
          `;

          const dateExpr = `
            STR_TO_DATE(
              JSON_UNQUOTE(JSON_EXTRACT(ccv.row_value, '$.date')),
              '%Y-%m-%d'
            )
          `;

          // ===== UNFILLED (standalone)
          if (filter.filterType === "unfilled") {
            conditions.push(`
                NOT EXISTS (
                  SELECT 1
                  FROM ClientCustomValue ccv
                  WHERE ccv.client_id = c.client_id
                    AND ccv.column_id = ?
                    AND JSON_VALID(ccv.row_value)
                    AND ${dateExpr} IS NOT NULL
                )
            `);
            params.push(columnId);
            return;
          }

          // ===== COMBINED FILTER (date + status + filled)
          let subConditions = [
            `
              ccv.client_id = c.client_id
              AND ccv.column_id = ?
              AND JSON_VALID(ccv.row_value)
            `,
          ];

          const subParams = [columnId];

          // filled means must have valid date
          if (filter.filterType === "filled") {
            subConditions.push(`${dateExpr} IS NOT NULL`);
          }

          // date range
          if (filter.startDate) {
            subConditions.push(`${dateExpr} >= ?`);
            subParams.push(filter.startDate);
          }

          if (filter.endDate) {
            subConditions.push(`${dateExpr} <= ?`);
            subParams.push(filter.endDate);
          }

          // status filter
          if (filter.selectedOptions?.length) {
            const statusConditions = [];

            if (filter.selectedOptions.includes("Completed")) {
              statusConditions.push(`${statusExpr} = true`);
            }

            if (filter.selectedOptions.includes("Pending")) {
              statusConditions.push(
                `(${statusExpr} = false OR ${statusExpr} IS NULL)`,
              );
            }

            if (statusConditions.length) {
              subConditions.push(`(${statusConditions.join(" OR ")})`);
            }
          }

          // final EXISTS
          conditions.push(`
            EXISTS (
              SELECT 1
              FROM ClientCustomValue ccv
              WHERE ${subConditions.join(" AND ")}
            )
          `);

          params.push(...subParams);
          return;
        }
        // else {
        //   if (filter.filterType === "unfilled") {
        //     conditions.push(`NOT EXISTS (
        //     SELECT 1 FROM ClientCustomValue ccv
        //      WHERE ccv.client_id = c.client_id
        //       AND ccv.column_id = ?
        //       AND ccv.row_value IS NOT NULL
        //       AND ccv.row_value != ''
        //       AND TRIM(ccv.row_value) != ''
        //   )`);
        //     params.push(columnId);
        //     return;
        //   }

        //   if (filter.filterType === "filled") {
        //     conditions.push(`EXISTS (
        //     SELECT 1 FROM ClientCustomValue ccv
        //     WHERE ccv.client_id = c.client_id
        //     AND ccv.column_id = ?
        //     AND ccv.row_value IS NOT NULL
        //     AND ccv.row_value != ''
        //     AND TRIM(ccv.row_value) != ''
        //   )`);
        //     params.push(columnId);
        //     return;
        //   }

        //   switch (columnType) {
        //     case "short_text":
        //     case "multiline":
        //     case "rich_text":
        //       if (filter.searchText?.trim()) {
        //         conditions.push(`c.client_id IN (
        //         SELECT client_id FROM ClientCustomValue
        //         WHERE column_id = ?
        //         AND row_value LIKE ?
        //       )`);
        //         params.push(columnId, `${filter.searchText}%`);
        //       }
        //       break;

        //     case "dropdown":
        //       if (filter.selectedOptions?.length) {
        //         const placeholders = filter.selectedOptions
        //           .map(() => "?")
        //           .join(",");
        //         conditions.push(`c.client_id IN (
        //         SELECT client_id FROM ClientCustomValue
        //         WHERE column_id = ?
        //         AND row_value IN (${placeholders})
        //       )`);
        //         params.push(columnId, ...filter.selectedOptions);
        //       }
        //       break;

        //     case "number":
        //       if (filter.minValue != null) {
        //         conditions.push(`c.client_id IN (
        //         SELECT client_id FROM ClientCustomValue
        //         WHERE column_id = ?
        //         AND CAST(row_value AS DECIMAL(10,2)) >= ?
        //       )`);
        //         params.push(columnId, parseFloat(filter.minValue));
        //       }
        //       if (filter.maxValue != null) {
        //         conditions.push(`c.client_id IN (
        //         SELECT client_id FROM ClientCustomValue
        //         WHERE column_id = ?
        //         AND CAST(row_value AS DECIMAL(10,2)) <= ?
        //       )`);
        //         params.push(columnId, parseFloat(filter.maxValue));
        //       }
        //       break;

        //     case "date":
        //       if (filter.startDate) {
        //         conditions.push(`c.client_id IN (
        //         SELECT client_id FROM ClientCustomValue
        //         WHERE column_id = ?
        //         AND row_value >= ?
        //       )`);
        //         params.push(columnId, filter.startDate);
        //       }
        //       if (filter.endDate) {
        //         conditions.push(`c.client_id IN (
        //         SELECT client_id FROM ClientCustomValue
        //         WHERE column_id = ?
        //         AND row_value <= ?
        //       )`);
        //         params.push(columnId, filter.endDate);
        //       }
        //       break;
        //   }
        // }
        else {

          if (filter.filterType === "unfilled") {
            conditions.push(`NOT EXISTS (
                SELECT 1 FROM ClientCustomValue ccv
                WHERE ccv.client_id = c.client_id
                  AND ccv.column_id = ?
                  AND TRIM(IFNULL(ccv.row_value, '')) != ''
              )`);
            params.push(columnId);
            return;
          }

          const subConditions = ["column_id = ?"];
          const subParams = [columnId];

          if (filter.filterType === "filled") {
            subConditions.push("TRIM(IFNULL(row_value, '')) != ''");
          }

          if (
            columnType === "short_text" ||
            columnType === "multiline" ||
            columnType === "rich_text"
          ) {
            if (filter.searchText?.trim()) {
              subConditions.push("row_value LIKE ?");
              subParams.push(`%${filter.searchText}%`);
            }
          }

          if (columnType === "dropdown") {
            if (filter.selectedOptions?.length) {
              const placeholders = filter.selectedOptions
                .map(() => "?")
                .join(",");
              subConditions.push(`row_value IN (${placeholders})`);
              subParams.push(...filter.selectedOptions);
            }
          }

          if (columnType === "number") {
            if (filter.minValue != null) {
              subConditions.push("CAST(row_value AS DECIMAL(10,2)) >= ?");
              subParams.push(parseFloat(filter.minValue));
            }

            if (filter.maxValue != null) {
              subConditions.push("CAST(row_value AS DECIMAL(10,2)) <= ?");
              subParams.push(parseFloat(filter.maxValue));
            }
          }

          if (columnType === "date") {
            if (filter.startDate) {
              subConditions.push("row_value >= ?");
              subParams.push(filter.startDate);
            }

            if (filter.endDate) {
              subConditions.push("row_value <= ?");
              subParams.push(filter.endDate);
            }
          }

          conditions.push(`c.client_id IN (
            SELECT client_id FROM ClientCustomValue
            WHERE ${subConditions.join(" AND ")}
          )`);

          params.push(...subParams);
        }

        break;
    }
  });

  const whereClause =
    conditions.length > 0 ? `AND ${conditions.join(" AND ")}` : "";

  return { whereClause, params };
};

module.exports = buildWhereClause;
