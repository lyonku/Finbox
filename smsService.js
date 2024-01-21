const moment = require('moment');
const {getMessages} = require('./db.js')
const {generateId} = require('./util.js')
const {findProfile} = require('./profiles.js')
const {sendSms} = require('./sendSms.js')
const { URLSearchParams } = require('url')

const TEMPLATES = [
  {
    delay(point) { return moment(point).add(30, 'minutes').toDate() },
    text: '%name% новое предложение по займу %url% ©Звонобот',
    target: 'https://finbox.email/go'
  },
  {
    delay(point) { return moment(point).add(2, 'hours').toDate() },
    text: '%name%, одобрено %approvedLoan%₸ под 0% %url% ©Звонобот',
    target: 'https://finbox.email/go'
  },
]

const generateTarget = async (id) => {
  try {
    const coll = await getMessages();
    const message = await coll.findOne({_id: id})
    const profile = await findProfile(message.userId)
    const template = TEMPLATES[message.templateId].target

    const qs = new URLSearchParams()
    qs.append('utm_source', profile.source)
    qs.append('utm_medium', 'sms')
    qs.append('userId', message.userId)
    if (profile.linkId) {
      qs.append('linkId', profile.linkId)
    }
    if (profile.buyer) {
      qs.append('buyer', profile.buyer)
    }
    if (profile.fbpix) {
      qs.append('fbpix', profile.fbpix)
    }

    return template + '?' + qs.toString()
  } catch (e) {
    console.error(e)

    return 'https://finbox.email/details?utm_source=app-error&utm_medium=sms'
  }
}

const findReadyMessages = async () => {
  const coll = await getMessages();

  return coll.find({
    executedAt: { $exists: false },
    point: { $lt: new Date() }
  }).toArray()
}

const initScript = async (userId) => {
  const templateId = 0;
  const template = TEMPLATES[templateId]

  const coll = await getMessages();
  await coll.insertOne({
    _id: generateId(4),
    templateId,
    point: template.delay(new Date()),
    startedAt: new Date(),
    userId
  })
};

const nextStep = async (prev) => {
  const templateId = prev.templateId + 1;
  const template = TEMPLATES[templateId]
  if (!template) {
    // finish script
    return
  }

  const coll = await getMessages();
  await coll.insertOne({
    _id: generateId(4),
    templateId,
    point: template.delay ? template.delay(new Date()) : template.delayAfterStart(prev.startedAt),
    startedAt: prev.startedAt,
    userId: prev.userId,
  })
}

const generateText = (message, profile) => {
  const template = TEMPLATES[message.templateId].text
  const map = {
    '%name%': profile.name,
    '%approvedLoan%': profile.approvedLoan,
    '%url%': `https://zaim.ink/${message._id}`
  }

  let result = template

  for (const [key, value] of Object.entries(map)) {
    result = result.replaceAll(key, value)
  }

  return result
}

const executeStep = async (message) => {
  if (message.executedAt) {
    console.error('Message was been executed before', message)
    return
  }

  const coll = await getMessages();
  await coll.updateOne(
    { _id: message._id },
    { $set: { executedAt: new Date()}}
  )
  await nextStep(message)

  const profile = await findProfile(message.userId)

  await sendSms(profile.phone, generateText(message, profile))
}

exports.initScript = initScript;
exports.executeStep = executeStep;
exports.findReadyMessages = findReadyMessages;
exports.generateTarget = generateTarget;
