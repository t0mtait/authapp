import express from 'express'
import passport from 'passport'
import session from "express-session";
import GoogleStrategy from 'passport-google-oauth2'
import env from 'dotenv'
import ejs from 'ejs'

const app = express()
const port = 3000
env.config()

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true
}))

app.use(express.static('public'))
app.set('views', './views');
app.set('view engine', 'ejs');
app.use(passport.initialize())
app.use(passport.session())

passport.use('google',new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: 'http://localhost:3000/auth/google/secrets',
    userProfileURL: 'https://www.googleapis.com/oauth/v3/userinfo',
}, async (accessToken, refreshToken, profile, cb) => {
    try {
        console.log(profile)
        let user = {
            id: profile.sub,
            name: profile.displayName
        }
        return cb(null,user)
    }
    catch (err){
        console.log(err)
        return cb(err)
    }
}))

passport.serializeUser((user, done) => {
    done(null, user);
  });
  
  passport.deserializeUser((obj, done) => {
    done(null, obj);
  });


app.get('/google', passport.authenticate('google', { scope: ['profile'] }));

app.get('/auth/google/secrets', 
    passport.authenticate('google', { failureRedirect: '/login' }), 
    (req, res) => {
        res.redirect('/success');
    }
);

app.get('/success', (req,res) => {
    if (req.isAuthenticated()){
        res.render('success', { name: req.user.name })
    }
    else { 
        res.redirect('/')
    }
    
})
app.get('/', (req,res) => {
    res.render('login.ejs')
})

app.get('/logout', (req,res) => {
    req.logout(function (err) {
        if(err) {
            return next(err)
        }
        res.redirect('/')
        }
    )
})

app.listen(port, () => {
    console.log('listening on ', port)
})