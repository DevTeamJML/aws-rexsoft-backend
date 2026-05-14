"use client";
const httpStatus = require("http-status");
const catchAsync = require("../utils/catchAsync");


const {
  invitationService,
  companyUserService,
  usersService,
  roleService,
} = require("../services");

const getInvitationById = catchAsync(async (req, res) => {
  const { invitation_id } = req.query;

  if (!invitation_id) {
    return res.status(httpStatus.BAD_REQUEST).send({
      message: "Missing invitation_id in query parameters",
    });
  }

  const result = await invitationService.getInvitationById(invitation_id);

  res.status(httpStatus.OK).send(result);
});

async function inviteUserToCompany(req, res) {
  try {
    const invitedUser = await invitationService.inviteUserToCompany(req.body);
    res.status(201).json({ message: "User invited successfully" });
  } catch (error) {
    console.error("Invite User Error:", error);
    res.status(500).json({ error: "Failed to invite user" });
  }
}

const removeInvitationAndUser = catchAsync(async (req, res) => {
  try {
    await invitationService.removeInvitationAndUser(req.body);
    res.status(httpStatus.OK).send("delete invitation/user successfully");
  } catch (error) {
    console.error("Failed to remove invitation/user : ", error);
  }
});

const rejectInvitation = catchAsync(async (req, res) => {
  await invitationService.rejectInvitation(req.body);
  res.status(200).send("reject invitation successfully");
});

const resendInvitation = catchAsync(async (req, res) => {
  await invitationService.resendInvitation(req.body);
  res.status(200).send("resend invitation successfully");
});

const signUpAndAcceptInvitation = catchAsync(async (req, res) => {
  const { user_id, first_name, last_name, email, password } = req.body || {};
  let userRecord;
  try {
    userRecord = await usersService.registerFirebaseUser({
      first_name,
      last_name,
      email,
      password,
    });
    const newUser = await usersService.registerUser({
      user_id: userRecord.uid,
      first_name,
      last_name,
      email,
    });
    await companyUserService.createCompanyUser({
      ...req.body,
      user_id: userRecord.uid,
    });

    await roleService.addUserToRole({
      ...req.body,
      user_id: userRecord.uid,
    });

    if (req.body.invitation_id) {
      await invitationService.removeInvitation(req.body);
      res.status(201).json({
        message: "User created successfully",
        user_id: newUser.user_id,
      });
    } else {
      res.status(201).json({
        message: "User created successfully",
        user_id: newUser.user_id,
      });
    }
  } catch (error) {
    if (userRecord?.uid) {
      try {
        await firebaseAuth.deleteUser(userRecord.uid);
        console.log(`Rolled back Firebase user ${userRecord.uid}`);
      } catch (rollbackError) {
        console.error("Failed to rollback Firebase user:", rollbackError);
      }
    }
    console.error("Create User Error:", error);
    res.status(500).json({ error: "Failed to create user" });
  }
});

const acceptInvitation = catchAsync(async (req, res) => {
  await companyUserService.createCompanyUser(req.body);
  await roleService.addUserToRole(req.body);
  await invitationService.removeInvitation(req.body);

  res.status(200).send("accept invitation successfully");
});

const getAllInvitationAndUser = catchAsync(async (req, res) => {
  try {
    const { company_id } = req.query;

    if (!company_id) {
      return res.status(httpStatus.BAD_REQUEST).send({
        message: "Missing company_id in query parameters",
      });
    }

    const result = await invitationService.getAllInvitationAndUser({
      company_id,
    });

    res.status(httpStatus.OK).send(result);
  } catch (error) {
    console.error("Failed to rollback Firebase user:", error);
  }
});


const createCRMUsers = catchAsync(async (req, res) => {
  const { user_id, first_name, last_name, email, password } = req.body || {};
  let userRecord;
  try {
    userRecord = await usersService.registerFirebaseUser({
      first_name,
      last_name,
      email,
      password,
    });

    const newUser = await usersService.registerUser({
      user_id: userRecord.uid,
      first_name,
      last_name,
      email,
    });

    res.status(201).json({
      message: "User created successfully",
      user_id: newUser.user_id,
    });
  } catch (error) {
    if (userRecord?.uid) {
      try {
        await firebaseAuth.deleteUser(userRecord.uid);
        console.log(`Rolled back Firebase user ${userRecord.uid}`);
      } catch (rollbackError) {
        console.error("Failed to rollback Firebase user:", rollbackError);
      }
    }
    console.error("Create User Error:", error);
    res.status(500).json({ error: "Failed to create user" });
  }
});

const createCRMUsersWithCompanyUsers = catchAsync(async (req, res) => {
  const { user_id, first_name, last_name, email, password } = req.body || {};
  let userRecord;
  try {
    userRecord = await usersService.registerFirebaseUser({
      first_name,
      last_name,
      email,
      password,
    });

    const newUser = await usersService.registerUser({
      user_id: userRecord.uid,
      first_name,
      last_name,
      email,
    });

    await companyUserService.createCompanyUser({
      ...req.body,
      user_id: userRecord.uid,
    });

    await roleService.addUserToRole({
      ...req.body,
      user_id: userRecord.uid
    });

    res.status(201).json({
      message: "User created successfully",
      user_id: newUser.user_id,
    });
  } catch (error) {
    if (userRecord?.uid) {
      try {
        await firebaseAuth.deleteUser(userRecord.uid);
        console.log(`Rolled back Firebase user ${userRecord.uid}`);
      } catch (rollbackError) {
        console.error("Failed to rollback Firebase user:", rollbackError);
      }
    }
    console.error("Create User Error:", error);
    res.status(500).json({ error: "Failed to create user" });
  }
});

module.exports = {
  getAllInvitationAndUser,
  getInvitationById,
  inviteUserToCompany,
  removeInvitationAndUser,
  rejectInvitation,
  acceptInvitation,
  resendInvitation,
  signUpAndAcceptInvitation,
  createCRMUsers,
  createCRMUsersWithCompanyUsers
};
