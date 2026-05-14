const createSuperDao = require('./index');
const models = require('../models');
const { generateUniqueID } = require('../utils/Generator');
const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const users = models.User;
const roles = models.Role;
const companies = models.Company;

const companyUsers = models.CompanyUser;
const company_agents = models.CompanyAgent;
const role_agents = models.RoleAgent;

function createUsersDao() {
  const superDaoUsers = createSuperDao(users);
//   const superDaoCompanies = createSuperDao(companies);
//   const superDaoRoles = createSuperDao(roles);
//   const superDaoCompanyAgents = createSuperDao(company_agents);
//   const superDaoRoleAgent = createSuperDao(role_agents);

const superDaoCompanyUsers =  createSuperDao(companyUsers);

const getCurrentCompany = async (company_id, user) =>
  company_id ? user.Companies.find((item) => item.company_id === company_id) : user.Companies[0];

  /**
   * * Get user data through junction table
   * * Get current company as well
   * ! Do not get unnecessary data here
   * @param {string} user_id
   * @returns {Promise<results>}
   */
  async function findUserDetailsById(user_id, company_id = null) {


    //get related role/permission/setting data

    const options = {
      include: [
        {
          model: companies,
          order:  [['created_at', 'DESC']],
          attributes: ['company_id', 'name'],
        },
        {
          model: users,
           attributes: { exclude: ['created_at', 'updated_at'] },
        },
        {
          model: roles,
                     attributes: ['role_id','name'],
                    include: [

                    ]

          
          
        }
      ]
    }
const query = {
      where: { user_id: user_id },
    };


        // const user = await superDaoUsers.findOne(options, query);

        const companyUser =   await superDaoCompanyUsers.findAll(options, query);
       let currentCompany = null;
      if(companyUser.length > 0){ 
             currentCompany = company_id ? await getCurrentCompany(company_id , companyUser) : null;

      }

         const results = {
      ...companyUser.toJSON(),
      currentCompany
    };
    return results;

    // const options = {
    //   include: [
    //     {
    //       model: companies,
    //       order: [['created_at', 'DESC']],
    //       through: {
    //         attributes: [],
    //       },
    //       attributes: ['company_id', 'name'],
    //     },
    //     // {
    //     //   model: roles,
    //     //   through: { attributes: [] },
    //     //   attributes: {
    //     //     exclude: ['is_default', 'created_at', 'updated_at'],
    //     //   },
    //     // },
    //   ],
    //   attributes: { exclude: ['created_at', 'updated_at'] },
    // };
    // const query = {
    //   where: { user_id: user_id },
    // };

    // const user = await superDaoUsers.findOne(options, query);

    // if (user.Companies?.length === 0) {
    //   // throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid Access');
    //   console.log("0 company")
    // }

    // /**
    //  * * If company_id is null, get first company to login (assuming first login without persist company_id)
    //  * * Else if company_id is not null, find corresponding company and send back data
    //  * ? Looking for better implementation, sequelize unable to set "limit" to companies model as it is many to many relationship
    //  * ? Possible approach is to use sequelize instance.get
    //  */
    // /**
    //  * * user.toJSON() required as sequelize is not giving raw results.
    //  * * Some attributes that are not spreadable will throw error
    //  */

    // const currentCompany = company_id ? await getCurrentCompany(company_id, user) : null;
    // // const currentRole = company_id ? await getCurrentRole(currentCompany, user) : null;
    // const results = {
    //   ...user.toJSON(),
    //   currentCompany: currentCompany,
    //   // roles: currentRole,
    // };
    // return results;

  }

  async function checkUser(payload){ 

    const query = {
      where: {

        ...payload,
        isAdmin: true,
      },
    };

    const options  = {
       include: [
    {
      model: companyUser,
      as: 'CompanyUser', // if you have alias
      required: true,
    },
  ],
    };
            const companyUser =   await superDaoCompanyUsers.findOne(options, query);
  return companyUser;
  }
  

  async function createUser(company_id, role_id, user_id, payload) {
    const data = {
      user_id,
      ...payload,
    };
    const [user, company, role] = await Promise.all([
      superDaoUsers.create(data)
      // superDaoCompanies.findByPk(company_id),
      // superDaoRoles.findByPk(role_id),
    ]);
  
    /**
     * * instance.add{Model(s)} helps to add junction data
     * * use findByPk to find specific set of data to served as relationship
     */
    await Promise.all([user.addRole(role), user.addCompany(company, { through: { first_name: data.first_name } })]);
  
    const results = await findOneUsers(user.user_id, company_id);
  
    return results;
    return user;
  }



  return {
    findUserDetailsById,
    createUser,
    checkUser
  };

  
}



module.exports = createUsersDao;
