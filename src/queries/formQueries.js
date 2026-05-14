const createFormTemplateQuery = () => {
  return `INSERT INTO FormTemplate(
    form_template_id,
    company_id,
    user_id,
    template_name,
    is_publish,
    created_at, 
    updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?)`;
};

const createFormSubmissionQuery = () => {
  return `
    INSERT INTO FormSubmission (
      form_submission_id,
      form_template_id,
      user_id,
      company_id,
      form_tracking_id,
      approved_at, 
      approved_by,
      rejected_by,
      rejected_reason,
      status,
      created_at,
      updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
};

const createFormAnswerQuery = (answer = []) => {
  const placeholder = Array(answer.length).fill(`(?,?,?,?,?,?,?)`).join(", ");

  return `INSERT INTO FormAnswer(
    form_answer_id,
    user_id,
    form_question_id,
    form_submission_id,
    answer,
    created_at,
    updated_at
    ) VALUES ${placeholder}`;
};

const createFormQuestionQuery = (questions = []) => {
  const placeholder = Array(questions.length)
    .fill(`(?,?,?,?,?,?,?,?,?,?,?)`)
    .join(", ");

  return `
  INSERT INTO FormQuestion (
    form_question_id,
    form_template_id,
    label,
    options,
    field_type,
    permission,
    width,
    is_required,
    allow_duplicate,
    created_at,
    updated_at
  ) VALUES ${placeholder}
`;
};
const getUserFormSubmissionQuery = () => {
  return `
    SELECT 
      fs.form_submission_id,
      fs.form_tracking_id,
      fs.form_template_id,
      fs.approved_at,
      fs.approved_by,
      fs.rejected_by,
      fs.rejected_at,
      fs.rejected_reason,
      fs.resubmit_at,
      fs.status,
      fs.created_at,
      ft.template_name,

      JSON_OBJECT(
        'user_id', u.user_id,
        'first_name', u.first_name
      ) AS user,

      JSON_ARRAYAGG(
        JSON_OBJECT(
          'form_answer_id', fa.form_answer_id,
          'form_question_id', fa.form_question_id,
          'answer', fa.answer,
          'created_at', fa.created_at
        )
      ) AS form_answers

    FROM FormSubmission fs
    LEFT JOIN FormAnswer fa 
      ON fs.form_submission_id = fa.form_submission_id
    LEFT JOIN User u 
      ON fs.user_id = u.user_id
    LEFT JOIN FormTemplate ft 
      ON fs.form_template_id = ft.form_template_id
    
    WHERE fs.company_id = ? 
      AND fs.user_id = ?
      AND fs.status = ?

    GROUP BY fs.form_submission_id
    ORDER BY fs.created_at DESC;
  `;
};

const getUserFormSubmissionCountQuery = () => {
  return `
    SELECT
      SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) AS pending_count,
      SUM(CASE WHEN status = 'Approved' THEN 1 ELSE 0 END) AS approved_count,
      SUM(CASE WHEN status = 'Rejected' THEN 1 ELSE 0 END) AS rejected_count,
      SUM(CASE WHEN status = 'Resubmission' THEN 1 ELSE 0 END) AS resubmission_count,
      COUNT(*) AS total_count
    FROM FormSubmission
    WHERE company_id = ?
      AND user_id = ?;
      `;
};

const getAllFormSubmissionsQuery = () => {
  return `
    SELECT 
      fs.form_submission_id,
      fs.form_tracking_id,
      fs.form_template_id,
      fs.approved_at,
      fs.approved_by,
      fs.rejected_at,
      fs.rejected_by,
      fs.rejected_reason,
      fs.resubmit_at,
      fs.status,
      fs.created_at,

      JSON_OBJECT(
        'user_id', u.user_id,
        'first_name', u.first_name
      ) AS user,

      JSON_ARRAYAGG(
        JSON_OBJECT(
          'form_answer_id', fa.form_answer_id,
          'form_question_id', fa.form_question_id,
          'answer', fa.answer,
          'created_at', fa.created_at
        )
      ) AS form_answers

    FROM FormSubmission fs
    LEFT JOIN FormAnswer fa ON fs.form_submission_id = fa.form_submission_id
    LEFT JOIN User u ON fs.user_id = u.user_id
    WHERE fs.company_id = ?
    AND fs.status = ?
    GROUP BY fs.form_submission_id
    ORDER BY fs.created_at DESC;
    

  `;
};

const getAllFormSubmissionsCountQuery = () => {
  return ` SELECT
  SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) AS pending_count,
  SUM(CASE WHEN status = 'Approved' THEN 1 ELSE 0 END) AS approved_count,
  SUM(CASE WHEN status = 'Rejected' THEN 1 ELSE 0 END) AS rejected_count,
  SUM(CASE WHEN status = 'Resubmission' THEN 1 ELSE 0 END) AS resubmission_count,
  COUNT(*) AS total_count
