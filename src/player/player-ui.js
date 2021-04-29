import $ from 'jquery';
import Utils from './utils';

class PlayerUI {
  constructor(options) {
    this.options = options || {};
    this.theme = this.options.theme || 'default';
    this.mainDom = $(`
      <div class="player-panel">
        <div class="player-title"></div>
        <div class="player-content">
          <div class="track-list"></div>

          <div class="track-details">
            <div class="meta">
              <div class="title"></div>
              <div class="album"></div>
              <div class="artist"></div>
              
            </div>

            <div class="subtitle"></div>
          </div>

        </div>

        <div class="player-control">
          <div class="progress">
            <div class="played time">0:00</div>
            <input class="progress-bar" value="0" min="0" max="10" step="1" type="range" disabled />
            <div class="duration time">0:00</div>
          </div>

          <div class="control-buttons">
            <div class="single-loop">
              <svg id="main" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 72">
                <path d="M91.1,12.24,90.42,0l16,16-3,3-13,13,.66-11.2H15.26a6.69,6.69,0,0,0-6.65,6.65V45a6.68,6.68,0,0,0,6.65,6.64h1.85v8.61H15.26A15.28,15.28,0,0,1,0,45V27.5A15.3,15.3,0,0,1,15.26,12.24Z" style="fill-rule:evenodd"/>
                <path d="M36.9,59.75,37.58,72l-16-16,3-3,13-13-.66,11.14h75.81a6.68,6.68,0,0,0,6.65-6.64V27a6.68,6.68,0,0,0-6.65-6.64h-1.84V11.72h1.84A15.3,15.3,0,0,1,128,27V44.5a15.3,15.3,0,0,1-15.27,15.25Z" style="fill-rule:evenodd"/>
              </svg>
            </div>
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
            <div class="show-details">
              <p></p>
              <p></p>
              <p></p>
            </div>
          </div>

          
        </div>
      </div>
    `);

    this.playerTitleDom = this.mainDom.find('.player-title');
    this.trackListDom = this.mainDom.find('.track-list');
    this.trackDetailsDom = this.mainDom.find('.track-details');

    this.metaTitleDom = this.mainDom.find('.track-details .meta .title');
    this.metaArtistDom = this.mainDom.find('.track-details .meta .artist');
    this.metaAlbumDom = this.mainDom.find('.track-details .meta .album');
    this.subtitleDom = this.mainDom.find('.track-details .subtitle');

    this.singleLoopButtonDom = this.mainDom.find('.control-buttons .single-loop');
    this.preButtonDom = this.mainDom.find('.control-buttons .pre');
    this.playCircleDom = this.mainDom.find('.play-circle-button');
    this.playButtonDom = this.mainDom.find('.play-circle-button .play');
    this.pauseButtonDom = this.mainDom.find('.play-circle-button .pause');
    this.nextButtonDom = this.mainDom.find('.control-buttons .next');
    this.showDetailsButtonDom = this.mainDom.find('.control-buttons .show-details');

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

  get trackDetails() {
    return this.trackDetailsDom;
  }

  get playerTitle() {
    return this.playerTitleDom;
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

  get singleLoopButton() {
    return this.singleLoopButtonDom;
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

  get showDetailsButton() {
    return this.showDetailsButtonDom;
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
    this.metaArtistDom.empty().html(`by ${meta.artist}`);
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
        scrollTop: topToScroll,
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

  switchSingleLoop() {
    this.singleLoopButtonDom[
      this.singleLoopButtonDom.hasClass('selected')
        ? 'removeClass'
        : 'addClass'
    ]('selected');
  }

  switchButton(status) {
    this.playButtonDom[status === 'play' ? 'addClass' : 'removeClass']('hide');
    this.pauseButtonDom[status === 'pause' ? 'addClass' : 'removeClass']('hide');
  }

  switchDetails() {
    this.trackDetailsDom[
      this.trackDetailsDom.hasClass('opened')
        ? 'removeClass'
        : 'addClass'
    ]('opened');

    this.showDetailsButtonDom[
      this.showDetailsButtonDom.hasClass('selected')
        ? 'removeClass'
        : 'addClass'
    ]('selected');
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
