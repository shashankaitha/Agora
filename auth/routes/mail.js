const emailConfig = require('../util/email-config')();
const mailgun = require('mailgun-js')(emailConfig);

exports.sendEmail = (recipient, message, attachment) =>
    new Promise((resolve, reject) => {
        const data = {
            from: 'AGORA Educations <info@mg.shashankaitha.com>',
            to: recipient,
            subject: message.subject,
            link: message.link,
            inline: attachment,
            html: message.html,
        };

        mailgun.messages().send(data, (error) => {
            if (error) {
                return reject(error);
            }
            return resolve();
        });
    });