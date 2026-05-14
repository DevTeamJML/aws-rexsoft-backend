const createSuperDao = require(".");
const models = require('../models');

const groups = models.ClientGroup;
const superDaoClientGroup = createSuperDao(groups);

function createClientGroupDao() {

    async function createClientGroup(payload){
        const { client_group_id, company_id, client_group_name} = payload;

        const newGroup = await superDaoClientGroup.create({
            client_group_id: client_group_id,
            company_id: company_id,
            client_group_name : client_group_name,
        });

        return {
            client_group_id: newGroup.client_group_id,
            company_id: newGroup.company_id,
            client_group_name: newGroup.client_group_name,
          };
    }

    async function getAllClientGroupByCompanyID({ company_id }){
        const query = {
            where: { company_id : company_id },
        }
        const results = await superDaoClientGroup.findAll({}, query);
        return results
    }

    return {
        getAllClientGroupByCompanyID,
        createClientGroup
    }
}


module.exports = createClientGroupDao;
