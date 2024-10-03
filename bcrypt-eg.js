const bcrypt = require('bcrypt');

const password = 'my_password';
const saltRounds = 10; // Número de rounds para salting

bcrypt.hash(password, saltRounds, (err, hash) => {
    if (err) throw err;
    console.log(`Hashed password: ${hash}`);
    
    // Comparar a senha apos o hash ser gerado:
    bcrypt.compare('not_my_password', hash, (err, result) => {
        if (err) throw err;
        if (result) {
            console.log('Valid password!');
        } else {
            console.log(`Invalid password!`);
        }
    });
});