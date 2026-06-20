export const MUSIC_TRACKS = {
  exploration: {
    name: "Aventura",
    mood: "descoberta, exploracao e misterio",
    tempo: 86,
    wave: "triangle",
    bassWave: "sine",
    notes: [196, 246.94, 293.66, 329.63, 246.94, 220],
    bass: [98, 123.47, 146.83, 110],
    percussion: false,
    ambience: "mystery"
  },
  city: {
    name: "Cidade",
    mood: "seguranca, conforto e vida cotidiana",
    tempo: 74,
    wave: "sine",
    bassWave: "triangle",
    notes: [220, 261.63, 329.63, 392, 329.63, 293.66],
    bass: [110, 130.81, 164.81, 146.83],
    percussion: false,
    ambience: "warm"
  },
  tavern: {
    name: "Taverna",
    mood: "alaude, flautas e ambiente acolhedor",
    tempo: 118,
    wave: "square",
    bassWave: "triangle",
    notes: [293.66, 329.63, 369.99, 440, 369.99, 329.63, 293.66, 246.94],
    bass: [146.83, 164.81, 196, 146.83],
    percussion: true,
    ambience: "tavern"
  },
  forest: {
    name: "Floresta",
    mood: "passaros, vento e natureza misteriosa",
    tempo: 68,
    wave: "sine",
    bassWave: "sine",
    notes: [174.61, 220, 261.63, 246.94, 196, 174.61],
    bass: [87.31, 98, 130.81, 98],
    percussion: false,
    ambience: "forest"
  },
  cave: {
    name: "Caverna",
    mood: "perigo, exploracao e tensao",
    tempo: 58,
    wave: "sawtooth",
    bassWave: "sine",
    notes: [110, 123.47, 146.83, 130.81, 98, 92.5],
    bass: [55, 61.74, 73.42, 49],
    percussion: false,
    ambience: "dark"
  },
  battle: {
    name: "Batalha",
    mood: "acao, urgencia e adrenalina",
    tempo: 142,
    wave: "sawtooth",
    bassWave: "square",
    notes: [196, 220, 246.94, 293.66, 246.94, 220, 196, 164.81],
    bass: [98, 98, 123.47, 82.41],
    percussion: true,
    ambience: "danger"
  },
  boost: {
    name: "Boost",
    mood: "chefe agressivo e memoravel",
    tempo: 154,
    wave: "sawtooth",
    bassWave: "square",
    notes: [164.81, 196, 246.94, 261.63, 311.13, 246.94, 196, 164.81],
    bass: [82.41, 98, 82.41, 73.42],
    percussion: true,
    ambience: "boss"
  },
  azgorath: {
    name: "Azgorath",
    mood: "ameaca final, demonios e destino",
    tempo: 132,
    wave: "sawtooth",
    bassWave: "sawtooth",
    notes: [98, 116.54, 130.81, 155.56, 146.83, 116.54],
    bass: [49, 58.27, 65.41, 46.25],
    percussion: true,
    ambience: "demon"
  },
  mystery: {
    name: "Misterio",
    mood: "pistas, sonhos e objetos reagindo",
    tempo: 52,
    wave: "sine",
    bassWave: "triangle",
    notes: [146.83, 174.61, 220, 207.65, 174.61],
    bass: [73.42, 87.31, 69.3],
    percussion: false,
    ambience: "mystery"
  },
  revelation: {
    name: "Revelacao",
    mood: "virada narrativa e maravilhamento",
    tempo: 64,
    wave: "triangle",
    bassWave: "sine",
    notes: [196, 261.63, 329.63, 392, 440, 392, 329.63],
    bass: [98, 130.81, 164.81, 196],
    percussion: false,
    ambience: "light"
  }
};

const CUE_PROFILES = {
  victory: { notes: [392, 493.88, 587.33, 783.99], wave: "triangle", gain: 0.075, step: 0.16 },
  defeat: { notes: [220, 196, 164.81, 146.83, 110], wave: "sine", gain: 0.06, step: 0.42 },
  mystery: { notes: [146.83, 220, 207.65, 174.61], wave: "sine", gain: 0.045, step: 0.32 },
  revelation: { notes: [196, 261.63, 329.63, 493.88, 659.25], wave: "triangle", gain: 0.06, step: 0.24 }
};

export class DynamicMusicDirector {
  constructor(gameState) {
    this.gameState = gameState;
    this.context = null;
    this.masterGain = null;
    this.trackGain = null;
    this.currentTrack = null;
    this.step = 0;
    this.loopTimer = 0;
    this.lastContextKey = "";
    this.intensity = 0;
    this.enabled = true;
    this.resumeHandler = () => this.resume();
    document.addEventListener("pointerdown", this.resumeHandler, { once: true });
    document.addEventListener("keydown", this.resumeHandler, { once: true });
  }

  resume() {
    const context = this.ensureContext();
    context?.resume?.();
  }

  update(context) {
    if (!this.enabled) return;
    const trackId = this.pickTrack(context);
    const intensity = context.threat?.intensity ?? 0;
    this.requestTrack(trackId, intensity);
  }

