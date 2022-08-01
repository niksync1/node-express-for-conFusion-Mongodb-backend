const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var favouriteSchema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        unique: true
    },
   dishes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Dishes',
    }] 
},{
    timestamps: true,
});

var Favourites  = mongoose.model('Favourite', favouriteSchema);

module.exports = Favourites;