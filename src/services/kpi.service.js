const {
  deleteKpiUsersByKpiIdQuery,
  insertKpiUserQuery,
  upsertKpiGroupKpiQuery,
  upsertKpiGroupQuery,
  upsertKpiQuery,
  upsertKpiGraphQuery,
  getKpiGroupsQuery,
  getKpiByIdQuery,
  getKpiGroupByIdQuery,
  getPublishedKpiGroupsQuery,
  getKpiMembersQuery,
  getKpiGraphQuery,
  getKpisByGroupIdQuery,
  deleteKpiGroupQuery,
} = require("../queries/kpiQueries");
const moment = require("moment");
const { v4 } = require("uuid");

const getConnection = require("../db/pool");
const {
  getFormGraphDatasetQuery,
  getGraphDatasetQuery,
} = require("../queries/graphQueries");

const formatDateTime = (date) => {
  if (!date) return null;
  return moment.utc(date).format("YYYY-MM-DD HH:mm:ss");
};

function buildTimeSeries(rows) {
  const map = new Map();

  rows.forEach((r) => {
    const dateKey = r.created_at.toISOString().slice(0, 10);
    const value = Number(r.answer ?? r.row_value ?? 0);

    map.set(dateKey, (map.get(dateKey) || 0) + value);
  });

  return Array.from(map.entries()).map(([x, y]) => ({ x, y }));
}
function calculateStats(rows, data, target, measurementRule) {
  let current = 0;

  if (measurementRule === "per_entry") {
    current = rows.length;
  } else {
    // sum
    current = data.reduce((sum, d) => sum + d.y, 0);
  }

  const percentage = target
    ? Math.min(100, Math.round((current / target) * 100))
    : 0;

  return { current, percentage };
}
function calculateMyContribution(rows, userId, rule) {
  const mine = rows.filter((r) => r.user_id === userId);

  if (rule === "per_entry") return mine.length;

  const total = mine.reduce(
    (s, r) => s + Number(r.answer ?? r.row_value ?? 0),
    0
  );

  return total;
}

const normalizeDecimal = (v) =>
  v === '' || v === undefined || v === null
    ? null
    : Number(v);

const generateKpiDataInternal = async (_body, _connection) => {
  return {
    data: [], 
  };
};

const generateKpiData = async (body) => {
  const connection = await getConnection();
  try {
    return await generateKpiDataInternal(body, connection);
  } finally {
    connection.release();
  }
};

