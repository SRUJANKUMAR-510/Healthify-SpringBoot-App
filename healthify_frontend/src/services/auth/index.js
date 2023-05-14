import axios from "axios";
import { initializeApp } from "firebase/app";
import {
    createUserWithEmailAndPassword,
    getAuth,
    signInWithEmailAndPassword,
    sendEmailVerification,
} from "firebase/auth";

const firebaseConfig = {
    apiKey: "",
    authDomain: "",
    projectId: "",
    storageBucket: "",
    messagingSenderId: "",
    appId: "",
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
            axios.get("http://localhost:8082/user/" + user.user.uid)
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
        .get("http://localhost:8082/user/" + userId)
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
