// This function was given and modified from:
// https://www.digitalocean.com/community/tutorials/how-to-process-images-in-node-js-with-sharp#step-7-adding-text-on-an-image
export  function addTextOnImage(
  text: string,
  { height = 72, fontColor = "#151111", anchor = "middle" }: { height?: number; fontColor?: string; anchor?: "start" | "middle" | "end" } = {}
) {
  const width = 0.3 * text.length * height;
  const x = anchor === "middle" ? "50%" : "0";
  try {
    const svgImage = `
    <svg width="${width}" height="${height}">
      <style>
      text { fill: ${fontColor}; font-size: ${height * 0.8}px; text-align: left; font-weight: bolder; font-family: Alumni Sans, Helvetica Neue, Helvetica, sans-serif; }
      </style>
      <text x="${x}" y="50%" text-anchor="${anchor}">${text}</text>
    </svg>
    `;
    return Buffer.from(svgImage);
  } catch (error) {
    console.log(error);
  }
}