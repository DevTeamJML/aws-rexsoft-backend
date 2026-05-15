const nodemailer = require("nodemailer");
const handlebars = require("handlebars");
const path = require("path");
const fs = require("fs");

let transporter;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: "jmlcreativedev@gmail.com", 
        pass: "uzzc fehn sufr rcuu", 
      },
    });
  }
  return transporter;
}

exports.sendMail = ({
  email: email,
  name: name,
  createdAt: createdAt,
  password: password,
}) => {
  const transporter = getTransporter();

  const filePath = path.join(__dirname, "../assets/mail_template/mail.html");
  const source = fs.readFileSync(filePath, "utf-8").toString();
  const template = handlebars.compile(source);
  const replacements = {
    name: name,
    email: email,
    createdAt: createdAt,
    password: password,
  };
  const htmlToSend = template(replacements);

  const message = {
    from: "jmlcreativedev@gmail.com",
    to: email,
    subject: `${name} , Welcome to CRM (NO-REPLY)`,
    html: htmlToSend,
  };

  transporter.sendMail(message, function (err, info) {
    if (err) {
      console.log(err);
    } else {
      console.log(info);
    }
  });
};

exports.sendVerificationMail = ({
  email: email,
  name: name,
  userid: userid,
}) => {
  //   let transporter = nodemailer.createTransport({
  //     host: "smtp.gmail.com",
  //     port: 465,
  //     auth: {
  //       user: "noreply.rexsoft@gmail.com",
  //       pass: "jvwyzlulymemxwku",
  //     },
  //   });
  const transporter = getTransporter();

  const filePath = path.join(
    __dirname,
    "../assets/mail_template/mail_verification.html"
  );
  const source = fs.readFileSync(filePath, "utf-8").toString();
  const template = handlebars.compile(source);
  const replacements = {
    name: name,
    email: email,
    userid: userid,
  };
  const htmlToSend = template(replacements);

  const message = {
    from: "jmlcreativedev@gmail.com",
    to: email,
    subject: `CRM, account activation. (NO-REPLY)`,
    html: htmlToSend,
  };

  transporter.sendMail(message, function (err, info) {
    if (err) {
      console.log(err);
    } else {
      console.log(info);
    }
  });
};

exports.sendInvitationMail = ({
  company_name,
  email,
  inviterName,
  role_id,
  invitation_id,
}) => {
  return new Promise((resolve, reject) => {
    try {
      const transporter = getTransporter();

      const filePath = path.join(
        __dirname,
        "../assets/mail_template/mail_invitation.html"
      );
      const source = fs.readFileSync(filePath, "utf-8").toString();
      const template = handlebars.compile(source);

      const replacements = {
        inviterName,
        email,
        companyName: company_name,
        url: `https://dupli.rexsoft.info/invitation?invitation_id=${invitation_id}&role_id=${role_id}`,
      };
      const htmlToSend = template(replacements);

      const message = {
        from: "jmlcreativedev@gmail.com",
        to: email,
        subject: "CRM Invitation",
        html: htmlToSend,
      };

      transporter.sendMail(message, (err, info) => {
        if (err) return reject(err);
        resolve(info);
      });
    } catch (error) {
      reject(error);
    }
  });
};
