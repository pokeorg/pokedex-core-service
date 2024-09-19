// authRoutes.ts

import { Router } from "express";
import {
  googleLogin,
  googleCallback,
  githubLogin,
  githubCallback,
  signUpController,
  loginController,
  forgotPasswordController,
  resetPasswordController,
} from "../controllers/authController";

const router = Router();

// Google OAuth routes
router.get("/google", googleLogin);
router.get("/google/callback", googleCallback);

// GitHub OAuth routes
router.get("/github", githubLogin);
router.get("/github/callback", githubCallback);

// Other authentication routes
router.post("/signup", signUpController);
router.post("/login", loginController);
router.post("/forgot-password", forgotPasswordController);
router.post("/reset-password", resetPasswordController);

export default router;




























// import { Router } from "express";
// import express from 'express';
// import passport from 'passport';
// import { authController } from "../controllers/authController";

// const router = express.Router();

// // Google OAuth routes
// router.get('/google', authController.googleLogin);
// router.get('/google/callback', authController.googleCallback);

// // GitHub OAuth routes
// router.get('/github', authController.githubLogin);
// router.get('/github/callback', authController.githubCallback);

// // // OAuth routes
// // router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
// // router.get('/auth/google/callback', passport.authenticate('google', { session: false }), (req, res) => {
// //   // Handle successful authentication and send JWT or user info
// //   res.redirect('/dashboard'); // Redirect to a page or handle response
// // });

// // router.get('/auth/github', passport.authenticate('github', { scope: ['profile', 'email'] }));
// // router.get('/auth/github/callback', passport.authenticate('github', { session: false }), (req, res) => {
// //   // Handle successful authentication and send JWT or user info
// //   res.redirect('/dashboard'); // Redirect to a page or handle response
// // });

// router.post("/signup", authController.signUp);
// router.post("/login", authController.login);
// router.post("/forgot-password", authController.forgotPassword);
// router.post("/reset-password", authController.resetPassword);

// export default router;



// // import { Router } from "express";
// // import { authController } from "../controllers/authController";
// // import passport from 'passport';

// // const router = Router();

// // // Authentication routes
// // router.post("/signup", authController.signUp);
// // router.post("/login", authController.login);
// // router.post("/forgot-password", authController.forgotPassword);
// // router.post("/reset-password", authController.resetPassword);

// // // Google Authentication Route
// // router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// // // Google OAuth Callback
// // router.get('/auth/google/callback', passport.authenticate('google', {
// //   successRedirect: 'http://localhost:3000/dashboard',
// //   failureRedirect: 'http://localhost:3000/login',
// // }));

// // // Apple Authentication Route
// // router.get('/auth/github', passport.authenticate('github',{scope:['user:email']}));

// // // Apple OAuth Callback
// // router.post('/auth/github/callback', passport.authenticate('github', {
// //   successRedirect: 'http://localhost:3000/dashboard',
// //   failureRedirect: 'http://localhost:3000/login',
// // }));

// // export default router;