const createSuperDao = require('./index');
const models = require('../models');
const { generateUniqueID } = require('../utils/Generator');
// const { advanceM2MFunction } = require('../utils/belongToManyFunction');

const companies = models.Company;
const users = models.User;
const companyUsers = models.CompanyUser;
const roles = models.Role; 

// const file_manager = models.file_manager;
// const company_address = models.CompanyAddress;

function createCompaniesDao() {
  const superDaoCompany = createSuperDao(companies);
  const superDaoUser = createSuperDao(users);
  const superDaoCompanyUser = createSuperDao(companyUsers); 
  const superDaoRole = createSuperDao(roles);
//   const superDaoCompanyAddress = createSuperDao(company_address);

  async function retrieveCompany(company_id) {
    const options = {
      attributes: {
        exclude: ['created_at', 'updated_at'],
      },
    //   include: [
    //     {
    //       model: file_manager,
    //       as: 'logo_file',
    //     },
    //     {
    //       model: company_address,
    //       as: 'CompanyAddresses',
    //       attributes: { exclude: ['created_at', 'updated_at'] },
    //     },
    //   ],
    };

    const query = {
      where: { company_id: company_id },
    };

    const results = await superDaoCompany.findOne(options, query);
    return results;
  }

  /**
   * * Update company profile
   */
  async function updateCompany(payload) {
    const { company_id, ...otherPayload } = payload;

    // if (address) {
    //   await advanceM2MFunction(
    //     address,
    //     'company_address_id',
    //     {
    //       company_id,
    //     },
    //     superDaoCompanyAddress,
    //     [
    //       'name',
    //       'street_address_1',
    //       'street_address_2',
    //       'city',
    //       'state',
    //       'postcode',
    //       'country',
    //       'default_billing',
    //       'default_shipping',
    //       'address',
    //     ]
    //   );
    // }

    if (Object.keys(otherPayload)) {
      const query = {
        where: {
          company_id: company_id,
        },
      };
      const result = await superDaoCompany.update(otherPayload, query);
      return result;
    }
  }

  async function createCompany(payload,transaction) {
    const companyUserID = await generateUniqueID();
    const  {user, ...companyInfo} = payload;
    const newCompany = await superDaoCompany.create(companyInfo, {transaction});

    await newCompany.addUser(user, { through: { company_user_id: companyUserID } ,transaction});

    const currentCompanyUser = await superDaoCompanyUser.findOne({},{where: {company_user_id :companyUserID , transaction}});

    const ownerRole = await superDaoRole.create({
      name: "Owner",
      is_admin: true,
    }, { transaction});
    currentCompanyUser.addRole(
ownerRole , { transaction}
    );

    return currentCompanyUser;

  }

  return {
    retrieveCompany,
    updateCompany,
    createCompany,
  };
}

module.exports = createCompaniesDao;
