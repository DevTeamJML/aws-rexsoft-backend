const { dynamicColumnService } = require("../services");
const catchAsync = require("../utils/catchAsync");

const getAllDynamicColumnByGroupID = catchAsync(async (req, res) => {
  const { group_id } = req.body;
  try {
    const result = await dynamicColumnService.getAllDynamicColumnByGroupID({ group_id });
    res.status(200).send(result);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
})

const createDefaultDynamicColumn = catchAsync(async (req, res) => {
    const { group_id } = req.body;
    try {
      const result = await dynamicColumnService.createDefaultDynamicColumn({ group_id });
      res.status(200).send(result);
    } catch (error) {
      res.status(500).send({ error: error.message });
    }
})

const createDynamicColumn = catchAsync(async (req, res) => {
    const payload = req.body;
    try {
        const result = await dynamicColumnService.createDynamicColumn(payload);
        res.status(200).send(result);
      } catch (error) {
        res.status(500).send({ error: error.message });
      }
})

module.exports ={
    createDynamicColumn,
    createDefaultDynamicColumn,
    getAllDynamicColumnByGroupID
}