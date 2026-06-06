require('dotenv').config();

const app = require('./src/app');
const prisma = require('./src/config/db');
const { startOverdueChecker } = require('./src/jobs/overdueChecker');

const PORT = process.env.PORT || 3000

async function main() {
    try {
        await prisma.$connect();
        console.log('✅ Database connected successfully');

        startOverdueChecker()

        app.listen(PORT, () => {
            console.log(`✅ Server is running on port ${PORT}`)
        });
    } catch (err) {
        console.error('❌ Database connection failed:', err.message)
        process.exit(1)
    }
}

main();