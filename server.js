const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const rootDir = __dirname;
const publicDir = path.join(rootDir, 'public');
const datasetPath = path.join(rootDir, 'SOCR-HeightWeight.csv');

function loadRegressionModel() {
  const csv = fs.readFileSync(datasetPath, 'utf8').replace(/^\uFEFF/, '');
  const rows = csv
    .trim()
    .split(/\r?\n/)
    .slice(1)
    .map((line) => {
      const [, height, weight] = line.split(',').map(Number);
      return { height, weight };
    })
    .filter(({ height, weight }) => Number.isFinite(height) && Number.isFinite(weight));

  if (rows.length < 2) {
    throw new Error('Training dataset must contain at least two valid rows.');
  }

  const meanWeight = rows.reduce((sum, row) => sum + row.weight, 0) / rows.length;
  const meanHeight = rows.reduce((sum, row) => sum + row.height, 0) / rows.length;
  const covariance = rows.reduce(
    (sum, row) => sum + (row.weight - meanWeight) * (row.height - meanHeight),
    0,
  );
  const variance = rows.reduce(
    (sum, row) => sum + (row.weight - meanWeight) ** 2,
    0,
  );

  if (variance === 0) {
    throw new Error('Training dataset has no weight variance.');
  }

  return {
    slope: covariance / variance,
    intercept: meanHeight - (covariance / variance) * meanWeight,
    sampleCount: rows.length,
  };
}

const regression = loadRegressionModel();

app.use(express.json({ limit: '10kb' }));
app.use(express.static(publicDir));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', model: 'linear-regression', samples: regression.sampleCount });
});

app.post('/predict', (req, res) => {
  const weight = Number(req.body?.weight);

  if (!Number.isFinite(weight) || weight <= 0 || weight > 1000) {
    return res.status(400).json({
      error: 'Enter a weight between 1 and 1000 pounds.',
    });
  }

  const predictedHeight = regression.intercept + regression.slope * weight;

  return res.json({
    weight,
    predicted_height: Number(predictedHeight.toFixed(2)),
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
