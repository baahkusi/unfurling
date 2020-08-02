const {User} = require('../models');

(async ()=> {

    // Drop tables
    await User.sync({force: true});
    console.log('\n\n\n');
    console.log('Begin Tests ...\n');


    // user authentication test.
    const user = await User.create({username: 'test'});

    const hashedPassword = await user.hashPass('test')
    user.password = hashedPassword;
    await user.save();
    
    console.log('Authenticatio Test ->', await user.authenticate('test'));
})();
