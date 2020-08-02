const axios = require('axios');
const cheerio = require('cheerio');


(async ()=> {

    let req = await axios.get('https://lambdastories.com');

    let $ = cheerio.load(req.data);

    $('meta').each(function(i, e) {
        console.log($(this).attr('name'));
    });
    
})();
