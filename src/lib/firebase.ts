// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from "firebase/storage"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAAnULJPRe3Vm_TzDUTtmUyJ-xqIzcsTj0",
  authDomain: "reposphere-5561f.firebaseapp.com",
  projectId: "reposphere-5561f",
  storageBucket: "reposphere-5561f.firebasestorage.app",
  messagingSenderId: "432031651098",
  appId: "1:432031651098:web:74888684f75fd7ec82c8a3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const storage = getStorage(app)

// function that allows to upload our files

export async function uploadFile(file: File, setProgress?: (progress: number) => void) {
  return new Promise((resolve, reject) => {
    try{
      const storageRef = ref(storage, file.name)
      const uploadTask = uploadBytesResumable(storageRef, file)

      uploadTask.on('state_changed', snapshot => {
        const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100)
        if (setProgress) setProgress(progress);

        switch(snapshot.state) {
          case 'paused':
            console.log("Upload is paused"); break;
          case 'running':
            console.log('Upload is running'); break;
        }
      }, error => {
        reject(error)
      }, () => {
        getDownloadURL(uploadTask.snapshot.ref).then(downloadUrl => {
          resolve(downloadUrl)
        })
      })
    } catch (error) {
      console.log(error);
    }
  })
}