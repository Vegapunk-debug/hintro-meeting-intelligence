const prisma = require('../../config/db')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const register = async ({ name, email, password }) => {
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
        const error = new Error('Email already registered')
        error.status = 409
        error.code = 'EMAIL_EXISTS'
        throw error
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
        const error = new Error('Invalid email or password')
        error.status = 401
        error.code = 'INVALID_CREDENTIALS'
        throw error
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
        const error = new Error('Invalid email or password')
        error.status = 401
        error.code = 'INVALID_CREDENTIALS'
        throw error
    }

    const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
    )

    return { token, user: { id: user.id, name: user.name, email: user.email } }
}

module.exports = { register, login };