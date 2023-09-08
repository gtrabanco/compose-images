// Center element by retrieving coords to place that element. Needs start point where max area element should be placed and calculate the position of element if size is lower
export function positionAreaToBeCentered(startPosition: Coordinates2D, maxArea: Area, elementArea: Area): Coordinates2D {
  const [x0, y0] = startPosition;
  const [wMax, hMax] = maxArea;
  const [w, h] = elementArea;

  const x1 = Math.abs(wMax - w) / 2;
  const y1 = Math.abs(hMax - h) / 2;

  return [x0 + x1, y0 + y1]
}