FROM FormSubmission
WHERE company_id = ?;`;
};

const getFormSubmissionByIdQuery = () => {
  return `
    SELECT
      fs.form_submission_id,
      fs.form_template_id,
      fs.user_id,
      fs.form_tracking_id,
      fs.rejected_by,
      fs.rejected_at,
      fs.rejected_reason,
      fs.resubmit_at,
      fs.status,
      fs.created_at,
      fs.previous_answers,

      JSON_OBJECT(
        'form_template_id', ft.form_template_id,
        'template_name', ft.template_name
      ) AS template,

      (
        SELECT JSON_ARRAYAGG(
          JSON_OBJECT(
            'form_question_id', q.form_question_id,
            'label', q.label,
            'options', q.options,
            'field_type', q.field_type,
            'permission', q.permission,
            'width', q.width,
            'is_required', q.is_required,
            'allow_duplicate', q.allow_duplicate
          )
        )
        FROM FormQuestion q
        WHERE q.form_template_id = fs.form_template_id
      ) AS questions,

      (
        SELECT JSON_ARRAYAGG(
          JSON_OBJECT(
            'form_answer_id', a.form_answer_id,
            'form_question_id', a.form_question_id,
            'answer', a.answer,
            'created_at', a.created_at
          )
        )
        FROM FormAnswer a
        WHERE a.form_submission_id = fs.form_submission_id
      ) AS form_answers

    FROM FormSubmission fs
    LEFT JOIN FormTemplate ft ON ft.form_template_id = fs.form_template_id
    WHERE fs.form_submission_id = ?
    LIMIT 1;
  `;
};

const getFormTemplateWithQuestionsByIdQuery = () => `
  SELECT 
    ft.form_template_id,
    ft.template_name,
    ft.is_publish,
    JSON_ARRAYAGG(
      JSON_OBJECT(
        'form_question_id', fq.form_question_id,
        'label', fq.label,
        'field_type', fq.field_type,
        'permission', fq.permission,
        'options', fq.options,
        'width', fq.width,
        'is_required', fq.is_required,
        'allow_duplicate', fq.allow_duplicate
      )
    ) AS questions
  FROM FormTemplate ft
  LEFT JOIN FormQuestion fq ON fq.form_template_id = ft.form_template_id
  WHERE ft.form_template_id = ?
  GROUP BY ft.form_template_id, ft.template_name;
`;

const getAllFormTemplatessQuery = () => `
  SELECT 
    ft.form_template_id,
    ft.template_name,
    ft.is_publish,
    JSON_ARRAYAGG(
      JSON_OBJECT(
        'form_question_id', fq.form_question_id,
        'label', fq.label,
        'field_type', fq.field_type,
        'permission', fq.permission,
        'options', fq.options,
        'width', fq.width,
        'is_required', fq.is_required,
        'allow_duplicate', fq.allow_duplicate
      )
    ) AS questions
  FROM FormTemplate ft
  LEFT JOIN FormQuestion fq ON fq.form_template_id = ft.form_template_id
  WHERE ft.company_id = ?
  GROUP BY ft.form_template_id, ft.template_name, ft.created_at, ft.is_publish
  ORDER BY ft.created_at DESC;
`;

const getAllFormQuestionQuery = () => `
  SELECT 
    form_question_id, 
    form_template_id, 
    label, 
    field_type, 
    permission, 
    width, 
    is_required, 
    allow_duplicate
  FROM 
    FormQuestion
  WHERE 
    form_template_id = ?
  ORDER BY 
    created_at DESC;
`;

const updateFormTemplateQuery = (fields) => {
  const setClause = fields.map((field) => `${field} = ?`).join(", ");
  return `
    UPDATE FormTemplate
    SET ${setClause}
    WHERE form_template_id = ?;
  `;
};

const updateFormQuestionQuery = (fields) => {
  const setClause = fields.map((field) => `${field} = ?`).join(", ");
  return `
  UPDATE FormQuestion
  SET ${setClause}
  WHERE form_question_id = ?;
`;
};

const updateFormApprovalQuery = (fields) => {
  const setClause = fields.map((f) => `${f} = ?`).join(", ");

  return `
    UPDATE FormSubmission
    SET ${setClause}
    WHERE form_submission_id = ?;
  `;
};

const updateFormSubmissionQuery = (fields) => {
  const setClause = fields.map((f) => `${f} = ?`).join(", ");

  return `
    UPDATE FormSubmission
    SET ${setClause}
    WHERE form_submission_id = ?;
  `;
};

const updateFormAnswerQuery = () => {
  return `
    UPDATE FormAnswer
    SET answer = ?
    WHERE form_answer_id = ?;
  `;
};

const deleteFormTemplateQuery = () => {
  return `
    DELETE FROM FormTemplate
    WHERE form_template_id = ?;
`;
};

const deleteFormSubmissionQuery = () => {
  return `
    DELETE FROM FormSubmission
    WHERE form_submission_id = ?;
`;
};

module.exports = {
  updateFormApprovalQuery,
  createFormTemplateQuery,
  createFormQuestionQuery,
  getFormTemplateWithQuestionsByIdQuery,
  getAllFormTemplatessQuery,
  updateFormTemplateQuery,
  updateFormQuestionQuery,
  getAllFormQuestionQuery,
  deleteFormTemplateQuery,
  createFormAnswerQuery,
  createFormSubmissionQuery,
  getAllFormSubmissionsQuery,
  getUserFormSubmissionQuery,
  getFormSubmissionByIdQuery,
  updateFormSubmissionQuery,
  updateFormAnswerQuery,
  deleteFormSubmissionQuery,
  getAllFormSubmissionsCountQuery,
  getUserFormSubmissionCountQuery,
};
