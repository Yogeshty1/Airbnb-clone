const mongoose =require("mongoose");
const Schema = mongoose.Schema;

const reviewSchema=new Schema({
    comment: {
        type: String,
        required: true,
        trim: true,
        validate: {
            validator: function(v){
                return typeof v === 'string' && v.trim().length > 0;
            },
            message: 'Comment cannot be empty'
        }
    },
    rating: {
        type:Number,
        required: true,
        min:1,
        max:5
    },
    createdAt:{
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("review", reviewSchema);