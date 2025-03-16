import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyAMd194LB7WS-Sj-4hP6LLFojMQUSLREok",
    authDomain: "qlnhahang-fe30b.firebaseapp.com",
    databaseURL: "https://qlnhahang-fe30b-default-rtdb.firebaseio.com",
    projectId: "qlnhahang-fe30b",
    storageBucket: "qlnhahang-fe30b.firebasestorage.app",
    messagingSenderId: "895401315926",
    appId: "1:895401315926:web:dc3273d701b55aca3c35f7",
    measurementId: "G-WTFY0NYKGT"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export { database };
