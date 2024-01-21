const axios = require('axios');
const qs = require('qs');


// @see https://www.unisender.com/ru/support/api/contacts/subscribe/

const LIST_WEBSITE = '907';
const LIST_UNKNOWN_WEBSITE = '911';
const EMAIL_STATUS_VALID = 'valid';
const EMAIL_STATUS_UNKNOWN = 'unknown';


const subscribe = async ({ email, emailStatus, phone, name, fullname, approvedLoan, userId, url, buyer }) => {
  if (![EMAIL_STATUS_VALID, EMAIL_STATUS_UNKNOWN].includes(emailStatus)) {
    throw new Error(`Can not subscribe "${email}" with "${emailStatus}" status`)
  }

  const params = {
    format: 'json',
    api_key: '6exyd14uur9ppmdwjgju71gwyg7mncys84oy11po',
    list_ids: emailStatus === EMAIL_STATUS_VALID ? LIST_WEBSITE : LIST_UNKNOWN_WEBSITE,
    double_optin: 3, // нужно выяснить у менеджера рассылок, как правильно заводить новых пользователей. Нужен ли запрос на подтверждения соглашения на рассылку или нет
    overwrite: 2, // merge data
    fields: {
      email: email,
      // обязательно только email, имена остальных полей можно самому придумывать
      phone: phone,
      NAME: fullname,
      LOAN_AMOUNT: approvedLoan,
      URL: url,
      BUYER: buyer,
    }
  };

  await axios.get('https://api.unisender.com/ru/api/subscribe?' + qs.stringify(params));
}

exports.subscribe = subscribe;
