// ==========================
// 3D CARD EFFECT
// ==========================

const card = document.querySelector(".card");


document.addEventListener("mousemove", (e)=>{

    let x = (window.innerWidth / 2 - e.clientX) / 30;
    let y = (window.innerHeight / 2 - e.clientY) / 30;


    card.style.transform =
    `rotateY(${x}deg) rotateX(${y}deg)`;

});


document.addEventListener("mouseleave", ()=>{

    card.style.transform =
    "rotateY(0deg) rotateX(0deg)";

});



// ==========================
// MUSIC PLAYER
// ==========================

const musicButton =
document.getElementById("music");


let playing = false;


// энд өөрийн music link хийнэ
const audio = new Audio(
"assets/music.mp3"
);


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

        playing=false;

    }

};



// ==========================
// TEMP VIEW COUNTER
// ==========================


let views =
localStorage.getItem("views");


if(!views){

    views = 1;

}

else{

    views++;

}


localStorage.setItem(
"views",
views
);


document.getElementById("views")
.innerHTML = views;

// CUSTOM CURSOR

const cursor = document.querySelector(".cursor");


document.addEventListener("mousemove",(e)=>{


    cursor.style.left =
    e.clientX + "px";


    cursor.style.top =
    e.clientY + "px";


});

// ==========================
// CURSOR TRAIL
// ==========================


const trail =
document.querySelector(".cursor-trail");


document.addEventListener(
"mousemove",
(e)=>{


    setTimeout(()=>{


        trail.style.left =
        e.clientX + "px";


        trail.style.top =
        e.clientY + "px";


    },80);


});

// ==========================
// NEON CURSOR TRAIL PARTICLES
// ==========================


document.addEventListener(
"mousemove",
(e)=>{


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

const isDesktop =
window.matchMedia("(hover: hover) and (pointer: fine)").matches;

if (isDesktop) {

    // CUSTOM CURSOR
    const cursor = document.querySelector(".cursor");

    document.addEventListener("mousemove", (e) => {
        cursor.style.left = e.clientX + "px";
        cursor.style.top = e.clientY + "px";
    });

    // CURSOR TRAIL
    const trail = document.querySelector(".cursor-trail");

    document.addEventListener("mousemove", (e) => {
        setTimeout(() => {
            trail.style.left = e.clientX + "px";
            trail.style.top = e.clientY + "px";
        }, 80);
    });

    // PARTICLES
    document.addEventListener("mousemove", (e) => {

        const particle = document.createElement("div");
        particle.className = "trail-particle";

        document.body.appendChild(particle);

        particle.style.left = e.clientX + "px";
        particle.style.top = e.clientY + "px";

        setTimeout(() => {
            particle.remove();
        }, 800);

    });

}