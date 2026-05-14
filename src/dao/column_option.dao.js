const createSuperDao = require(".");
const models = require('../models');

const columnOption = models.ColumnOption;
const superDaoColumnOption = createSuperDao(columnOption);

function createDynamicColumnDao() {

    async function createColumnOption(payload){
        return await superDaoColumnOption.create(payload);
    }

    async function getAllColumnOptionByColumnID({ column_id }){
        const query = {
            where: { column_id : column_id },
        };
        const results = await superDaoColumnOption.findAll({}, query);
        return results
    }

    return {
        createColumnOption,
        getAllColumnOptionByColumnID
    }
}


module.exports = createDynamicColumnDao;
