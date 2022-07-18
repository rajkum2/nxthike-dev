import firebase from "firebase";
import "firebase/auth";
import "firebase/database";

var Config = {
  apiKey: "AIzaSyAJn9H2fPPAnVgW1j6ie9JKUq1sUiOV1aY",
  authDomain: "spirit-5c98d.firebaseapp.com",
  projectId: "spirit-5c98d",
  storageBucket: "spirit-5c98d.appspot.com",
  messagingSenderId: "369865356990",
  appId: "1:369865356990:web:f50fe48b8f3b052c98d0ef",
};

firebase.initializeApp(Config);

export default firebase;

export const database = firebase.database();
