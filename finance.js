// Κοινή λογική για το dashboard και τη φόρμα καταχώρησης.
// Αποθηκεύει τις κινήσεις (έσοδα/έξοδα) στο localStorage του browser.

const FINANCE_STORAGE_KEY = 'company-finance-transactions';

function loadTransactions() {
  try {
    const saved = JSON.parse(localStorage.getItem(FINANCE_STORAGE_KEY));
    if (Array.isArray(saved)) return saved;
  } catch (e) {}
  return [];
}

function saveTransactions(list) {
  localStorage.setItem(FINANCE_STORAGE_KEY, JSON.stringify(list));
}

function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function computeTotals(list) {
  let income = 0;
  let expenses = 0;
  for (const t of list) {
    if (t.type === 'income') income += t.amount;
    else expenses += t.amount;
  }
  return { income, expenses, net: income - expenses };
}

function formatCurrency(n) {
  return new Intl.NumberFormat('el-GR', { style: 'currency', currency: 'EUR' }).format(n);
}

function formatDateDisplay(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('el-GR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function sortByDateDesc(list) {
  return [...list].sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id));
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// Ζωγραφίζει τις γραμμές του πίνακα κινήσεων μέσα σε ένα <tbody>.
// onDelete(id) καλείται όταν πατηθεί το κουμπί διαγραφής μιας γραμμής.
function renderTransactionRows(tbody, list, onDelete) {
  const sorted = sortByDateDesc(list);
  tbody.innerHTML = '';

  if (sorted.length === 0) {
    const tr = document.createElement('tr');
    tr.innerHTML = '<td colspan="5" class="empty-row">Δεν υπάρχουν καταχωρήσεις ακόμα.</td>';
    tbody.appendChild(tr);
    return;
  }

  for (const t of sorted) {
    const isIncome = t.type === 'income';
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${formatDateDisplay(t.date)}</td>
      <td><span class="type-badge ${isIncome ? 'type-income' : 'type-expense'}">${isIncome ? 'Έσοδο' : 'Έξοδο'}</span></td>
      <td class="desc-cell">${escapeHtml(t.description || '—')}</td>
      <td class="amount-cell ${isIncome ? 'amount-income' : 'amount-expense'}">${isIncome ? '+' : '−'}${formatCurrency(t.amount)}</td>
      <td><button type="button" class="delete-btn" data-id="${t.id}" aria-label="Διαγραφή">🗑</button></td>
    `;
    tbody.appendChild(tr);
  }

  tbody.querySelectorAll('.delete-btn').forEach((btn) => {
    btn.addEventListener('click', () => onDelete(btn.dataset.id));
  });
}
