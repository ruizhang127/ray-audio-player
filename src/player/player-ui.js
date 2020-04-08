import $ from 'jquery';
import Utils from './utils';

class PlayerUI {
  constructor(options) {
    this.options = options || {};
    this.theme = this.options.theme || 'default';
    this.mainDom = $(`
      <div class="player-panel">
        <div class="content">
          <div class="track-list">
            <div class="list-title">List Title</div>
          </div>
          <div class="track-details">
            <div class="meta">
              <div class="title"></div>
              <div class="artist"></div>
              <div class="album"></div>
              
            </div>

            <div class="subtitle"></div>
          </div>
        </div>

        <div class="control">
          <div class="control-buttons">
            <div class="pre">
              <span class="column"></span>
              <span class="left-arrow"></span>
            </div>
            <div class="play-circle-button">
              <div class="play right-arrow"></div>
              <div class="pause hide">
                <span class="column"></span>
                <span class="column"></span>
              </div>
            </div>
            <div class="next">
              <span class="right-arrow"></span>
              <span class="column"></span>
            </div>
          </div>

          <div class="progress">
            <div class="played time"></div>
            <input class="progress-bar" value="0" min="0" max="10" step="1" type="range" disabled />
            <div class="duration time"></div>
          </div>
        </div>
      </div>
    `);

    this.trackListDom = this.mainDom.find('.track-list');
    this.listTitleDom = this.mainDom.find('.list-title');

    this.metaTitleDom = this.mainDom.find('.track-details .meta .title');
    this.metaArtistDom = this.mainDom.find('.track-details .meta .artist');
    this.metaAlbumDom = this.mainDom.find('.track-details .meta .album');
    this.subtitleDom = this.mainDom.find('.track-details .subtitle');

    this.preButtonDom = this.mainDom.find('.control-buttons .pre');
    this.playCircleDom = this.mainDom.find('.play-circle-button');
    this.playButtonDom = this.mainDom.find('.play-circle-button .play');
    this.pauseButtonDom = this.mainDom.find('.play-circle-button .pause');
    this.nextButtonDom = this.mainDom.find('.control-buttons .next');

    this.progressPlayedDom = this.mainDom.find('.progress .played');
    this.progressBarDom = this.mainDom.find('.progress .progress-bar');
    this.progressDurationDom = this.mainDom.find('.progress .duration');
  }

  get playerDom() {
    return this.mainDom;
  }

  get trackList() {
    return this.trackListDom;
  }

  get listTitle() {
    return this.listTitleDom;
  }

  get title() {
    return this.metaTitleDom;
  }

  get artist() {
    return this.metaArtistDom;
  }

  get album() {
    return this.metaAlbumDom;
  }

  get subtitle() {
    return this.subtitleDom;
  }

  get preButton() {
    return this.preButtonDom;
  }

  get playCircle() {
    return this.playCircleDom;
  }

  get playButton() {
    return this.playButtonDom;
  }

  get pauseButton() {
    return this.pauseButtonDom;
  }

  get nextButton() {
    return this.nextButtonDom;
  }

  get played() {
    return this.progressPlayedDom;
  }

  get progressBar() {
    return this.progressBarDom;
  }

  get duration() {
    return this.progressDurationDom;
  }

  addTrackRow(row, index) {
    const trackRowDom = $('<div class="track-row"></div>').html(row.name);
    trackRowDom.attr('id', `track-${index}`);
    this.trackListDom.append(trackRowDom);
    return trackRowDom;
  }

  addSubtitleRow(row) {
    const subtitleRowDom = $('<div class="subtitle-row"></div>');
    subtitleRowDom.attr('id', `row-${row.time}`);
    subtitleRowDom.html(row.content);
    this.subtitleDom.append(subtitleRowDom);
    return subtitleRowDom;
  }

  selectTrack(row) {
    this.trackListDom.find('.track-row.selected').removeClass('selected');
    row.addClass('selected');
  }

  loadMeta(meta) {
    this.metaTitleDom.empty().html(meta.title);
    this.metaArtistDom.empty().html(meta.artist);
    this.metaAlbumDom.empty().html(meta.album);
  }

  loadProgress(duration) {
    this.progressDurationDom.html(Utils.parseTime(duration));
    this.progressBarDom.attr('max', duration);
  }

  scrollSubtitle(time) {
    const toSingRow = this.subtitleDom.find(`#row-${time}`);
    const singingRow = this.subtitleDom.find('.singing');

    if (toSingRow && toSingRow.length === 1) {
      singingRow.removeClass('singing');
      toSingRow.addClass('singing');

      const rowTop = toSingRow.offset().top;
      const containerTop = this.subtitleDom.offset().top;
      const containerScrollTop = this.subtitleDom.scrollTop();
      const topToScroll = rowTop - containerTop + containerScrollTop;

      this.subtitleDom.animate({
        scrollTop: topToScroll - 30,
      });
    } else if (time === 0) {
      singingRow.removeClass('singing');
      this.subtitleDom.animate({
        scrollTop: 0,
      });
    } else {
      this.scrollSubtitle(time - 1);
    }
  }

  switchButton(status) {
    this.playButtonDom[status === 'play' ? 'addClass' : 'removeClass']('hide');
    this.pauseButtonDom[status === 'pause' ? 'addClass' : 'removeClass']('hide');
  }

  updateTrack(time) {
    this.progressPlayedDom.html(Utils.parseTime(time));
    this.progressBarDom.val(time);
    this.scrollSubtitle(time);
  }

  stopTrack() {
    this.switchButton('pause');
  }
}

export default PlayerUI;
