// Κοινός ορισμός των πεδίων "Προσλήψεις" — χρησιμοποιείται και από το index.html (φόρμα
// υποβολής/επεξεργασίας του αιτούντα) και από το admin.html (πλήρης προβολή/επεξεργασία από τον admin),
// ώστε να μην υπάρχουν δύο ξεχωριστές, πιθανόν ασύμβατες, εκδοχές της ίδιας φόρμας.
// Απαιτεί να υπάρχει ήδη global συνάρτηση escapeHtml(str) στη σελίδα που το φορτώνει.
//
// Χωρισμένο σε δύο ομάδες πεδίων:
//  - personalFields/collectPersonal: τα συμπληρώνει/επεξεργάζεται ο ίδιος ο αιτών.
//  - hireFields/collectHire: "Στοιχεία πρόσληψης" (ημ/νία πρόσληψης, ειδικότητα, σύμβαση, ωράριο) —
//    τα συμπληρώνει αποκλειστικά ο admin, ο αιτών δεν τα βλέπει καθόλου.
//
// Τα πεδία εμφανίζονται σε καρτέλες (tabs) ώστε να μη χρειάζεται scroll για να τα συμπληρώσεις όλα —
// βλ. renderTabs() παρακάτω. Ο χειρισμός του κλικ πάνω στις καρτέλες γίνεται εδώ, με ένα και μόνο
// delegated listener στο document, ώστε να δουλεύει και στο index.html και στο admin.html χωρίς
// επιπλέον κώδικα σε καθεμία σελίδα.

