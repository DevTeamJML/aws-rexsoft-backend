const { v4 } = require("uuid");
const createSuperDao = require(".");
const models = require('../models');

const column = models.DynamicColumn;
const superDaoColumn = createSuperDao(column);

function createDynamicColumnDao() {

    async function createDynamicColumn(payload){
        return await superDaoColumn.create(payload);
    }

    async function createDefaultDynamicColumn({ client_group_id }){

        const defaultColumn = {
            column_id : v4(), 
            client_group_id : client_group_id, 
            column_name : "Client Name", 
            column_type : "Text", 
            column_index: 0, 
            allow_duplicate : false, 
            is_required : true, 
            width : "25%", 
            is_multiselect : false, 
        }

        return await superDaoColumn.create(defaultColumn);
    }

    async function getAllDynamicColumnByGroupID({ client_group_id }){
        const query = {
            where: { client_group_id : client_group_id },
        };
        const results = await superDaoColumn.findAll({}, query);
        return results
    }

    return {
        createDefaultDynamicColumn,
        createDynamicColumn,
        getAllDynamicColumnByGroupID
    }
}


module.exports = createDynamicColumnDao;
