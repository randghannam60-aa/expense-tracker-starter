
const API_URL = 'http://localhost:3000/api/expenses';


const tableBody = document.getElementById('expensesTableBody');
const loadingSpinner = document.getElementById('loadingSpinner');
const alertBox = document.getElementById('alertBox');
const totalAmountElement = document.getElementById('totalAmount');
const expenseCountElement = document.getElementById('expenseCount');
const highestExpenseElement = document.getElementById('highestExpense');
const highestExpenseTitleElement = document.getElementById('highestExpenseTitle');
const categoryFilter = document.getElementById('categoryFilter');
const addExpenseForm = document.getElementById('addExpenseForm');
const editExpenseForm = document.getElementById('editExpenseForm');
const themeToggleBtn = document.getElementById('themeToggleBtn');

let editModalInstance = null;
let categoryChartInstance = null;
let allExpenses = [];


document.addEventListener('DOMContentLoaded', () => {
  editModalInstance = new bootstrap.Modal(document.getElementById('editModal'));


  document.getElementById('dateInput').value = new Date().toISOString().split('T')[0];


  initTheme();


  fetchExpenses();
});


function initTheme() {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
    document.body.classList.add('dark-mode');
    themeToggleBtn.textContent = '☀️ Light Mode';
  }

  themeToggleBtn.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    themeToggleBtn.textContent = isDark ? '☀️ Light Mode' : '🌙 Dark Mode';
    localStorage.setItem('theme', isDark ? 'dark' : 'light');


    if (categoryChartInstance) {
      updateCategoryChart(allExpenses);
    }
  });
}


function showAlert(message) {
  alertBox.textContent = message;
  alertBox.classList.remove('d-none');
  setTimeout(() => {
    alertBox.classList.add('d-none');
  }, 3500);
}


async function fetchExpenses() {
  loadingSpinner.classList.remove('d-none');

  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error('Failed to load expenses');
    }
    allExpenses = await response.json();
    renderExpenses();
    updateSummaryCards(allExpenses);
    updateCategoryChart(allExpenses);
  } catch (error) {
    showAlert(error.message || 'Error connecting to server');
  } finally {
    loadingSpinner.classList.add('d-none');
  }
}


function renderExpenses() {
  const selectedCategory = categoryFilter.value;
  const filtered = (selectedCategory === 'All')
    ? allExpenses
    : allExpenses.filter(item => item.category === selectedCategory);

  tableBody.innerHTML = '';

  if (filtered.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="5" class="text-center text-muted py-4">No expenses found.</td></tr>`;
    return;
  }

  filtered.forEach(item => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="fw-medium">${escapeHtml(item.title)}</td>
      <td>${parseFloat(item.amount).toFixed(2)}</td>
      <td><span class="badge ${getCategoryBadgeClass(item.category)}">${item.category}</span></td>
      <td>${formatDate(item.date)}</td>
      <td class="text-end">
        <button class="btn btn-outline-secondary btn-sm me-1 edit-btn" data-id="${item.id}">Edit</button>
        <button class="btn btn-outline-danger btn-sm delete-btn" data-id="${item.id}">Delete</button>
      </td>
    `;
    tableBody.appendChild(tr);
  });

  attachTableEvents();
}


function attachTableEvents() {
  document.querySelectorAll('.edit-btn').forEach(button => {
    button.addEventListener('click', () => {
      const id = button.getAttribute('data-id');
      openEditModal(id);
    });
  });

  document.querySelectorAll('.delete-btn').forEach(button => {
    button.addEventListener('click', () => {
      const id = button.getAttribute('data-id');
      deleteExpense(id);
    });
  });
}


function getCategoryBadgeClass(category) {
  switch (category) {
    case 'Food':
      return 'badge-food';
    case 'Transport':
      return 'badge-transport';
    case 'Bills':
      return 'badge-bills';
    case 'Entertainment':
      return 'badge-entertainment';
    case 'Other':
      return 'badge-other';
    default:
      return 'badge-other';
  }
}


function formatDate(dateStr) {
  return dateStr.split('T')[0];
}


function updateSummaryCards(data) {
  if (data.length === 0) {
    totalAmountElement.textContent = '0.00';
    expenseCountElement.textContent = '0';
    highestExpenseElement.textContent = '0.00';
    highestExpenseTitleElement.textContent = '-';
    return;
  }

  const total = data.reduce((acc, curr) => acc + parseFloat(curr.amount), 0);
  const highest = data.reduce((max, curr) => parseFloat(curr.amount) > parseFloat(max.amount) ? curr : max, data[0]);

  totalAmountElement.textContent = total.toFixed(2);
  expenseCountElement.textContent = data.length.toString();
  highestExpenseElement.textContent = parseFloat(highest.amount).toFixed(2);
  highestExpenseTitleElement.textContent = highest.title;
}


