
const appConfig = require('../config/app');
const Joi = require('@hapi/joi');
const stripe = require('stripe')(process.env.SECRET_KEY);
const moment = require('moment-timezone');
moment.tz.setDefault('UTC');
const randtoken = require('rand-token');

const mysqlConnection = appConfig.connection;

const { transporter, mailOptions } = require('../config/app');

exports.showPaymentForm = async (req, res) => {

    try {
        
        const [package] = await mysqlConnection.promise().query(`
            SELECT 
                packages.packageId, 
                packages.name, 
                packages.amount,
                packages.stripePlanId,
                package_categories.name as package_category_name
            FROM 
                packages
            INNER JOIN 
                package_categories 
            ON 
                packages.packageCategoryId = package_categories.packageCategoryId
            WHERE
                packages.status = 1 AND
                packages.stripePlanId = ?
        `, [req.params.stripePackageId]);

        if (!package.length) {
            throw { message: 'Invalid package id provided.' };
        }

        res.render('payment', {
            showSubscriptionForm: false,
            package: package[0]
        });
    } catch (error) {
        return res.status(500).send({ message: error.message });
    }
}

exports.makePayment = async (req, res) => {

    try {
        
        const schema = Joi.object({
            first_name: Joi.string().min(3).required(),
            last_name: Joi.string().min(3).required(),
            email: Joi.string().email().required(),
            mobile_number: Joi.number().positive().required(),
            plan_id: Joi.string().required(),
            payment_method: Joi.string().required().messages({
                "string.base": "Kindly provide the card details to process subscription.",
                "string.empty": "Kindly provide the card details to process subscription.",
                "any.required": "Card details are required. Please add them."
            })
        });

        const result = schema.validate(req.body);

        if (result.error) {
            throw { message: result.error.message }
        }
        
        const [package, fields] = await mysqlConnection.promise().query(`
            SELECT 
                packages.packageId, 
                packages.name, 
                packages.amount,
                packages.stripePlanId,
                package_categories.name as package_category_name
            FROM 
                packages
            INNER JOIN 
                package_categories 
            ON 
                packages.packageCategoryId = package_categories.packageCategoryId
            WHERE
                packages.stripePlanId = ? AND
                packages.status = 1 AND
                package_categories.status = 1
        `, [req.body.plan_id]);

        if (!package.length) {
            throw { message: 'Invalid package id provided.' };
        }
        
        let [user, abc] = await mysqlConnection.promise().query(`
            SELECT 
                users.userId, 
                users.firstName, 
                users.lastName, 
                users.mobileNumber, 
                users.email, 
                users.stripeId,
                CASE 
                    WHEN
                        EXISTS (SELECT userSubscriptionId FROM user_subscription WHERE user_subscription.userId = users.userId AND user_subscription.subscriptionExpiredDate > DATE(?))
                    THEN
                        true
                    ELSE
                        false
                END as has_active_subscription
            FROM 
                users
            WHERE 
                users.email = ?
            LIMIT 1
            `, [
                moment().format('YYYY-MM-DD hh:mm:ss'), req.body.email
            ]);
       
        if (user.length && user[0].has_active_subscription) {
            throw {message: 'You are already registed users of 24/7 LIVE & have active subscription running. Please try to login.'};
        }
        
        let userStripeId, userInsertedId, token = null;
        if (!user.length) {

            const payment_method = JSON.parse(req.body.payment_method);

            const customer = await stripe.customers.create({
                name: `${req.body.first_name} ${req.body.last_name}`,
                email: req.body.email,
                phone: req.body.mobile_number,
                payment_method: payment_method.id,
                invoice_settings: {
                    default_payment_method: payment_method.id
                }
            });

            let [status] = await mysqlConnection.promise()
            .query(`INSERT INTO users (firstName, lastName, mobileNumber, email, stripeId, token) VALUES (?, ?, ?, ?, ?, ?)`, [
                req.body.first_name, req.body.last_name, req.body.mobile_number, req.body.email, userStripeId = customer.id, token = randtoken.generate(48)
            ]);
            
            userInsertedId = status.insertId;
        }

        const subscriptions = await stripe.subscriptions.list({
            customer: userStripeId ?? user[0].stripeId,
            status: 'active',
        });

        if (!user.length || (!user[0].has_active_subscription && !subscriptions.data.length)) {
            
            const subscription = await stripe.subscriptions.create({
                customer: userStripeId ?? user[0].stripeId,
                items: [
                    { price: req.body.plan_id },
                ],
            });

            await mysqlConnection.promise()
            .query(`INSERT INTO user_subscription (userId, packageId, transactionId, subscriptionDate, subscriptionExpiredDate, amount, status, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`, [
                userInsertedId ?? user[0].userId,
                package[0].packageId, 
                subscription.id, 
                new Date(subscription.current_period_start * 1000).toISOString().slice(0, 19).replace('T', ' '),
                new Date(subscription.current_period_end * 1000).toISOString().slice(0, 19).replace('T', ' '),
                Math.round(subscription.plan.amount / 100, 2),
                subscription.status,
            ]);
        }

        if (token) {
            
            await transporter.sendMail({
                ...mailOptions,
                ...{
                    to: req.body.email,
                    subject: `Hurray! Let's setting up your account!`,
                    html: `<a href='${process.env.APP_URL}/verify-account?email=${req.body.email}&token=${token}'>VERIFY YOUR ACCOUNT</a>`,
                }
            });
        }

        return res.status(200).send({ 
            message: 'Congratulations! You are successfully subscribed.'
        });
        
    } catch (error) {
        return res.status(500).send({ message: error.message });
    }
}

