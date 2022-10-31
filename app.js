let appConfig = require('./config/app');

const express = require('express');
const exphbs = require('express-handlebars');

const bcrypt = require('bcrypt');
const saltRounds = 10;

var hbs = exphbs.create({
    helpers: {
        ifCond: function (v1, operator, v2, options) {

            switch (operator) {
                case '==':
                    return (v1 == v2) ? options.fn(this) : options.inverse(this);
                case '===':
                    return (v1 === v2) ? options.fn(this) : options.inverse(this);
                case '!=':
                    return (v1 != v2) ? options.fn(this) : options.inverse(this);
                case '!==':
                    return (v1 !== v2) ? options.fn(this) : options.inverse(this);
                case '<':
                    return (v1 < v2) ? options.fn(this) : options.inverse(this);
                case '<=':
                    return (v1 <= v2) ? options.fn(this) : options.inverse(this);
                case '>':
                    return (v1 > v2) ? options.fn(this) : options.inverse(this);
                case '>=':
                    return (v1 >= v2) ? options.fn(this) : options.inverse(this);
                case '&&':
                    return (v1 && v2) ? options.fn(this) : options.inverse(this);
                case '||':
                    return (v1 || v2) ? options.fn(this) : options.inverse(this);
                default:
                    return options.inverse(this);
            }
        },
        concat: function() {
            arguments = [...arguments].slice(0, -1);
            console.log(arguments.join(''));
            return arguments.join('');
        },
        split: function(separator, string) {
            return string.split(separator);
        }
    },
});

const Joi = require('@hapi/joi');

const app     = express();

const contactController = require('./controllers/ContactController')
const paymentController = require('./controllers/PaymentController')
const planController = require('./controllers/PlanController')
const mysqlConnection = appConfig.connection;

app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');

app.use(express.static('public'))

app.use((req, res, next) => {
    if (req.originalUrl === '/webhook') {
        console.log('YOU ARE WEBHOOK');
        next();
    } else {
        express.json()(req, res, next);
    }
});
app.use(express.urlencoded({
    extended: true
}));

if (['production', 'development'].includes(appConfig.app.environment)) {

    const fs = require('fs');
    
    var protocol    = require('https').Server({
        key: fs.readFileSync(process.env.SSL_PRIVATE_KEY),
        cert: fs.readFileSync(process.env.SSL_CERTIFICATE_KEY)
    }, app);
}else{
  
    var protocol    = require('http').Server(app);
}

app.get('/', (req, res) => {
    res.render('home');
});

app.get('/about', (req, res) => {
    res.render('about');
});


app.get('/contact', (req, res) => {
    res.render('contact', {
        showSubscriptionForm: false
    });
});

app.get('/creative-services', (req, res) => {
    res.render('creative-services');
});


app.get('/ppc-advertising', planController.ppcAdvertising);

app.get('/ecommerce-ppc', planController.ecommercePPC);
app.get('/lead-ganeration', planController.leadGeneration);

app.get('/local-seo', planController.localSEO);
app.get('/national-seo', planController.nationalSEO);
app.get('/onsite-seo', planController.onsiteSEO);

app.get('/social-media-marketing', planController.socialMediaMarketing);
app.get('/email-makteting', planController.emailMarketing);
app.get('/amazon-advertising-management', planController.amazonAdvertisingManagement);
app.get('/web-devlopment', planController.webDevelopment);
app.get('/packages', planController.packages);

app.post('/sendServiceEmail', contactController.sendAnEmail);
app.get('/package-details/:stripePackageId', paymentController.showPaymentForm);
app.post('/makePayment', paymentController.makePayment);
app.get('/verify-account', (req, res)=> {

    return res.render('reset-password', {
        showSubscriptionForm: false,
        email: req.query.email,
        token: req.query.token,
    });
});

app.post('/setup-password', async(req, res)=> {

    try {
         
        const schema = Joi.object({
            email: Joi.string().email().required(),
            password: Joi.string().min(8).required(),
            token: Joi.string().required().messages({
                "string.base": "Invalid token provided. make sure to request from valid link.",
                "string.empty": "Invalid token provided. make sure to request from valid link.",
                "any.required": "Invalid token provided. make sure to request from valid link.",
            })
        }).unknown(true);
    
        const result = schema.validate(req.body);
    
        if (result.error) {
            throw { message: result.error.message }
        }
        
        const password = await bcrypt.hash(req.body.password, saltRounds);
        let [status] = await mysqlConnection.promise()
        .query(`UPDATE users SET password = ?, token = ?, emailVerifiedAt = NOW() WHERE email = ? AND token = ? AND token IS NOT NULL`, [
            password, null, req.body.email, req.body.token
        ]);
        
        if (!status.changedRows) {
            throw {message: 'Something went wrong while setting up new password. Make sure to request with valid information.'}
        }
      
        return res.send({
            message: 'Your password has been updated successfully. Enjoy the service by login in CMS. 👍'
        });
    } catch (error) {
        return res.status(500).send({ message: error.message });
    }
});

protocol.listen(appConfig.app.port, ()=> {
  console.log(`${appConfig.app.environment}`+` server is started on port number ${appConfig.app.port}`);
});