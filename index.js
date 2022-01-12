import express from "express";
import { v4 as uuidv4 } from 'uuid';


const app = express();
app.use(express.json());


const database = [];


const verifyIfCpfAlreadyRegistered = (req, res, next) => {

    const { cpf } = req.body;
    const existingUser = database.find((user) => user.cpf === cpf);

    existingUser ? res.status(409).send({ error: "CPF already registered" }) : next();

};

const verifyValidCpf = (req, res, next) => {

    const { cpf } = req.params;

    const existingUserIndex = database.findIndex((user) => user.cpf === cpf);
    req.userIndex = existingUserIndex;

    existingUserIndex >= 0 ? next() : res.status(404).send({ error: "invalid cpf - user is not registered" });

};

const verifyNoteId = (req, res, next) => {

    const userIndex = req.userIndex;
    const noteId = req.params.id;

    const noteIndex = database[userIndex].notes.findIndex((note) => note.id === noteId);

    req.noteIndex = noteIndex;

    noteIndex >= 0 ? next() : res.status(404).send({ error: "invalid note id - note is not registered" });
};



app.get('/users', (req, res) => {
    res.status(200).send(database);
});

app.post('/users', verifyIfCpfAlreadyRegistered, (req, res) => {

    let new_user = {};

    const { name, cpf } = req.body;

    new_user.id = uuidv4();
    new_user.name = name;
    new_user.cpf = cpf;
    new_user.notes = [];

    database.push(new_user);

    res.status(201).send(new_user);
});


app.use('/users/:cpf', verifyValidCpf);


app.patch('/users/:cpf', (req, res) => {

    const { name, cpf } = req.body;

    const userIndex = req.userIndex;

    database[userIndex].name = name;
    database[userIndex].cpf = cpf;

    res.send(database[userIndex]);
});

app.delete('/users/:cpf', (req, res) => {

    const indexToRemove = req.userIndex;

    database.splice(indexToRemove, 1);

    res.send({
        "message": "User is deleted",
        "users": database
    });
});

app.post('/users/:cpf/notes', (req, res) => {
    const userIndex = req.userIndex;

    const { title, content } = req.body;

    const newNote = {};

    newNote.id = uuidv4();
    newNote.created_at = new Date();
    newNote.title = title;
    newNote.content = content;

    database[userIndex].notes.push(newNote);

    res.status(201).send({ message: `${title} was added into ${database[userIndex].name}'s notes` });
});

app.get('/users/:cpf/notes', (req, res) => {
    const userIndex = req.userIndex;

    res.send(database[userIndex].notes);
});

app.use('/users/:cpf/notes/:id', verifyNoteId);

app.patch('/users/:cpf/notes/:id', (req, res) => {

    const userIndex = req.userIndex;
    const noteIndex = req.noteIndex;

    const { title, content } = req.body;

    database[userIndex].notes[noteIndex].title = title;
    database[userIndex].notes[noteIndex].content = content;
    database[userIndex].notes[noteIndex].updated_at = new Date();

    res.send(database[userIndex].notes[noteIndex]);
});

app.delete('/users/:cpf/notes/:id', (req, res) => {

    const userIndex = req.userIndex;
    const noteIndex = req.noteIndex;

    database[userIndex].notes.splice(noteIndex, 1);

    res.send({
        "message": "Note is deleted",
        "Notes": database[userIndex].notes
    });
});


app.listen(3000);