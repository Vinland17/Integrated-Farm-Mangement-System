/**
 * Deterministically calculates composite soil health score (0 - 100)
 * based on agricultural reference ranges for N, P, K, pH, and Organic Matter.
 *
 * @param {Object} params
 * @param {number} params.nitrogen - Nitrogen in mg/kg
 * @param {number} params.phosphorus - Phosphorus in mg/kg
 * @param {number} params.potassium - Potassium in mg/kg
 * @param {number} params.pH - Soil pH (0 - 14)
 * @param {number} params.organicMatter - Organic Matter percentage
 * @returns {number} Composite Health Score clamped between 0 and 100
 */
const calculateSoilHealthScore = ({ nitrogen, phosphorus, potassium, pH, organicMatter }) => {
  const n = parseFloat(nitrogen) || 0;
  const p = parseFloat(phosphorus) || 0;
  const k = parseFloat(potassium) || 0;
  const phVal = parseFloat(pH) || 7.0;
  const om = parseFloat(organicMatter) || 0;

  // 1. Nitrogen Component (Max 25 pts) - Target: 30 - 60 mg/kg
  let nScore = 0;
  if (n >= 30 && n <= 60) {
    nScore = 25;
  } else if (n < 30) {
    nScore = (n / 30) * 25;
  } else {
    nScore = Math.max(0, 25 - ((n - 60) / 40) * 15);
  }

  // 2. Phosphorus Component (Max 20 pts) - Target: 25 - 50 mg/kg
  let pScore = 0;
  if (p >= 25 && p <= 50) {
    pScore = 20;
  } else if (p < 25) {
    pScore = (p / 25) * 20;
  } else {
    pScore = Math.max(0, 20 - ((p - 50) / 40) * 10);
  }

  // 3. Potassium Component (Max 20 pts) - Target: 35 - 70 mg/kg
  let kScore = 0;
  if (k >= 35 && k <= 70) {
    kScore = 20;
  } else if (k < 35) {
    kScore = (k / 35) * 20;
  } else {
    kScore = Math.max(0, 20 - ((k - 70) / 50) * 10);
  }

  // 4. pH Component (Max 20 pts) - Ideal range: 6.0 - 7.5
  let phScore = 0;
  if (phVal >= 6.0 && phVal <= 7.5) {
    phScore = 20;
  } else if (phVal < 6.0) {
    phScore = Math.max(0, (phVal / 6.0) * 20);
  } else {
    phScore = Math.max(0, 20 - ((phVal - 7.5) / 6.5) * 20);
  }

  // 5. Organic Matter Component (Max 15 pts) - Target: >= 4.0%
  let omScore = Math.min(15, (om / 4.0) * 15);

  const totalScore = Math.round(nScore + pScore + kScore + phScore + omScore);
  return Math.min(100, Math.max(0, totalScore));
};

module.exports = calculateSoilHealthScore;
