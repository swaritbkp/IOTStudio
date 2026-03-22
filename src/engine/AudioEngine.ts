class AudioEngineImpl {
  private ctx: AudioContext | null = null;
  private oscillator: OscillatorNode | null = null;
  private gain: GainNode | null = null;
  private initialized = false;

  init() {
    if (this.initialized) return;
    // Must be called after user gesture
    document.addEventListener(
      'click',
      () => {
        if (!this.ctx) {
          this.ctx = new AudioContext();
          this.gain = this.ctx.createGain();
          this.gain.gain.value = 0.1;
          this.gain.connect(this.ctx.destination);
        }
      },
      { once: true }
    );
    this.initialized = true;
  }

  play(frequency: number) {
    if (!this.ctx || !this.gain) return;
    this.stop();
    if (frequency <= 0) return;

    this.oscillator = this.ctx.createOscillator();
    this.oscillator.type = 'square';
    this.oscillator.frequency.value = frequency;
    this.oscillator.connect(this.gain);
    this.oscillator.start();
  }

  stop() {
    if (this.oscillator) {
      try {
        this.oscillator.stop();
        this.oscillator.disconnect();
      } catch {
        /* already stopped */
      }
      this.oscillator = null;
    }
  }
}

export const audioEngine = new AudioEngineImpl();
