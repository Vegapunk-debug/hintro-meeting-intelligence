const prisma = require('../../config/db')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const createError = require('../../utils/error')

const register = async ({ name, email, password }) => {
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
        throw createError('Email already registered', 409, 'EMAIL_EXISTS')
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
        data: { 
            name, 
            email, 
            password: hashedPassword 
        }
    })

    return { id: user.id, name: user.name, email: user.email }
}

const login = async ({ email, password }) => {
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
         throw createError('Invalid email or password', 401, 'INVALID_CREDENTIALS')
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
        throw createError('Invalid email or password', 401, 'INVALID_CREDENTIALS')
    }

    const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
    )

    return { token, user: { id: user.id, name: user.name, email: user.email } }
}

module.exports = { register, login };