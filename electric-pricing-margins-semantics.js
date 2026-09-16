/* Bruno Electric — Pricing & Margins unresolved-cost takeover.
 * Active UI contract:
 * - blank/missing Your Cost => UNRESOLVED (never Customer Price, never numeric zero)
 * - explicit numeric 0 => known zero
 * - positive finite numeric => known cost
 *
 * This module takes ownership of Pricing & Margins derived display after the legacy
 * inline renderer runs, and capture-guards Your Cost / discount inputs so legacy
 * fallback math cannot re-resolve an unresolved row.
 */
(function (root) {
  'use strict';

  var JOB_KEY = 'bruno-electric-v1';
  var PRIMARY_COST_MAP_KEY = 'bruno-electric-catalog-costs-v1';
  var renderQueued = false;
  var rendering = false;

  function parseKnownCost(raw) {
    if (raw == null || String(raw).trim() === '') return { known: false, value: null };
    var n = Number(raw);
    if (!Number.isFinite(n) || n < 0) return { known: false, value: null };
    return { known: true, value: Math.round(n * 100) / 100 };
  }

  function deriveRow(c) {
    c = c || {};
    var cust = Number(c.unitCost);
    if (!Number.isFinite(cust) || cust < 0) cust = 0;
    var k = parseKnownCost(c.yourCost);
    if (!k.known) {
      return {
        customerPrice: cust,
        yourCostKnown: false,
        yourCost: null,
        grossDifference: null,
        marginPct: null,
        status: 'UNRESOLVED'
      };
    }
    var diff = cust - k.value;
    var pct = cust > 0 ? (diff / cust) * 100 : 0;
    return {
      customerPrice: cust,
      yourCostKnown: true,
      yourCost: k.value,
      grossDifference: diff,
      marginPct: pct,
      status: 'RESOLVED'
    };
  }

  function aggregate(rows) {
    rows = Array.isArray(rows) ? rows : [];
    var out = {
      customerTotal: 0,
      resolvedCustomerTotal: 0,
      resolvedCostTotal: 0,
      resolvedGrossDifference: 0,
      resolvedMarginPct: null,
      resolvedCount: 0,
      unresolvedCount: 0
    };
    for (var i = 0; i < rows.length; i++) {
      var d = deriveRow(rows[i]);
      out.customerTotal += d.customerPrice;
      if (!d.yourCostKnown) {
        out.unresolvedCount++;
        continue;
      }
      out.resolvedCount++;
      out.resolvedCustomerTotal += d.customerPrice;
      out.resolvedCostTotal += d.yourCost;
      out.resolvedGrossDifference += d.grossDifference;
    }
    if (out.resolvedCustomerTotal > 0) {
      out.resolvedMarginPct = (out.resolvedGrossDifference / out.resolvedCustomerTotal) * 100;
    } else if (out.resolvedCount > 0) {
      out.resolvedMarginPct = 0;
    }
    return out;
  }

  function money(n) {
    n = Number(n);
    if (!Number.isFinite(n)) n = 0;
    return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function readJob() {
    try {
      var x = JSON.parse(root.localStorage.getItem(JOB_KEY) || 'null');
      return x && typeof x === 'object' && !Array.isArray(x) ? x : null;
    } catch (e) {
      return null;
    }
  }

  function writeJob(job) {
    try { root.localStorage.setItem(JOB_KEY, JSON.stringify(job)); return true; }
    catch (e) { return false; }
  }

  function catalogRow(job, id) {
    var cat = job && Array.isArray(job.catalog) ? job.catalog : [];
    for (var i = 0; i < cat.length; i++) {
      if (cat[i] && String(cat[i].id) === String(id)) return cat[i];
    }
    return null;
  }

  function readMap(key) {
    try {
      var x = JSON.parse(root.localStorage.getItem(key) || '{}');
      return x && typeof x === 'object' && !Array.isArray(x) ? x : {};
    } catch (e) { return {}; }
  }

  function allCostMapKeys() {
    var keys = {};
    keys[PRIMARY_COST_MAP_KEY] = true;
    try {
      for (var i = 0; i < root.localStorage.length; i++) {
        var k = root.localStorage.key(i);
        if (k && /-catalog-costs-v1$/.test(k)) keys[k] = true;
      }
    } catch (e) {}
    return Object.keys(keys);
  }

  function updateCostMaps(id, parsed) {
    var keys = allCostMapKeys();
    for (var i = 0; i < keys.length; i++) {
      var key = keys[i];
      var m = readMap(key);
      if (Object.prototype.hasOwnProperty.call(m, String(id))) delete m[String(id)];
      if (parsed.known && key === PRIMARY_COST_MAP_KEY) m[String(id)] = parsed.value;
      try { root.localStorage.setItem(key, JSON.stringify(m)); } catch (e) {}
    }
  }

  function persistYourCost(id, raw) {
    var parsed = parseKnownCost(raw);
    var job = readJob();
    var row = catalogRow(job, id);
    if (!job || !row) return parsed;
    row.yourCost = parsed.known ? parsed.value : '';
    writeJob(job);
    updateCostMaps(id, parsed);
    return parsed;
  }

  function persistDiscount(id, rawPct) {
    if (rawPct == null || String(rawPct).trim() === '') return persistYourCost(id, '');
    var pct = Number(rawPct);
    if (!Number.isFinite(pct)) return persistYourCost(id, '');
    pct = Math.max(0, Math.min(100, pct));
    var job = readJob();
    var row = catalogRow(job, id);
    if (!job || !row) return { known: false, value: null };
    var cust = Number(row.unitCost);
    if (!Number.isFinite(cust) || cust < 0) cust = 0;
    var cost = Math.round(cust * (1 - pct / 100) * 100) / 100;
    row.yourCost = cost;
    writeJob(job);
    var parsed = { known: true, value: cost };
    updateCostMaps(id, parsed);
    return parsed;
  }

  function setText(id, text, unresolved) {
    var el = root.document && root.document.getElementById ? root.document.getElementById(id) : null;
    if (!el) return;
    el.textContent = text;
    if (unresolved) el.setAttribute('data-cost-state', 'partial-unresolved');
    else el.removeAttribute('data-cost-state');
  }

  function patchRow(tr, c) {
    var d = deriveRow(c);
    var your = tr.querySelector('.mrg-your');
    var pctInput = tr.querySelector('.mrg-pct');
    var cells = tr.querySelectorAll('td');
    tr.setAttribute('data-cost-state', d.yourCostKnown ? 'resolved' : 'unresolved');

    if (!d.yourCostKnown) {
      if (your && root.document.activeElement !== your) your.value = '';
      if (your) {
        your.placeholder = 'Unresolved';
        your.setAttribute('data-cost-state', 'unresolved');
        your.setAttribute('aria-label', 'Your cost — unresolved');
      }
      if (pctInput && root.document.activeElement !== pctInput) pctInput.value = '';
      if (pctInput) {
        pctInput.placeholder = 'Unresolved';
        pctInput.setAttribute('data-cost-state', 'unresolved');
        pctInput.setAttribute('aria-label', 'Discount / margin — unresolved until Your Cost is known');
      }
      if (cells.length >= 7) {
        cells[cells.length - 2].textContent = 'Unresolved';
        cells[cells.length - 1].textContent = 'Unresolved';
        cells[cells.length - 2].setAttribute('data-cost-state', 'unresolved');
        cells[cells.length - 1].setAttribute('data-cost-state', 'unresolved');
      }
      return d;
    }

    if (your && root.document.activeElement !== your) your.value = String(d.yourCost);
    if (your) {
      your.removeAttribute('placeholder');
      your.setAttribute('data-cost-state', 'resolved');
      your.setAttribute('aria-label', 'Your cost');
    }
    if (pctInput && root.document.activeElement !== pctInput) pctInput.value = String(Math.round(d.marginPct * 10) / 10);
    if (pctInput) {
      pctInput.removeAttribute('placeholder');
      pctInput.setAttribute('data-cost-state', 'resolved');
      pctInput.setAttribute('aria-label', 'Discount / margin percent');
    }
    if (cells.length >= 7) {
      cells[cells.length - 2].textContent = money(d.grossDifference);
      cells[cells.length - 1].textContent = (Math.round(d.marginPct * 10) / 10) + '%';
      cells[cells.length - 2].setAttribute('data-cost-state', 'resolved');
      cells[cells.length - 1].setAttribute('data-cost-state', 'resolved');
    }
    return d;
  }

  function renderActiveMargins() {
    if (rendering || !root.document) return;
    var body = root.document.getElementById('margins-body');
    if (!body) return;
    var job = readJob();
    if (!job || !Array.isArray(job.catalog)) return;
    var byId = {};
    for (var i = 0; i < job.catalog.length; i++) {
      var c = job.catalog[i];
      if (c && c.id != null) byId[String(c.id)] = c;
    }

    rendering = true;
    try {
      var trs = body.querySelectorAll('tr[data-id]');
      var visible = [];
      for (var j = 0; j < trs.length; j++) {
        var id = String(trs[j].getAttribute('data-id') || '');
        var row = byId[id];
        if (!row) continue;
        visible.push(row);
        patchRow(trs[j], row);
      }
      var a = aggregate(visible);
      setText('mrg-cust-sum', money(a.customerTotal), a.unresolvedCount > 0);
      if (a.unresolvedCount > 0) {
        setText('mrg-cost-sum', money(a.resolvedCostTotal) + ' resolved · ' + a.unresolvedCount + ' unresolved', true);
        setText('mrg-diff-sum', money(a.resolvedGrossDifference) + ' resolved · ' + a.unresolvedCount + ' unresolved', true);
        setText('mrg-pct-sum', (a.resolvedMarginPct == null ? '—' : (Math.round(a.resolvedMarginPct * 10) / 10) + '%') + ' resolved · ' + a.unresolvedCount + ' unresolved', true);
      } else {
        setText('mrg-cost-sum', money(a.resolvedCostTotal), false);
        setText('mrg-diff-sum', money(a.resolvedGrossDifference), false);
        setText('mrg-pct-sum', a.resolvedMarginPct == null ? '—' : (Math.round(a.resolvedMarginPct * 10) / 10) + '%', false);
      }
      var panel = root.document.getElementById('panel-margins');
      if (panel) {
        panel.setAttribute('data-pricing-margins-runtime', 'strict-v1');
        panel.setAttribute('data-unresolved-count', String(a.unresolvedCount));
      }
    } finally {
      rendering = false;
    }
  }

  function queueRender() {
    if (renderQueued) return;
    renderQueued = true;
    var run = function () { renderQueued = false; renderActiveMargins(); };
    if (typeof root.queueMicrotask === 'function') root.queueMicrotask(run);
    else root.setTimeout(run, 0);
  }

  function rowIdFromTarget(t) {
    var tr = t && t.closest ? t.closest('tr[data-id]') : null;
    return tr ? String(tr.getAttribute('data-id') || '') : '';
  }

  function captureMarginEdit(e) {
    var t = e && e.target;
    if (!t || !t.classList) return;
    var isYour = t.classList.contains('mrg-your');
    var isPct = t.classList.contains('mrg-pct');
    if (!isYour && !isPct) return;
    var id = rowIdFromTarget(t);
    if (!id) return;

    // Own these two edit paths completely; the legacy bubbling handler contains
    // blank=>Customer Price/0 fallback semantics and must not run.
    if (e.stopImmediatePropagation) e.stopImmediatePropagation();
    if (isYour) persistYourCost(id, t.value);
    else persistDiscount(id, t.value);
    queueRender();

    // Sync the inline app's closed-over state on commit without allowing an
    // intermediate misleading numeric render.
    if (e.type === 'change' && root.location && typeof root.location.reload === 'function') {
      root.setTimeout(function () { root.location.reload(); }, 0);
    }
  }

  function install() {
    if (!root.document) return;
    root.document.addEventListener('input', captureMarginEdit, true);
    root.document.addEventListener('change', captureMarginEdit, true);
    var body = root.document.getElementById('margins-body');
    if (body && root.MutationObserver) {
      var mo = new root.MutationObserver(function () { if (!rendering) queueRender(); });
      mo.observe(body, { childList: true, subtree: true, characterData: true });
    }
    renderActiveMargins();
    root.setTimeout(renderActiveMargins, 0);
    root.setTimeout(renderActiveMargins, 100);
  }

  root.BrunoPricingMarginsSemantics = Object.freeze({
    parseKnownCost: parseKnownCost,
    deriveRow: deriveRow,
    aggregate: aggregate,
    persistYourCost: persistYourCost,
    persistDiscount: persistDiscount,
    render: renderActiveMargins,
    version: 'strict-v1'
  });

  if (root.document) {
    if (root.document.readyState === 'loading') root.document.addEventListener('DOMContentLoaded', install, { once: true });
    else install();
  }
})(typeof window !== 'undefined' ? window : globalThis);
