const express = require('express')
const morgan = require('morgan')
const app = express()
const cors = require('cors')
require('dotenv').config()
const Person = require('./models/person')

app.use(express.static('build'))
app.use(cors())
app.use(express.json())

morgan.token('body', req => {
    if(req.method === 'POST'){
      return JSON.stringify(req.body)
    }else {
      return null
    }
})

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

app.get('/',(request, response) => {
    response.send("<h1>It's Work!</h1>")
})

app.get('/api/persons', (request, response) => {
    Person.find({}).then(persons => {
        console.log(persons)
        response.json(persons)
    })
})

app.get('/info', (request, response) => {
    Person.find({}).then(persons => {
        response.send(`
        <div>
            <p>Phonebook has info for ${persons.length} people</p> 
            <p>${new Date()}</p>
        </div>`)
    })
})

app.get('/api/persons/:id', (request, response, next) => {
    Person.findById(request.params.id)
        .then(person => {
            if(person){
                response.json(person)
            }else {
                response.status(404)-end()
            }
        })
        .catch(error => next(error))
})


app.post('/api/persons', (request, response) => {
    const body = request.body
    // console.log(body)

    if(body.name === undefined || body.number === undefined){
        return response.status(400).json({
            error: 'name or number missing'
        })
    }

    const person = new Person({
        name: body.name,
        number: body.number
    })

    person.save().then(savedPerson => {
        response.json(savedPerson)
    })
})

app.delete('/api/persons/:id', (request, response, next) => {
    Person.findByIdAndRemove(request.params.id)
      .then(result => {
          response.status(204).end()
      })
      .catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
    const body = request.body

    const person = {
      name: body.name,
      number: body.number
    }

    Person.findByIdAndUpdate(request.params.id, person, {new: true})
      .then(updatePerson => {
        response.json(updatePerson)
      })
      .catch(error => next(error))
})


const unknowRoute = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknowRoute)

const errorHandler = (error, request, response, next) => {
    console.log(error.message)

    if(error.name === 'CastError'){
        return response.status(404).end({error: 'malformatted id'})
    }

    next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})