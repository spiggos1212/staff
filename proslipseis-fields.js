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
                ${selOpt("Άγαμος/η", "Οικογενειακή κατάσταση")}
                ${selOpt("Έγγαμος/η", "Οικογενειακή κατάσταση")}
                ${selOpt("Διαζευγμένος/η", "Οικογενειακή κατάσταση")}
                ${selOpt("Χήρος/α", "Οικογενειακή κατάσταση")}
              </select>
            </div>
            <div><label>Τέκνα έως 18 ετών</label><input type="number" id="f_p_children" min="0" value="${data["Τέκνα έως 18"] ?? "0"}" /></div>
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

// Ένας μόνο delegated listener για όλες τις καρτέλες πεδίων, ώστε να μη χρειάζεται ξεχωριστός
// κώδικας σε κάθε σελίδα που τις εμφανίζει (δουλεύει και μετά από innerHTML re-render).
document.addEventListener("click", (e) => {
  const btn = e.target.closest(".tab-btn");
  if (!btn) return;
  const group = btn.closest(".field-tabs");
  if (!group) return;
  group.querySelectorAll(".tab-btn").forEach((b) => b.classList.toggle("active", b === btn));
  group.querySelectorAll(".tab-panel").forEach((p) => p.classList.toggle("active", p.id === btn.dataset.tabTarget));
});
