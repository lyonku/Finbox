const axios = require('axios');

const sendSms = async (phone, text) => {
  console.log('Send sms', phone)

  const data = {
    apiKey: 'hKj5Hi56oRRrWfrWNp2NOdwbai6SRKtUwiRT3iWIB4Y4dN4ONsN6KReEsM5B',
    sms: [
      {
        // channel: 'digit',
        channel: 'char', sender: 'VIRTA',
        phone: '+' + phone.replaceAll(/\D+/g, ''),
        text,
      }
    ]
  }

  // console.log(data)

  const result = await axios.post('https://admin.p1sms.ru/apiSms/create', data)

  console.log(result.data)
}

exports.sendSms = sendSms;
