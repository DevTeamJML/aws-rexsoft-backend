const getConnection = require("../db/pool");
const {
  createFormTemplateQuery,
  createFormQuestionQuery,
  getFormTemplateWithQuestionsByIdQuery,
  getAllFormTemplatessQuery,
  updateFormTemplateQuery,
  updateFormQuestionQuery,
  deleteFormTemplateQuery,
  createFormAnswerQuery,
  createFormSubmissionQuery,
  getAllFormSubmissionsQuery,
  getFormSubmissionByIdQuery,
  updateFormSubmissionQuery,
  updateFormAnswerQuery,
  deleteFormSubmissionQuery,
  getUserFormSubmissionQuery,
  updateFormApprovalQuery,
  getAllFormSubmissionsCountQuery,
  getUserFormSubmissionCountQuery,
} = require("../queries/formQueries");

const createFormTemplate = async (body) => {
  const connection = await getConnection();

  try {
    const {
      form_template_id,
      is_publish,
      template_name,
      questions = [],
      user_id,
      company_id,
    } = body || {};

    const createFormTemplate = createFormTemplateQuery();
    const createFormQuestion = createFormQuestionQuery(questions);

    const formTemplateValues = [
      form_template_id,
      company_id,
      user_id,
      template_name,
      is_publish,
      new Date(),
      new Date(),
    ];

    const formQuestionValues = questions.flatMap((item) => [
      item.form_question_id,
      form_template_id,
      item.label,
      item.options.length > 0 ? item.options : null,
      item.field_type,
      item.permission,
      item.width,
      item.is_required ? 1 : 0,
      item.allow_duplicate ? 1 : 0,
      new Date(),
      new Date(),
    ]);

    await connection.beginTransaction();
    await connection.execute(createFormTemplate, formTemplateValues);
    await connection.execute(createFormQuestion, formQuestionValues);
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    console.error("error in creating form", error);
    throw error;
  } finally {
    connection.release();
  }
};

const createFormSubmission = async (payload) => {
  const connection = await getConnection();

  try {
    const {
      company_id,
      form_submission_id,
      user_id,
      form_tracking_id,
      answers = [],
      form_template_id,
    } = payload;

    const createSubmission = createFormSubmissionQuery();

    const formSubmissionValue = [
      form_submission_id,
      form_template_id,
      user_id,
      company_id,
      form_tracking_id,
      null,
      null,
      null,
      null,
      "Pending",
      new Date(),
      new Date(),
    ];

    await connection.beginTransaction();
    await connection.execute(createSubmission, formSubmissionValue);

    if (answers.length > 0) {
      const createAnswer = createFormAnswerQuery(answers);
      const answerValues = answers.flatMap((item) => [
        item.form_answer_id,
        item.user_id,
        item.form_question_id,
        form_submission_id,
        item.answer,
        new Date(),
        new Date(),
      ]);

      await connection.execute(createAnswer, answerValues);
    }

    await connection.commit();
  } catch (error) {
    await connection.rollback();
    console.error("error in creating form submission", error);
    throw error;
  } finally {
    connection.release();
  }
};

const getFormTemplateWithQuestionsById = async (form_template_id) => {
  const connection = await getConnection();

  try {
    const query = getFormTemplateWithQuestionsByIdQuery();
    const [result] = await connection.execute(query, [form_template_id]);
    return result[0];
  } finally {
    connection.release();
  }
};

const getFormSubmissionById = async (form_submission_id) => {
  const connection = await getConnection();

  try {
    const query = getFormSubmissionByIdQuery();
    const [result] = await connection.execute(query, [form_submission_id]);
    return result[0];
  } finally {
    connection.release();
  }
};

const getAllFormTemplatesWithQuestion = async (company_id) => {
  const connection = await getConnection();

  try {
    const query = getAllFormTemplatessQuery();
    const [rows] = await connection.execute(query, [company_id]);
    return rows;
  } finally {
    connection.release();
  }
};

const getUserFormSubmission = async (body) => {
  const connection = await getConnection();
  const { company_id, user_id, status } = body;

  try {
    const query = getUserFormSubmissionQuery();
    const countQuery = getUserFormSubmissionCountQuery();
    const [results] = await connection.execute(query, [
      company_id,
      user_id,
      status,
    ]);

    const [counts] = await connection.execute(countQuery, [
      company_id,
      user_id,
    ]);

    return {
      submissions: results,
      counts: counts[0],
    };
  } catch (error) {
    console.error("Error fetching form submissions:", error);
    throw error;
  } finally {
    connection.release();
  }
};

const getAllFormSubmissions = async (body) => {
  const connection = await getConnection();

  try {
    const query = getAllFormSubmissionsQuery();
    const countQuery = getAllFormSubmissionsCountQuery();

    const [results] = await connection.query(query, [
      body.company_id, // For first SELECT
      body.status, // For status filter
    ]);

    const [count] = await connection.query(countQuery, [
      body.company_id, // For second SELECT
    ]);
    return {
      submissions: results,
      counts: count[0],
    };
  } finally {
    connection.release();
  }
};

