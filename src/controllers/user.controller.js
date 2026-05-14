const catchAsync = require("../utils/catchAsync");
const { usersService } = require("../services");
const { messaging } = require("../config/firebase");

const findAllUsers = catchAsync(async (req, res) => {
  const company_id = req.headers[Headers.company_id];
  const users = await usersService.getAllUsers(company_id);
});

// const createUser = catchAsync(async (req, res) => {
//   const company_id = req.body.company_id;
//   const role_id = req.body.role_id;
//   const user_id = req.body.user_id;
//   const data = req.body.data;
//   const users = await usersService.createUser(
//     company_id,
//     role_id,
//     user_id,
//     data
//   );
// });

async function getUserDetailsById(req, res) {
  const { user_id, company_id } = req.query;

  // in the future need to add company_id
  if (!user_id) {
    return res.status(400).json({
      message: "Missing required query parameters: user_id and/or company_id",
    });
  }

  try {
    const user = await usersService.getUserDetailsById(user_id, company_id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
}

async function registerUser(req, res) {
  const { user_id, first_name, last_name, email } = req.body || {};

  try {
    const newUser = await usersService.registerUser({
      user_id,
      first_name,
      last_name,
      email,
    });
    res
      .status(201)
      .json({ message: "User created successfully", user_id: newUser.user_id });
  } catch (error) {
    console.error("Create User Error:", error);
    res.status(500).json({ error: "Failed to create user" });
  }
}

async function inviteUserToCompany(req, res) {
  try {
    const invitedUser = await usersService.inviteUserToCompany(req.body);
    res.status(201).json({ message: "User invited successfully" });
  } catch (error) {
    console.error("Invite User Error:", error);
    res.status(500).json({ error: "Failed to invite user" });
  }
}

async function registerFCM(req, res) {
  const message = {
    notification: {
      title: req.body.title,
      body: req.body.body,
    },
    data: {
      profileImg: req.body.profileImg,
      imgContent: req.body.imgContent,
    },
    token: req.body.fcm,
  };

  // Send a message to the device corresponding to the provided
  // registration token.
  messaging
    .send(message)
    .then((response) => {
      // Response is a message ID string.
      console.log("Successfully sent message:", response);
    })
    .catch((error) => {
      console.log("Error sending message:", error);
    });
}
async function updateUserProfile(req, res) {
  const { user_id, first_name, last_name, email } = req.body || {};

  if (!user_id) {
    return res.status(400).json({ error: "user_id is required" });
  }

  try {
    await usersService.updateUserProfile({
      user_id,
      first_name,
      last_name,
      email,
    });

    return res.status(200).json({
      message: "User updated successfully",
    });
  } catch (error) {
    console.error("Update User Error:", error);

    return res.status(500).json({
      error: "Failed to update user",
    });
  }
}

module.exports = {
  findAllUsers,
  getUserDetailsById,
  registerUser,
  inviteUserToCompany,
  registerFCM,
  updateUserProfile,
};
