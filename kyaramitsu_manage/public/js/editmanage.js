/**
 * edit.js
 * function： product edit
 **/

'use strict';
// pref id
let globalPrefectureId = "";
// area id
let globalAreaId = "";

// get global area
const getGlobalArea = (area) => {
  // set global mode
  globalAreaId = String(area);
}
// get global pref
const getGlobalPref = (pref) => {
  // set global mode
  globalPrefectureId = String(pref);
}

$(document).ready(function () {
  // when area selected
  $('#area-select').change(function () {
    // send area
    location.href = `https://manage.ebisu-do.jp/shop_edit?area=${$(this).val()}`;
  });
  // when prefecture prefecture
  $('#prefecture-select').change(function () {
    // send prefecture
    location.href = `https://manage.ebisu-do.jp/shop_edit?prefecture=${$(this).val()}`;
  });
  // select initial area
  $('#area-select').delay(10).queue(function () {
    if (globalAreaId != "") {
      // select target
      $(this).val(globalAreaId);
    } else {
      // select target
      $(this).val("0");
    }
  });
  // select initial prefecture
  $('#prefecture-select').delay(10).queue(function () {
    if (globalPrefectureId != "") {
      // select target
      $(this).val(globalPrefectureId);
    } else {
      // select target
      $(this).val("0");
    }
  });
});

// goto edit page
const gotoEdit = (id) => {
  console.log(id);
  // send prefecture
  location.href = `https://manage.ebisu-do.jp/editpage?id=${id}`;
}
