const { dashboardService } = require("../services");

const getDashboard = async (req, res, next) => {
  try {
    const { company_id, user_id, isAdmin } = req.query;

    const data = await dashboardService.getDashboardSummary({
      isAdmin: isAdmin,
      company_id,
      user_id,
    });

    res.status(200).send(data);
  } catch (error) {
    console.error("Error in dashboard controller:", error);
    next(error);
  }
};

module.exports = {
  getDashboard,
};
