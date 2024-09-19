import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as GitHubStrategy } from 'passport-github2';
import { userModel } from "../models/userModel";
import { config } from "./config";
import { Strategy as LocalStrategy } from 'passport-local';
import bcrypt from 'bcrypt';

// Define types for profile objects
interface GoogleProfile {
  emails?: { value: string }[];
  displayName?: string;
}

interface GitHubProfile {
  emails?: { value: string }[];
  displayName?: string;
}

// Local Strategy
passport.use(new LocalStrategy(
  async (usernameOrEmail: string, password: string, done: (error: any, user?: any, info?: any) => void) => {
    try {
      const user = await userModel.findByEmail(usernameOrEmail) || await userModel.findByUsername(usernameOrEmail);
      if (user && await bcrypt.compare(password, user.password)) {
        return done(null, user);
      } else {
        return done(null, false, { message: 'Incorrect credentials.' });
      }
    } catch (err) {
      return done(err);
    }
  }
));

passport.serializeUser((user: any, done: (error: any, id?: any) => void) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done: (error: any, user?: any) => void) => {
  try {
    const user = await userModel.findByEmail(id);
    done(null, user || false); // Pass false if user is not found
  } catch (err) {
    done(err, false); // Pass false if an error occurs
  }
});

passport.use(
  new GoogleStrategy(
    {
      clientID: config.google.clientID,
      clientSecret: config.google.clientSecret,
      callbackURL: config.google.callbackURL,
      scope: ['profile','email'],
    },
    async (_accessToken: string, _refreshToken: string, profile: GoogleProfile, done: (error: any, user?: any) => void) => {
      try {

        console.log('Google Access Token:', _accessToken);

        const email = profile.emails?.[0]?.value;
        if (!email) {
          return done(new Error("No email associated with this Google account"), false);
        }

        const username = profile.displayName ?? email.split('@')[0];

        // Ensure username and email are strings
        if (typeof username !== 'string' || typeof email !== 'string') {
          return done(new Error("Invalid username or email"), false);
        }

        // Find or create user in database
        let user = await userModel.findByEmail(email);
        if (!user) {
          const passwordHash = '';  // No password for OAuth users
          user = await userModel.createUser(username, email, passwordHash);
        }

        return done(null, user);
      } catch (err) {
        return done(err, false);  // Pass 'false' instead of 'null'
      }
    }
  )
);

passport.use(
  new GitHubStrategy(
    {
      clientID: config.github.clientID,
      clientSecret: config.github.clientSecret,
      callbackURL: config.github.callbackURL,
      scope: ['user:email'],
    },
    async (_accessToken: string, _refreshToken: string, profile: GitHubProfile, done: (error: any, user?: any) => void) => {
      try {
        
        console.log('GitHub Access Token:', _accessToken);

        const email = profile.emails?.[0]?.value;
        if (!email) {
          return done(new Error("No email associated with this GitHub account"), false);
        }
        
        const username = profile.displayName ?? email.split('@')[0];
        
        // Ensure username and email are strings
        if (typeof username !== 'string' || typeof email !== 'string') {
          return done(new Error("Invalid username or email"), false);
        }
        
        let user = await userModel.findByEmail(email);
        if (!user) {
          const passwordHash = '';  // No password for OAuth users
          user = await userModel.createUser(username, email, passwordHash);
        }
        
        return done(null, user);
      } catch (err) {
        return done(err, false);
      }
    }
  )
);
