import $ from 'jquery';
import RayPlayer from '@/player/player';

import demo1Sound from '@/assets/audios/为我受伤.mp3';
import demo1Subtitle from '@/assets/subtitles/为我受伤.lrc';
import demo2Sound from '@/assets/audios/eilleen.m4a';

import '@/assets/styles/main.css';
import '@/assets/styles/player.css';

// Data for Testing
const demoTracks = [{
  audioUrl: demo1Sound,
  subtitleUrl: demo1Subtitle,
}, {
  audioUrl: demo2Sound,
  subtitleUrl: '',
}];

$(document).ready(() => {
  /**
   * Init player with track paths
   */
  const player = new RayPlayer({
    tracks: demoTracks,
    autoNext: true,
    listLoop: true,
  });

  $('.player-container').html(player.UI);
});
