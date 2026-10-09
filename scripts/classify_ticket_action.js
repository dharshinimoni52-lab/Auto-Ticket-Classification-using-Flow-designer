/**
 * Script step for the "Classify Ticket" custom action (Flow Designer).
 * Inputs : inputs.short_description, inputs.description
 * Outputs: outputs.category, outputs.subcategory,
 *          outputs.assignment_group (sys_id), outputs.confidence (0-100)
 *
 * Scoring: each active rule whose keyword appears in the ticket text adds its
 * weight to its category|subcategory bucket. The highest bucket wins.
 * confidence = winning score / total matched weight * 100
 */
(function execute(inputs, outputs) {
    var text = ((inputs.short_description || '') + ' ' +
                (inputs.description || '')).toLowerCase();
    var buckets = {};
    var total = 0;

    var gr = new GlideRecord('u_ticket_keyword_rule');
    gr.addQuery('u_active', true);
    gr.query();
    while (gr.next()) {
        var kw = (gr.getValue('u_keyword') || '').toLowerCase();
        if (!kw || text.indexOf(kw) === -1) continue;

        var w = parseInt(gr.getValue('u_weight'), 10) || 1;
        var key = gr.getValue('u_category') + '|' + gr.getValue('u_subcategory');
        if (!buckets[key]) {
            buckets[key] = { score: 0, group: gr.getValue('u_assignment_group') };
        }
        buckets[key].score += w;
        total += w;
    }

    var best = null, bestKey = '';
    for (var k in buckets) {
        if (!best || buckets[k].score > best.score) {
            best = buckets[k];
            bestKey = k;
        }
    }

    if (best) {
        var parts = bestKey.split('|');
        outputs.category = parts[0];
        outputs.subcategory = parts[1];
        outputs.assignment_group = best.group;
        outputs.confidence = Math.round((best.score / total) * 100);
    } else {
        outputs.category = '';
        outputs.subcategory = '';
        outputs.assignment_group = '';
        outputs.confidence = 0;
    }
})(inputs, outputs);
