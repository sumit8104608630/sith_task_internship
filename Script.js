// ── DATA ──────────────────────────────────────────────────────────────────
const users = [];       // { name, accNo, password, amount, transactions }
let currentUser = null;
let currentTxType = '';

// ── AUTH ──────────────────────────────────────────────────────────────────
function switchTab(tab) {
  const isLogin = tab === 'login';
  document.getElementById('loginForm').classList.toggle('hidden', !isLogin);
  document.getElementById('registerForm').classList.toggle('hidden', isLogin);
  document.getElementById('loginTab').className = `flex-1 py-2.5 rounded-xl text-sm transition-all font-700 ${isLogin ? 'tab-active' : ''}`;
  document.getElementById('registerTab').className = `flex-1 py-2.5 rounded-xl text-sm transition-all font-700 ${!isLogin ? 'tab-active' : ''}`;
  if (!isLogin) {
    document.getElementById('loginTab').style.color = 'rgba(255,255,255,0.5)';
    document.getElementById('registerTab').style.color = '#0a0a0f';
  } else {
    document.getElementById('loginTab').style.color = '#0a0a0f';
    document.getElementById('registerTab').style.color = 'rgba(255,255,255,0.5)';
  }
}

function register() {
  const name = document.getElementById('regName').value.trim();
  const accNo = document.getElementById('regAcc').value.trim();
  const amount = parseFloat(document.getElementById('regAmount').value);
  const password = document.getElementById('regPass').value;

  if (!name || !accNo || !password) return toast('Please fill all fields', 'error');
  if (isNaN(amount) || amount < 0) return toast('Enter a valid initial deposit', 'error');
  if (users.find(u => u.accNo === accNo)) return toast('Account number already exists', 'error');

  users.push({ name, accNo, password, amount, transactions: [] });
  toast(`Account created! Welcome, ${name}`, 'success');
  switchTab('login');
  document.getElementById('loginAcc').value = accNo;
}

function login() {
  const accNo = document.getElementById('loginAcc').value.trim();
  const password = document.getElementById('loginPass').value;

  const user = users.find(u => u.accNo === accNo && u.password === password);
  if (!user) return toast('Invalid account number or password', 'error');

  currentUser = user;
  showDashboard();
}

function logout() {
  currentUser = null;
  document.getElementById('dashboardScreen').classList.add('hidden');
  document.getElementById('authScreen').classList.remove('hidden');
  toast('Logged out successfully', 'success');
}

// ── DASHBOARD ─────────────────────────────────────────────────────────────
function showDashboard() {
  document.getElementById('authScreen').classList.add('hidden');
  document.getElementById('dashboardScreen').classList.remove('hidden');
  refreshDashboard();
}

