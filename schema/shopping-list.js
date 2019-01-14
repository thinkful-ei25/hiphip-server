'use strict';

const mongoose = require('mongoose');

//======Shopping List Schema======//

const schema = new mongoose.Schema({
    username: { type: String, required: true, unique: true},
    password: { type: String, required: true},
    items: [{
        name: {type: String},
        aisle: {type: String}
    }],
    store: { type: String, required: false}
});


schema.set('toJSON', {
    virtuals: true,
    transform: (doc, result) => {
        delete result.__v;
        delete result.password;
        delete result.id;
    }
});

module.exports = mongoose.model('List', schema);