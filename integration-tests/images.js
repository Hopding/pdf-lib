import fs from 'fs';
import _ from 'lodash';

const imagesDir = '/Users/user/Pictures';

export const pngImages = _.mapValues(
  {
    minions: `${imagesDir}/minions.png`,
    minionsNoAlpha: `${imagesDir}/minions-no-alpha.png`,
    greyscaleBird: `${imagesDir}/greyscale-bird.png`,
    smallMario: `${imagesDir}/small-mario.png`,
  },
  filePath => fs.readFileSync(filePath),
);

export const jpgImages = _.mapValues(
  {
    catUnicorn: `${imagesDir}/cat-riding-unicorn.jpg`,
    minions: `${imagesDir}/mini.jpg`,
  },
  filePath => fs.readFileSync(filePath),
);