  requestTrack(trackId, intensity = 0) {
    if (!MUSIC_TRACKS[trackId]) return;
    this.intensity = Phaser.Math.Clamp(intensity, 0, 1);
    if (this.currentTrack === trackId) return;
    this.currentTrack = trackId;
    this.step = 0;
    this.lastContextKey = `${MUSIC_TRACKS[trackId].name}: ${MUSIC_TRACKS[trackId].mood}`;
    this.startLoop();
  }

  playCue(cueId, nextTrack = "exploration") {
    const cue = CUE_PROFILES[cueId];
    if (!cue) return;
    const context = this.ensureContext();
    if (!context) return;
    this.stopLoop();
    const start = context.currentTime + 0.02;
    cue.notes.forEach((frequency, index) => {
      this.playTone(frequency, start + index * cue.step, cue.step * 1.5, cue.wave, cue.gain);
    });
    window.setTimeout(() => this.requestTrack(nextTrack, 0), Math.ceil((cue.notes.length * cue.step + 0.5) * 1000));
  }

  playStoryCue(kind) {
    this.playCue(kind === "revelation" ? "revelation" : "mystery", kind === "revelation" ? "revelation" : "mystery");
  }

  playDefeat() {
    this.playCue("defeat", "exploration");
  }

  getCurrentLabel() {
    return this.lastContextKey;
  }

  pickTrack(context) {
    const threat = context.threat;
    if (threat?.bossType === "boost") return "boost";
    if (threat?.bossType === "azgorath") return "azgorath";
    if (threat) return "battle";
    if (context.storyMood) return context.storyMood;
    if (context.location === "tavern") return "tavern";
    if (context.regionId === "valoria" || context.regionId === "academy") return "city";
    if (context.regionId === "forest") return "forest";
    if (context.regionId === "underworld-gate" || context.regionId === "drakhar-ruins") return "cave";
    return "exploration";
  }

  startLoop() {
    this.stopLoop();
    this.scheduleLoop();
    this.loopTimer = window.setInterval(() => this.scheduleLoop(), 240);
  }

  stopLoop() {
    if (this.loopTimer) window.clearInterval(this.loopTimer);
    this.loopTimer = 0;
  }

  scheduleLoop() {
    const profile = MUSIC_TRACKS[this.currentTrack];
    const context = this.ensureContext();
    if (!profile || !context || context.state === "suspended") return;
    const beat = 60 / profile.tempo;
    const start = context.currentTime + 0.03;
    const note = profile.notes[this.step % profile.notes.length];
    const bass = profile.bass[this.step % profile.bass.length];
    const dynamicGain = 0.026 + this.intensity * 0.038;
    this.playTone(note, start, beat * 0.72, profile.wave, dynamicGain);
    if (this.step % 2 === 0) this.playTone(bass, start, beat * 1.4, profile.bassWave, 0.018 + this.intensity * 0.025);
    if (profile.percussion) this.playNoise(start, 0.045 + this.intensity * 0.055);
    this.playAmbience(profile.ambience, start);
    this.step += 1;
  }

  playTone(frequency, start, duration, type, gainValue) {
    const context = this.ensureContext();
    if (!context) return;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, start);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(gainValue, start + 0.025);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    oscillator.connect(gain).connect(this.trackGain);
    oscillator.start(start);
    oscillator.stop(start + duration + 0.04);
  }

  playNoise(start, gainValue) {
    const context = this.ensureContext();
    if (!context) return;
    const buffer = context.createBuffer(1, Math.max(1, Math.floor(context.sampleRate * 0.05)), context.sampleRate);
    const data = buffer.getChannelData(0);
    for (let index = 0; index < data.length; index += 1) data[index] = (Math.random() * 2 - 1) * (1 - index / data.length);
    const source = context.createBufferSource();
    const gain = context.createGain();
    source.buffer = buffer;
    gain.gain.setValueAtTime(gainValue, start);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.08);
    source.connect(gain).connect(this.trackGain);
    source.start(start);
  }

  playAmbience(kind, start) {
    const context = this.ensureContext();
    if (!context || this.step % 4 !== 0) return;
    const ambience = {
      forest: [880, 1174.66],
      warm: [523.25, 659.25],
      tavern: [783.99, 987.77],
      dark: [61.74, 73.42],
      danger: [196, 261.63],
      boss: [82.41, 164.81],
      demon: [49, 98],
      light: [659.25, 783.99],
      mystery: [220, 311.13]
    }[kind] ?? [220, 293.66];
    ambience.forEach((frequency, index) => {
      this.playTone(frequency, start + index * 0.09, 0.45, "sine", 0.008 + this.intensity * 0.006);
    });
  }

  ensureContext() {
    if (this.context) return this.context;
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return null;
      this.context = new AudioContextClass();
      this.masterGain = this.context.createGain();
      this.trackGain = this.context.createGain();
      this.masterGain.gain.value = 0.42;
      this.trackGain.gain.value = 1;
      this.trackGain.connect(this.masterGain).connect(this.context.destination);
      return this.context;
    } catch {
      return null;
    }
  }
}
