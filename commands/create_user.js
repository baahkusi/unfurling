const {  User } = require('../models');

(async ()=> {

    if (process.argv.length !== 4) {
        throw new Error('positional arguments "username" "password" is missing ...')
    }

    const name = process.argv[2];
    const pass = process.argv[3];

    const user = await User.create({username: name});

    const hashedPassword = await user.hashPass(pass);
    user.password = hashedPassword;
    await user.save();

    console.log(`User ${user.username} successfully created ...`);
})();

