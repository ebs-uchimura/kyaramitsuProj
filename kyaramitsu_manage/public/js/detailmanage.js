/**
 * manage.js
 * function： product management
 **/

'use strict';

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