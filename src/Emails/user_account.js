const sgMail = require('@sendgrid/mail');
//const sendgridAPIkey = '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';
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
console.log(process.env.SENDGRID_API_KEY);

const sendWelcomeEmail = (email, name) => {
  const msg = {
    to: email,
    from: 'ayushigandhi12345@gmail.com',
    subject: `Welcome ${name} to SendGrid Email System`,
    text: `Welcome ${name} for joining the Task-APP , hope you have a Good Day !`
  };
  sgMail.send(msg);
};

const sendCancelationEmail = (email, name) => {
  const msg = {
    to: email,
    from: 'ayushigandhi12345@gmail.com',
    subject: `${name} to CANCEL SendGrid Email System`,
    text: `Welcome ${name} for CANCELATION the Task-APP , hope you have a Good Day !`
  };
  sgMail.send(msg);
};

module.exports= {
   sendWelcomeEmail : sendWelcomeEmail,
  sendCancelationEmail : sendCancelationEmail
} ;
