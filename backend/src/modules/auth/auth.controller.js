const authService = require('./auth.service')
const logger = require('../../utils/logger')
const { successResponse } = require('../../utils/response')

const register = async (req, res, next) => {
  try {
    const user = await authService.register(req.body)
    logger.info(req.traceId, 'User registered', { email: req.body.email })
    res.status(201).json(successResponse(req, user))
  } catch (err) {
    next(err)
  }
}

const login = async (req, res, next) => {
  try {
    const result = await authService.login(req.body)
    logger.info(req.traceId, 'User logged in', { email: req.body.email })
    res.status(200).json(successResponse(req, result))
  } catch (err) {
    next(err)
  }
}

module.exports = { register, login };