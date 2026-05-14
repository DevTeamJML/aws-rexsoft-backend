const moment = require("moment");
const getConnection = require("../db/pool");
const {
  getGraphDatasetQuery,
  updateGraphQuery,
  insertGraphQuery,
  getGraphsBySourceQuery,
  getGraphByIdQuery,
  getFormGraphDatasetQuery,
  getPublishedGraphQuery,
  deleteGraphQuery,
} = require("../queries/graphQueries");

const resolveDateFilter = ({ saved, override }) => {
  if (override?.range) {
    return {
      dateColumnId: saved?.dateColumnId || null,
      range: override.range,
    };
  }

  if (saved?.dateColumnId) {
    return {
      dateColumnId: saved.dateColumnId,
      range: saved.range && saved.range !== "all" ? saved.range : "7d",
    };
  }

  if (saved?.range && saved.range !== "all") {
    return {
      range: saved.range,
    };
  }

  return {
    range: "today",
  };
};

const isDateField = (type) => type === "date" || type === "datetime";

const normalizeValue = (val) => {
  if (val === null || val === undefined) return null;

  if (typeof val === "string") {
    const trimmed = val.trim();
    if (trimmed === "") return null;

    if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) return parsed[0] ?? null;
      } catch {
        return trimmed;
      }
    }

    return trimmed;
  }

  if (Array.isArray(val)) return val[0] ?? null;

  return val;
};

const resolveFieldValue = (row_value, axis) => {
  if (!axis) return null;
  // Handler field → map user_id → label
  if (axis.field_type === "handler") {
    const userId = normalizeValue(row_value);
    const user = axis.userList?.find((u) => u.value === userId);
    return user?.label ?? "Unknown";
  }

  // Normal fields
  return normalizeValue(row_value);
};

const normalizeDate = (value) =>
  moment(value).isValid() ? moment(value).format("YYYY-MM-DD") : value;
const isWithinDateRange = (value, range) => {
  if (!value || !range || range === "all") return true;

  const date = moment.utc(value);
  const now = moment.utc();

  switch (range) {
    case "today":
      return date.isSameOrAfter(now.clone().startOf("day"));
    case "7d":
      return date.isSameOrAfter(now.clone().subtract(7, "days"));
    case "1m":
      return date.isSameOrAfter(now.clone().subtract(1, "month"));
    case "6m":
      return date.isSameOrAfter(now.clone().subtract(6, "months"));
    case "1y":
      return date.isSameOrAfter(now.clone().subtract(1, "year"));
    default:
      return true;
  }
};

const sortGraphData = (data, sortBy = "x", sortOrder = "asc") => {
  const dir = sortOrder === "desc" ? -1 : 1;

  return data.sort((a, b) => {
    if (sortBy === "y") {
      return ((a.y ?? 0) - (b.y ?? 0)) * dir;
    }

    if (typeof a.x === "number" && typeof b.x === "number") {
      return (a.x - b.x) * dir;
    }

    return String(a.x).localeCompare(String(b.x)) * dir;
  });
};

