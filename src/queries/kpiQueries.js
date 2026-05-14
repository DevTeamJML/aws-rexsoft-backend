
const upsertKpiGroupQuery = () => `
  INSERT INTO KpiGroup (
    kpi_group_id,
    company_id,
    title,
    created_by,
    is_publish,
    created_at,
    updated_at
  ) VALUES (?, ?, ?, ?, ?, NOW(), NOW())
  ON DUPLICATE KEY UPDATE
    title = VALUES(title),
    is_publish = VALUES(is_publish),
    updated_at = NOW();
`;

const upsertKpiQuery = () => `
  INSERT INTO Kpi (
    kpi_id,
    company_id,
    user_id,
    title,
    definition,
    data_source_type,
    data_source_id,
    metric_value_id,
    measurement_rule,
    measurement_unit,
    target_value,
    start_date,
    due_date,
    team_contribution,
    created_at,
    updated_at
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
  ON DUPLICATE KEY UPDATE
    title = VALUES(title),
    definition = VALUES(definition),
    data_source_type = VALUES(data_source_type),
    data_source_id = VALUES(data_source_id),
    metric_value_id = VALUES(metric_value_id),
    measurement_rule = VALUES(measurement_rule),
    measurement_unit = VALUES(measurement_unit),
    target_value = VALUES(target_value),
    start_date = VALUES(start_date),
    due_date = VALUES(due_date),
    team_contribution = VALUES(team_contribution),
    updated_at = NOW();
`;

const upsertKpiGroupKpiQuery = () => `
  INSERT INTO KpiGroupKpi (
    kpi_group_id,
    kpi_id,
    sort_order
  ) VALUES (?, ?, ?)
  ON DUPLICATE KEY UPDATE
    sort_order = VALUES(sort_order);
`;

const deleteKpiUsersByKpiIdQuery = () => `
  DELETE FROM KpiUser
  WHERE kpi_id = ?;
`;

const insertKpiUserQuery = () => `
  INSERT INTO KpiUser (
    kpi_user_id,
    kpi_id,
    user_id,
    created_at,
    updated_at
  ) VALUES (UUID(), ?, ?, NOW(), NOW());
`;

const upsertKpiGraphQuery = () => `
  INSERT INTO KpiGraph (
    kpi_graph_id,
    company_id,
    user_id,
    kpi_id,
    chart_type,
    x_axis,
    y_axis,
    visual_setting,
    created_at,
    updated_at
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  ON DUPLICATE KEY UPDATE
    chart_type = VALUES(chart_type),
    x_axis = VALUES(x_axis),
    y_axis = VALUES(y_axis),
    visual_setting = VALUES(visual_setting),
    updated_at = VALUES(updated_at)
`;


const getKpiGroupsQuery = () => `
  SELECT
    kg.kpi_group_id,
    kg.title AS kpi_group_name,
    CASE
      WHEN kg.is_publish = 1 THEN 'published'
      ELSE 'draft'
    END AS status,
    kg.created_by,
    kg.created_at,
    COUNT(kgk.kpi_id) AS kpi_count
  FROM KpiGroup kg
  LEFT JOIN KpiGroupKpi kgk
    ON kgk.kpi_group_id = kg.kpi_group_id
  WHERE kg.company_id = ?
  GROUP BY
    kg.kpi_group_id,
    kg.title,
    kg.is_publish,
    kg.created_at
  ORDER BY kg.created_at DESC
`;

const getKpiGroupByIdQuery = () => `
  SELECT
    -- group
    kg.kpi_group_id,
    kg.company_id,
    kg.created_by,
    kg.title AS kpi_group_name,
    kg.is_publish,

    -- ordering
    kgk.sort_order,

    -- kpi
    k.kpi_id,
    k.title AS kpi_title,
    k.definition,
    k.data_source_type,
    k.data_source_id,
    k.metric_value_id,
    k.measurement_rule,
    k.measurement_unit,
    k.target_value,
    k.start_date,
    k.due_date,
    k.team_contribution,

    -- members
    ku.user_id AS member_user_id,

    -- graph
    g.kpi_graph_id,
    g.chart_type,
    g.x_axis,
    g.y_axis,
    g.visual_setting

  FROM KpiGroup kg
  JOIN KpiGroupKpi kgk
    ON kgk.kpi_group_id = kg.kpi_group_id
  JOIN Kpi k
    ON k.kpi_id = kgk.kpi_id
  LEFT JOIN KpiUser ku
    ON ku.kpi_id = k.kpi_id
  LEFT JOIN KpiGraph g
    ON g.kpi_id = k.kpi_id

  WHERE kg.kpi_group_id = ?
  ORDER BY kgk.sort_order ASC
`;

// Published
const getPublishedKpiGroupsQuery = () => `
  SELECT
    kg.kpi_group_id,
    kg.title AS kpi_group_name
  FROM KpiGroup kg
  WHERE kg.company_id = ?
    AND kg.is_publish = 1
`;

const getKpisByGroupIdQuery = () => `
  SELECT
    k.*,
    kgk.sort_order
  FROM KpiGroupKpi kgk
  JOIN Kpi k ON k.kpi_id = kgk.kpi_id
  WHERE kgk.kpi_group_id = ?
  ORDER BY kgk.sort_order
`;

const getKpiMembersQuery = () => `
  SELECT
    ku.kpi_id,
    u.user_id,
    u.first_name
  FROM KpiUser ku
  JOIN User u ON u.user_id = ku.user_id
`;

const getKpiGraphQuery = () => `
  SELECT
    kpi_id,
    chart_type
  FROM KpiGraph
`;

const deleteKpiGroupQuery = () => {
  return `
    DELETE FROM KpiGroup
    WHERE kpi_group_id = ?;
`;
};

module.exports = {
  upsertKpiGroupQuery,
  upsertKpiQuery,
  upsertKpiGroupKpiQuery,
  deleteKpiUsersByKpiIdQuery,
  insertKpiUserQuery,
  upsertKpiGraphQuery,
  getKpiGroupsQuery,
  getKpiGroupByIdQuery,
  getPublishedKpiGroupsQuery,
  getKpisByGroupIdQuery,
  getKpiMembersQuery,
  getKpiGraphQuery,
  deleteKpiGroupQuery
};
