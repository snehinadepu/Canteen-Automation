import mongoose from "mongoose";

const connectDB = async () => {
    await mongoose.connect('mongodb+srv://abhiramogirala2005:gStqyiNbM7pVu8UE@cluster0.da4bvym.mongodb.net/food-del').then(() => {
        console.log(
            'DB Connected'
        )
    })
}

export default connectDB;