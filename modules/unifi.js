/**
 * Import vendor modules
 */
const unifi = require('node-unifi');
const time = require('../modules/time');
/**
 * Import own modules
 */
const config = {
    unifi: {
        ip: process.env.UNIFI_IP || '192.168.1.1',
        port: process.env.UNIFI_PORT || 443,
        username: process.env.UNIFI_USERNAME || 'admin',
        password: process.env.UNIFI_PASSWORD || 'password',
        siteID: process.env.UNIFI_SITE_ID || 'default'
    }
};

/**
 * Exports the UniFi voucher function
 *
 * @param type
 * @returns {Promise<unknown>}
 */
module.exports.createVoucher = (type) => {
    return new Promise((resolve) => {
        /**
         * Create new UniFi controller object
         *
         * @type {Controller}
         */
        const controller = new unifi.Controller({host: config.unifi.ip, port: config.unifi.port, site: config.unifi.siteID, sslverify: false});

        /**
         * Login and create a voucher
         */
        controller.login(config.unifi.username, config.unifi.password).then(() => {
            controller.getSitesStats().then(() => {
                controller.createVouchers(type.expiration, 1, type.usage === 1 ? 1 : 0, null, typeof type.upload !== "undefined" ? type.upload : null, typeof type.download !== "undefined" ? type.download : null, typeof type.megabytes !== "undefined" ? type.megabytes : null).then((voucher_data) => {
                    controller.getVouchers(voucher_data[0].create_time).then((voucher_data_complete) => {
                        const voucher = `${[voucher_data_complete[0].code.slice(0, 5), '-', voucher_data_complete[0].code.slice(5)].join('')}`;
                        resolve(voucher);
                    }).catch((e) => {
                        console.log('Error while getting voucher!');
                        console.log(e);
                        process.exit(1);
                    });
                }).catch((e) => {
                    console.log('Error while creating voucher!');
                    console.log(e);
                    process.exit(1);
                });
            }).catch((e) => {
                console.log('Error while getting site stats!');
                console.log(e);
                process.exit(1);
            });
        }).catch((e) => {
            console.log('Error while logging in!');
            console.log(e);
            process.exit(1);
        });
    });
};

/**
 * Exports the UniFi voucher function
 *
 * @returns {Promise<unknown>}
 */
module.exports.getExistingVouchers = () => {
    return new Promise((resolve) => {
        /**
         * Create new UniFi controller object
         *
         * @type {Controller}
         */
        const controller = new unifi.Controller({host: config.unifi.ip, port: config.unifi.port, site: config.unifi.siteID, sslverify: false});

        /**
         * Login and gets all existing vouchers
         */
        controller.login(config.unifi.username, config.unifi.password).then(() => {
            controller.getSitesStats().then(() => {
                controller.getVouchers().then((voucher_data_complete) => {
                    let vouchers = [];
                    voucher_data_complete.forEach(function(voucher) {
                        vouchers.push({
                            code: `${[voucher.code.slice(0, 5), '-', voucher.code.slice(5)].join('')}`,
                            duration: time(voucher.duration),
                            type: voucher.status === 'VALID_MULTI' ? 'multi-use' : 'single-use'
                        });
                    });
                    resolve(vouchers);
                }).catch((e) => {
                    console.log('Error while getting vouchers!');
                    console.log(e);
                    process.exit(1);
                });
            }).catch((e) => {
                console.log('Error while getting site stats!');
                console.log(e);
                process.exit(1);
            });
        }).catch((e) => {
            console.log('Error while logging in!');
            console.log(e);
            process.exit(1);
        });
    });
};