window.PROSLIPSEIS_FIELDS = {
  _personalGroups(data = {}) {
    const v = (k) => escapeHtml(data[k] || "");
    const selOpt = (label, key) => `<option ${data[key] === label ? "selected" : ""}>${label}</option>`;
    // Κενή πρώτη επιλογή σε κάθε select — χωρίς αυτήν το πρόγραμμα περιήγησης επιλέγει μόνο του την
    // πρώτη επιλογή, οπότε το πεδίο φαίνεται "συμπληρωμένο" (και η καρτέλα πράσινη) χωρίς ο χρήστης
    // να έχει διαλέξει τίποτα.
    const blankOpt = (key) => `<option value="" ${data[key] ? "" : "selected"}>Επιλέξτε...</option>`;
    return [
      {
        label: "Γέννηση",
        html: `
          <div class="row2">
            <div><label>Όνομα πατρός</label><input type="text" id="f_p_father" value="${v("Όνομα πατρός")}" /></div>
            <div><label>Όνομα μητρός</label><input type="text" id="f_p_mother" value="${v("Όνομα μητρός")}" /></div>
          </div>
          <div class="row2">
            <div><label>Τόπος γέννησης</label><input type="text" id="f_p_birthplace" value="${v("Τόπος γέννησης")}" /></div>
            <div><label>Ημερομηνία γέννησης</label><input type="date" id="f_p_birthdate" value="${v("Ημερομηνία γέννησης")}" /></div>
          </div>
        `,
      },
      {
        label: "Ιθαγένεια",
        html: `
          <label>Ιθαγένεια</label>
          <select id="f_p_citizenship">
            ${blankOpt("Ιθαγένεια")}
            ${selOpt("Έλληνας/ίδα", "Ιθαγένεια")}
            ${selOpt("Πολίτης ΕΟΚ", "Ιθαγένεια")}
            ${selOpt("Πολίτης εκτός ΕΟΚ", "Ιθαγένεια")}
          </select>
        `,
      },
      {
        label: "Διεύθυνση",
        html: `
          <label>Διεύθυνση κατοικίας</label>
          <input type="text" id="f_p_address" value="${v("Διεύθυνση")}" />
          <div class="row2">
            <div><label>Τ.Κ.</label><input type="text" id="f_p_tk" value="${v("Τ.Κ.")}" /></div>
            <div><label>Δήμος</label><input type="text" id="f_p_dimos" value="${v("Δήμος")}" /></div>
          </div>
        `,
      },
      {
        label: "Οικογένεια",
        html: `
          <div class="row2">
            <div>
              <label>Οικογενειακή κατάσταση</label>
              <select id="f_p_marital">
                ${blankOpt("Οικογενειακή κατάσταση")}
                ${selOpt("Άγαμος/η", "Οικογενειακή κατάσταση")}
                ${selOpt("Έγγαμος/η", "Οικογενειακή κατάσταση")}
                ${selOpt("Διαζευγμένος/η", "Οικογενειακή κατάσταση")}
                ${selOpt("Χήρος/α", "Οικογενειακή κατάσταση")}
              </select>
            </div>
            <div><label>Τέκνα έως 18 ετών</label><input type="number" id="f_p_children" min="0" value="${v("Τέκνα έως 18")}" /></div>
          </div>
        `,
      },
      {
        label: "Μητρώο",
        html: `
          <div class="row2">
            <div><label>Α.Φ.Μ.</label><input type="text" id="f_p_afm" value="${v("Α.Φ.Μ.")}" /></div>
            <div><label>Α.Μ.Κ.Α.</label><input type="text" id="f_p_amka" value="${v("Α.Μ.Κ.Α.")}" /></div>
          </div>
          <label>Αριθμός Μητρώου ΙΚΑ/ΕΦΚΑ (Α.Μ.Α.)</label>
          <input type="text" id="f_p_ama" value="${v("Α.Μ.Α.")}" />
          <label>Εκπαίδευση</label>
          <select id="f_p_education">
            ${blankOpt("Εκπαίδευση")}
            ${selOpt("Δημοτικό", "Εκπαίδευση")}
            ${selOpt("Γυμνάσιο", "Εκπαίδευση")}
            ${selOpt("Λύκειο", "Εκπαίδευση")}
            ${selOpt("ΑΕΙ/ΑΤΕΙ", "Εκπαίδευση")}
            ${selOpt("Μεταπτυχιακό", "Εκπαίδευση")}
            ${selOpt("ΙΕΚ", "Εκπαίδευση")}
            ${selOpt("Άλλο", "Εκπαίδευση")}
          </select>
        `,
      },
    ];
  },

  // Καρτέλες + περιεχόμενο καρτελών από έναν πίνακα ομάδων [{label, html}, ...].
  // idPrefix ξεχωρίζει τα ids όταν στην ίδια σελίδα υπάρχουν δύο ανεξάρτητα σετ καρτελών.
  _renderTabs(groups, idPrefix) {
    return `
      <div class="field-tabs">
        <div class="tab-bar" role="tablist">
          ${groups.map((g, i) => `<button type="button" class="tab-btn${i === 0 ? " active" : ""}" role="tab" data-tab-target="${idPrefix}-panel-${i}">${g.label}</button>`).join("")}
        </div>
        ${groups.map((g, i) => `<div class="tab-panel${i === 0 ? " active" : ""}" role="tabpanel" id="${idPrefix}-panel-${i}">${g.html}</div>`).join("")}
      </div>
    `;
  },

  personalFields(data = {}) {
    return this._renderTabs(this._personalGroups(data), "pf");
  },

  collectPersonal() {
    return {
      "Όνομα πατρός": document.getElementById("f_p_father").value,
      "Όνομα μητρός": document.getElementById("f_p_mother").value,
      "Τόπος γέννησης": document.getElementById("f_p_birthplace").value,
      "Ημερομηνία γέννησης": document.getElementById("f_p_birthdate").value,
      "Ιθαγένεια": document.getElementById("f_p_citizenship").value,
      "Διεύθυνση": document.getElementById("f_p_address").value,
      "Τ.Κ.": document.getElementById("f_p_tk").value,
      "Δήμος": document.getElementById("f_p_dimos").value,
      "Οικογενειακή κατάσταση": document.getElementById("f_p_marital").value,
      "Τέκνα έως 18": document.getElementById("f_p_children").value,
      "Α.Φ.Μ.": document.getElementById("f_p_afm").value,
      "Α.Μ.Κ.Α.": document.getElementById("f_p_amka").value,
      "Α.Μ.Α.": document.getElementById("f_p_ama").value,
      "Εκπαίδευση": document.getElementById("f_p_education").value,
    };
  },

  hireFields(data = {}) {
    const v = (k) => escapeHtml(data[k] || "");
    const selOpt = (label, key) => `<option ${data[key] === label ? "selected" : ""}>${label}</option>`;
    const blankOpt = (key) => `<option value="" ${data[key] ? "" : "selected"}>Επιλέξτε...</option>`;
    const schedule = {};
    (data["Ωράριο εργασίας"] || "").split(" · ").forEach((part) => {
      const idx = part.indexOf(": ");
      if (idx > -1) schedule[part.slice(0, idx)] = part.slice(idx + 2);
    });
    return `
      <div class="row2">
        <div><label>Ημερομηνία πρόσληψης</label><input type="date" id="f_p_hiredate" value="${v("Ημερομηνία πρόσληψης")}" /></div>
        <div><label>Ειδικότητα</label><input type="text" id="f_p_role" value="${v("Ειδικότητα")}" /></div>
      </div>
      <div class="row2">
        <div>
          <label>Σύμβαση</label>
          <select id="f_p_contract">
            ${blankOpt("Σύμβαση")}
            ${selOpt("Αορίστου χρόνου", "Σύμβαση")}
            ${selOpt("Ορισμένου χρόνου", "Σύμβαση")}
          </select>
        </div>
        <div><label>Λήξη σύμβασης <span class="opt">(αν ορισμένου)</span></label><input type="date" id="f_p_contractend" value="${v("Λήξη σύμβασης")}" /></div>
      </div>
      <label>Ωράριο εργασίας</label>
      <div class="schedule-grid">
        ${["Δευτέρα", "Τρίτη", "Τετάρτη", "Πέμπτη", "Παρασκευή", "Σάββατο", "Κυριακή"]
          .map((d, i) => `<div class="schedule-row"><span>${d}</span><input type="text" id="f_p_day${i}" placeholder="π.χ. 09:00-17:00 ή Ρεπό" value="${escapeHtml(schedule[d] || "")}" /></div>`)
          .join("")}
      </div>
    `;
  },

  collectHire() {
    const days = ["Δευτέρα", "Τρίτη", "Τετάρτη", "Πέμπτη", "Παρασκευή", "Σάββατο", "Κυριακή"];
    const schedule = days
      .map((d, i) => {
        const val = document.getElementById(`f_p_day${i}`).value.trim();
        return val ? `${d}: ${val}` : null;
      })
      .filter(Boolean)
      .join(" · ");
    return {
      "Ημερομηνία πρόσληψης": document.getElementById("f_p_hiredate").value,
      "Ειδικότητα": document.getElementById("f_p_role").value,
      "Σύμβαση": document.getElementById("f_p_contract").value,
      "Λήξη σύμβασης": document.getElementById("f_p_contractend").value,
      "Ωράριο εργασίας": schedule,
    };
  },

  // Πλήρης φόρμα/συλλογή (personal + hire μαζί) — τη χρησιμοποιεί μόνο το admin.html.
  // Όλες οι ομάδες (προσωπικά + πρόσληψη) εμφανίζονται σε ένα ενιαίο σετ καρτελών.
  extraFields(data = {}) {
    const groups = this._personalGroups(data);
    groups.push({ label: "Πρόσληψη", html: this.hireFields(data) });
    return this._renderTabs(groups, "ef");
  },
  collectExtra() {
    return { ...this.collectPersonal(), ...this.collectHire() };
  },
};