function updateCategoryChart(data) {
  const categoryTotals = {
    Food: 0,
    Transport: 0,
    Bills: 0,
    Entertainment: 0,
    Other: 0
  };

  data.forEach(item => {
    if (categoryTotals[item.category] !== undefined) {
      categoryTotals[item.category] += parseFloat(item.amount);
    }
  });

  const isDark = document.body.classList.contains('dark-mode');
  const textColor = isDark ? '#e0e0e0' : '#495057';

  if (categoryChartInstance) {
    categoryChartInstance.destroy();
  }

  const ctx = document.getElementById('categoryChart').getContext('2d');
  categoryChartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: Object.keys(categoryTotals),
      datasets: [{
        data: Object.values(categoryTotals),
        backgroundColor: [
          '#198754', // Food
          '#0d6efd', // Transport
          '#ffc107', // Bills
          '#6f42c1', // Entertainment
          '#6c757d'  // Other
        ],
        borderWidth: 2,
        borderColor: isDark ? '#1e1e1e' : '#ffffff'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right',
          labels: { color: textColor, font: { size: 12 } }
        }
      }
    }
  });
}


addExpenseForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const titleInput = document.getElementById('titleInput');
  const amountInput = document.getElementById('amountInput');
  const categoryInput = document.getElementById('categoryInput');
  const dateInput = document.getElementById('dateInput');


  titleInput.classList.remove('is-invalid');
  amountInput.classList.remove('is-invalid');
  categoryInput.classList.remove('is-invalid');
  dateInput.classList.remove('is-invalid');

  let isValid = true;

  if (!titleInput.value.trim()) {
    titleInput.classList.add('is-invalid');
    isValid = false;
  }

  const amountVal = parseFloat(amountInput.value);
  if (isNaN(amountVal) || amountVal <= 0) {
    amountInput.classList.add('is-invalid');
    isValid = false;
  }

  if (!categoryInput.value) {
    categoryInput.classList.add('is-invalid');
    isValid = false;
  }

  if (!dateInput.value) {
    dateInput.classList.add('is-invalid');
    isValid = false;
  }

  if (!isValid) return;

  const newExpense = {
    title: titleInput.value.trim(),
    amount: amountVal,
    category: categoryInput.value,
    date: dateInput.value
  };

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newExpense)
    });

    if (!response.ok) {
      const errorData = await response.json();
      showAlert(errorData.message || 'Error adding expense');
      return;
    }

    addExpenseForm.reset();
    dateInput.value = new Date().toISOString().split('T')[0];
    await fetchExpenses();
  } catch (error) {
    showAlert('Server connection failed while saving.');
  }
});


async function openEditModal(id) {
  try {
    const response = await fetch(`${API_URL}/${id}`);
    if (!response.ok) {
      throw new Error('Expense not found');
    }
    const item = await response.json();

    document.getElementById('editExpenseId').value = item.id;
    document.getElementById('editTitleInput').value = item.title;
    document.getElementById('editAmountInput').value = parseFloat(item.amount);
    document.getElementById('editCategoryInput').value = item.category;
    document.getElementById('editDateInput').value = item.date.split('T')[0];

    editModalInstance.show();
  } catch (error) {
    showAlert('Failed to retrieve expense details.');
  }
}


editExpenseForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const id = document.getElementById('editExpenseId').value;
  const updatedExpense = {
    title: document.getElementById('editTitleInput').value.trim(),
    amount: parseFloat(document.getElementById('editAmountInput').value),
    category: document.getElementById('editCategoryInput').value,
    date: document.getElementById('editDateInput').value
  };

  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedExpense)
    });

    if (!response.ok) {
      throw new Error('Update failed');
    }

    editModalInstance.hide();
    await fetchExpenses();
  } catch (error) {
    showAlert('Could not update expense.');
  }
});


async function deleteExpense(id) {
  if (!confirm('Are you sure you want to delete this expense?')) return;

  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      throw new Error('Failed to delete expense');
    }

    await fetchExpenses();
  } catch (error) {
    showAlert('Error while deleting record.');
  }
}


categoryFilter.addEventListener('change', renderExpenses);


function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}