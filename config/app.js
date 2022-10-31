const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const nodemailer = require("nodemailer");
const mysql = require('mysql2');

console.log(JSON.stringify({
    host: '127.0.0.1',
    database: process.env.DB_DATABASE,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    connectionLimit: 200,
}));
const connection = mysql.createPool({
    host: '127.0.0.1',
    database: process.env.DB_DATABASE,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    connectionLimit: 200,
});

const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    secure: process.env.MAIL_SECURE, // true for 465, false for other ports
    auth: {
        user: process.env.MAIL_USERNAME, // generated ethereal user
        pass: process.env.MAIL_PASSWORD, // generated ethereal password
    },
});

const app = {
    port: process.env.NODE_PORT,
    environment: process.env.APP_ENV
};

const mailOptions = {
    from: `${process.env.MAIL_FROM_NAME} <${process.env.MAIL_FROM_ADDRESS}>`, // sender address
    to: "imran@247liveit.com", // list of receivers
    bcc: "nimishcpatel@gmail.com, Fahim@247liveit.com, developer@yopmail.com"
};

module.exports = {
	app: app,
    transporter: transporter,
    connection: connection,
    mailOptions: mailOptions,
}