// --- Καρτέλες: εναλλαγή + οπτική ένδειξη συμπλήρωσης ανά καρτέλα ---
// Πράσινο φόντο μόλις συμπληρωθούν όλα τα πεδία μιας καρτέλας (ζωντανά, ενώ πληκτρολογεί).
// Πολύ ανοιχτό κόκκινο μόνο όταν ο χρήστης αλλάξει καρτέλα αφήνοντας πίσω κάποια ασυμπλήρωτη —
// όχι εξαρχής, για να μην "τρομάζει" μια φόρμα που μόλις άνοιξε.
function fieldTabsPanelIsComplete(panel) {
  const fields = panel.querySelectorAll("input, select, textarea");
  return Array.from(fields).every((f) => (f.value || "").trim() !== "");
}
function fieldTabsSyncComplete(panel, btn) {
  if (!panel || !btn) return;
  btn.classList.toggle("tab-complete", fieldTabsPanelIsComplete(panel));
}
function fieldTabsMarkLeftIfIncomplete(panel, btn) {
  if (!panel || !btn) return;
  const complete = fieldTabsPanelIsComplete(panel);
  btn.classList.toggle("tab-complete", complete);
  btn.classList.toggle("tab-incomplete", !complete);
}

// Ένας μόνο delegated listener για όλες τις καρτέλες πεδίων, ώστε να μη χρειάζεται ξεχωριστός
// κώδικας σε κάθε σελίδα που τις εμφανίζει (δουλεύει και μετά από innerHTML re-render).
document.addEventListener("click", (e) => {
  const btn = e.target.closest(".tab-btn");
  if (!btn) return;
  const group = btn.closest(".field-tabs");
  if (!group) return;
  const btns = Array.from(group.querySelectorAll(".tab-btn"));
  const panels = Array.from(group.querySelectorAll(".tab-panel"));
  const newIdx = btns.indexOf(btn);
  const oldIdx = btns.findIndex((b) => b.classList.contains("active"));
  if (oldIdx === newIdx) return;
  if (oldIdx > -1) fieldTabsMarkLeftIfIncomplete(panels[oldIdx], btns[oldIdx]);

  btns.forEach((b, i) => b.classList.toggle("active", i === newIdx));
  panels.forEach((p, i) => p.classList.toggle("active", i === newIdx));

  // Η καρτέλα που μόλις άνοιξε δεν δείχνει ποτέ κόκκινο — μόνο πράσινο αν τυχαίνει να είναι ήδη πλήρης.
  btn.classList.remove("tab-incomplete");
  fieldTabsSyncComplete(panels[newIdx], btn);
});

