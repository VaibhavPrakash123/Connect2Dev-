const express = require('express');
const connectdb = require('./config/mongodb');
const app = express();


connectdb();
app.get('/',(req,res)=>{
    res.send('API running');
});

app.use(express.json({extended:false}));

app.use('/api/users',require('./routes/users'));
app.use('/api/profile',require('./routes/profile'));
app.use('/api/auth',require('./routes/auth'));
app.use('/api/posts',require('./routes/posts'));
const PORT = process.env.PORT || 5000;

app.listen(PORT, ()=> console.log("Server started on port ",PORT));