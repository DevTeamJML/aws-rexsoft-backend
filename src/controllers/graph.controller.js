const httpStatus = require("http-status");
const { formService, graphService } = require("../services");
const catchAsync = require("../utils/catchAsync");

const generateGraphData = catchAsync(async (req, res) => {
  const result = await graphService.generateGraphData(req.query);
  res.status(httpStatus.CREATED).send(result);
});

const saveGraph = catchAsync(async (req, res) => {
  const result = await graphService.saveGraph(req.body);
  res.status(httpStatus.CREATED).send(result);
});

const getGraphsBySource = catchAsync(async (req, res) => {
  const result = await graphService.getGraphsBySource(req.query);
  res.status(httpStatus.CREATED).send(result);
});

const getGraphById = async (req, res, next) => {
  try {
    const graph = await graphService.getGraphById(req.query);

    if (!graph) {
      return res.status(404).json({ message: "Graph not found" });
    }

    res.status(httpStatus.CREATED).send(graph);
  } catch (err) {
    next(err);
  }
};

const getPublishedGraph = async (req, res, next) => {
  try {
    const graph = await graphService.getPublishedGraph(req.query);

    if (!graph) {
      return res.status(404).json({ message: "Graph not found" });
    }

    res.status(httpStatus.CREATED).send(graph);
  } catch (err) {
    next(err);
  }
};

const getPublishedGraphById = async (req, res, next) => {
  try {
    const graph = await graphService.getPublishedGraphById(req.query);

    if (!graph) {
      return res.status(404).json({ message: "Graph not found" });
    }

    res.status(httpStatus.CREATED).send(graph);
  } catch (err) {
    next(err);
  }
};

const deleteGraph = catchAsync(async (req, res) => {
  const result = await graphService.deleteGraph(
    req.body.graph_id
  );
  res.status(httpStatus.CREATED).send(result);
});



module.exports = {
  generateGraphData,
  saveGraph,
  getGraphsBySource,
  getGraphById,
  getPublishedGraph,
  getPublishedGraphById,
  deleteGraph
};
