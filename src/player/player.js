import parseAudioMetadata from 'parse-audio-metadata';
import AudioModel from '../audio/audio-model-class';
import audioAPI from '../audio/audio-api';
import PlayerUI from './player-ui';
import Utils from './utils';

const filterCrossOriginUrl = (tracks) => {
  const sourceTracks = (tracks && Array.isArray(tracks)) ? tracks : [];
  const hostDomain = Utils.parseDomain(window.location.href);
  const newTracks = sourceTracks
    .filter((track) => {
      const trackUrl = track.audioUrl;

      if (!trackUrl || trackUrl.length === 0) {
        return false;
      }

      const trackDomain = Utils.parseDomain(trackUrl);

      if (!trackDomain) {
        return false;
      }

      return trackUrl && [hostDomain, null].includes(Utils.parseDomain(trackUrl));
    });


  return newTracks;
};

const parseAudioBlob = (blob) => new Promise((resolve) => {
  const fileReader = new FileReader();

  fileReader.readAsArrayBuffer(blob);
  fileReader.addEventListener('load', () => {
    resolve(fileReader.result);
  });
});

// Parse audio blob data
const parseAudioData = async (audioBlob) => {
  const metadata = await parseAudioMetadata(audioBlob);
  const arrayBuffer = await parseAudioBlob(audioBlob);

  return {
    metadata,
    arrayBuffer,
  };
};

const fetchAudio = (path) => new Promise((resolve, reject) => {
  const request = new XMLHttpRequest();

  request.addEventListener('load', async (event) => {
    if (request.status !== 200) {
      reject(new Error('AudioLoadFailed'));
      return;
    }

    const audioBlob = (event && event.target && event.target.response)
      ? event.target.response
      : null;

    if (!audioBlob) {
      resolve();
    }

    const parsedData = await parseAudioData(audioBlob);

    audioAPI.context.decodeAudioData(parsedData.arrayBuffer, (buffer) => {
      const loadedAudioModel = new AudioModel(path);
      loadedAudioModel.buffer = buffer;
      loadedAudioModel.meta = parsedData.metadata;

      resolve(loadedAudioModel);
    });
  });

  request.open('GET', path, true);
  request.responseType = 'blob';
  request.send();
});

const fetchSubtitle = (path) => new Promise((resolve) => {
  const request = new XMLHttpRequest();

  request.addEventListener('load', async (event) => {
    if (request.status !== 200) {
      throw new Error('SubtitleLoadFailed');
    }

    const subtitle = (event && event.target && event.target.response)
      ? event.target.response
      : null;

    resolve(subtitle);
  });

  request.open('GET', path, true);
  request.send();
});

/**
 * Player Class
 */
