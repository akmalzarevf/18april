document.addEventListener('DOMContentLoaded', () => {

    /* --- 1. Typewriter Effect --- */
    const nameStr = "Zahra Reva Fauzia";
    const nameEl = document.getElementById("name-typing");
    let charIndex = 0;

    function typeWriter() {
        if (charIndex < nameStr.length) {
            nameEl.textContent += nameStr.charAt(charIndex);
            charIndex++;
            setTimeout(typeWriter, 150); // Speed of typing
        }
    }
    
    // Start typing after a short delay
    setTimeout(typeWriter, 1000);


    /* --- 2. Blow out the Candle (AudioContext) --- */
    const micBtn = document.getElementById('mic-btn');
    const micStatus = document.getElementById('mic-status');
    const flame = document.getElementById('flame');
    let audioContext;
    let microphone;
    let analyser;

    // We will consider it a "blow" if the volume stays high for a short duration
    let blowCounter = 0;
    const BLOW_THRESHOLD = 30; // Adjust volume threshold (0-255)
    const REQUIRED_BLOWS = 15; // How long it needs to stay above threshold

    micBtn.addEventListener('click', async () => {
        try {
            // Request Mic access
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
            micStatus.textContent = "Mic aktif! Coba tiup lilinnya dari dekat!";
            micStatus.style.color = "#38a169"; // green
            micBtn.style.display = 'none';

            // Setup AudioContext
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
            microphone = audioContext.createMediaStreamSource(stream);
            analyser = audioContext.createAnalyser();
            
            analyser.fftSize = 256;
            const bufferLength = analyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);
            
            microphone.connect(analyser);

            // Function to monitor audio level
            function checkAudioLevel() {
                analyser.getByteFrequencyData(dataArray);
                
                // Calculate average volume
                let sum = 0;
                for(let i = 0; i < bufferLength; i++) {
                    sum += dataArray[i];
                }
                let average = sum / bufferLength;

                if (average > BLOW_THRESHOLD) {
                    blowCounter++;
                } else {
                    blowCounter = Math.max(0, blowCounter - 1); // gradually decrease if they stop
                }

                // If blown hard enough
                if (blowCounter > REQUIRED_BLOWS) {
                    blowOutCandle();
                    // Stop listening
                    stream.getTracks().forEach(track => track.stop());
                    audioContext.close();
                    return; // exit loop
                }

                requestAnimationFrame(checkAudioLevel);
            }

            checkAudioLevel();

        } catch (err) {
            console.error("Microphone access denied or error: ", err);
            micStatus.textContent = "Gagal mengakses mic. Pastikan izin diberikan! (Atau gunakan http / localhost)";
        }
    });

    function blowOutCandle() {
        flame.classList.add('out');
        micStatus.textContent = "Yay! Happy Birthday! 🎉🎉";
        
        // Simple confetti from canvas-confetti
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
        });

        // Automatically scroll to gift after 2 seconds
        setTimeout(() => {
            document.getElementById('message-section').scrollIntoView({ behavior: 'smooth' });
        }, 2500);
    }


    /* --- 3. Surprise Gift Box --- */
    const giftContainer = document.getElementById('gift-box');
    const secretMessage = document.getElementById('secret-message');

    giftContainer.addEventListener('click', () => {
        // Play opening animation
        giftContainer.classList.add('opened');
        
        // Fire grand confetti effect
        var duration = 3 * 1000;
        var animationEnd = Date.now() + duration;
        var defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

        function randomInRange(min, max) {
          return Math.random() * (max - min) + min;
        }

        var interval = setInterval(function() {
            var timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            var particleCount = 50 * (timeLeft / duration);
            confetti(Object.assign({}, defaults, { particleCount,
                origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
            }));
            confetti(Object.assign({}, defaults, { particleCount,
                origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
            }));
        }, 250);

        // Show the secret message after a short delay
        setTimeout(() => {
            secretMessage.classList.remove('hidden');
        }, 800);
    });

});
