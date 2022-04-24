const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const mongoose=require('mongoose')
const bodyParser = require('body-parser');
var _ = require('underscore');

app.use(cors())
app.use(express.static('public'))

app.use(bodyParser.urlencoded({extended:false}))

app.use(bodyParser.json())

//config mongoose and User Model
mongoose.connect('')
.then(console.log('mongoose connected'))
.catch(err=>console.log(err))

const Schema = mongoose.Schema;
const UserSchema=new Schema({
  username:String,
  log:[{description:String,duration:Number,date:Date}]
})

const User=mongoose.model('user',UserSchema);

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

//You can POST to /api/users with form data username to create a new user
//The returned response from POST /api/users with form data username will
//be an object with username and _id properties.
app.post('/api/users',(req,res)=>{
  const {username} = req.body

  const newUser = new User({
    username:username
  })

  newUser.save()
  .then(()=>{res.json({_id:newUser._id,username:username})})
  .catch(err=>console.log(err))
})

/*
You can make a GET request to /api/users to get a list of all users.

The GET request to /api/users returns an array.

Each element in the array returned from GET /api/users is
an object literal containing a user's username and _id.
*/
app.get('/api/users',async(req,res)=>{
  try {

  const users = await User.find();

  const temp = users.map(user=>({username:user.username,_id:user._id}))

  res.json(temp)
  } catch (e) {
    console.log(e)
  }
})

/*
You can POST to /api/users/:_id/exercises with form data description, duration,
and optionally date. If no date is supplied, the current date will be used.

The response returned from POST /api/users/:_id/exercises
will be the user object with the exercise fields added.
*/
app.post('/api/users/:_id/exercises',async(req,res)=>{

const {_id} =req.params;
const {description,duration,username} = req.body;

let date= req.body.date;

if(!date){
 date = Date.now();
}

const newExc={date,duration,description}

const user = await User.findById(mongoose.Types.ObjectId(_id));

//User.update(
 User.findOneAndUpdate(
  {_id:_id},
  {$push:{log:newExc}},

).then(res.send({_id,username:user.username,date:new Date(date).toDateString(),duration:parseInt(duration),description}))
.catch(err=>console.log(err))

})

/*
You can make a GET request to /api/users/:_id/logs to retrieve a full exercise log of any user.

A request to a user's log GET /api/users/:_id/logs returns a user object
with a count property representing the number of exercises that belong to that user.

A GET request to /api/users/:id/logs will return the user object with a
log array of all the exercises added.

Each item in the log array that is returned from GET /api/users/:id/logs is
 an object that should have a description, duration, and date properties.

The description property of any object in the log array that is returned
from GET /api/users/:id/logs should be a string.

The duration property of any object in the log array that
is returned from GET /api/users/:id/logs should be a number.

The date property of any object in the log array that is
returned from GET /api/users/:id/logs should be a string..
Use the dateString format of the Date API.
*/

app.get('/api/users/:_id/logs',async(req,res)=>{
  const {_id}= req.params;

  let {from,to,limit}=req.query;

 
  try {

    const user = await User.findById(mongoose.Types.ObjectId(_id));

  //  console.log(user);
      const {description,duration,date}=user.log;
        let count= user.log.length

         if(limit&&count>limit){
         count=limit
         }

  //filter the user.log record to meet the query requirements
  //to sort the log array

      user.log = _.sortBy(user.log, 'date');



  if(!from&!to){

    console.log('proceed without any query params')

     const filtered =user.log.slice(-count)


        const temp = filtered.map(exc=>({
       description:exc.description,
       duration:exc.duration,
       date: new Date(exc.date).toDateString()}))
       res.send({_id,username:user.username,count,log:temp});

  }else if(!from&&to){
    console.log('proceed without query params from, and to is: '+to)

        from = '1970-01-01';

       const filtered =user.log.filter(record=>
           record.date>=new Date(from) &&record.date<=new Date(to)).slice(-count)

         console.log(filtered.length)


        const temp = filtered.map(exc=>({
        description:exc.description,
        duration:parseInt(exc.duration),
        date: new Date(exc.date).toDateString()}))

      res.json({_id,username:user.username,to:new Date(to).toDateString(),count:filtered.length,log:temp});

       }else if(from&&!to){

       console.log('to does not assigned and from is: '+from)
       to= '2999-01-01';

      const filtered =user.log.filter(record=>
           record.date>=new Date(from) &&record.date<=new Date(to)).slice(-count)

         console.log(filtered.length)

        const temp = filtered.map(exc=>({
        description:exc.description,
        duration:parseInt(exc.duration),
        date: new Date(exc.date).toDateString()}))
      res.json({_id,username:user.username,from:new Date(from).toDateString(),count:filtered.length,log:temp});

        }else{
          console.log('from and to both exist. from is: '+from+'to: '+to)
           const filtered =user.log.filter(record=>
           record.date>=new Date(from) &&record.date<=new Date(to)).slice(-count)

         console.log(filtered.length)


        const temp = filtered.map(exc=>({
        description:exc.description,
        duration:parseInt(exc.duration),
        date: new Date(exc.date).toDateString()}))
      res.json({_id,username:user.username,from:new Date(from).toDateString(),to:new Date(to).toDateString(),count:filtered.length,log:temp});

  }

  }catch (e) {
    console.log(e)
  }


})

/*
You can add from, to and limit parameters to a GET /api/users/:_id/logs request
to retrieve part of the log of any user. from and to are dates in yyyy-mm-dd format.
limit is an integer of how many logs to send back.
*/




const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
