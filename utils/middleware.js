const jwt = require('jsonwebtoken')
const logger = require('./logger')

const requestLogger = (request, response, next) => {
	logger.info(`method: ${request.method} | path: ${request.path}`)
	logger.info(`body: ${JSON.stringify(request.body)}`)
	logger.info('------------')
	next()
}

const unknownEndpoint = (request, response) => {
	response.status(404).send({ error: 'unknown endpoint' })
}

const errorHandler = (error, request, response, next) => {
	if (error.name === 'ValidationError') {
		return response.status(400).json({ error: error.message })
	}

	logger.error(error.message)

	next(error)
}

const tokenExtractor = (request, response, next) => {
	const auth = request.get('authorization')
	if(auth && auth.toLowerCase().startsWith('bearer ')) {
		request.token = auth.substring(7)
	}
	next()
}

const authenticator = (request, response, next) => {
	if (!request.token) {
		return response.status(401).json({ error: 'token missing' })
	}

	const decodedToken = jwt.verify(request.token, process.env.SECRET)

	if(!decodedToken.id) {
		return response.status(401).json({ error: 'token invalid' })
	}

	request.decodedToken = decodedToken
	next()
}

module.exports = {
	requestLogger,
	unknownEndpoint,
	errorHandler,
	tokenExtractor,
	authenticator
}