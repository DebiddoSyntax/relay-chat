// let isUnlocked = false;

// export const unlockAudio = async () => {
//     if (isUnlocked) return;

//     try {
//         const audio = new Audio("/ringtone.mp3");
//         await audio.play();
//         audio.pause();
//         audio.currentTime = 0;

//         isUnlocked = true;
//     } catch (error) {
//         console.log("Audio unlock failed", error);
//     }
// };
