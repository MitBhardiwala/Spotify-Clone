let currentSong = new Audio();
let play = document.querySelector(".songbuttons").children[1];
let songs;
let volumeValue = 75;
let currFolder;
let prevVol;

async function getSongs(folder) {
    currFolder = folder;
    let a = await fetch(`/${folder}/`)
    let response = await a.text();
    // console.log(response);

    let parser = new DOMParser();
    let doc = parser.parseFromString(response, 'text/html');

    let as = doc.getElementsByTagName("a");
    // console.log(as);

    songs = [];

    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            // console.log(element);
            songs.push(element.href.split(`/${folder}/`)[1])
        }
    }

    console.log(songs)

    let songUL = document.querySelector(".songlist").getElementsByTagName("ul")[0];
    songUL.innerHTML = "";

    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML +
            `<ul>
                <li>
                    <img class="invert" src="img/music.svg" alt="">
                    <div class="info">
                        <div>${song.replaceAll("%20", " ")}</div>
                        
                    </div>

                    <div class="playnow">
                        <span>Play Now </span>
                        <img class="invert" src="img/play.svg" alt="">
                    </div>

                </li>
            </ul>`
        // console.log(song);
    }

    // // //attach event listener to each song

    Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e => {

        e.addEventListener("click", element => {
            console.log(e.querySelector(".info").firstElementChild.innerHTML);
            playMusic(e.querySelector(".info").firstElementChild.innerHTML);
        })

    })


}


async function displayAllAlbums() {
    let a = await fetch(`http://127.0.0.1:5500/songs/`)
    let response = await a.text();
    let cardContainer = document.querySelector(".cardContainer");
    // console.log(response);
    let div = document.createElement("div");
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a");
    let array = Array.from(anchors);

    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        if (e.href.includes("/songs/")) {
            let folder = e.href.split("/")[4];
            let a = await fetch(`http://127.0.0.1:5500/songs/${folder}/info.json`)
            let response = await a.json();
            // console.log(response)
            cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder="${folder}" class="card">

            <div class="play">
                <img src="img/green-play-button.svg" height="40px">

            </div>
            <img src="songs/${folder}/cover.jpg" alt="">
            <h2>${response.title}</h2>
            <p>${response.description}</p>

        </div>`

        }

    }

    //load the playlist when card is clicked
    Array.from(document.getElementsByClassName("card")).forEach((e) => {
        e.addEventListener("click", async (item) => {

            await getSongs(`songs/${item.currentTarget.dataset.folder}`)
            playMusic(songs[0])
        })
    })

}
const playMusic = (track) => {
    // <div>${song.split("songs/")[1].replaceAll("%20", "")}</div>

    // currentAudio = new Audio("/songs/" + track);

    currentSong.src = `/${currFolder}/` + track;


    document.querySelector(".songinfo").innerHTML = decodeURI(track);
    document.querySelector(".songtime").innerHTML = "00:00/00:00";
    play.src = "img/pause.svg";
    currentSong.play();
}

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}






async function main() {



    await getSongs("songs/cs");
    // console.log(songs);

    // console.log(songs);


    displayAllAlbums();




    // //play first song
    // // let firstsong =document.querySelector(".info").getElementsByTagName("div")[0].innerHTML;
    // // console.log(firstsong);
    // // playMusic(firstsong);

    // //attach an event listener to play,next and previous

    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "img/pause.svg";
        }
        else {
            currentSong.pause();
            play.src = "img/play.svg";
        }
    })

    // // //listen for time update event
    currentSong.addEventListener("timeupdate", async () => {
        // console.log(currentSong.currentTime, currentSong.duration);
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)}/${secondsToMinutesSeconds(currentSong.duration)}`

        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";

        
        if (currentSong.currentTime == currentSong.duration) {
            let index = songs.indexOf(currentSong.src.split(`/${currFolder}/`)[1]);
            console.log(index);
            if (index + 1 < songs.length)
                playMusic(songs[index + 1])
        }

    })

    // // //seekbar circle event listner

    document.querySelector(".seekbar").addEventListener("click", (e) => {

        const rect = e.target.getBoundingClientRect();
        document.querySelector(".circle").style.left = (e.offsetX / rect.width) * 100 + "%";
        currentSong.currentTime = (e.offsetX / rect.width) * currentSong.duration;
    })

    // // //add event listener to hamburger

    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    })

    // // add eventlistner to close button

    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%";
    })

    //add event listeners on next and previous
    previous.addEventListener("click", () => {
        console.log("next clicked");
        let index = songs.indexOf(currentSong.src.split(`/${currFolder}/`)[1]);
        console.log(index);
        if (index > 0)
            playMusic(songs[index - 1])
    })

    next.addEventListener("click", () => {
        console.log("next clicked");
        let index = songs.indexOf(currentSong.src.split(`/${currFolder}/`)[1]);
        console.log(index);
        if (index + 1 < songs.length)
            playMusic(songs[index + 1])

    })

    // // //volume adjust
    document.querySelector(".range").firstElementChild.addEventListener("input", (e) => {
        // console.log(e.target.value);
        currentSong.volume = (e.target.value / 100);
    })

    //mute on clicking volume icon
    document.querySelector(".volume").getElementsByTagName("img")[0].addEventListener("click", (e) => {


        if (e.target.src.includes("volume.svg")) {
            e.target.src = e.target.src.replace("img/volume.svg", "img/mute.svg");
            prevVol = currentSong.volume;
            currentSong.volume = 0;
            document.querySelector(".range").firstElementChild.value = 0;
        }
        else {
            e.target.src = e.target.src.replace("img/mute.svg", "img/volume.svg");
            currentSong.volume = prevVol;
            document.querySelector(".range").firstElementChild.value = (currentSong.volume) * 100;
        }




    })

    //playing next songs if it has ended
   


}

main()

