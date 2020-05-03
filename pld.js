const pld = {};
const { nanoid } = require('nanoid');
const fs = require('fs');

pld.setPcClientId = function () {
  if (fs.existsSync('pcClientId')) {
    let pcClientId = fs.readFileSync('pcClientId', 'utf-8');
    return pcClientId;
  }
  else {
    let pcClientId = nanoid(10);
    fs.writeFileSync('pcClientId',pcClientId, 'utf-8');
    return pcClientId;
  }  
}

module.exports = pld;