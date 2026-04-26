if(process.env.NODE_ENV != "production"){
    require('dotenv').config();
}


const express = require('express');
const app = express();
const mongoose = require('mongoose');
const path=require('path');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const ExpressError = require('./utils/ExpressError.js');
const listingRouter = require('./routes/listing.js');
const reviewRouter = require('./routes/review.js');
const session = require('express-session');
const MongoStore = require('connect-mongo').default;
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user.js');
const userRouter = require('./routes/user.js');

const dbUrl=process.env.ATLASDB_URL;
console.log("DB URL:", dbUrl);

main().then(()=>{
    console.log("Connected to MongoDB");
}).catch((err)=>{
    console.error("Error connecting to MongoDB:", err);
});
async function main(){
    await mongoose.connect(dbUrl);
}

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, 'public')));


const store=MongoStore.create({
    mongoUrl: dbUrl,
    crypto:{
        secret:process.env.SECRET
    },
    touchAfter: 24*60*60
});

store.on("error", () => {
    console.log("ERROR in MONGO SESSION STORE" , err);
});

const sessionOptions={
    store,
    secret:process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie:{
        expires: Date.now() + 1000*60*60*24*7,
        maxAge: 1000*60*60*24*7,
        httpOnly:true
    }
};
// app.get("/", (req,res)=>{
//     res.send("Hi, I am root");
// });


app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
});

app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);

app.get("/", (req, res) => {
    res.redirect("/listings");
});

app.use("/", userRouter);


// app.get("/testListing", async (req,res)=>{
//     let sampleListing = new Listing({
//         title: "My New Villa",
//         description: "A charming Sunlight.",
//         price: 1500,
//         location: "Calangute, Goa",
//         country: "India",
//     });
//     await sampleListing.save()
//     console.log("Sample listing saved:", sampleListing);
//     res.send("Successful testing");
    
// });

// app.use((err, req, res, next)=>{
//     res.send("Something went wrong!");
// });



app.use((req,res,next)=>{
    next(new ExpressError(404, "Page Not Found!"));
});

app.use((err, req, res, next) => {
    let { statusCode=500, message="Something went wrong!" } = err;
    res.status(statusCode).render("error.ejs", { err });
    //res.status(statusCode).send(message);
});

app.listen(8080, () => {
    console.log('Server is running on port 8080');
});