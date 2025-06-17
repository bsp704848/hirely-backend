import dotenv from 'dotenv';
dotenv.config();
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.js'; 

console.log("Client ID:", process.env.GOOGLE_CLIENT_ID);

passport.use(new GoogleStrategy({
    
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: 'https://hirely-backend.onrender.com/api/auth/google/callback',
}, async (accessToken, refreshToken, profile, done) => {
    try {
        console.log("✅ Google AccessToken:", accessToken);
        console.log("👤 Google Profile:", profile);
        const existingUser = await User.findOne({ googleId: profile.id });

        if (existingUser) return done(null, existingUser);

        const newUser = await User.create({
            username: profile.displayName,
            email: profile.emails[0].value,
            googleId: profile.id,
            role: 'employee', 
        });

        done(null, newUser);
    } catch (err) {
        console.error("❌ Error in GoogleStrategy callback:", error);
        done(err, null);
    }
}));

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
    const user = await User.findById(id);
    done(null, user);
});
