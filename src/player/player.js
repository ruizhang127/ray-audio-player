import $ from 'jquery';
import Utils from '@/utils';
import audioAPI from '@/audio-api';
import PlayerUI from '@/player/player-ui';

class RayPlayer {
  constructor(options) {
    // Parameters
    this.options = options || {};
    this.tracks = (this.options.tracks && Array.isArray(this.options.tracks))
      ? this.options.tracks
      : [];
    this.container = options.container;
    this.theme = this.options.theme || 'default';
    this.subtitleShow = this.options.subtitleShow; // TODO
    this.autoNext = this.options.autoNext || false;
    this.random = this.options.random || false; // TODO

    // Sequence control
    this.currentLoop = this.options.currentLoop || false; // TODO
    this.listLoop = this.options.listLoop || false;

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

    // Click a track in list to play track
    this.tracks.forEach((track, index) => {
      const row = {
        path: track.audioUrl,
        name: track.audioUrl.split('/').pop(),
      };
      const trackRow = this.playerUI.addTrackRow(row, index);

      trackRow.click(() => {
        // Prevent users from clicking continuously in a short time
        this.playerUI.trackList.attr('disabled', true);

        this.stop(this.currentKey);
        this.load(row.path).then((audio) => {
          this.playerUI.selectTrack(trackRow);
          this.playerUI.subtitle.empty();

          if (audio.subtitle) {
            Utils.parseLRC(audio.subtitle).forEach((line) => {
              this.playerUI.addSubtitleRow(line);
            });
          }

          this.playerUI.loadMeta(audio.meta);
          this.playerUI.loadProgress(audio.meta.duration);

          this.play(row.path);
          this.playerUI.switchButton('play');

          // Allow user to click again after starting playback
          this.playerUI.trackList.removeAttr('disabled');

          // Allow users to drag and drop only when playing
          this.playerUI.progressBar.removeAttr('disabled');
        });
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

    // Pause the playing track
    this.playerUI.pauseButton.click(() => {
      this.pause();
      this.playerUI.switchButton('pause');
    });

    // Click play button to play/resume
    this.playerUI.playButton.click(() => {
      this.play(this.currentKey);
      this.playerUI.switchButton('play');
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

    const track = this.tracks.find((t) => t.audioUrl === key);
    const loadedAudio = await audioAPI.load(key);

    if (!loadedAudio.subtitle && track.subtitleUrl && track.subtitleUrl.length > 0) {
      loadedAudio.subtitle = await $.get(track.subtitleUrl);
    }

    this.update('loaded');
    return loadedAudio;
  }

  play(key, position) {
    if (!key) {
      return;
    }

    audioAPI.play(key, {
      updated: (playingTime) => {
        this.playerUI.updateTrack(playingTime);
      },
      played: (data) => {
        this.playerUI.stopTrack(data);

        if (this.autoNext) {
          this.playNext(this.tracks.indexOf(this.tracks.find((track) => track.audioUrl === key)));
        }
      },
    }, position);

    this.currentKey = key;
    this.update('playing');
  }

  playNext(playedIndex) {
    if (playedIndex < this.tracks.length - 1) {
      this.playerUI.trackList.find(`#track-${playedIndex + 1}`).click();
    } else if (this.listLoop) {
      this.playNext(-1);
    }
  }

  playAt(position) {
    this.stop();
    this.play(this.currentKey, position);
  }

  pause() {
    if (!this.currentKey) {
      return;
    }

    audioAPI.pause(this.currentKey);
    this.update('pause');
  }

  resume() {
    if (!this.currentKey) {
      return;
    }

    this.play(this.currentKey);
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

export default RayPlayer;
