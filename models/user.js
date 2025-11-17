const mongoose =require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new Schema({
   // username: String,
    email:{type:String, 
        required:true, 
        unique:true}  
});
userSchema.plugin(passportLocalMongoose);

userSchema.pre("save", async function(next){
    if(this.isModified("password")){
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
});
module.exports = mongoose.model("User", userSchema);