class Player {
  constructor(options) {
    // Parameters
    this.options = options || {};
    this.listTitle = this.options.listTitle || 'List Title';
    this.tracks = filterCrossOriginUrl(this.options.tracks || []);
    this.theme = this.options.theme || 'default';
    this.subtitleShow = this.options.subtitleShow; // TODO
    this.preload = this.options.preload || false;
    this.autoNext = this.options.autoNext || false;
    this.random = this.options.random || false; // TODO

    // Sequence control
    this.currentLoop = this.options.currentLoop || false; // TODO
    this.listLoop = this.options.listLoop || false;
    this.trackIndexMap = {};
    this.tracks.reduce((pre, value, index, list) => {
      const track = {
        preIndex: index > 0 ? index - 1 : 0,
        nextIndex: index < list.length - 1 ? index + 1 : 0,
      };

      this.trackIndexMap[value.audioUrl] = track;

      return pre;
    }, {});

    // player status
    this.statusList = ['init', 'loaded', 'playing', 'pause'];
    this.playerStatus = 'init';
    this.currentKey = null;

    /**
     * --------------------------
     * Bind events on UI elements
     * --------------------------
     */
    this.playerUI = new PlayerUI();

    this.playerUI.listTitle.html(this.listTitle);

    // Click a track in list to play track
    this.tracks.forEach(async (track, index) => {
      const newRow = {
        path: track.audioUrl,
        name: track.audioUrl.split('/').pop(),
      };

      let preloadedAudio = null;
      let loadedAudio = null;

      // Load all audios (buffer, meta) before show track list
      if (this.preload) {
        try {
          preloadedAudio = await this.load(newRow.path);
          newRow.name = preloadedAudio.meta.title;
        } catch (e) {
          return;
        }
      }

      const trackRow = this.playerUI.addTrackRow(newRow, index);

      trackRow.click(async () => {
        // Prevent users from clicking continuously in a short time
        this.playerUI.trackList.attr('disabled', true);

        // Stop the audio is playing
        this.stop();

        loadedAudio = preloadedAudio || await this.load(newRow.path);
        this.playerUI.selectTrack(trackRow);
        this.playerUI.subtitle.empty();

        if (loadedAudio.subtitle) {
          Utils.parseLRC(loadedAudio.subtitle).forEach((line) => {
            this.playerUI.addSubtitleRow(line);
          });
        }

        this.playerUI.loadMeta(loadedAudio.meta);
        this.playerUI.loadProgress(loadedAudio.meta.duration);

        this.play(newRow.path);
        this.playerUI.switchButton('play');

        // Allow user to click again after starting playback
        this.playerUI.trackList.removeAttr('disabled');

        // Allow users to drag and drop only when playing
        this.playerUI.progressBar.removeAttr('disabled');
      });
    });

    // Drag thumb on progress bar
    this.playerUI.progressBar.on('input', () => {
      // Prevent users from dragging continuously in a short time
      this.playerUI.progressBar.attr('disabled', true);

      this.playAt(this.playerUI.progressBar.val());
      this.playerUI.switchButton('play');

      // Allow user to drag again after starting playback
      this.playerUI.progressBar.removeAttr('disabled');
    });

    // Control button's events
    this.playerUI.pauseButton.click(() => {
      this.pause();
    });
    this.playerUI.playButton.click(() => {
      this.resume();
    });
    this.playerUI.preButton.click(() => {
      this.playLast();
    });
    this.playerUI.nextButton.click(() => {
      this.playNext();
    });
  }

  get UI() {
    return this.playerUI.playerDom;
  }

  /**
   * --------------------------
   * Public methods
   * --------------------------
   */
  async load(key) {
    if (!key) {
      return null;
    }

    const track = this.trackIndexMap[key];
    const loadedAudio = await fetchAudio(key);

    audioAPI.load(loadedAudio);

    if (track.subtitleUrl && track.subtitleUrl.length > 0) {
      loadedAudio.subtitle = await fetchSubtitle(track.subtitleUrl);
      Utils.logger.debug(`[${loadedAudio.path}] subtitle has loaded`);
    }

    this.update('loaded');
    return loadedAudio;
  }

  play(key, position) {
    const keyToPlay = key || this.currentKey;

    if (!keyToPlay) {
      return;
    }

    audioAPI.play(keyToPlay, position, {
      updated: (playingTime) => {
        this.playerUI.updateTrack(playingTime);
      },
      played: (data) => {
        this.playerUI.stopTrack(data);

        if (this.autoNext) {
          this.playNext();
        }
      },
    });

    this.currentKey = key;
    this.update('playing');
  }

  playLast() {
    if (!this.currentKey) {
      return;
    }

    const { preIndex } = this.trackIndexMap[this.currentKey];
    this.playerUI.trackList.find(`#track-${preIndex}`).click();
  }

  playNext() {
    if (!this.currentKey) {
      return;
    }

    const { nextIndex } = this.trackIndexMap[this.currentKey];
    this.playerUI.trackList.find(`#track-${nextIndex}`).click();
  }

  playAt(position) {
    if (!this.currentKey) {
      return;
    }

    this.stop(this.currentKey);
    this.play(this.currentKey, position);
  }

  pause() {
    if (!this.currentKey) {
      return;
    }

    audioAPI.pause(this.currentKey);
    this.update('pause');
    this.playerUI.switchButton('pause');
  }

  resume() {
    if (!this.currentKey) {
      return;
    }

    this.play(this.currentKey);
    this.playerUI.switchButton('play');
  }

  stop() {
    if (!this.currentKey) {
      return;
    }

    audioAPI.stop(this.currentKey);
    this.update('loaded');
  }

  update(newStatus) {
    if (this.statusList.includes(newStatus)) {
      this.playerStatus = newStatus;
    }
  }

  get status() {
    return this.playerStatus;
  }

  get isPlaying() {
    return this.playerStatus === 'playing';
  }

  get isPause() {
    return this.playerStatus === 'pause';
  }

  get playable() {
    return ['init', 'pause'].includes(this.playerStatus);
  }
}

export default Player;
