const express = require('express')
const { generateTarget } = require('./smsService.js')
const app = express()

app.get('/', async (req, res) => {
  const id = req.params[0]

  return res.redirect('https://finbox.email/details?utm_source=zaim-direct')
});

app.get(/^\/(\w{4,5})$/, async (req, res) => {
  const id = req.params[0]

  return res.redirect(await generateTarget(id))
});

app.use((req, res, next) => {
  return res.redirect('https://finbox.email/details?utm_source=zaim-404')
})

const listener = app.listen(process.env.SHORT_PORT || 3001, '127.0.0.1', () => {
  console.log("Server is listening on port " + listener.address().port);
})
