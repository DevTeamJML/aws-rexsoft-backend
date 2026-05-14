const { columnOptionService } = require("../services");
const catchAsync = require("../utils/catchAsync");

const getAllColumnOptionByGroupID = catchAsync(async (req, res) => {
    const { column_id } = req.body;
    try {
        const result = await columnOptionService.getAllColumnOptionByColumnID({ column_id });
        res.status(200).send(result);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
})

const createColumnOption = catchAsync(async (req, res) => {
    const payload = req.body;
       try {
        const result = await columnOptionService.createColumnOption(payload);
        res.status(200).send(result);
       } catch (error) {
        res.status(500).send({ error: error.message });
       }
})

module.exports ={
    createColumnOption,
    getAllColumnOptionByGroupID
}