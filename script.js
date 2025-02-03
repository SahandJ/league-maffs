function linspace(start, stop, num) {
    const step = (stop - start) / (num - 1);
    const result = [];
    for (let i = start; i <= stop; i += step) {
        result.push(i);
    }
    return result;
}


function calcDmg(ap, enemy_mr, flat_pen, mdBase, mdRatio, tdBase, tdRatio, percentage_pen) {
    let new_mr = (enemy_mr * (1 - percentage_pen)) - flat_pen;

    let magic_damage = mdBase + (mdRatio * ap);
    let post_mitigation_magic_damage = magic_damage * (100 / (100 + new_mr));

    let true_damage = tdBase + (tdRatio * ap)

    return post_mitigation_magic_damage + true_damage;
}

function compareItems(current_dmg, ap, mr, flatPen, mdBase, mdRatio, tdBase, tdRatio, cmp_type, includeGold) {
    let vDmg = calcDmg(ap + 95, mr, flatPen, mdBase, mdRatio, tdBase, tdRatio, 0.4)
    let rDmg = calcDmg((ap + 130) * 1.3, mr, flatPen, mdBase, mdRatio, tdBase, tdRatio, 0)


    const vDmgPerGold = vDmg / 3000;
    const rDmgPerGold = rDmg / 3600;

    let diff;
    if (includeGold) {
        diff = (vDmgPerGold * vDmg) - (rDmgPerGold * rDmg)
    } else {
        diff = vDmg - rDmg
    }

    if (cmp_type === "percentage") {
        return diff / current_dmg * 100
    } else {
        return diff
    }
}

const apValues = linspace(0, 500, 200)
const mrValues = linspace(30, 200, 200);


function updatePlot() {
    const flatPen = parseFloat(document.getElementById("flatPen").value);

    // Magic Damage Sliders
    const mdRatio = parseFloat(document.getElementById("md-ratio").value);
    const mdBase = parseFloat(document.getElementById("md-base").value);

    // True Damage Sliders
    const tdRatio = parseFloat(document.getElementById("td-ratio").value);
    const tdBase = parseFloat(document.getElementById("td-base").value);

    const includeGold = document.querySelector('input[name="gold"]').checked
    const compareType = document.querySelector('input[name="cmpType"]:checked').value;

    let minDiff = Infinity;
    let maxDiff = -Infinity;
    // Calculate the result matrix
    const resultMatrix = mrValues.map(mr =>
        apValues.map(ap => {
            const current = calcDmg(ap, mr, flatPen, mdBase, mdRatio, tdBase, tdRatio, 0)
            const diff = compareItems(current, ap, mr, flatPen, mdBase, mdRatio, tdBase, tdRatio, compareType, includeGold);
            minDiff = Math.min(minDiff, diff);
            maxDiff = Math.max(maxDiff, diff);
            return diff
        })
    )

    // Too lazy to fix colouring
    // Ensure that there's always a neg/pos value for zmin/zmax to maintain color legend
    const zmin = Math.min(minDiff, 0);
    const zmax = Math.max(maxDiff, 0);

    // Determine zeroOffset so that it's always white
    let zeroOffset = (-zmin / (zmax - zmin))

    // Create the Plotly heatmap trace
    const data = [{
        z: resultMatrix,
        x: apValues,
        y: mrValues,
        type: 'heatmap',
        colorscale: [
            [0, 'rgb(255, 0, 0)'],       // Red for Rabadon's
            [zeroOffset, 'rgb(255, 255, 255)'], // White at 0
            [1, 'rgb(0, 0, 255)'],       // Blue for Void Staff
        ],
        reversescale: false,
        zmin: zmin,
        zmax: zmax,
        colorbar: {
            len: 1.05
        }
    }];

    const layout = {
        xaxis: {title: 'AP'},
        yaxis: {title: 'MR'},
        autosize: true,
        margin: {
            l: 50,
            r: 50,
            b: 50,
            t: 50,
            pad: 4
        }
    };

    Plotly.newPlot('plot', data, layout);
}

function resizeSliders() {
    const plot = document.getElementById('plot');
    const sliders = document.querySelector('.sliders');

    if (plot && sliders) {
        const plotWidth = plot.offsetWidth;
        sliders.style.width = `${plotWidth}px`;
    }
}

// Initialize Plotly plot
updatePlot();


// Add event listeners to radio buttons
document.querySelectorAll('input[name="cmpType"]').forEach(radio => {
    radio.addEventListener('change', updatePlot);
});

// Add event listeners to sliders
["flatPen", "md-base", "md-ratio", "td-base", "td-ratio"].forEach(inputId => {
    const input = document.getElementById(inputId);
    const valueDisplay = document.getElementById(`${inputId}-value`);

    if (valueDisplay) {
        input.addEventListener('input', () => {
            valueDisplay.textContent = input.value;
            updatePlot();
        });
    } else {
        input.addEventListener('input', updatePlot);
    }
});

document.querySelector('input[name="gold"]').addEventListener('change', updatePlot);

// Call resizeSliders initially and on window resize
resizeSliders();
window.addEventListener('resize', resizeSliders);