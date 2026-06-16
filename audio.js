class SoundManager {
  constructor() {
    this.context = null;
    this.masterGain = null;
    this.muted = false;
    this.musicTimer = 0;
    this.musicStep = 0;
    this.melody = [55, 60, 64, 62, 57, 60, 67, 64, 55, 60, 64, 69, 67, 64, 62, 57];
  }

  unlock() {
    if (!this.context) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;

      this.context = new AudioContextClass();
      this.masterGain = this.context.createGain();
      this.masterGain.gain.value = this.muted ? 0 : 0.16;
      this.masterGain.connect(this.context.destination);
    }

    if (this.context.state === "suspended") {
      this.context.resume();
    }
  }

  update(deltaSeconds, intensity, isPlaying) {
    if (!this.context || !isPlaying || this.muted) {
      this.musicTimer = 0;
      return;
    }

    this.musicTimer -= deltaSeconds;
    if (this.musicTimer > 0) return;

    const interval = 0.34 - intensity * 0.07;
    const note = this.melody[this.musicStep % this.melody.length];
    this.playTone(this.midiToFrequency(note), interval * 0.78, 0.07, "triangle");

    if (this.musicStep % 4 === 0) {
      this.playTone(
        this.midiToFrequency(note - 24),
        interval * 2.7,
        0.045,
        "sine"
      );
    }

    this.musicStep += 1;
    this.musicTimer = interval;
  }

  toggleMute() {
    this.muted = !this.muted;

    if (this.masterGain && this.context) {
      this.masterGain.gain.setTargetAtTime(
        this.muted ? 0 : 0.16,
        this.context.currentTime,
        0.02
      );
    }

    return this.muted;
  }

  playEffect(name) {
    if (this.muted) return;
    this.unlock();
    if (!this.context) return;

    if (name === "menu") {
      this.playTone(440, 0.07, 0.05, "sine");
    } else if (name === "collect") {
      this.playTone(659, 0.09, 0.07, "sine");
      this.playTone(880, 0.12, 0.06, "sine", 0.07);
    } else if (name === "power") {
      this.playTone(392, 0.16, 0.07, "triangle");
      this.playTone(523, 0.18, 0.07, "triangle", 0.1);
      this.playTone(659, 0.24, 0.07, "triangle", 0.2);
    } else if (name === "jaguncoHit") {
      this.playTone(180, 0.14, 0.1, "square", 0, 95);
      this.playTone(260, 0.08, 0.055, "triangle", 0.03, 150);
    } else if (name === "hit") {
      this.playTone(125, 0.2, 0.11, "sawtooth", 0, 58);
    } else if (name === "phase") {
      this.playTone(262, 0.13, 0.055, "triangle");
      this.playTone(330, 0.13, 0.055, "triangle", 0.11);
      this.playTone(392, 0.2, 0.06, "triangle", 0.22);
    }
  }

  playTone(frequency, duration, volume, waveType, delay = 0, endFrequency = null) {
    if (!this.context || !this.masterGain || this.muted) return;

    const startTime = this.context.currentTime + delay;
    const oscillator = this.context.createOscillator();
    const gain = this.context.createGain();

    oscillator.type = waveType;
    oscillator.frequency.setValueAtTime(frequency, startTime);
    if (endFrequency) {
      oscillator.frequency.exponentialRampToValueAtTime(
        endFrequency,
        startTime + duration
      );
    }

    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.exponentialRampToValueAtTime(volume, startTime + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    oscillator.connect(gain);
    gain.connect(this.masterGain);
    oscillator.start(startTime);
    oscillator.stop(startTime + duration + 0.02);
  }

  midiToFrequency(note) {
    return 440 * Math.pow(2, (note - 69) / 12);
  }
}
