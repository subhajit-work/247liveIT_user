const Joi = require('@hapi/joi');
const { transporter } = require('../config/app');

exports.sendAnEmail = async (req, res) => {

    try {

        const schema = Joi.object().keys({
            first_name: Joi.any().messages({ 'any': 'First name is required.' }),
            last_name: Joi.any().messages({ 'any': 'Last name is required.' }),
            full_name: Joi.any().messages({ 'any': 'Full name is required.' }),
            email: Joi.string().email().required().messages({
                'any.required': `Email is required.`
            }),
            mobile: Joi.required().messages({
                'any.required': `Mobile is required.`
            }),
            service: Joi.any().messages({ 'any': 'Service is required.' }),
            subject: Joi.any().messages({ 'any': 'Subject is required.' }),
            message: Joi.any().messages({ 'any': 'Message is required.' }),
            website: Joi.any().messages({ 'any': 'Website is required.' }),
        })
        .xor('service', 'subject', 'website')
        .with('website', ['first_name', 'last_name', 'email', 'mobile'])
        .with('service', ['full_name', 'email', 'mobile', 'message'])
        .with('subject', ['full_name', 'email', 'mobile', 'message'])
        .unknown(true);

        const result = schema.validate(req.body);

        if (result.error) {
            return res.status(422).send({ message: result.error.message });
        } else {

            await transporter.sendMail({
                from: `${process.env.MAIL_FROM_NAME} <${process.env.MAIL_FROM_ADDRESS}>`, // sender address
                to: "imran@247liveit.com", // list of receivers
                subject: `${req.body.full_name} contact you from 247liveit.com`, // Subject line
                html: await emailTemplate(req), // html body
                bcc: "nimishcpatel@gmail.com, Fahim@247liveit.com, developer@yopmail.com"
            });

            return res.status(200).send({ sent: true });
        }
    } catch (error) {
        return res.status(500).send({ message: error.message });
    }
}

function emailTemplate(req) {
    return `
            <div>
                <h3 style="margin-bottom:10px;">Message Details</h3>
                <table style="border-collapse: collapse; border: 2px solid rgb(200, 200, 200); letter-spacing: 1px; font-family: sans-serif; font-size: .8rem;">
                    <tr>
                        <th style="border: 1px solid rgb(190, 190, 190); padding: 10px;">Full Name</th>
                        <th style="border: 1px solid rgb(190, 190, 190); padding: 10px;">${req.body.full_name}</th>
                    </tr>
                    <tr>
                        <th style="border: 1px solid rgb(190, 190, 190); padding: 10px;">Subject</th>
                        <th style="border: 1px solid rgb(190, 190, 190); padding: 10px;">${req.body.service || req.body.subject}</th>
                    </tr>
                    <tr>
                        <th style="border: 1px solid rgb(190, 190, 190); padding: 10px;">Mobile</th>
                        <th style="border: 1px solid rgb(190, 190, 190); padding: 10px;">${req.body.mobile}</th>
                    </tr>
                    <tr>
                        <th style="border: 1px solid rgb(190, 190, 190); padding: 10px;">Message</th>
                        <th style="border: 1px solid rgb(190, 190, 190); padding: 10px;">${req.body.message}</th>
                    </tr>
                </table>
            </div>
        `;
}