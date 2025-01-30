// --- Canvas Setup for Heatmap ---
const canvas = document.getElementById('heatmap');
const ctx = canvas.getContext('2d');
const width = canvas.width;
const height = canvas.height;

// --- Function to calculate damage (JavaScript version) ---
function magicDamage(ap, ratio, base) {
    return base + ratio * ap;
}

function postMitigationDamage(ap, mr, ratio, base) {
    const damage = magicDamage(ap, ratio, base);
    return damage * (100 / (100 + mr));
}

function calculateComparison(ap, mr, ratio, base, pen) {
    const r = postMitigationDamage((ap + 130) * 1.3, mr - pen, ratio, base);
    const v = postMitigationDamage(ap + 95, (mr * 0.6) - pen, ratio, base);
    if (r > v) return 1;
    if (r < v) return -1;
    return 0;
}

// --- Parameter Ranges ---
const apValues = [];
for (let ap = 0; ap <= 1000; ap += 5) {
    apValues.push(ap);
}
const mrValues = [];
for (let mr = 50; mr <= 250; mr += 2.5) {
    mrValues.push(mr);
}

// --- Slider Elements ---
const ratioSlider = document.getElementById('ratio-slider');
const baseSlider = document.getElementById('base-slider');
const penSlider = document.getElementById('pen-slider');
const ratioValue = document.getElementById('ratio-value');
const baseValue = document.getElementById('base-value');
const penValue = document.getElementById('pen-value');

// --- Update Function ---
function updateHeatmap() {
    const ratio = parseFloat(ratioSlider.value);
    const base = parseInt(baseSlider.value);
    const pen = parseInt(penSlider.value);

    ratioValue.textContent = ratio.toFixed(1);
    baseValue.textContent = base;
    penValue.textContent = pen;

    const imageData = ctx.createImageData(width, height);
    const data = imageData.data;

    for (let i = 0; i < mrValues.length; i++) {
        for (let j = 0; j < apValues.length; j++) {
            const ap = apValues[j];
            const mr = mrValues[i];
            const result = calculateComparison(ap, mr, ratio, base, pen);

            const x = j / apValues.length * width;
            const y = i / mrValues.length * height;

            let red = 0;
            let green = 0;
            let blue = 0;

            if (result === 1) {
                red = 255; // Rabadon's
            } else if (result === -1) {
                blue = 255; // Void Staff
            } else {
                red = 200
                blue = 200
                green = 200
            }

            const pixelIndex = ((height - 1 - Math.floor(y)) * width + Math.floor(x)) * 4;
            data[pixelIndex] = red;     // Red
            data[pixelIndex + 1] = green; // Green
            data[pixelIndex + 2] = blue;  // Blue
            data[pixelIndex + 3] = 255;   // Alpha (opacity)
        }
    }

    ctx.putImageData(imageData, 0, 0);
}

// --- Event Listeners for Sliders ---
ratioSlider.addEventListener('input', updateHeatmap);
baseSlider.addEventListener('input', updateHeatmap);
penSlider.addEventListener('input', updateHeatmap);

// --- Initial Update ---
updateHeatmap();