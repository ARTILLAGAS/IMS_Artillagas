let inventory = JSON.parse(localStorage.getItem('inventory')) || [];
let editingIndex = -1;

function saveToLocalStorage() {
    localStorage.setItem('inventory', JSON.stringify(inventory));
}

function formatPrice(price) {
    const formatted = price.toLocaleString('en-PH', {
        minimumFractionDigits: 0,
        maximumFractionDigits: price % 1 === 0 ? 0 : 2
    });
    return `₱${formatted}`;
}

function renderTable(data = inventory) {
    const tableBody = document.querySelector('#inventoryTable tbody');
    tableBody.innerHTML = '';
    data.forEach((product, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${product.name}</td>
            <td>${product.quantity.toLocaleString()}</td>
            <td>${formatPrice(product.price)}</td>
            <td>${product.dateAdded}</td>
            <td>
                <div style="display: flex; gap: 8px;">
                    <button class="edit-button" onclick="event.stopPropagation(); openEditProduct(${index})">Edit</button>
                    <button class="delete-button" onclick="event.stopPropagation(); deleteProduct(${index})">Delete</button>
                </div>
            </td>
        `;
        row.addEventListener('click', () => showProductDetails(index, row));
        tableBody.appendChild(row);
    });
}

function deleteProduct(index) {
    inventory.splice(index, 1);
    saveToLocalStorage();
    filterTable();
}

function showProductDetails(index, row) {
    const existingDetails = row.nextElementSibling;
    if (existingDetails && existingDetails.classList.contains('product-details-row')) {
        existingDetails.remove();
        return;
    }

    const product = inventory[index];
    const detailsRow = document.createElement('tr');
    detailsRow.classList.add('product-details-row');
    const detailsCell = document.createElement('td');
    detailsCell.colSpan = 5;
    detailsCell.innerHTML = `
        <div class="product-details">
            <strong>Details:</strong><br>
            ${product.productDetails || 'No additional details provided.'}
        </div>
    `;
    detailsRow.appendChild(detailsCell);
    row.parentNode.insertBefore(detailsRow, row.nextSibling);
}

function openEditProduct(index) {
    const product = inventory[index];
    document.getElementById('productName').value = product.name;
    document.getElementById('quantity').value = product.quantity;
    document.getElementById('price').value = product.price;
    document.getElementById('dateAdded').value = product.dateAdded;
    document.getElementById('productDetails').value = product.productDetails;
    document.getElementById('modalTitle').innerText = "Edit Product";
    editingIndex = index;
    toggleModal(true);
}

function toggleAddProduct() {
    clearForm();
    document.getElementById('modalTitle').innerText = "Add Product";
    editingIndex = -1;
    toggleModal(true);
}

function toggleModal(show = true) {
    const modal = document.getElementById('productModal');
    modal.style.display = show ? 'flex' : 'none';
}

function closeModal() {
    toggleModal(false);
    clearForm();
}

function submitProduct() {
    const name = document.getElementById('productName').value;
    const quantity = parseInt(document.getElementById('quantity').value);
    const price = parseFloat(document.getElementById('price').value);
    const dateAdded = document.getElementById('dateAdded').value;
    const productDetails = document.getElementById('productDetails').value;

    if (name && quantity > 0 && price >= 0) {
        const product = { name, quantity, price, dateAdded, productDetails };
        if (editingIndex >= 0) {
            inventory[editingIndex] = product;
        } else {
            inventory.push(product);
        }
        saveToLocalStorage();
        filterTable();
        closeModal();
    } else {
        alert("Please fill all fields correctly.");
    }
}

function clearForm() {
    document.getElementById('productName').value = '';
    document.getElementById('quantity').value = '';
    document.getElementById('price').value = '';
    document.getElementById('dateAdded').value = '';
    document.getElementById('productDetails').value = '';
    document.getElementById('modalTitle').innerText = "Add Product";
    editingIndex = -1;
}

document.getElementById('search').addEventListener('input', filterTable);
document.getElementById('quantityFilterType').addEventListener('change', filterTable);
document.getElementById('sortOrder').addEventListener('change', filterTable);

function filterTable() {
    let filtered = [...inventory];

    const searchQuery = document.getElementById('search').value.toLowerCase();
    const quantityFilterType = document.getElementById('quantityFilterType').value;
    const sortOrder = document.getElementById('sortOrder').value;

    if (searchQuery) {
        filtered = filtered.filter(product =>
            product.name.toLowerCase().includes(searchQuery)
        );
    }

    if (quantityFilterType === 'least') {
        filtered.sort((a, b) => a.quantity - b.quantity);
    } else if (quantityFilterType === 'most') {
        filtered.sort((a, b) => b.quantity - a.quantity);
    }

    if (sortOrder === 'asc') {
        filtered.sort((a, b) => new Date(a.dateAdded) - new Date(b.dateAdded));
    } else if (sortOrder === 'desc') {
        filtered.sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));
    }

    renderTable(filtered);
}

renderTable();