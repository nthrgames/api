import * as functions from 'firebase-functions';
import fetch from 'node-fetch';

export const emailSubscribe = functions.https.onCall(async (
  data: {
    email: string;
  }
) => {
  try {
    await fetch('https://api.sendgrid.com/v3/mail/send', { 
      method: 'POST',
      body: JSON.stringify({
        personalizations: [
          {
            to: [{
              email: data.email,
            }],
          }
        ],
        from: {
          email: 'brennen@nthrgames.com',
          name: 'Brennen Peters',
        },
        template_id: 'd-34ae597bb11045059f9a971641247410',
      }),
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${functions.config().sendgrid.key}`,
      },
    });

    return {
      error: null,
    };
  } catch (error) {
    console.log('Error', error.message);

    throw new functions.https.HttpsError('failed-precondition', error.message);
  }
});
