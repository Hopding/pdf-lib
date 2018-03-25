import fs from 'fs';
import _ from 'lodash';

const fontsDir = '/Users/user/Desktop/fonts';
const fontsBytes = _.mapValues(
  {
    ubuntu: `${fontsDir}/ubuntu/Ubuntu-R.ttf`,
    cursivey: `${fontsDir}/cursivey-font.otf`,
    elegant: `${fontsDir}/elegant-font.otf`,
    candles_: `${fontsDir}/candles/Candles_.TTF`,
    candles_chrome: `${fontsDir}/candles/Candles Chrome.ttf`,
    fantasque: `${fontsDir}/fantasque/FantasqueSansMono-Regular.ttf`,
  },
  (filePath) => fs.readFileSync(filePath),
);

export default fontsBytes;