const updateFormTemplateWithQuestion = async (body) => {
  const connection = await getConnection();

  try {
    const { form_template_id, questions = [], ...otherData } = body || {};

    const allowedTemplateFields = ["template_name", "is_publish"];
    const allowedQuestionFields = [
      "label",
      "width",
      "field_type",
      "permission",
      "is_required",
      "allow_duplicate",
    ];

    // Update template fields
    const fieldsToUpdate = Object.keys(otherData).filter((key) =>
      allowedTemplateFields.includes(key)
    );

    if (fieldsToUpdate.length > 0) {
      const updateQuery = updateFormTemplateQuery(fieldsToUpdate);
      const values = fieldsToUpdate.map((k) => otherData[k]);
      values.push(form_template_id);
      await connection.execute(updateQuery, values);
    }

    // Get existing question IDs
    const [existingQuestions] = await connection.execute(
      `SELECT form_question_id FROM FormQuestion WHERE form_template_id = ?`,
      [form_template_id]
    );

    const existingIds = existingQuestions.map((q) => q.form_question_id);
    const incomingIds = questions.map((q) => q.form_question_id);

    // Remove missing questions
    const toDelete = existingIds.filter((id) => !incomingIds.includes(id));

    if (toDelete.length > 0) {
      await connection.execute(
        `DELETE FROM FormQuestion WHERE form_question_id IN (${toDelete
          .map(() => "?")
          .join(",")})`,
        toDelete
      );
    }

    const now = new Date();

    // Upsert questions
    await Promise.all(
      questions.map(async (q) => {
        const values = allowedQuestionFields.map((f) => q[f] ?? null);

        if (existingIds.includes(q.form_question_id)) {
          // UPDATE
          const updateQuery = updateFormQuestionQuery([
            ...allowedQuestionFields,
            "updated_at",
          ]);
          const updateValues = [...values, now, q.form_question_id];
          await connection.execute(updateQuery, updateValues);
        } else {
          // INSERT
          const insertQuery = `
            INSERT INTO FormQuestion (
              ${[
                ...allowedQuestionFields,
                "form_question_id",
                "form_template_id",
                "created_at",
                "updated_at",
              ].join(", ")}
            ) VALUES (
              ${[
                ...allowedQuestionFields.map(() => "?"),
                "?",
                "?",
                "?",
                "?",
              ].join(", ")}
            )
          `;
          const insertValues = [
            ...values,
            q.form_question_id,
            form_template_id,
            now,
            now,
          ];
          await connection.execute(insertQuery, insertValues);
        }
      })
    );
  } finally {
    connection.release();
  }
};

const updateFormSubmissionApproval = async (payload) => {
  const connection = await getConnection();

  try {
    const {
      form_submission_id,
      status,
      approved_by,
      approved_at,
      rejected_by,
      rejected_at,
      rejected_reason,
    } = payload;

    const fields = ["status"];
    const values = [status];

    if (approved_by) {
      fields.push("approved_by", "approved_at");
      values.push(approved_by, approved_at);
    }

    if (rejected_by) {
      fields.push("rejected_by", "rejected_at", "rejected_reason");
      values.push(rejected_by, rejected_at, rejected_reason);
    }

    const query = updateFormApprovalQuery(fields);

    values.push(form_submission_id);

    await connection.execute(query, values);

    return { success: true };
  } catch (err) {
    console.error("Approval update error:", err);
    throw err;
  } finally {
    connection.release();
  }
};

const updateFormSubmissionWithAnswer = async (payload) => {
  const connection = await getConnection();

  try {
    const {
      form_submission_id,
      status,
      resubmit_at,
      approved_at,
      approved_by,
      previous_answers,
      answers = [],
    } = payload;

    await connection.beginTransaction();

    const updateFields = [];
    const updateValues = [];

    if (status !== undefined) {
      updateFields.push("status");
      updateValues.push(status);
    }

    if (resubmit_at !== undefined) {
      updateFields.push("resubmit_at");
      updateValues.push(resubmit_at);
    }

    if (approved_at !== undefined) {
      updateFields.push("approved_at");
      updateValues.push(approved_at);
    }

    if (approved_by !== undefined) {
      updateFields.push("approved_by");
      updateValues.push(approved_by);
    }

    if (previous_answers !== undefined) {
      updateFields.push("previous_answers");
      updateValues.push(previous_answers);
    }

    if (updateFields.length > 0) {
      const submissionQuery = updateFormSubmissionQuery(updateFields);
      await connection.execute(submissionQuery, [
        ...updateValues,
        form_submission_id,
      ]);
    }

    const answerQuery = updateFormAnswerQuery();
    await Promise.all(
      answers
        .filter((a) => a.answer !== null)
        .map((a) =>
          connection.execute(answerQuery, [a.answer, a.form_answer_id])
        )
    );

    await connection.commit();
    return { success: true };
  } catch (err) {
    await connection.rollback();
    console.error("Error updating form submission and answers:", err);
    throw err;
  } finally {
    connection.release();
  }
};

const deleteFormTemplate = async (form_template_id) => {
  const connection = await getConnection();

  try {
    const query = deleteFormTemplateQuery();
    await connection.execute(query, [form_template_id]);
    return form_template_id;
  } finally {
    connection.release();
  }
};

const deleteFormSubmission = async (form_submission_id) => {
  const connection = await getConnection();

  try {
    const query = deleteFormSubmissionQuery();
    await connection.execute(query, [form_submission_id]);
    return form_submission_id;
  } finally {
    connection.release();
  }
};

module.exports = {
  createFormTemplate,
  getFormTemplateWithQuestionsById,
  getAllFormTemplatesWithQuestion,
  updateFormTemplateWithQuestion,
  deleteFormTemplate,
  createFormSubmission,
  getAllFormSubmissions,
  getUserFormSubmission,
  getFormSubmissionById,
  updateFormSubmissionWithAnswer,
  deleteFormSubmission,
  updateFormSubmissionApproval,
};
