// Κοινός ορισμός των πεδίων "Προσλήψεις" — χρησιμοποιείται και από το index.html (φόρμα
// υποβολής/επεξεργασίας του αιτούντα) και από το admin.html (επεξεργασία από τον admin),
// ώστε να μην υπάρχουν δύο ξεχωριστές, πιθανόν ασύμβατες, εκδοχές της ίδιας φόρμας.
// Απαιτεί να υπάρχει ήδη global συνάρτηση escapeHtml(str) στη σελίδα που το φορτώνει.

window.PROSLIPSEIS_FIELDS = {
  extraFields(data = {}) {
    const v = (k) => escapeHtml(data[k] || "");
    const selOpt = (label, key) => `<option ${data[key] === label ? "selected" : ""}>${label}</option>`;
    const schedule = {};
    (data["Ωράριο εργασίας"] || "").split(" · ").forEach((part) => {
      const idx = part.indexOf(": ");
      if (idx > -1) schedule[part.slice(0, idx)] = part.slice(idx + 2);
    });
    return `
      <div class="section-title">Στοιχεία γέννησης</div>
      <div class="row2">
        <div><label>Όνομα πατρός</label><input type="text" id="f_p_father" value="${v("Όνομα πατρός")}" /></div>
        <div><label>Όνομα μητρός</label><input type="text" id="f_p_mother" value="${v("Όνομα μητρός")}" /></div>
      </div>
      <div class="row2">
        <div><label>Τόπος γέννησης</label><input type="text" id="f_p_birthplace" value="${v("Τόπος γέννησης")}" /></div>
        <div><label>Ημερομηνία γέννησης</label><input type="date" id="f_p_birthdate" value="${v("Ημερομηνία γέννησης")}" /></div>
      </div>

      <div class="section-title">Ιθαγένεια</div>
      <select id="f_p_citizenship">
        ${selOpt("Έλληνας/ίδα", "Ιθαγένεια")}
        ${selOpt("Πολίτης ΕΟΚ", "Ιθαγένεια")}
        ${selOpt("Πολίτης εκτός ΕΟΚ", "Ιθαγένεια")}
      </select>

      <div class="section-title">Διεύθυνση &amp; επικοινωνία</div>
      <label>Διεύθυνση κατοικίας</label>
      <input type="text" id="f_p_address" value="${v("Διεύθυνση")}" />
      <div class="row2">
        <div><label>Τ.Κ.</label><input type="text" id="f_p_tk" value="${v("Τ.Κ.")}" /></div>
        <div><label>Δήμος</label><input type="text" id="f_p_dimos" value="${v("Δήμος")}" /></div>
      </div>

      <div class="section-title">Οικογενειακή κατάσταση</div>
      <div class="row2">
        <div>
          <label>Κατάσταση</label>
          <select id="f_p_marital">
            ${selOpt("Άγαμος/η", "Οικογενειακή κατάσταση")}
            ${selOpt("Έγγαμος/η", "Οικογενειακή κατάσταση")}
            ${selOpt("Διαζευγμένος/η", "Οικογενειακή κατάσταση")}
            ${selOpt("Χήρος/α", "Οικογενειακή κατάσταση")}
          </select>
        </div>
        <div><label>Τέκνα έως 18 ετών</label><input type="number" id="f_p_children" min="0" value="${data["Τέκνα έως 18"] ?? "0"}" /></div>
      </div>

      <div class="section-title">Στοιχεία μητρώου</div>
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

      <div class="section-title">Στοιχεία πρόσληψης</div>
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

  collectExtra() {
    const days = ["Δευτέρα", "Τρίτη", "Τετάρτη", "Πέμπτη", "Παρασκευή", "Σάββατο", "Κυριακή"];
    const schedule = days
      .map((d, i) => {
        const val = document.getElementById(`f_p_day${i}`).value.trim();
        return val ? `${d}: ${val}` : null;
      })
      .filter(Boolean)
      .join(" · ");
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
      "Ημερομηνία πρόσληψης": document.getElementById("f_p_hiredate").value,
      "Ειδικότητα": document.getElementById("f_p_role").value,
      "Σύμβαση": document.getElementById("f_p_contract").value,
      "Λήξη σύμβασης": document.getElementById("f_p_contractend").value,
      "Ωράριο εργασίας": schedule,
    };
  },
};
