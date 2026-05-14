const createCompanyQuery = () => {
  return `
    INSERT INTO Company (
      company_id,
      company_name, 
      company_email, 
      phone_no, 
      address, 
      created_at, 
      updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
};

const setCompanyQuery = () => {
  return `
   SELECT * FROM Company
  `;
};

const getAllCompaniesQuery = () => {
  return `
    SELECT c.* FROM Company as c
    INNER JOIN CompanyUser as cu ON cu.company_id = c.company_id
    WHERE user_id = ?
  `;
};

module.exports = {
  createCompanyQuery,
  setCompanyQuery,
  getAllCompaniesQuery,
};
