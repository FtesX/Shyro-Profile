// ==========================
// FIREBASE SETUP
// ==========================

import { initializeApp }
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
getFirestore,
doc,
getDoc,
setDoc,
updateDoc,
increment
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";



const firebaseConfig = {

apiKey: "AIzaSyA29_4UB7n8KxVisZ0o4PPQY4EH6E0gWE8",

authDomain: "shyro-profile.firebaseapp.com",

projectId: "shyro-profile",

storageBucket: "shyro-profile.firebasestorage.app",

messagingSenderId: "810707781934",

appId: "1:810707781934:web:5578352d41adda6c4a52bf"

};



const app = initializeApp(firebaseConfig);

const db = getFirestore(app);



// ==========================
// VARIABLES
// ==========================


const card =
document.querySelector(".card");


const isDesktop =
window.matchMedia(
"(hover: hover) and (pointer: fine)"
).matches;



const isMobile =
window.matchMedia(
"(pointer: coarse)"
).matches;



// ==========================
// PC 3D MOUSE CARD EFFECT
// ==========================


if(isDesktop){


document.addEventListener(
"mousemove",
(e)=>{


let rotateY =
(window.innerWidth / 2 - e.clientX) / 30;


let rotateX =
(window.innerHeight / 2 - e.clientY) / 30;



card.style.transform =

`
rotateY(${rotateY}deg)
rotateX(${rotateX}deg)
`;



});



document.addEventListener(
"mouseleave",
()=>{


card.style.transform =
"rotateY(0deg) rotateX(0deg)";


});


}




// ==========================
// MUSIC PLAYER
// ==========================


const musicButton =
document.getElementById("music");


let playing = false;


const audio =
new Audio("assets/music.mp3");



if(musicButton){


musicButton.onclick = ()=>{


if(!playing){


audio.play();


musicButton.innerHTML =
"⏸ Pause Music";


playing = true;


}

else{


audio.pause();


musicButton.innerHTML =
"🎵 Play Music";


playing = false;


}


};


}



// ==========================
// FIREBASE VIEW COUNTER
// ==========================


const viewRef =
doc(
db,
"website",
"views"
);



async function addView(){


try{


const snap =
await getDoc(viewRef);



if(snap.exists()){


await updateDoc(
viewRef,
{

count:
increment(1)

}
);


}

else{


await setDoc(
viewRef,
{

count:1

}
);


}



const updated =
await getDoc(viewRef);



const viewElement =
document.getElementById("views");



if(viewElement){


viewElement.innerHTML =
updated.data().count;


}



}

catch(error){


console.log(
"Firebase View Error:",
error
);


}


}



addView();




// ==========================
// DESKTOP CUSTOM CURSOR
// ==========================


if(isDesktop){


const cursor =
document.querySelector(".cursor");


const trail =
document.querySelector(".cursor-trail");



document.addEventListener(
"mousemove",
(e)=>{


if(cursor){


cursor.style.left =
e.clientX + "px";


cursor.style.top =
e.clientY + "px";


}




if(trail){


setTimeout(()=>{


trail.style.left =
e.clientX + "px";


trail.style.top =
e.clientY + "px";


},80);


}




const particle =
document.createElement("div");


particle.className =
"trail-particle";



document.body.appendChild(
particle
);



particle.style.left =
e.clientX + "px";


particle.style.top =
e.clientY + "px";



setTimeout(()=>{


particle.remove();


},800);



});


}





// ==========================
// MOBILE GYROSCOPE
// ==========================


if(isMobile){


window.addEventListener(
"deviceorientation",
(e)=>{


let rotateY =
e.gamma / 5;


let rotateX =
e.beta / 10;



card.style.transform =

`
rotateY(${rotateY}deg)
rotateX(${rotateX}deg)
`;



});


}




// ==========================
// LOADER REMOVE
// ==========================


window.addEventListener(
"load",
()=>{


const loader =
document.querySelector(".loader");


if(loader){


setTimeout(()=>{


loader.remove();


},2000);


}


});


const line = document.querySelector(".signature-path");

if (line) {

    function replaySignature() {

        line.style.animation = "none";

        // Animation-ийг дахин эхлүүлэх
        void line.offsetWidth;

        line.style.animation =
            "drawSignature 5s linear forwards, signatureGlow 2s ease-in-out infinite alternate";
    }

    // Эхний удаа
    replaySignature();

    // 8 секунд тутам дахин бичигдэнэ
    setInterval(replaySignature, 8000);
}