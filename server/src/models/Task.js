import mongoose from "mongoose";


const taskSchema = new mongoose.Schema({
    
    title:{
        type: String,
        required: true,
        trim: true,
        minLength: 3
    },
    description:{
        type: String,
        required: true,
        trim: true,
        
    },
    completed:{
        type: Boolean,
        default: false
      
        
    },
    owner:{
       type: mongoose.Schema.Types.ObjectId,
       required: true,
       ref: "User",
       index: true
    },      
},
{ timestamps: true }

)

const Task = mongoose.model("Task", taskSchema)


export default Task


