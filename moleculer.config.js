const os = require('os');

const namespace = process.env.NODE_ENV || 'development';
const transporter = process.env.TRANSPORTER || 'TCP';
const disableBalancer = !process.env.TRANSPORTER === 'TCP';
const validator = require('./utils/joi.validator');

module.exports = {
	namespace,
	nodeID: os.hostname().toLowerCase(),
	logger: {
		type: 'Console',
		options: {
			level: 'info',
			formatter: 'simple',
		},
	},
	transporter,
	disableBalancer,
	validator,
	serializer: 'ProtoBuf',
	cacher: {
		type: 'Memory',
		options: {
			ttl: 86400,
			clone: true,
		},
	},
	internalServices: false,
};
