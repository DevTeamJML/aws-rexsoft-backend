const httpStatus = require("http-status");
const { kpiService } = require("../services");
const catchAsync = require("../utils/catchAsync");

const saveKpi = catchAsync(async (req, res) => {
  const result = await kpiService.saveKpi(req.body);
  res.status(httpStatus.CREATED).send(result);
});

const getKpisBySource = catchAsync(async (req, res) => {
  const result = await kpiService.getKpisBySource(req.query);
  res.status(httpStatus.CREATED).send(result);
});

const getKpiById = async (req, res, next) => {
  try {
    const kpi = await kpiService.getKpiById(req.query);

    if (!kpi) {
      return res.status(404).json({ message: "KPI not found" });
    }

    res.status(httpStatus.CREATED).send(kpi);
  } catch (err) {
    next(err);
  }
};

const getPublishedKpi = async (req, res, next) => {
  try {
    const kpi = await kpiService.getPublishedKpi(req.query);

    if (!kpi) {
      return res.status(404).json({ message: "KPI not found" });
    }

    res.status(httpStatus.CREATED).send(kpi);
  } catch (err) {
    next(err);
  }
};

const getPublishedKpiById = async (req, res, next) => {
  try {
    const kpi = await kpiService.getPublishedKpiById(req.query);

    if (!kpi) {
      return res.status(404).json({ message: "KPI not found" });
    }

    res.status(httpStatus.CREATED).send(kpi);
  } catch (err) {
    next(err);
  }
};

const deleteKpiGroup = catchAsync(async (req, res) => {
  const result = await kpiService.deleteKpiGroup(
    req.body.kpi_group_id
  );
  res.status(httpStatus.CREATED).send(result);
});

module.exports = {
  saveKpi,
  getKpisBySource,
  getKpiById,
  getPublishedKpi,
  getPublishedKpiById,
  deleteKpiGroup
};