const saveKpi = async (body) => {
  const connection = await getConnection();

  const { group, kpis, visualization } = body;

  try {
    await connection.beginTransaction();

    const upsertKpiGroupSql = upsertKpiGroupQuery();

    const upsertKpiSql = upsertKpiQuery();

    const upsertKpiGroupKpiSql = upsertKpiGroupKpiQuery();

    const insertKpiUserSql = insertKpiUserQuery();

    const deleteKpiUserSql = deleteKpiUsersByKpiIdQuery();

    const upsertGraphSql = upsertKpiGraphQuery();

  
    await connection.query(upsertKpiGroupSql, [
      group.kpi_group_id,
      group.company_id,
      group.kpi_group_name,
      group.created_by,
      1,
    ]);
    
    for (let index = 0; index < kpis.length; index++) {
      const kpi = kpis[index];

      /**
       * KPI
       */
      await connection.query(upsertKpiSql, [
        kpi.kpi_id,
        group.company_id,
        group.created_by, // owner
        kpi.title,
        kpi.definition,
        kpi.data_source_type,
        kpi.data_source_id,
        kpi.metric_value_id,
        kpi.measurement_rule,
        kpi.measurement_unit,
        normalizeDecimal(kpi.target_value),
        formatDateTime(kpi.start_date),
        formatDateTime(kpi.due_date),
        kpi.team_contribution ? 1 : 0,
      ]);

      /**
       * KPI Group
       */
      await connection.query(upsertKpiGroupKpiSql, [
        group.kpi_group_id,
        kpi.kpi_id,
        index,
      ]);

      /**
       * KPI Member
       */
      await connection.query(deleteKpiUserSql, [kpi.kpi_id]);

      if (Array.isArray(kpi.members)) {
        for (const userId of kpi.members) {
          await connection.query(insertKpiUserSql, [kpi.kpi_id, userId]);
        }
      }
    }

    /**
     * KPI Graph
     */
    for (let index = 0; index < kpis.length; index++) {
      const kpi = kpis[index];

      const seriesConfig = visualization.series?.find(
        (s) => s.kpi_id === kpi.kpi_id
      );

      if (seriesConfig) {
        const graphId = seriesConfig.kpi_graph_id || v4();
        const now = new Date();

        await connection.query(upsertGraphSql, [
          graphId,
          group.company_id,
          group.created_by,
          kpi.kpi_id,
          seriesConfig.chart_type, 
          JSON.stringify(visualization.x_axis),
          JSON.stringify({
            unit: kpi.measurement_unit,
            target: normalizeDecimal(kpi.target_value),
          }),
          JSON.stringify({
            color: seriesConfig.color,
            visible: seriesConfig.visible,
          }),
          now,
          now,
        ]);
      }
    }

    await connection.commit();

    return {
      success: true,
      kpi_group_id: group.kpi_group_id,
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};


const getKpisBySource = async (params) => {
  const connection = await getConnection();

  try {
    const { company_id } = params;

    const sql = getKpiGroupsQuery();

    const [rows] = await connection.query(sql, [company_id]);
    return rows.map((row) => ({
      kpi_group_id: row.kpi_group_id,
      kpi_group_name: row.kpi_group_name,
      status: row.status,
      created_by: row.created_by,
      created_at: row.created_at,
      kpi_count: row.kpi_count,
    }));
  } finally {
    connection.release();
  }
};

const getKpiById = async (params) => {
  const connection = await getConnection();

  try {
    const { kpi_group_id } = params;

    const [rows] = await connection.query(getKpiGroupByIdQuery(), [
      kpi_group_id,
    ]);

    if (!rows.length) return null;

    const group = {
      kpi_group_id: rows[0].kpi_group_id,
      company_id: rows[0].company_id,
      created_by: rows[0].created_by,
      kpi_group_name: rows[0].kpi_group_name,
      status: rows[0].is_publish ? "published" : "draft",
    };

   
    const kpiMap = new Map();

    for (const row of rows) {
      if (!kpiMap.has(row.kpi_id)) {
        kpiMap.set(row.kpi_id, {
          kpi_id: row.kpi_id,
          title: row.kpi_title,
          definition: row.definition,
          data_source_type: row.data_source_type,
          data_source_id: row.data_source_id,
          metric_value_id: row.metric_value_id,
          measurement_rule: row.measurement_rule,
          measurement_unit: row.measurement_unit,
          target_value: row.target_value,
          start_date: row.start_date,
          due_date: row.due_date,
          team_contribution: Boolean(row.team_contribution),
          members: [],
          visualization: row.kpi_graph_id
            ? {
                kpi_graph_id: row.kpi_graph_id,
                chart_type: row.chart_type,
                x_axis: row.x_axis,
                y_axis: row.y_axis,
                visual_setting: row.visual_setting,
              }
            : null,
        });
      }

      if (row.member_user_id) {
        kpiMap.get(row.kpi_id).members.push(row.member_user_id);
      }
    }

    return {
      group,
      kpis: Array.from(kpiMap.values()),
    };
  } finally {
    connection.release();
  }
};

const getPublishedKpi = async ({ company_id, user_id }) => {
  const connection = await getConnection();

  try {
    const [groups] = await connection.query(getPublishedKpiGroupsQuery(), [
      company_id,
    ]);
    const [members] = await connection.query(getKpiMembersQuery());
    const [graphs] = await connection.query(getKpiGraphQuery());

    const membersMap = {};
    members.forEach((m) => {
      membersMap[m.kpi_id] ||= [];
      membersMap[m.kpi_id].push(m);
    });

    const graphMap = {};
    graphs.forEach((g) => (graphMap[g.kpi_id] = g.chart_type));

    const result = [];

    for (const group of groups) {
      const [kpis] = await connection.query(getKpisByGroupIdQuery(), [
        group.kpi_group_id,
      ]);

      let overallCurrent = 0;
      let overallTarget = 0;

      const enriched = [];

      for (const kpi of kpis) {
        let rows;

        if (kpi.data_source_type === "form") {
          [rows] = await connection.query(getFormGraphDatasetQuery(1), [
            kpi.data_source_id,
            kpi.metric_value_id,
          ]);
        } else {
          [rows] = await connection.query(getGraphDatasetQuery(1), [
            kpi.metric_value_id,
          ]);
        }

        const data = buildTimeSeries(rows);
        const { current, percentage } = calculateStats(
          rows,
          data,
          Number(kpi.target_value),
          kpi.measurement_rule
        );

        overallCurrent += current;
        overallTarget += Number(kpi.target_value || 0);

        enriched.push({
          measurement_rule: kpi.measurement_rule,
          kpi_id: kpi.kpi_id,
          title: kpi.title,
          chart_type: graphMap[kpi.kpi_id] || "bar",
          data,
          current_value: current,
          target_value: Number(kpi.target_value),
          percentage,
          team_contribution: !!kpi.team_contribution,
          my_contribution: kpi.team_contribution
            ? calculateMyContribution(rows, user_id, kpi.measurement_rule)
            : current,
          unit: kpi.measurement_unit,
          start_date: kpi.start_date,
          due_date: kpi.due_date,
          members: membersMap[kpi.kpi_id] || [],
        });
      }

      result.push({
        kpi_group_id: group.kpi_group_id,
        kpi_group_name: group.kpi_group_name,
        overall: {
          current: overallCurrent,
          target: overallTarget,
          percentage: overallTarget
            ? Math.round((overallCurrent / overallTarget) * 100)
            : 0,
        },
        kpis: enriched,
      });
    }

    return result;
  } finally {
    connection.release();
  }
};

const deleteKpiGroup = async (kpi_group_id) => {
  const connection = await getConnection();

  try {
    const query = deleteKpiGroupQuery();
    await connection.execute(query, [kpi_group_id]);
    return kpi_group_id;
  } finally {
    connection.release();
  }
};

module.exports = {
  generateKpiData, 
  saveKpi,
  getKpisBySource,
  getKpiById,
  getPublishedKpi,
  deleteKpiGroup
};
