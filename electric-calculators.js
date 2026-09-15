/* Bruno Electric — modular calculator engine, Phase 1. */
(function (root) {
  'use strict';
  const R = root.BrunoElectricalRules;
  if (!R) throw new Error('BrunoElectricalRules must load before electric-calculators.js');

  function n(v, name) {
    const x = Number(v);
    if (!Number.isFinite(x)) throw new Error((name || 'value') + ' must be numeric');
    return x;
  }
  function positive(v, name, allowZero) {
    const x = n(v, name);
    if (allowZero ? x < 0 : x <= 0) throw new Error((name || 'value') + (allowZero ? ' must be >= 0' : ' must be > 0'));
    return x;
  }
  function round(v, places) { const p = Math.pow(10, places == null ? 2 : places); return Math.round((v + Number.EPSILON) * p) / p; }
  function tempFactor(tempRating, ambientC) {
    const rows = R.TEMP_FACTORS[tempRating];
    if (!rows) throw new Error('Unsupported conductor temperature rating');
    const a = n(ambientC, 'ambient temperature');
    if (a > rows[rows.length - 1][0]) throw new Error('Ambient temperature is outside the Phase 1 correction table range');
    for (let i = 0; i < rows.length; i++) if (a <= rows[i][0]) return rows[i][1];
    return rows[rows.length - 1][1];
  }
  function cccFactor(count) {
    const c = positive(count, 'current-carrying conductor count');
    const hit = R.CCC_FACTORS.find(x => c >= x.min && c <= x.max);
    return hit ? hit.factor : 1;
  }
  function tempIndex(rating) { return rating === 60 ? 0 : rating === 75 ? 1 : rating === 90 ? 2 : -1; }

  function ampacity(input) {
    const material = input.material === 'Al' ? 'Al' : 'Cu';
    const size = String(input.size || '');
    const insulationRating = Number(input.insulationRating || 90);
    const terminalRating = Number(input.terminalRating || 75);
    const row = R.AMPACITY[material] && R.AMPACITY[material][size];
    if (!row) throw new Error('Unsupported conductor size/material in Phase 1');
    const ii = tempIndex(insulationRating), ti = tempIndex(terminalRating);
    if (ii < 0 || ti < 0) throw new Error('Temperature rating must be 60, 75, or 90°C');
    const base = row[ii];
    const tf = tempFactor(insulationRating, input.ambientC == null ? 30 : input.ambientC);
    const cf = cccFactor(input.ccc == null ? 3 : input.ccc);
    const adjusted = base * tf * cf;
    const terminalLimit = row[ti];
    const finalAllowable = Math.min(adjusted, terminalLimit);
    const load = positive(input.loadAmps, 'load amps', true);
    const required = load * (input.continuous ? 1.25 : 1);
    return {
      module:'ampacity', status: finalAllowable + 1e-9 >= required ? 'PASS' : 'FAIL',
      inputs:Object.assign({}, input),
      steps:[
        {label:'Table 310.16 base ampacity', value:base, unit:'A', status:'Code Required'},
        {label:'Ambient correction factor', value:tf, status:'Code Required'},
        {label:'CCC adjustment factor', value:cf, status:'Code Required'},
        {label:'Adjusted ampacity before terminal limit', value:round(adjusted), unit:'A', status:'Code Required'},
        {label:'Terminal temperature limit', value:terminalLimit, unit:'A', status:'Code Required'},
        {label:'Final allowable ampacity', value:round(finalAllowable), unit:'A', status:'Code Required'},
        {label: input.continuous ? 'Required ampacity (125% continuous load)' : 'Required ampacity', value:round(required), unit:'A', status:'Code Required'}
      ],
      result:{baseAmpacity:base,tempFactor:tf,cccFactor:cf,adjustedAmpacity:round(adjusted),terminalLimit,finalAllowableAmpacity:round(finalAllowable),requiredAmpacity:round(required)},
      reference:R.REFERENCES.ampacity,
      warnings:[
        'Verify conductor type is permitted for the installation and wet/dry location.',
        'Small-conductor overcurrent protection rules and equipment-specific articles can further limit conductor/OCPD selection.',
        'This Phase 1 module does not cover parallel conductors, rooftop adders, cable-specific ampacity tables, dwelling service allowances, or engineered installations.'
      ]
    };
  }

  function voltageDrop(input) {
    const material = input.material === 'Al' ? 'Al' : 'Cu';
    const size = String(input.size || '');
    const cmil = R.CMIL[size];
    if (!cmil) throw new Error('Unsupported conductor size');
    const voltage = positive(input.voltage, 'voltage');
    const amps = positive(input.current, 'current', true);
    const distance = positive(input.distanceFt, 'one-way distance', true);
    const phase = input.phase === '3' || input.phase === 3 ? 3 : 1;
    const pf = input.powerFactor == null ? 1 : positive(input.powerFactor, 'power factor');
    if (pf > 1) throw new Error('Power factor cannot exceed 1');
    const K = material === 'Al' ? 21.2 : 12.9;
    const multiplier = phase === 3 ? Math.sqrt(3) : 2;
    const drop = multiplier * K * amps * distance * pf / cmil;
    const pct = voltage ? drop / voltage * 100 : 0;
    const atLoad = voltage - drop;
    const target = Number(input.targetPct || 3);
    return {
      module:'voltageDrop', status:pct <= target ? 'PASS' : 'REVIEW',
      steps:[
        {label:'Method',value:(phase === 3 ? '√3' : '2') + ' × K × I × L × PF ÷ CM',status:'Estimating Assumption'},
        {label:'Conductor constant K',value:K,status:'Estimating Assumption'},
        {label:'Voltage dropped',value:round(drop),unit:'V',status:'Recommended'},
        {label:'Voltage drop',value:round(pct),unit:'%',status:'Recommended'},
        {label:'Voltage at load',value:round(atLoad),unit:'V',status:'Recommended'}
      ],
      result:{voltsDropped:round(drop),percentDropped:round(pct),voltageAtLoad:round(atLoad),targetPct:target},
      reference:R.REFERENCES.voltageDrop,
      warnings:['Voltage-drop percentages in this tool are design recommendations unless a specific NEC rule/equipment requirement makes a limit mandatory.','K-method is a practical estimating approximation; use impedance/reactance or engineering methods where needed.']
    };
  }

  function conduitFill(input) {
    const racewayType = input.racewayType || 'EMT';
    const tradeSize = String(input.tradeSize || '');
    const racewayArea = R.RACEWAY_AREA[racewayType] && R.RACEWAY_AREA[racewayType][tradeSize];
    if (!racewayArea) throw new Error('Unsupported raceway type/trade size in Phase 1');
    const rows = Array.isArray(input.conductors) ? input.conductors : [];
    if (!rows.length) throw new Error('Add at least one conductor row');
    let qty = 0, used = 0;
    const breakdown = rows.map(function (r) {
      const q = positive(r.qty, 'conductor quantity');
      const size = String(r.size || '');
      const area = R.THHN_AREA[size];
      if (!area) throw new Error('Unsupported THHN/THWN-2 conductor size: ' + size);
      qty += q; used += area * q;
      return {size,qty:q,eachArea:area,totalArea:round(area*q,4)};
    });
    const allowedPct = qty === 1 ? 53 : qty === 2 ? 31 : 40;
    const allowedArea = racewayArea * allowedPct / 100;
    const usedPct = used / racewayArea * 100;
    return {
      module:'conduitFill', status:used <= allowedArea + 1e-12 ? 'PASS' : 'FAIL',
      steps:[
        {label:'Raceway internal area',value:racewayArea,unit:'in²',status:'Code Required'},
        {label:'Total conductor occupied area',value:round(used,4),unit:'in²',status:'Code Required'},
        {label:'Allowed fill',value:allowedPct,unit:'%',status:'Code Required'},
        {label:'Used fill',value:round(usedPct,2),unit:'%',status:'Code Required'}
      ],
      breakdown,
      result:{conductorCount:qty,racewayArea,totalConductorArea:round(used,4),allowedFillPct:allowedPct,allowedArea:round(allowedArea,4),usedFillPct:round(usedPct,2),remainingArea:round(Math.max(0,allowedArea-used),4)},
      reference:R.REFERENCES.conduitFill,
      warnings:['Phase 1 supports THHN/THWN-2 conductor areas and common EMT/PVC Schedule 40 sizes only. Mixed insulation types require their own Chapter 9 Table 5 dimensions.','Raceway fill is separate from ampacity adjustment, nipple rules, conductor bending, pulling practicality, and equipment listing.']
    };
  }

  function boxFill(input) {
    const size = String(input.size || '12');
    const allowance = R.BOX_FILL[size];
    if (!allowance) throw new Error('Unsupported conductor gauge for box fill');
    const insulated = positive(input.insulatedCount || 0, 'insulated conductor count', true);
    const grounds = positive(input.groundCount || 0, 'ground count', true);
    const yokes = positive(input.yokeCount || 0, 'device/yoke count', true);
    const clamps = input.internalClamp ? 1 : 0;
    // Simplified same-gauge model: grounds together count as one conductor volume; each yoke = two conductor volumes.
    const conductorUnits = insulated;
    const groundUnits = grounds > 0 ? 1 : 0;
    const yokeUnits = yokes * 2;
    const clampUnits = clamps;
    const totalUnits = conductorUnits + groundUnits + yokeUnits + clampUnits;
    const required = totalUnits * allowance;
    const available = positive(input.boxVolume, 'box volume');
    return {
      module:'boxFill', status:available + 1e-9 >= required ? 'PASS' : 'FAIL',
      steps:[
        {label:'Volume allowance per conductor unit',value:allowance,unit:'in³',status:'Code Required'},
        {label:'Insulated conductor units',value:conductorUnits,status:'Code Required'},
        {label:'Equipment grounding conductor units',value:groundUnits,status:'Code Required'},
        {label:'Device/yoke units',value:yokeUnits,status:'Code Required'},
        {label:'Internal clamp units',value:clampUnits,status:'Code Required'},
        {label:'Required box volume',value:round(required),unit:'in³',status:'Code Required'},
        {label:'Available box volume',value:round(available),unit:'in³',status:'User Input'}
      ],
      result:{allowance,totalUnits,requiredVolume:round(required),availableVolume:round(available),remainingVolume:round(available-required)},
      reference:R.REFERENCES.boxFill,
      warnings:['Phase 1 same-gauge model only. Mixed conductor sizes, multiple EGC sizes, barriers, fittings, terminal blocks, cable clamps, luminaire studs/hickeys, and special box provisions require a detailed calculation.']
    };
  }

  function transformerCurrent(input) {
    const kva = positive(input.kva, 'kVA');
    const phase = input.phase === '3' || input.phase === 3 ? 3 : 1;
    const pv = positive(input.primaryVoltage, 'primary voltage');
    const sv = positive(input.secondaryVoltage, 'secondary voltage');
    const factor = phase === 3 ? Math.sqrt(3) : 1;
    const primary = kva * 1000 / (factor * pv);
    const secondary = kva * 1000 / (factor * sv);
    return {module:'transformerCurrent',status:'INFO',steps:[{label:'Primary current',value:round(primary),unit:'A',status:'Code/Design Input'},{label:'Secondary current',value:round(secondary),unit:'A',status:'Code/Design Input'}],result:{primaryAmps:round(primary),secondaryAmps:round(secondary)},warnings:['Current calculation only. Transformer OCPD, conductor sizing, grounding/bonding, secondary conductor protection and uncommon protection arrangements are intentionally not automated in Phase 1.']};
  }

  root.BrunoElectricalCalc = Object.freeze({ampacity, voltageDrop, conduitFill, boxFill, transformerCurrent, _test:{tempFactor,cccFactor}});
})(window);
