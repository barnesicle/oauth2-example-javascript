const express = require('express');
const router = express.Router();
const axios = require('axios');

const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
const redirectURI = process.env.CLIENT_REDIRECT_URL;

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', { title: 'Express', redirect_url: redirectURI, client_id: clientId });
});

router.get('/success', function(req, res, next) {
    const token = req.query.token;
    res.render('success', { title: 'Express', token: token });
});

router.get('/email', async function(req, res, next) {
    const token = req.query.token;
    const emailIndex = typeof req.query.index !== 'undefined' ? req.query.index : 0;

    const config = {
        headers: {
            Authorization : 'Bearer ' + token
        }
    }

    console.log('Getting emails', JSON.stringify(config))

    const messagesResponse = await axios.get('https://www.googleapis.com/gmail/v1/users/me/messages', config).catch(error => {console.error(error);});

    console.log('messages response', messagesResponse.data.messages)

    const emailId = messagesResponse.data.messages[emailIndex].id;

    console.log('Getting email', emailId, JSON.stringify(config))

    const message = await axios.get('https://www.googleapis.com/gmail/v1/users/me/messages/'+emailId, config).catch(error => {console.error(error);});

    const emailContent = message.data.snippet;

    res.render('email', { title: 'Express', emailContent: emailContent });
});

router.get('/login/oauth2/code/:type', function(req, res, next) {

  const type = req.params.type;
  const code = req.query.code;

  console.log('Callback called', req.query.code, req.params.code)

  axios.post('https://oauth2.googleapis.com/token',
      null, {
        auth: {
          username: clientId,
          password: clientSecret
        },
        headers: {
          'content-type' : 'application/x-www-form-urlencoded'
        },
        params: {
            grant_type: 'authorization_code',
            client_id: clientId,
            client_secret: clientSecret,
            redirect_uri: redirectURI,
            code: code
          }
      })
      .then(response => {

        console.log("RESPONSE", JSON.stringify(response.data))

        const token = response.data.access_token;
        res.redirect("/success?token="+token)

        //res.render('index', { title: 'Express', token: token });
      })
      .catch(error => {
        console.error(error);
          res.render('index', { title: 'Express', redirect_url: redirectURI, client_id: clientId });
      });



});

module.exports = router;
