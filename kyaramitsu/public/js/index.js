/**
 * index.js
 * function： main operation
 **/

'use strict';
// root url
let globalRootUrl = '';
// root area
let globalArea = '';
// root pref
let globalPrefecture = '';

$(document).ready(function () {
  $(window).scroll(function () {
    if ($(this).scrollTop() > 100) {
      $('.scroll-top-btn').fadeIn();
    } else {
      $('.scroll-top-btn').fadeOut();
    }
  });
  $('.scroll-top-btn').click(function () {
    $('html, body').animate({ scrollTop: 0 }, 800);
    return false;
  });
  if (globalArea != "99") {
    const globalPosition = getGlobalPosition(globalArea);
    $(`.item-map ul li:nth-child(${globalPosition})`).css('background-color', 'red');
    if (globalPosition == 3) {
      $(`.item-map ul li:nth-child(5)`).css('background-color', 'red');
    }
    if (globalPosition == 7) {
      $(`.item-map ul li:nth-child(8)`).css('background-color', 'red');
    }
  }

});

// get global root
const getGlobalRoot = (url) => {
  // set global mode
  globalRootUrl = url;
}

// get global root
const getGlobalArea = (area) => {
  // set global mode
  globalArea = area;
}

// get global root
const getGlobalPosition = (area) => {
  // set global mode
  switch (area) {
    case "1":
      return 1;
    case "2":
      return 2;
    case "3":
      return 4;
    case "4":
      return 3;
    case "5":
      return 6;
    case "6":
      return 7;
    case "7":
      return 9;
    case "99":
      return 99;
    default:
      console.log(`Sorry, we are out of ${expr}.`);
  }
}