// tworzy dźwięk(C)
const audioCtx = new AudioContext();
function playSound(frequency, duration) {
    if (isMuted) return;
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    oscillator.frequency.value = frequency;
    gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
    oscillator.start();
    oscillator.stop(audioCtx.currentTime + duration);
}