const generateGraphDataInternal = async (body, connection) => {
  const {
    source = "group",
    source_id,
    xAxis,
    yAxis,
    series,
    dateFilter,
    sort,
    limit,
  } = body;

  if (!xAxis?.id || !yAxis?.id) {
    throw new Error("X Axis and Y Axis are required");
  }

  const isFormSource = source === "form";
  const filterDateColumnId = dateFilter?.dateColumnId || null;
  const dateRange = dateFilter?.range || "all";
  const isNumericYAxis = yAxis.field_type === "number";

  /**
   * Build Column Ids
   */
  // const ids = [xAxis.id, yAxis.id];
  // if (series?.id) ids.push(series.id);

  const ids = [xAxis.id, yAxis.id, series?.id]
    .filter(Boolean)
    .filter((id) => id !== "handler");

  /**
   * Query
   */
  const sql = isFormSource
    ? getFormGraphDatasetQuery(ids.length)
    : getGraphDatasetQuery(ids.length);

    console.log(sql)
  const params = isFormSource ? [source_id, ...ids] : ids;
  const [rows] = await connection.query(sql, params);

  const normalizedRows = rows.flatMap((r) => {
    const base = isFormSource
      ? {
          entity_id: r.form_submission_id,
          created_at: r.created_at,
        }
      : {
          entity_id: r.client_id,
          created_at: r.created_at,
        };

    const out = [];

    // Normal custom fields
    if (r.column_id || r.form_question_id) {
      out.push({
        ...base,
        column_id: isFormSource ? r.form_question_id : r.column_id,
        row_value: isFormSource ? r.answer : r.row_value,
      });
    }
    
    // Inject handler
    out.push({
      ...base,
      column_id: "handler",
      row_value: r.user_id,
    });

    return out;
  });

  /**
   * Group per entity
   */
  const perEntity = {};

  normalizedRows.forEach(({ entity_id, column_id, row_value, created_at }) => {
    perEntity[entity_id] ||= {
      _createdAt: created_at,
    };

    if (column_id === filterDateColumnId) {
      perEntity[entity_id]._filterDate = row_value;
    }

    if (column_id === xAxis.id) {
      const resolved = resolveFieldValue(row_value, xAxis) ?? "N/A";

      perEntity[entity_id].x = isDateField(xAxis.field_type)
        ? normalizeDate(row_value)
        : resolved;
    }

    if (column_id === yAxis.id) {
      if (isNumericYAxis) {
        perEntity[entity_id].y = Number(row_value) || 0;
      } else {
        perEntity[entity_id].y = 1;
      }
    }

    if (column_id === series?.id) {
      const resolved = resolveFieldValue(row_value, series) ?? "N/A";

      perEntity[entity_id].seriesValue = isDateField(series.field_type)
        ? normalizeDate(row_value)
        : resolved;
    }
  });

  /**
   * Aggregate data
   */
  const aggregated = {};

  Object.values(perEntity).forEach(
    ({ x, y = 0, seriesValue, _filterDate, _createdAt }) => {
      const effectiveDate =
        filterDateColumnId && _filterDate ? _filterDate : _createdAt;

      if (!isWithinDateRange(effectiveDate, dateRange)) return;
      if (x == null || x === "") return;

      if (series?.id) {
        const key = seriesValue ?? "N/A";
        aggregated[x] ??= { x };
        aggregated[x][key] = (aggregated[x][key] ?? 0) + y;
      } else {
        aggregated[x] ??= { x, y: 0 };
        aggregated[x].y += y;
      }
    },
  );

  /**
   * Zero-fill missing series keys
   */
  if (series?.id) {
    const seriesKeys = new Set();

    // Collect all possible series keys
    Object.values(aggregated).forEach((row) => {
      Object.keys(row).forEach((k) => {
        if (k !== "x") seriesKeys.add(k);
      });
    });

    // Fill missing keys with 0
    Object.values(aggregated).forEach((row) => {
      seriesKeys.forEach((k) => {
        if (row[k] == null) row[k] = 0;
      });
    });
  }

  let data = Object.values(aggregated);
  data = sortGraphData(data, sort?.by, sort?.order);
  if (limit) data = data.slice(0, limit);

  return { data };
};

const generateGraphData = async (body) => {
  const connection = await getConnection();
  try {
    return await generateGraphDataInternal(body, connection);
  } finally {
    connection.release();
  }
};

const saveGraph = async (body) => {
  const connection = await getConnection();

  try {
    const {
      company_id,
      user_id,
      graph_id,
      graph_source,
      source_id,
      title,
      description,
      chart_type,
      xAxis,
      yAxis,
      series,
      sort,
      dateFilter,
      visualSettings,
      viewableMembers,
      is_publish,
    } = body;

    if (graph_id) {
      await connection.query(updateGraphQuery(), [
        graph_source,
        source_id,
        title || null,
        description || null,
        chart_type,
        JSON.stringify(xAxis),
        JSON.stringify(yAxis),
        series ? JSON.stringify(series) : null,
        sort ? JSON.stringify(sort) : null,
        dateFilter ? JSON.stringify(dateFilter) : null,
        visualSettings ? JSON.stringify(visualSettings) : null,
        JSON.stringify(viewableMembers || []),
        is_publish ? 1 : 0,
        graph_id,
        company_id,
      ]);
    } else {
      const [res] = await connection.query(insertGraphQuery(), [
        company_id,
        user_id,
        graph_source,
        source_id,
        title || null,
        description || null,
        chart_type,
        JSON.stringify(xAxis),
        JSON.stringify(yAxis),
        series ? JSON.stringify(series) : null,
        sort ? JSON.stringify(sort) : null,
        dateFilter ? JSON.stringify(dateFilter) : null,
        visualSettings ? JSON.stringify(visualSettings) : null,
        JSON.stringify(viewableMembers || []),
        is_publish ? 1 : 0,
      ]);

      return { success: true, graph_id: res.insertId };
    }

    return { success: true, graph_id };
  } finally {
    connection.release();
  }
};

