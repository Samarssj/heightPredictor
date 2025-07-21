const express = require('express');
const bodyParser = require('body-parser');
const { exec } = require('child_process');
const path = require('path');

const app = express();
app.use(bodyParser.json());
app.use(express.static('public')); // to serve frontend

app.post('/predict', (req, res) => {
    const weight = req.body.weight;

    exec(`python model.py ${weight}`, (err, stdout, stderr) => {
        if (err) {
            console.error('Error:', stderr);
            return res.status(500).json({ error: 'Prediction failed' });
        }
        res.json({ predicted_height: stdout.trim() });
    });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
