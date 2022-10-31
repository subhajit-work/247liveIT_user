const appConfig = require('../config/app');
const mysqlConnection = appConfig.connection;

exports.ppcAdvertising = async (req, res) => {

    res.render('ppc-advertising', {
        'packages': await getPlansOfThisPackage(req)
    });
}

exports.ecommercePPC = async (req, res) => {

    res.render('ecommerce-ppc', {
        'packages': await getPlansOfThisPackage(req)
    });
}

exports.leadGeneration = async (req, res) => {

    res.render('lead-ganeration', {
        'packages': await getPlansOfThisPackage(req)
    });
}

exports.localSEO = async (req, res) => {

    res.render('local-seo', {
        'packages': await getPlansOfThisPackage(req)
    });
}

exports.nationalSEO = async (req, res) => {

    res.render('national-seo', {
        'packages': await getPlansOfThisPackage(req)
    });
}

exports.onsiteSEO = async (req, res) => {

    res.render('onsite-seo', {
        'packages': await getPlansOfThisPackage(req)
    });
}

exports.socialMediaMarketing = async (req, res) => {

    res.render('social-media-marketing', {
        'packages': await getPlansOfThisPackage(req)
    });
}

exports.emailMarketing = async (req, res) => {

    res.render('email-makteting', {
        'packages': await getPlansOfThisPackage(req)
    });
}

exports.amazonAdvertisingManagement = async (req, res) => {

    res.render('amazon-advertising-management', {
        'packages': await getPlansOfThisPackage(req)
    });
}

exports.webDevelopment = async (req, res) => {

    res.render('web-devlopment', {
        'packages': await getPlansOfThisPackage(req)
    });
}

exports.packages = async (req, res) => {

    res.render('packages', {
        'packages': await getPlansOfThisPackage(req)
    });
}

async function getPlansOfThisPackage(req) {
    let [packages] = await mysqlConnection.promise().query(`
        SELECT 
            package_categories.packageCategoryId as package_category_id, 
            package_categories.name as package_category_name,
            packages.duration as month_duration,
            packages.stripePlanId as stripe_package_id,
            CASE 
                WHEN packages.type = 1 THEN 'STARTER' 
                WHEN packages.type = 2 THEN 'INTERMEDIATE'
                WHEN packages.type = 3 THEN 'STANDARD'
            END as plan_type,
            packages.name,
            packages.amount as package_amount,
            packages.includedFeatures as package_included_features,
            packages.notIncludedFeatures as package_not_included_features
        FROM 
            package_categories 
        LEFT JOIN
            packages
        ON
            package_categories.packageCategoryId = packages.packageCategoryId
        WHERE 
            package_categories.status = 1 AND
            package_categories.identifier = ? AND
            packages.status = 1
    `, [req.originalUrl.substr(1)]);

    
    return packages;
}