const getGraphsBySource = async (params) => {
  const connection = await getConnection();
  try {
    const { company_id, graph_source, source_id } = params;

    const hasSourceId = !!source_id;
    const sql = getGraphsBySourceQuery({ hasSourceId });

    const queryParams = hasSourceId
      ? [company_id, graph_source, source_id]
      : [company_id, graph_source];

    const [rows] = await connection.query(sql, queryParams);
    return rows;
  } finally {
    connection.release();
  }
};

const getGraphById = async (params) => {
  const connection = await getConnection();
  try {
    const { graph_id, company_id } = params;

    const [rows] = await connection.query(getGraphByIdQuery(), [
      graph_id,
      company_id,
    ]);

    if (!rows.length) return null;

    const r = rows[0];

    return {
      ...r,
      xAxis: r.x_axis,
      yAxis: r.y_axis,
      series: r.series ? r.series : null,
      sort: r.sort_setting ? r.sort_setting : null,
      dateFilter: r.date_setting ? r.date_setting : null,
      visualSettings: r.visual_setting ? r.visual_setting : null,
      viewableMembers: r.viewable_by || [],
    };
  } finally {
    connection.release();
  }
};

const getPublishedGraphById = async (params) => {
  const connection = await getConnection();

  try {
    const { company_id, graph_id, dateRange = "7d" } = params;

    // console.log("this is params : ", params)
    const [rows] = await connection.query(
      `
      SELECT *
      FROM Graph
      WHERE graph_id = ?
        AND company_id = ?
        AND is_publish = 1
      LIMIT 1
      `,
      [graph_id, company_id],
    );

    if (!rows.length) return null;

    const r = rows[0];

    // console.log("This is rows : ", rows.length)

    const resolvedDateFilter = resolveDateFilter({
      saved: r.date_setting,
      override: { range: dateRange },
    });

    const summary = await generateGraphDataInternal(
      {
        source: r.graph_source,
        source_id: r.source_id,
        xAxis: r.x_axis,
        yAxis: r.y_axis,
        series: r.series ?? null,
        sort: r.sort_setting ?? null,
        dateFilter: resolvedDateFilter,
        limit: 500,
      },
      connection,
    );

    return {
      graph_id: r.graph_id,
      title: r.title,
      chart_type: r.chart_type,
      graph_source: r.graph_source,
      source_id: r.source_id,
      xAxis: r.x_axis,
      yAxis: r.y_axis,
      series: r.series ?? null,
      visualSettings: r.visual_setting ?? null,
      data: summary.data,
    };
  } finally {
    connection.release();
  }
};

const getPublishedGraph = async (params) => {
  const connection = await getConnection();

  try {
    const { company_id, limit = 4, offset = 0, isAdmin, user_id } = params;

    const isAdminBool = isAdmin === true || isAdmin === "true" || isAdmin === 1;

    const sql = getPublishedGraphQuery({ isAdmin: isAdminBool });

    const queryParams = isAdminBool
      ? [company_id, Number(limit), Number(offset)]
      : [company_id, user_id, Number(limit), Number(offset)];

    const [rows] = await connection.query(sql, queryParams);

    const results = [];

    for (const r of rows) {
      const resolvedDateFilter = resolveDateFilter({
        saved: r.date_setting,
      });

      const summary = await generateGraphDataInternal(
        {
          source: r.graph_source,
          source_id: r.source_id,
          xAxis: r.x_axis,
          yAxis: r.y_axis,
          series: r.series ?? null,
          sort: r.sort_setting ?? null,
          dateFilter: resolvedDateFilter,
          limit: 20,
        },
        connection,
      );

      results.push({
        graph_id: r.graph_id,
        title: r.title,
        chart_type: r.chart_type,
        graph_source: r.graph_source,
        source_id: r.source_id,
        xAxis: r.x_axis,
        yAxis: r.y_axis,
        series: r.series ?? null,
        visualSettings: r.visual_setting ?? null,
        data: summary.data,
        dateFilter: resolvedDateFilter,
      });
    }
    return results;
  } finally {
    connection.release();
  }
};

const deleteGraph = async (graph_id) => {
  const connection = await getConnection();

  try {
    const query = deleteGraphQuery();
    await connection.execute(query, [graph_id]);
    return graph_id;
  } finally {
    connection.release();
  }
};

module.exports = {
  generateGraphData,
  saveGraph,
  getGraphsBySource,
  getGraphById,
  getPublishedGraph,
  getPublishedGraphById,
  deleteGraph,
};
