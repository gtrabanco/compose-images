import sharp from "sharp";
import { addTextOnImage } from "./lib/add-text-on-image";
import { positionAreaToBeCentered } from "./lib/position-to-be-centered-coords";
import { resizeToProportional } from "./lib/resize-to-proportional";






// Config for composition
// const SHIELD_START_POSITION_COORDINATES: Coordinates2D = [1110, 510]; // 1
// const SHIELD_START_POSITION_COORDINATES: Coordinates2D = [643, 284]; // 2
const VISITOR_SHIELD_START_POSITION_COORDINATES: Coordinates2D = [1105, 225]; // 3
const CATEGORY_START_POSITION_COORDINATES: Coordinates2D = [639, 275]; // 3
// const SHIELD_MAX_AREA: Area = [365, 370]; // 1
// const SHIELD_MAX_AREA: Area = [310, 320]; // 2
const VISITOR_SHIELD_MAX_AREA: Area = [450, 400]; // 3
const WEEK_POSITION: Coordinates2D = [30, 820]


// Config files
// const FONT_FILE_PATH = './assets/AlumniSans-Black.ttf'
const BACKGROUND_IMAGE_PATH = "./assets/background3.png";
const OUTPUT_FILE = process.env.HOME + "/Downloads/out.webp"

const shieldFile = './assets/shields/Atletica.png';
const categoryText = "PRIMERA NACIONAL";
const WEEK = 1;

const backgroundImage = sharp(await Bun.file(BACKGROUND_IMAGE_PATH).arrayBuffer());
const shield = sharp(shieldFile);
const { width: originalWidth = 0, height: originalHeight = 0 } = await shield.metadata();

if (originalWidth === 0 || originalHeight === 0) {
  console.error('Any side size is 0', { originalWidth, originalHeight });
}

// Positioning
const [rescaleWidth, rescaleHeight] = resizeToProportional([originalWidth, originalHeight], VISITOR_SHIELD_MAX_AREA);
const [x, y] = positionAreaToBeCentered(VISITOR_SHIELD_START_POSITION_COORDINATES, VISITOR_SHIELD_MAX_AREA, [rescaleWidth, rescaleHeight]).map(Math.floor);

let shieldConverted;
try {
  console.info('Shield')
  if (rescaleWidth !== originalWidth || rescaleHeight !== originalWidth) {
    shieldConverted = sharp(await Bun.file(shieldFile).arrayBuffer()).resize({
      width: rescaleWidth,
      height: rescaleHeight,
    });
  } else {
    shieldConverted = sharp(await Bun.file(shieldFile).arrayBuffer());
  }

  // await shieldConverted.toFile('shield.webp');
  // console.info('Shield converted');

  console.info('Starting composition')
  const composition = await backgroundImage.webp({ quality: 100, lossless: true }).composite([
    {
      input: await shieldConverted.webp({ lossless: true, quality: 100 }).toBuffer(),
      top: y,
      left: x,
    },
    {
      input: addTextOnImage(`JORNADA ${WEEK.toString().padStart(2, '0')}`, { height: 64, fontColor: "white", anchor: "start" }),
      top: WEEK_POSITION[1],
      left: WEEK_POSITION[0]
    },
    {
      input: addTextOnImage(categoryText, { height: 108, fontColor: "black", anchor: "start" }),
      top: CATEGORY_START_POSITION_COORDINATES[1],
      left: CATEGORY_START_POSITION_COORDINATES[0],
    },
    // {
    //   input: addTextOnImage("PRIMERA PARTE", { height: 100, fontColor: "red", anchor: "middle" }),
    //   top: 505,
    //   left: 610,
    // },
    // { // Middle shield vetusta
    //   input: addTextOnImage("17", { height: 120, anchor: "start", fontColor: "white" }),
    //   top: 500,
    //   left: 520
    // },
    // {
    //   input: addTextOnImage("11", { height: 120, anchor: "start" }),
    //   top: 500,
    //   left: 1050
    // }
  ]).toBuffer();
  Bun.write(OUTPUT_FILE, composition)

  console.info('Composition done successfully: %s', OUTPUT_FILE)
} catch (error) {
  console.warn(error)
}

