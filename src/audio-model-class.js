class AudioModel {
  constructor(path) {
    // Necessary for new audio
    this.path = path;

    // Audio data
    this.fileName = this.path.split('/').pop();
    this.meta = null;
    this.buffer = null;
    this.subtitle = null;

    // Additional controlling during audio playing
    this.startTime = 0;
    this.timePosition = 0;
  }
}
export default AudioModel;
