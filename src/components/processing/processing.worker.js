import { DelmaResourceCalculatorCore } from 'delma-resource-calculator-core';

self.addEventListener('message', ({ data: { label, ...data } }) => {
    switch (label) {
        case 'run': {
            run(data);
            break;
        }
        default: {
            self.postMessage({ label: 'error', data: 'Unknown message received by worker instance' });
            break;
        }
    }
});

function run({ blueprints, assetLength, calculationAccuracy, cuttingEdge }) {
    new DelmaResourceCalculatorCore(blueprints)
        .setLogger(({ step, error }) => {
            const hasError = typeof error !== 'undefined';
            if (hasError) {
                self.postMessage({ label: 'error', data: error.message });
            } else {
                self.postMessage({ label: 'status', data: step });
            }
        })
        .setAssetLength(assetLength)
        .setCalculationAccuracy(calculationAccuracy)
        .setCuttingEdgeWidth(cuttingEdge)
        .calculate(calculations => {
            self.postMessage({ label: 'calculations', data: calculations });
        })
        .analyze(analysis => {
            self.postMessage({ label: 'analysis', data: analysis });
            self.close();
        });
}
