import firebase from "firebase";
import "firebase/auth";
import "firebase/database";

var Config = {
  apiKey: "AIzaSyBdXTzir2U8fCQOpz_Ofa06hmzmwQa2XYw",
  authDomain: "nxthike-dev.firebaseapp.com",
  projectId: "nxthike-dev",
  storageBucket: "nxthike-dev.appspot.com",
  messagingSenderId: "832531981490",
  appId: "1:832531981490:web:597cefa5e116b3c42a95ab",
  measurementId: "G-447CR583VN"
};

firebase.initializeApp(Config);

export default firebase;

export const database = firebase.database();
