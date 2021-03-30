const mongoose = require('mongoose');
const config = require('config');
const mongouri = config.get('mongouri');

const connectdb = async () => {
try{

    await mongoose.connect(mongouri, {useUnifiedTopology : true, 
        useNewUrlParser: true,
        useFindAndModify: false});
    console.log("Database Connected");
}catch(err)
{
    console.error(err);
    //Exit program with failure
    process.exit(1);
}
};
module.exports = connectdb;