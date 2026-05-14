const { randomBytes, randomInt } = require('node:crypto');

async function generateRandomBytes(length) {
  return new Promise((resolve, reject) => {
    randomBytes(length, (err, buffer) => {
      if (err) {
        reject(err);
      } else {
        resolve(buffer);
      }
    });
  });
}

async function generateUniqueID(length = 16) {
  const bytes = await generateRandomBytes(length);
  const timestamp = Date.now().toString(16); // Get the current timestamp as a hexadecimal string
  const uniqueID = bytes.toString('hex') + timestamp; // Append the timestamp to the generated random bytes
  return uniqueID;
}

async function generatePassword(length = 16) {
  const charset = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ,.-{}+!"#$%/()=?';
  const randomChar = () => charset[Math.floor(Math.random() * charset.length)];

  const requiredChars = [
    charset.substring(0, 10), // Digits
    charset.substring(10, 36), // Lowercase letters
    charset.substring(36, 62), // Uppercase letters
    charset.substring(62, 77), // Special characters
  ].map((set) => set[Math.floor(Math.random() * set.length)]);

  let password = requiredChars.join('');

  for (let i = password.length; i < length; i++) {
    password += randomChar();
  }

  return password
    .split('')
    .sort(() => Math.random() - 0.5)
    .join('');
}

function replaceNumberFormatDate(format) {
  const date = new Date();
  const pattern = /\[(YYYY|YY|MM|DD)\]/g;
  const datePlaceholders = {
    '[YYYY]': date.getFullYear(),
    '[YY]': String(date.getFullYear()).slice(-2),
    '[MM]': String(date.getMonth() + 1).padStart(2, '0'),
    '[DD]': String(date.getDate()).padStart(2, '0'),
  };
  const replacedFormat = format.replace(pattern, (originalValue, placeholder) => {
    return datePlaceholders[`[${placeholder}]`] || originalValue; // Replace or keep the original match
  });

  return replacedFormat;
}

function replaceNumberFormatDate(format) {
  const pattern = /\[(YYYY|YY|MM|DD)\]/g;
  const datePlaceholders = {
    '[YYYY]': date.getFullYear(),
    '[YY]': String(date.getFullYear()).slice(-2),
    '[MM]': String(date.getMonth() + 1).padStart(2, '0'),
    '[DD]': String(date.getDate()).padStart(2, '0'),
  };
  const replacedFormat = format.replace(pattern, (originalValue, placeholder) => {
    return datePlaceholders[`[${placeholder}]`] || originalValue; // Replace or keep the original match
  });

  return replacedFormat;
}

function generateDateNow() {
  const currentDate = new Date();

  const options = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  };

  const dateFormatter = new Intl.DateTimeFormat('ms-MY', options);
  const formattedDate = dateFormatter.format(currentDate);

  return formattedDate;
}

module.exports = { generateUniqueID, generatePassword, replaceNumberFormatDate, generateDateNow };
