import * as functions from 'firebase-functions';
import fetch from 'node-fetch';
import * as fs from 'fs';

type EmailData = {
  [key:string]: any,
};

const emailData: EmailData = {
  'raid': {
    email: fs.readFileSync(`${__dirname}/emails/nether-news-raid-updates.html`, 'utf8'),
    data: {},
  },
  'seven-sails': {
    email: fs.readFileSync(`${__dirname}/emails/nether-news-raid-updates.html`, 'utf8'),
    data: {},
  },
};

export const emailSubscribe = functions.https.onCall(async (
  data: {
    email: string;
    type: string;
  }
) => {
  if (!data.email) {
    throw new functions.https.HttpsError('invalid-argument', 'missing email');
  }

  if (!emailData[data.type]) {
    throw new functions.https.HttpsError('invalid-argument', 'invalid email type');
  }

  try {
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', { 
      method: 'POST',
      body: JSON.stringify({
        personalizations: [
          {
            to: [{
              email: data.email,
            }],
            subject: 'Nether News - Raid Updates',
            bcc: [{
              email: 'brennen@nthrgames.com',
            }],
            substitutions: emailData[data.type].data,
          }
        ],
        from: {
          email: 'brennen@nthrgames.com',
          name: 'Brennen Peters',
        },
        content: [{
          type: 'text/html',
          value: emailData[data.type].email,
        }],
      }),
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${functions.config().sendgrid.key}`,
      },
    });

    if (response.status !== 202) {
      throw new Error('failed to send email');
    }
  } catch (error) {
    console.error(error.message);
    throw new functions.https.HttpsError('failed-precondition', 'failed to send email');
  }

  return {
    error: null,
  };
});
