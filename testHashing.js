const bcrypt = require('bcrypt');

async function testHashing() {
    const plainPassword = 'nirman123';
    const hashedPassword = '$2a$10$iwcU6cihn.Fqt09M7vT2zu3nfaAGVEWudLfQ5AMB48HZkBm.IsLPW';

    try {
        const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
        console.log(`Password match: ${isMatch}`);
    } catch (error) {
        console.error(`Error comparing passwords: ${error}`);
    }
}

testHashing();
