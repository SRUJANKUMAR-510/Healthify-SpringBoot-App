import axios from "axios";
import { initializeApp } from "firebase/app";
import {
    createUserWithEmailAndPassword,
    getAuth,
    signInWithEmailAndPassword,
    sendEmailVerification,
} from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyAkcn6emGhBWfmXIkSUCJXxcDD8xoFBuoc",
    authDomain: "heathify-29846.firebaseapp.com",
    projectId: "heathify-29846",
    storageBucket: "heathify-29846.appspot.com",
    messagingSenderId: "727135022402",
    appId: "1:727135022402:web:9d5945b232dafe397f6cdb"
  };

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export function addNewUser(email, password, callback) {
    createUserWithEmailAndPassword(auth, email, password)
        .then((user) => {
            sendEmailVerification(auth.currentUser)
                .then(() => {
                    callback(null, user.user.uid);
                })
                .catch((error) => {
                    callback(error, null);
                });
        })
        .catch((error) => {
            callback(error, null);
        });
}

export function signIn(email, password, callback, next) {
    signInWithEmailAndPassword(auth, email, password)
        .then((user) => {
            axios.get(`${import.meta.env.VITE_HOST}/user/` + user.user.uid)
                .then((_) => {
                    if (!user.user.emailVerified) {
                        callback({ message: "Please verify your email" });
                        return;
                    }
                    storeInCache(user.user.uid, next);
                    callback(null);
                })
                .catch((_) => {
                    storeInCache(user.user.uid, next);
                    callback(null);
                });
        })
        .catch((_) => {
            callback({ message: "Invalid credentials" });
        });
}

export function signOut() {
    removeFromCache();
    auth.signOut();
}

export function getCurrentUser() {
    return auth.currentUser;
}

export function isUserSignedIn() {
    return auth.currentUser !== null;
}

function storeInCache(userId, next) {
    localStorage.setItem("user", userId);
    axios
        .get(`${import.meta.env.VITE_HOST}/user/` + userId)
        .then((_) => {
            localStorage.setItem("type", "user");
            next();
        })
        .catch((_) => {
            localStorage.setItem("type", "doctor");
            next();
        });
}

function removeFromCache() {
    localStorage.removeItem("user");
    localStorage.removeItem("type");
}

export function getUserId() {
    return localStorage.getItem("user");
}

export function getUserType() {
    return localStorage.getItem("type");
}
