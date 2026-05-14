

module.exports.ErrorCode = {
  INTERNAL_SERVER: {
    code: 'DEFAULT_ROLE',
    description: 'Default role is not allowed to remove',
  },
  'auth/wrong-password': {
    code: 'USER_CREDENTIAL_INVALID',
    description: 'Invalid password',
  },
  'auth/user-not-found': {
    code: 'USER_NOT_FOUND',
    description: 'User not found',
  },
  'auth/too-many-requests': {
    code: 'TOO_MANY_LOGIN_ATTEMPTS',
    description: 'Too many attempts',
  },
  'auth/email-already-exists': {
    code: 'EMAIL_ALREADY_TAKEN',
    description: 'Email already registered',
  },
  API_NOT_FOUND: {
    code: 'API_NOT_FOUND',
    description: 'Invalid API request',
  },
  INVITATION_EXPIRED: {
    code: 'INVITATION_EXPIRED',
    description: 'Invitation expired. Please contact admin for new link.',
  },
  INVALID_API_ACCESS: {
    code: 'INVALID_API_ACCESS',
    description: 'Invalid access to API',
  },
  USER_NO_PERMISSION: {
    code: 'USER_NO_PERMISSION',
    description: 'User no permission to access this API',
  },
  USER_EXISTED: {
    code: 'USER_EXISTED',
    description: 'User existed in current company',
  },
  USER_INVITED: {
    code: 'USER_INVITED',
    description: `User has been invited`,
  },
  TAG_EXISTED: {
    code: 'TAG_EXISTED',
    description: `The name has already been taken`,
  },
  TAG_GROUP_EXISTED: {
    code: 'TAG_GROUP_EXISTED',
    description: `The name has already been taken`,
  },
  NUMBER_FORMAT_EXISTED: {
    code: 'NUMBER_FORMAT_EXISTED',
    description: `The format has already been taken`,
  },
  ACCOUNT_EXISTED: {
    code: 'ACCOUNT_EXISTED',
    description: `The name has already been taken`,
  },
  CONTACT_GROUP_EXISTED: {
    code: 'CONTACT_GROUP_EXISTED',
    description: `The name has already been taken`,
  },
  CONTACT_EXISTED: {
    code: 'CONTACT_EXISTED',
    description: `The name has already been taken`,
  },
  PRODUCT_GROUP_EXISTED: {
    code: 'PRODUCT_GROUP_EXISTED',
    description: `The name has already been taken`,
  },
  PRODUCT_EXISTED: {
    code: 'PRODUCT_EXISTED',
    description: `The name has already been taken`,
  },

  // MYSQL ERROR
  ER_BAD_FIELD_ERROR: {
    code: 'INVALID_FIELD_FOUND',
    description: 'Data does not match with table field',
  },
  ROLE_NAME_EXISTED: {
    code: 'ROLE_NAME_EXISTED',
    description: 'Role name duplicated',
  },
  DUPLICATE_NAME: {
    code: 'DUPLICATE_NAME',
    description: 'Name must be unique',
  },
  DATA_NOT_FOUND: {
    code: 'DATA_NOT_FOUND',
    description: 'Data not found',
  },
  // Token Error
  LOGIN_EXPIRED: {
    code: 'LOGIN_EXPIRED',
    description: 'Session expired, please login again!',
  },
  ACCESS_TOKEN_EXPIRED: {
    code: 'ACCESS_TOKEN_EXPIRED',
    description: 'Access expired, getting new access',
  },
  CURRENCY_OVERLAP: {
    code: 'CURRENCY_OVERLAP',
    description: 'The date range overlaps with existing rates',
  },
  // Sequelize
  roles_SequelizeForeignKeyConstraintError: {
    code: 'roles_SequelizeForeignKeyConstraintError',
    description: 'This is role is used and cannot be deleted',
  },
  DEFAULT_ROLE: {
    code: 'DEFAULT_ROLE',
    description: 'Default role is not allowed to remove',
  },
};
