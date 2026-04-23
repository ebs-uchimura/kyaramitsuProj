/**
 * manage.js
 * function： product management
 **/

'use strict';

$(document).ready(function () {
  // initialize timepicker
  $('input.timepicker1').timepicker({
    'minTime': '6:00',
    'maxTime': '23:00',
    'startTime': '10:00',
    'timeFormat': 'HH:mm'
  });
  $('input.timepicker2').timepicker({
    'startTime': '18:00',
    'timeFormat': 'HH:mm'
  });
  // when check on
  $('.showpath').change(function () {
    // checked
    const chk_status = $(this).prop("checked");
    // switch on checkbox
    if (chk_status) {
      // check on
      $(this).next().addClass('display-none');
      $(this).next().next().removeClass('display-none');
    } else {
      // check off
      $(this).next().removeClass('display-none');
      $(this).next().next().addClass('display-none');
    }
  });
});

// initialize zip code
const initPostcodeJp = function () {
  const autoComplement = new postcodejp.address.AutoComplementService('Nard1YulQWftGYx58U6DkRHw5Vpyps');
  autoComplement.setZipTextbox('sample1_zip');
  autoComplement.add(new postcodejp.address.StateTownStreetTextbox('sample1_addr'));
  autoComplement.observe();
};
if (window.addEventListener) {
  window.addEventListener('load', initPostcodeJp)
} else {
  window.attachEvent('onload', initPostcodeJp)
}