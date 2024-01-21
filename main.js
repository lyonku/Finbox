const express = require('express')
const app = express()
const cookieParser = require('cookie-parser')
const { subscribe } = require('./unisender.js')
const { emailValidator } = require('./emailValidator.js')
const appSource = require('./appSource.js')
const fbSource = require('./fbSource.js')
const { addProfile, findProfile } = require('./profiles.js')
const {extractName, formatNumber, generateId} = require('./util.js')
const {initScript} = require('./smsService.js')

// set the view engine to ejs
app.set('view engine', 'ejs');

// use res.render to load up an ejs view file

app.use(express.json())
app.use(express.urlencoded({
  extended: true
}))
app.use(express.static('public'));
app.use(cookieParser());


const getUserId = (req) => {
  return req.query.linkId ? req.query.linkId : ( req.query.userId ?? req.cookies.userId )
}
app.use((req, res, next) => {
  if (!req.cookies.userId) {
    let userId = getUserId(req)
    if (!userId) {
      userId = generateId(12)
      req.cookies.userId = userId
    }
    const expires = new Date();
    expires.setDate(expires.getDate() + 365);
    res.cookie('userId', userId, { expires, httpOnly: false })
  }
  if (!req.cookies.source || (req.query.utm_source && req.cookies.source !== req.query.utm_source)) {
    let source = null
    if (req.query.linkId) {
      source = 'app'
    } else if (req.query.utm_source) {
      source = req.query.utm_source
    }
    if (source) {
      req.cookies.source = source
      const expires = new Date();
      expires.setDate(expires.getDate() + 365);
      res.cookie('source', source, { expires, httpOnly: false })
    }
  }
  next()
});

const getSource = (req) => {
  return req.query.linkId ? appSource : fbSource;
}

// index page
app.get('/details', async function(req, res) {
  const userId = getUserId(req);
  const offers = await getSource(req).getOffers(userId, req);
  const targetUrl = '/go?' + req._parsedUrl.query;
  const mainOffers = offers.slice(0, 3)
  const restOffers = offers.slice(3)
  const profile = await findProfile(userId)

  res.render('details', {
    profile,
    targetUrl,
    mainOffers,
    restOffers,
    formatNumber,
    approvedLoan: profile?.approvedLoan ?? 150_000,
  });
});

app.get('/validate-email', async (req, res) => {
  const email = req.query.email;
  const result = await emailValidator(email);

  res.json({ email, ...result });
});

app.post('/api/add-profile', async (req, res) => {
  if (req.headers?.authorization !== 'Bearer f409a9e6-cefc-4739-a9e5-05925d5ddc20') {
    return res.status(403).json({ error: 'No credentials sent!' });
  }

  const data = req.body;
  const userId = data.linkId;

  const profile = {
    email: data.email,
    emailStatus: 'valid',
    phone: data.phone,
    name: extractName(data.fullname),
    fullname: data.fullname,
    approvedLoan: data.approvedLoan,
    userId: userId,
    linkId: data.linkId,
    source: 'app',
    url: `https://finbox.mobi/details?linkId=${userId}&email=true&utm_source=app&utm_medium=email`,
  }

  await Promise.all([addProfile(userId, profile), initScript(userId)])

  res.json(profile)
})

app.post('/details', async function(req, res) {
  const offers = await getSource(req).getOffers(getUserId(req), req);
  const targetUrl = '/go?' + req._parsedUrl.query;
  const mainOffers = offers.slice(0, 3)
  const restOffers = offers.slice(3)

  try {
    const data = req.body;
    const buyer = req.query.buyer;
    const userId = getUserId(req);

    if (data.phone[0] === '(') {
      data.phone = '+7' + data.phone;
    }

    data.name = data.name.toLowerCase().replace(
      /^[\u00C0-\u1FFF\u2C00-\uD7FF\w]|\s[\u00C0-\u1FFF\u2C00-\uD7FF\w]/g,
      (letter) => letter.toUpperCase()
    );

    data.sum = parseInt(data.sum.replace(' ', ''), 10);

    const profile = {
      email: data.email,
      emailStatus: data.emailStatus,
      phone: data.phone,
      name: extractName(data.name),
      fullname: data.name,
      approvedLoan: data.sum,
      userId: userId,
      fbpix: req.query.fbpix,
      source: 'website',
      url: `https://finbox.mobi/details?buyer=${buyer}&fbpix=${req.query.fbpix}&userId=${userId}&email=true&utm_source=website&utm_medium=email`,
      buyer: req.query.buyer,
    }

    await Promise.all([subscribe(profile), addProfile(userId, profile), initScript(userId)])

    res.render('details', {
      profile,
      targetUrl,
      mainOffers,
      restOffers,
      formatNumber,
      approvedLoan: profile?.approvedLoan ?? 150_000,
    });
  } catch (e) {
    console.error(e)

    res.render('details', {
      targetUrl,
      mainOffers,
      restOffers,
      formatNumber,
      approvedLoan: 150_000,
    });
  }
});

const generateTarget = (req, offer) => {
  const userId = getUserId(req);
  const buyer = req.cookies.buyer
  const source = req.cookies.source

  let routeToRedirect = offer.url + (offer.url.match(/\?/) ? '&' : '?') + req._parsedUrl.query;

  if (!req.query.userId && userId) {
    routeToRedirect += `&userId=${userId}`
  }
  if (!req.query.buyer && buyer) {
    routeToRedirect += `&buyer=${buyer}`
  }
  if (!req.query.utm_source && source) {
    routeToRedirect += `&utm_source=${source}`
  }

  return routeToRedirect
}

app.get('/go', async (req, res) => {
  const userId = getUserId(req);
  const offer = await getSource(req).findOffer(userId);

  return res.redirect(generateTarget(req, offer))
});

app.get('/go/:preferOfferId', async (req, res) => {
  const userId = getUserId(req);
  const offer = await getSource(req).findOffer(userId, req.params.preferOfferId * 1);

  return res.redirect(generateTarget(req, offer))
});

const listener = app.listen(process.env.PORT || 3000, '127.0.0.1', () => {
  console.log("Server is listening on port " + listener.address().port);
})