function refreshDashboard() {
  document.getElementById('navName').textContent = currentUser.name;
  document.getElementById('navAcc').textContent = `ACC: ${currentUser.accNo}`;
  document.getElementById('cardName').textContent = currentUser.name.toUpperCase();
  document.getElementById('cardAcc').textContent = currentUser.accNo;
  document.getElementById('balanceDisplay').textContent = `₹${currentUser.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const txList = document.getElementById('transactionList');
  document.getElementById('txCount').textContent = `${currentUser.transactions.length} transactions`;

  if (!currentUser.transactions.length) {
    txList.innerHTML = `<div class="text-center py-10" style="color:rgba(255,255,255,0.2);"><svg class="mx-auto mb-3" width="40" height="40" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></svg><p class="text-sm">No transactions yet</p></div>`;
    return;
  }

  txList.innerHTML = [...currentUser.transactions].reverse().map(tx => {
    const isCredit = tx.type === 'credit';
    const color = isCredit ? '#2ecc71' : '#ff4757';
    const sign = isCredit ? '+' : '-';
    const icon = isCredit
      ? `<svg width="16" height="16" fill="none" stroke="${color}" stroke-width="2.5" viewBox="0 0 24 24"><path d="M12 5v14M5 12l7-7 7 7"/></svg>`
      : `<svg width="16" height="16" fill="none" stroke="${color}" stroke-width="2.5" viewBox="0 0 24 24"><path d="M12 19V5M5 12l7 7 7-7"/></svg>`;
    return `
      <div class="transaction-item rounded-r-xl p-4 mb-2 flex items-center justify-between" style="border-color:${color};background:rgba(255,255,255,0.02);">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg flex items-center justify-center" style="background:rgba(255,255,255,0.05);">${icon}</div>
          <div>
            <p class="text-sm font-600 capitalize">${tx.type}</p>
            <p class="mono text-xs" style="color:rgba(255,255,255,0.35);">${tx.date}</p>
          </div>
        </div>
        <div class="text-right">
          <p class="mono font-700 text-sm" style="color:${color};">${sign}₹${tx.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
          <p class="mono text-xs" style="color:rgba(255,255,255,0.3);">Bal: ₹${tx.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
        </div>
      </div>
    `;
  }).join('');
}

// ── MODAL ─────────────────────────────────────────────────────────────────
const modalConfig = {
  credit:   { title: 'Credit Money',  subtitle: 'Add funds to your account',    btnClass: 'btn-success' },
  debit:    { title: 'Debit Money',   subtitle: 'Make a payment or transfer',   btnClass: 'btn-danger'  },
  withdraw: { title: 'Withdraw Cash', subtitle: 'Withdraw cash from account',   btnClass: 'btn-primary' },
};

function openModal(type) {
  currentTxType = type;
  const cfg = modalConfig[type];
  document.getElementById('modalTitle').textContent = cfg.title;
  document.getElementById('modalSubtitle').textContent = cfg.subtitle;
  document.getElementById('modalConfirm').className = `flex-1 py-3 rounded-xl text-sm ${cfg.btnClass}`;
  document.getElementById('modalAmount').value = '';
  document.getElementById('modal').classList.remove('hidden');
  setTimeout(() => document.getElementById('modalAmount').focus(), 100);
}

function closeModal() {
  document.getElementById('modal').classList.add('hidden');
}

function confirmTransaction() {
  const amount = parseFloat(document.getElementById('modalAmount').value);
  if (isNaN(amount) || amount <= 0) return toast('Enter a valid amount', 'error');

  const isDebit = currentTxType === 'debit' || currentTxType === 'withdraw';
  if (isDebit && amount > currentUser.amount) return toast('Insufficient balance!', 'error');

  if (currentTxType === 'credit') currentUser.amount += amount;
  else currentUser.amount -= amount;

  const now = new Date();
  currentUser.transactions.push({
    type: currentTxType,
    amount,
    balance: currentUser.amount,
    date: now.toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  });

  closeModal();
  refreshDashboard();
  const labels = { credit: 'credited', debit: 'debited', withdraw: 'withdrawn' };
  toast(`₹${amount.toLocaleString('en-IN')} ${labels[currentTxType]} successfully!`, 'success');
}

// ── TOAST ─────────────────────────────────────────────────────────────────
function toast(msg, type = 'success') {
  const t = document.createElement('div');
  t.className = `toast toast-${type}`;
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => {
    t.style.opacity = '0';
    t.style.transition = 'opacity 0.3s';
    setTimeout(() => t.remove(), 300);
  }, 2800);
}

// ── KEYBOARD ──────────────────────────────────────────────────────────────
document.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    if (!document.getElementById('modal').classList.contains('hidden')) confirmTransaction();
    else if (!document.getElementById('loginForm').classList.contains('hidden')) login();
    else if (!document.getElementById('registerForm').classList.contains('hidden')) register();
  }
  if (e.key === 'Escape') closeModal();
});

// ── INIT ──────────────────────────────────────────────────────────────────
document.getElementById('loginTab').style.color = '#0a0a0f';
document.getElementById('registerTab').style.color = 'rgba(255,255,255,0.5)';