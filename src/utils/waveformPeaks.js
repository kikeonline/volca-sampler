export const GROUP_PIXEL_WIDTH = 6;

export const WAVEFORM_CACHED_WIDTH = GROUP_PIXEL_WIDTH * 44; // 264

/**
 * @typedef {{
 *   positive: Float32Array;
 *   negative: Float32Array;
 * }} SamplePeaks
 */

/**
 * @param {Float32Array} samples an array of floats from -1 to 1 (supposedly)
 * @param {number} containerPixelWidth the size of the waveform container
 * @returns {SamplePeaks} arrays of peak positive and negative values
 */
export function getPeaksForSamples(samples, containerPixelWidth) {
  const groupSize = Math.floor(
    (GROUP_PIXEL_WIDTH * samples.length) / containerPixelWidth
  );
  if (groupSize === 0) {
    return {
      positive: new Float32Array(),
      negative: new Float32Array(),
    };
  }
  const positive = new Float32Array(Math.floor(samples.length / groupSize));
  const negative = new Float32Array(Math.floor(samples.length / groupSize));
  for (let i = 0; i < positive.length; i++) {
    const group = new Float32Array(
      samples.buffer,
      samples.byteOffset + i * groupSize * 4,
      groupSize
    );
    let max = 0;
    let min = 0;
    for (const sample of group) {
      if (sample > max) {
        max = sample;
      }
      if (sample < min) {
        min = sample;
      }
    }
    positive[i] = max;
    negative[i] = min;
  }
  return {
    positive,
    negative,
  };
}
