const createError = (message, status, code) => {
    const error = new Error(message)
    error.status = status
    error.code = code
    return error
}

module.exports = createError;