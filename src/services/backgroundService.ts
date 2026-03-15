/**
 * BackgroundService
 * 
 * Uses a silent audio loop to keep the browser process active in the background
 * on mobile devices, which is critical for maintaining GPS tracking during 
 * phone calls or when the app is minimized.
 */

class BackgroundService {
  private audio: HTMLAudioElement | null = null;
  private isRunning: boolean = false;

  constructor() {
    // Create a 10-second silent base64 audio string (more robust than 1s)
    // This is a standard silent WAV header + silence
    const silentAudioBase64 = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=';
    
    if (typeof window !== 'undefined') {
      this.audio = new Audio(silentAudioBase64);
      this.audio.loop = true;
      
      // Handle potential interruptions (like phone calls ending)
      this.audio.onpause = () => {
        if (this.isRunning) {
          this.audio?.play().catch(e => console.error('Background audio resume failed:', e));
        }
      };
    }
  }

  public async start() {
    if (this.isRunning || !this.audio) return;

    try {
      await this.audio.play();
      this.isRunning = true;
      console.log('Background audio service started');
    } catch (err) {
      console.error('Failed to start background audio:', err);
      // Most browsers require a user gesture to start audio
    }
  }

  public stop() {
    if (!this.isRunning || !this.audio) return;
    
    this.audio.pause();
    this.audio.currentTime = 0;
    this.isRunning = false;
    console.log('Background audio service stopped');
  }
}

export const backgroundService = new BackgroundService();
