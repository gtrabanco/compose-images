import { basename, extname, join } from "path";
import sharp from "sharp";
import { addTextOnImage } from "./lib/add-text-on-image";
import { positionAreaToBeCentered } from "./lib/position-to-be-centered-coords";
import { resizeToProportional } from "./lib/resize-to-proportional";

const understand_overwrite = (process.argv.includes('-y') || process.argv.includes('--yes') || process.argv.includes('--force'))

if (!understand_overwrite) {
  console.info('Any output file that exists will be overwritten');
  console.warn('You should write -y as argument to make explicit that you understand this');
  process.exit(-1);
}



// Config for composition
// const SHIELD_START_POSITION_COORDINATES: Coordinates2D = [1110, 510]; // 1
// const SHIELD_START_POSITION_COORDINATES: Coordinates2D = [643, 284]; // 2
const VISITOR_SHIELD_START_POSITION_COORDINATES: Coordinates2D = [1105, 225]; // 3
const CATEGORY_START_POSITION_COORDINATES: Coordinates2D = [639, 275]; // 3
// const SHIELD_MAX_AREA: Area = [365, 370]; // 1
// const SHIELD_MAX_AREA: Area = [310, 320]; // 2
const VISITOR_SHIELD_MAX_AREA: Area = [450, 400]; // 3
const WEEK_POSITION: Coordinates2D = [30, 820];


// Config files
// const FONT_FILE_PATH = './assets/AlumniSans-Black.ttf'
const BACKGROUND_IMAGE_PATH = "./assets/background3.png";
const OUTPUT_PATH = process.env.HOME + "/Downloads/"; // file + extension will be added later. File will be the week

const shieldFile = './assets/shields/sdc_astillero.png';
const categoryText = "PRIMERA NACIONAL";
const WEEK = 3;
const SHOULD_OUTPUT_WEBP_SHIELD = true;

const backgroundImage = sharp(await Bun.file(BACKGROUND_IMAGE_PATH).arrayBuffer());
const shield = sharp(shieldFile);
const { width: originalWidth = 0, height: originalHeight = 0 } = await shield.metadata();

if (originalWidth === 0 || originalHeight === 0) {
  console.error('Any side size is 0', { originalWidth, originalHeight });
}

// Positioning
const [rescaleWidth, rescaleHeight] = resizeToProportional([originalWidth, originalHeight], VISITOR_SHIELD_MAX_AREA);
const [x, y] = positionAreaToBeCentered(VISITOR_SHIELD_START_POSITION_COORDINATES, VISITOR_SHIELD_MAX_AREA, [rescaleWidth, rescaleHeight]).map(Math.floor);

let shieldResized;
try {
  console.info('Shield')
  if (rescaleWidth !== originalWidth || rescaleHeight !== originalWidth) {
    shieldResized = sharp(await Bun.file(shieldFile).arrayBuffer()).resize({
      width: rescaleWidth,
      height: rescaleHeight,
    });
  } else {
    shieldResized = sharp(await Bun.file(shieldFile).arrayBuffer());
  }

  console.info('Files will be writen in folder: %s', OUTPUT_PATH)
  if (SHOULD_OUTPUT_WEBP_SHIELD) {
    const filename = basename(shieldFile, extname(shieldFile)) + '.webp';
    const webp_shield_path = join(OUTPUT_PATH, filename)
    console.info('Converting shield to WEBP')
    await shieldResized.webp({ quality: 100, lossless: true }).toFile(webp_shield_path);
    console.info('Shield as WEBP done in: %s', webp_shield_path)
  }

  console.info('Configuring composition')
  const composition = backgroundImage.composite([
    {
      input: await shieldResized.webp({ lossless: true, quality: 100 }).toBuffer(),
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
  ]);
  const FILENAME = `J${WEEK.toString().padStart(2, '0')}`
  const FILE_PNG = join(OUTPUT_PATH, FILENAME + '.png')
  const FILE_WEBP = join(OUTPUT_PATH, FILENAME + '.webp')

  console.info('Starting composition as PNG')
  Bun.write(FILE_PNG, await composition.png({ quality: 100 }).toBuffer())
  console.info('Composition as PNG done: %s', FILE_PNG)

  console.info('Starting composition as WEBP')
  Bun.write(FILE_WEBP, await composition.webp({ quality: 100, lossless: true }).toBuffer())
  console.info('Composition as WEBP done: %s', FILE_WEBP)
} catch (error) {
  console.warn(error)
}

