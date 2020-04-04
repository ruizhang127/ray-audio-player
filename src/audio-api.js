import parseAudioMetadata from 'parse-audio-metadata';
import AudioModel from '@/audio-model-class';

const audioAPI = {};

/**
 * Internal methods
 */

// Init audio api context
const init = () => {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  audioAPI.context = new AudioContext();
  audioAPI.audios = {}; // Store audios have loaded
  audioAPI.played = null;
  audioAPI.timer = 0;
};

// Bind played listener
const bindPlayedListener = (handler, key) => {
  audioAPI.played = (event) => {
    audioAPI.source.removeEventListener('ended', audioAPI.played, false);
    clearInterval(audioAPI.timer);
    handler(event);
    audioAPI.stop(key);
  };
  audioAPI.source.addEventListener('ended', audioAPI.played, false);
};

// Calculate timePosition and send it
const getPlayedSeconds = (start, now, position) => {
  const played = now - start;
  return position + played;
};

const sendTimePosition = (monitor, key) => {
  const playing = audioAPI.audios[key];
  // The moment starts to play
  const newStart = audioAPI.context.currentTime;
  const playedSeconds = getPlayedSeconds(
    newStart,
    audioAPI.context.currentTime,
    playing.timePosition,
  );
  const integerSeconds = Math.round(playedSeconds);
  monitor(integerSeconds);

  setTimeout(() => {
    audioAPI.timer = setInterval(() => {
      // Send play time back to other module (Like: UI)
      monitor(Math.round(getPlayedSeconds(
        newStart,
        audioAPI.context.currentTime,
        playing.timePosition,
      )));
    }, 1000);
  }, integerSeconds - playedSeconds);
};

// Parse audio blob data
const parseAudioData = async (audioBlob) => {
  const metadata = await parseAudioMetadata(audioBlob);
  const arrayBuffer = await audioBlob.arrayBuffer();
  return {
    metadata,
    arrayBuffer,
  };
};

// Get audio buffer and metadata from url
const loadServerAudioData = (path) => new Promise((resolve) => {
  const request = new XMLHttpRequest();
  request.open('GET', path, true);
  request.responseType = 'blob';

  request.addEventListener('load', async (event) => {
    const audioBlob = (event && event.target && event.target.response)
      ? event.target.response
      : null;

    const am = new AudioModel(path);

    if (audioBlob) {
      const parsedData = await parseAudioData(audioBlob);
      const buffer = await audioAPI.context.decodeAudioData(parsedData.arrayBuffer);
      am.buffer = buffer;
      am.meta = parsedData.metadata;
    }

    audioAPI.audios[am.path] = am;
    resolve(am);
  }, false);

  request.send();
});

/**
 * Public interface
 */
const getAudioAPI = () => {
  if (!audioAPI.context) {
    init();

    // Load audio file
    audioAPI.load = async (path) => {
      if (Object.keys(audioAPI.audios).includes(path)) {
        return audioAPI.audios[path];
      }

      const audioModel = await loadServerAudioData(path);
      return audioModel;
    };

    // Play audio
    audioAPI.play = (key, funcs, position) => {
      const toPlay = audioAPI.audios[key];
      const updateCallback = typeof funcs.updated === 'function' ? funcs.updated : null;
      const playedCallback = typeof funcs.played === 'function' ? funcs.played : null;

      // Build audio source for playing
      audioAPI.source = audioAPI.context.createBufferSource();
      audioAPI.gainNode = audioAPI.context.createGain();
      audioAPI.source.connect(audioAPI.gainNode);
      audioAPI.gainNode.connect(audioAPI.context.destination);

      // Set audio buffer to play
      audioAPI.source.buffer = toPlay.buffer;

      // Bind callback function on end event
      if (playedCallback) {
        bindPlayedListener(playedCallback, key);
      }

      // Play from position of time if there is a postion has provided
      if (position) {
        toPlay.timePosition = parseInt(position, 10);
      }

      // Start playing from current time position on the audio
      audioAPI.source.start(0, toPlay.timePosition > 0 ? toPlay.timePosition : null);

      // Send time position by updateCallback
      if (updateCallback) {
        sendTimePosition(updateCallback, key);
      }

      // Mark new start time for calculating on pause
      toPlay.startTime = audioAPI.context.currentTime;

      // console.log(`Starts at: ${audioModel.timePosition || 0}`);
    };

    // Pause audio
    audioAPI.pause = (key) => {
      const toPause = audioAPI.audios[key];

      // Check there is an audio source is running a buffer
      if (!audioAPI.source || !audioAPI.source.buffer) {
        return;
      }

      // Stop playing and clear audio source
      audioAPI.source.stop(0);

      // Remove end-event callback function
      if (typeof audioAPI.played === 'function') {
        audioAPI.source.removeEventListener('ended', audioAPI.played, false);
      }

      // Stop timer of updating
      if (audioAPI.timer > 0) {
        clearInterval(audioAPI.timer);
      }

      // Clear audio source
      audioAPI.gainNode.disconnect();
      audioAPI.source.disconnect();
      audioAPI.gainNode = null;
      audioAPI.source = null;

      // Mark current time position for replaying
      toPause.timePosition += (audioAPI.context.currentTime - toPause.startTime);

      // console.log(`Stop at: ${audioModel.timePosition}`);
    };

    // Stop audio
    audioAPI.stop = (key) => {
      audioAPI.pause(key);

      const toStop = audioAPI.audios[key];
      toStop.startTime = 0;
      toStop.timePosition = 0;
    };
  }

  return audioAPI;
};


export default getAudioAPI();
