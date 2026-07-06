/**
 * edit.js
 * function： product edit
 **/

'use strict';
// pref id
let globalPrefectureId = "";

// get global pref
const getGlobalPref = (pref) => {
  // set global mode
  globalPrefectureId = String(pref);
}

$(document).ready(function () {
  // when prefecture prefecture
  $('#prefecture-select').change(function () {
    // send prefecture
    location.href = `https://manage.ebisu-do.jp/shop_edit?prefecture=${$(this).val()}`;
  });
  // select initial prefecture
  $('#prefecture-select').delay(10).queue(function () {
    console.log(globalPrefectureId);
    if (globalPrefectureId != "") {
      // select target
      $(this).val(globalPrefectureId);
    } else {
      // select target
      $(this).val("0");
    }
  });
  // select initial prefecture
  $('.subbutton').on('click', function () {
    // send prefecture
    location.href = `https://manage.ebisu-do.jp/editpage?id=${$(this).val()}`;
  });
});
