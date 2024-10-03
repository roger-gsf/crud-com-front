const bcrypt = require('bcrypt');

const password = 'sua_senha_aqui';
const saltRounds = 10; // Número de rounds para salting

bcrypt.hash(password, saltRounds, (err, hash) => {
    if (err) throw err;
    console.log(`Senha encriptada: ${hash}`);

    // Comparar a senha apos o hash ser gerado:
    bcrypt.compare('senha', hash, (err, result) => {
        if (err) throw err;
        if (result) {
            console.log('Senha valida!');
        } else {
            console.log(`Senha invalida!`);
        }
    });
});