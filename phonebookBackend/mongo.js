const mongoose = require('mongoose')

if(process.argv.length < 3){
  console.log('Please provide the password as an argument: node mongo.js <password>')
  process.exit(1)
}

const password = process.argv[2]
const name = process.argv[3]
const number = process.argv[4]

const url = `
  mongodb+srv://phonebook:${password}@cluster0.a2aot.mongodb.net/phonebook-backend?retryWrites=true&w=majority`

mongoose.connect(url, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true
})

const personSchema = new mongoose.Schema({
  name: String,
  number: String
})

const Person = mongoose.model('Person', personSchema)

const person = new Person({
  name,
  number
})

if(process.argv.length === 3){
  Person.find({}).then(result => {
    result.forEach(person => {
      console.log(person)
    })
    mongoose.connection.close()
  })
}else {
  person.save().then(persons => {
    console.log(`added ${name} number ${number} to phonebook`)
    mongoose.connection.close()
  })
  
}