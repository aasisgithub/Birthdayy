const startMicButton = document.getElementById('startMic');
const candles = document.querySelectorAll('.candle');
const balloonContainer = document.getElementById('balloon-container');
const message = document.getElementById('message');
const birthdayMusic = document.getElementById('birthdayMusic');
let isMicActive = false;
let audioContext, analyser, microphone;
let blowDetected = false;

// Ensure music plays on page load/refresh
window.addEventListener('load', () => {
    birthdayMusic.currentTime = 0; // Reset to start
    birthdayMusic.play().catch(err => {
        console.error('Music playback error:', err);
        // Fallback: attempt to play after user interaction
        document.addEventListener('click', () => {
            birthdayMusic.play().catch(e => console.error('Retry playback error:', e));
        }, { once: true });
    });
});

startMicButton.addEventListener('click', async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioContext.createAnalyser();
        microphone = audioContext.createMediaStreamSource(stream);
        microphone.connect(analyser);
        analyser.fftSize = 256;
        startMicButton.classList.add('hidden');
        isMicActive = true;
        checkMicInput();
    } catch (err) {
        console.error('Microphone access denied:', err);
        alert('Please allow microphone access to blow out the candles!');
    }
});

function checkMicInput() {
    if (!isMicActive) return;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyser.getByteFrequencyData(dataArray);
    const average = dataArray.reduce((sum, val) => sum + val, 0) / bufferLength;

    if (average > 100 && !blowDetected) {
        blowDetected = true;
        setTimeout(() => {
            blowOutCandles();
        }, 500);
    } else if (isMicActive) {
        requestAnimationFrame(checkMicInput);
    }
}

function blowOutCandles() {
    candles.forEach(candle => {
        const flame = candle.querySelector('.flame');
        flame.classList.add('extinguished');
    });
    setTimeout(showBalloons, 1000);
}

function showBalloons() {
    createBalloons(15);
    const balloons = document.querySelectorAll('.balloon');
    balloons.forEach(balloon => {
        balloon.classList.add('visible');
    });
    setTimeout(() => {
        balloons.forEach((balloon, index) => {
            setTimeout(() => {
                balloon.classList.add('popped');
                if (index === balloons.length - 1) {
                    setTimeout(() => {
                        message.style.display = 'block';
                    }, 500);
                }
            }, 2000 + index * 200);
        });
    }, 100);
}

function createBalloons(num) {
    const colors = [
        'rgba(255, 0, 0, 0.9)', // Red
        'rgba(0, 255, 0, 0.9)', // Green
        'rgba(0, 0, 255, 0.9)', // Blue
        'rgba(255, 255, 0, 0.9)', // Yellow
        'rgba(255, 105, 180, 0.9)', // Pink
        'rgba(128, 0, 128, 0.9)', // Purple
        'rgba(0, 255, 255, 0.9)', // Cyan
    ];
    const cakeWidth = Math.min(20, window.innerWidth * 4.3);
    const cakeCenterRight = (window.innerWidth - cakeWidth) / 2 + cakeWidth;
    const spread = window.innerWidth * 0.6;
    for (let i = 0; i < num; i++) {
        const balloon = document.createElement('div');
        balloon.className = 'balloon';
        const offset = (Math.random() - 0.5) * spread;
        const leftPos = cakeCenterRight + offset;
        const color = colors[Math.floor(Math.random() * colors.length)];
        const dur = Math.random() * 2 + 6;
        const xSpread = (Math.random() - 0.5) * window.innerWidth * 0.4;
        balloon.style.cssText = `
            background-color: ${color};
            color: ${color};
            box-shadow: inset -1.75vw -0.75vw 2.5vw rgba(0, 0, 0, 0.3), 0 0 6.25vw rgba(255, 255, 255, 1);
            left: ${leftPos}px;
            animation-duration: ${dur}s;
            --spread: ${xSpread}px;
        `;
        balloonContainer.appendChild(balloon);
    }
}