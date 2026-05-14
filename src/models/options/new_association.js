// const { EXAMPLE } = require('../enums/modelEnum')

module.exports = (db) => {
  const {
    /**
     * * Define roles in company relationship
     */
    // invitations,
    // users
    Admin,
    AppointmentClient,
    Appointment,
    AppointmentUser,
    ClientGroupPermission,
    ClientGroup,
    ClientUser,
    Client,
    ColumnOption,
    CompanyUser,
    Company,
    DynamicAnswer,
    DynamicColumn,
    DynamicQuestion,
    DynamicRow,
    FormPermission,
    FormSubmission,
    FormTemplate,
    Graph,
    Kpi,
    KpiUser,
    Permission,
    QuestionOption,
    RolePermission,
    Role,
    UserRole,
    User,
    FileManager,
    ClientCustomField,
    ClientCustomValue,
    FormTemplatePermission,
    FormQuestion,
    FormAnswer,
  } = db;
  /**
   * * Define roles in company relationship
   */
  // companies.hasMany(roles, { foreignKey: 'company_id' });
  // roles.belongsTo(companies, { foreignKey: 'company_id' });

  // Company.hasMany(FileManager, { foreignKey: "company_id" });
  // FileManager.belongsTo(Company, { foreignKey: "company_id" });

  // Company.belongsTo(FileManager, { foreignKey: "logo", as: "logo_file" });
  // FileManager.hasOne(Company, { foreignKey: "logo", as: "logo_file" });

  // // 1. Company & User (Many-to-Many)
  // Company.belongsToMany(User, {
  //   through: CompanyUser,
  //   foreignKey: "company_id",
  //   onDelete: "RESTRICT",
  // });
  // User.belongsToMany(Company, {
  //   through: CompanyUser,
  //   foreignKey: "user_id",
  //   onDelete: "RESTRICT",
  // });

  // Company.hasMany(ClientGroup, { foreignKey: "company_id" });
  // ClientGroup.belongsTo(Company, { foreignKey: "company_id" });

  // ClientGroup.hasMany(Client, { foreignKey: "client_group_id" });
  // Client.belongsTo(ClientGroup, { foreignKey: "client_group_id" });

  // //for client table custom field
  // ClientGroup.belongsToMany(ClientCustomField, {
  //   through: ClientCustomValue,
  //   foreignKey: "client_group_id",
  // });
  // ClientCustomField.belongsToMany(ClientGroup, {
  //   through: ClientCustomValue,
  //   foreignKey: "client_custom_field_id",
  // });

  // //!this is admin has to set group permission for each user
  // // //when company user delete or client group delete then remove related permission
  // // CompanyUser.belongsToMany(ClientGroup,{ through: ClientGroupPermission , foreignKey : "company_user_id",  onDelete: 'CASCADE',});
  // // ClientGroup.belongsToMany(CompanyUser, { through: ClientGroupPermission,  foreignKey : "client_group_id", onDelete: 'CASCADE',});

  // //based on role to get whatever table or data they can access
  // Role.belongsTo(CompanyUser, { foreignKey: "role_id" });
  // CompanyUser.hasOne(Role, { foreignKey: "role_id" });

  // Role.belongsToMany(ClientGroup, {
  //   through: ClientGroupPermission,
  //   foreignKey: "role_id",
  // });
  // ClientGroup.belongsToMany(Role, {
  //   through: ClientGroupPermission,
  //   foreignKey: "client_group_id",
  // });

  // // only when agent row that has related to parent and needed to delete as well then only have to write relationship between them .
  // ClientGroupPermission.belongsTo(ClientGroup, {
  //   foreignKey: "client_group_id",
  //   onDelete: "CASCADE",
  // });
  // ClientGroup.hasMany(ClientGroupPermission, {
  //   foreignKey: "client_group_id",
  // });

  // CompanyUser.belongsToMany(Kpi, {
  //   through: KpiUser,
  //   foreignKey: "company_user_id",
  // });
  // Kpi.belongsToMany(CompanyUser, { through: KpiUser, foreignKey: "kpi_id" });

  // //when kpi removed , then remove the agent row that related to removed kpi
  // KpiUser.belongsTo(Kpi, { foreignKey: "kpi_id", onDelete: "CASCADE" });
  // Kpi.hasMany(KpiUser, {
  //   foreignKey: "kpi_id",
  // });

  // //when company user removed , then remove the agent row that related to removed company user
  // KpiUser.belongsTo(CompanyUser, {
  //   foreignKey: "company_user_id",
  //   onDelete: "CASCADE",
  // });
  // Kpi.hasMany(CompanyUser, {
  //   foreignKey: "company_user_id",
  // });

  // CompanyUser.belongsToMany(Client, {
  //   through: Appointment,
  //   foreignKey: "company_user_id",
  // });
  // Client.belongsToMany(CompanyUser, {
  //   through: Appointment,
  //   foreignKey: "client_id",
  // });

  // User.belongsToMany(Appointment, {
  //   through: AppointmentUser,
  //   foreignKey: "user_id",
  // });
  // Appointment.belongsToMany(User, {
  //   through: AppointmentUser,
  //   foreignKey: "appointment_id",
  // });

  // Client.belongsToMany(Appointment, {
  //   through: AppointmentClient,
  //   foreignKey: "client_id",
  // });
  // Appointment.belongsToMany(Client, {
  //   through: AppointmentClient,
  //   foreignKey: "appointment_id",
  // });

  // //??
  // Company.hasMany(FormTemplate, { foreignKey: "form_template_id" });
  // FormTemplate.belongsTo(Company, { foreignKey: "form_template_id" });

  // //created by who
  // User.hasOne(FormTemplate, { foreignKey: "form_template_id" });
  // FormTemplate.belongsTo(User, { foreignKey: "form_template_id" });

  // //for template permission
  // CompanyUser.belongsToMany(FormTemplate, {
  //   through: FormTemplatePermission,
  //   foreignKey: "company_user_id",
  // });
  // FormTemplate.belongsToMany(CompanyUser, {
  //   through: FormTemplatePermission,
  //   foreignKey: "form_template_id",
  // });

  // //form question and answer
  // FormTemplate.belongsToMany(FormQuestion, {
  //   through: FormAnswer,
  //   foreignKey: "form_template_id",
  // });
  // FormQuestion.belongsToMany(FormQuestion, {
  //   through: FormAnswer,
  //   foreignKey: "form_question_id",
  // });

  // CompanyUser.hasMany(FormAnswer, { foreignKey: "company_user_id" });
  // FormAnswer.belongsTo(CompanyUser, { foreignKey: "company_user_id" });

  Company.hasMany(FileManager, { foreignKey: "company_id" });
  FileManager.belongsTo(Company, { foreignKey: "company_id" });

  // Company.belongsTo(FileManager, { foreignKey: "logo", as: "logo_file" });
  // FileManager.hasOne(Company, { foreignKey: "logo", as: "logo_file" });

  Company.belongsToMany(User, {
    through: CompanyUser,
    foreignKey: "company_id",
    onDelete: "RESTRICT",
  });
  User.belongsToMany(Company, {
    through: CompanyUser,
    foreignKey: "user_id",
    onDelete: "RESTRICT",
  });

  Company.hasMany(ClientGroup, { foreignKey: "company_id" });
  ClientGroup.belongsTo(Company, { foreignKey: "company_id" });

  ClientGroup.hasMany(Client, { foreignKey: "client_group_id" });
  Client.belongsTo(ClientGroup, { foreignKey: "client_group_id" });

  // Custom fields for clients
  ClientGroup.belongsToMany(ClientCustomField, {
    through: ClientCustomValue,
    foreignKey: "client_group_id",
  });
  ClientCustomField.belongsToMany(ClientGroup, {
    through: ClientCustomValue,
    foreignKey: "client_custom_field_id",
  });

  // Permissions
  Role.belongsTo(CompanyUser, { foreignKey: "role_id" });
  CompanyUser.hasOne(Role, { foreignKey: "role_id" });

  Role.belongsToMany(ClientGroup, {
    through: ClientGroupPermission,
    foreignKey: "role_id",
  });
  ClientGroup.belongsToMany(Role, {
    through: ClientGroupPermission,
    foreignKey: "client_group_id",
  });

  ClientGroupPermission.belongsTo(ClientGroup, {
    foreignKey: "client_group_id",
    onDelete: "CASCADE",
  });
  ClientGroup.hasMany(ClientGroupPermission, {
    foreignKey: "client_group_id",
  });

  // KPI associations
  CompanyUser.belongsToMany(Kpi, {
    through: KpiUser,
    foreignKey: "company_user_id",
  });
  Kpi.belongsToMany(CompanyUser, {
    through: KpiUser,
    foreignKey: "kpi_id",
  });

  KpiUser.belongsTo(Kpi, { foreignKey: "kpi_id", onDelete: "CASCADE" });
  Kpi.hasMany(KpiUser, { foreignKey: "kpi_id" });

  KpiUser.belongsTo(CompanyUser, {
    foreignKey: "company_user_id",
    onDelete: "CASCADE",
  });
  CompanyUser.hasMany(KpiUser, {
    foreignKey: "company_user_id",
  });

  // Appointments
  CompanyUser.belongsToMany(Client, {
    through: Appointment,
    foreignKey: "company_user_id",
  });
  Client.belongsToMany(CompanyUser, {
    through: Appointment,
    foreignKey: "client_id",
  });

  User.belongsToMany(Appointment, {
    through: AppointmentUser,
    foreignKey: "user_id",
  });
  Appointment.belongsToMany(User, {
    through: AppointmentUser,
    foreignKey: "appointment_id",
  });

  Client.belongsToMany(Appointment, {
    through: AppointmentClient,
    foreignKey: "client_id",
  });
  Appointment.belongsToMany(Client, {
    through: AppointmentClient,
    foreignKey: "appointment_id",
  });

  // Form Templates
  Company.hasMany(FormTemplate, { foreignKey: "company_id" });
  FormTemplate.belongsTo(Company, { foreignKey: "company_id" });

  // Created by User
  User.hasOne(FormTemplate, { foreignKey: "created_by" });
  FormTemplate.belongsTo(User, { foreignKey: "created_by" });

  // Form Template Permissions
  CompanyUser.belongsToMany(FormTemplate, {
    through: FormTemplatePermission,
    foreignKey: "company_user_id",
  });
  FormTemplate.belongsToMany(CompanyUser, {
    through: FormTemplatePermission,
    foreignKey: "form_template_id",
  });

  // FormTemplate <-> FormQuestion via FormAnswer
  FormTemplate.belongsToMany(FormQuestion, {
    through: FormAnswer,
    foreignKey: "form_template_id",
  });
  FormQuestion.belongsToMany(FormTemplate, {
    through: FormAnswer,
    foreignKey: "form_question_id",
  });

  // FormAnswer answered by a CompanyUser
  CompanyUser.hasMany(FormAnswer, { foreignKey: "company_user_id" });
  FormAnswer.belongsTo(CompanyUser, { foreignKey: "company_user_id" });
};