// Ζωντανή ενημέρωση του πράσινου όσο πληκτρολογεί/επιλέγει μέσα σε μια καρτέλα.
["input", "change"].forEach((evt) =>
  document.addEventListener(evt, (e) => {
    const panel = e.target.closest(".tab-panel");
    if (!panel) return;
    const group = panel.closest(".field-tabs");
    if (!group) return;
    const panels = Array.from(group.querySelectorAll(".tab-panel"));
    const idx = panels.indexOf(panel);
    const btn = group.querySelectorAll(".tab-btn")[idx];
    fieldTabsSyncComplete(panel, btn);
  })
);

// Αρχική ενημέρωση (πράσινο μόνο) μόλις εμφανιστούν καρτέλες στη σελίδα — π.χ. στη φόρμα
// επεξεργασίας όπου κάποιες καρτέλες μπορεί να είναι ήδη πλήρεις από πριν.
new MutationObserver((mutations) => {
  for (const m of mutations) {
    for (const node of m.addedNodes) {
      if (!(node instanceof Element)) continue;
      const groups = node.matches(".field-tabs") ? [node] : Array.from(node.querySelectorAll(".field-tabs"));
      groups.forEach((group) => {
        const btns = group.querySelectorAll(".tab-btn");
        group.querySelectorAll(".tab-panel").forEach((p, i) => fieldTabsSyncComplete(p, btns[i]));
      });
    }
  }
}).observe(document.body, { childList: true, subtree: true });
