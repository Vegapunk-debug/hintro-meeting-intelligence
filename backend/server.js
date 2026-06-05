require('dotenv').config();

const app = require('./src/app');
const prisma = require('./src/config/db');

const PORT = process.env.PORT || 3000

async function main() {
  await prisma.$connect();
  console.log('Database connected successfully');
}

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
});

main();