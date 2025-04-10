let inventory = JSON.parse(localStorage.getItem('inventory')) || [];
let editingIndex = -1;
let currentImage = "";

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
            <td><img src="${product.image || 'https://i.ibb.co/GfjP2TN9/your-image.jpg'}" alt="Product Image" style="width: 150px; height: 150px;"></td>
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
    toggleDetailsModal(false);
}

function showProductDetails(index) {
    const product = inventory[index];
    const detailsContent = `
        <strong>Name:</strong> ${product.name}<br>
        <strong>Quantity:</strong> ${product.quantity}<br>
        <strong>Price:</strong> ${formatPrice(product.price)}<br>
        <strong>Date Added:</strong> ${product.dateAdded}<br>
        <strong>Details:</strong> ${product.productDetails || 'No additional details provided.'}<br>
        <img src="${product.image || 'https://i.ibb.co/GfjP2TN9/your-image.jpg'}" alt="Product Image" style="width: 150px; height: 150px;">
    `;
    document.getElementById('detailsContent').innerHTML = detailsContent;
    editingIndex = index; // Store the index for editing
    toggleDetailsModal(true);
}

function toggleDetailsModal(show = true) {
    const detailsModal = document.getElementById('detailsModal');
    detailsModal.style.display = show ? 'flex' : 'none';
}

function closeDetailsModal() {
    toggleDetailsModal(false);
}

// Update the product row click event
function renderTable(data = inventory) {
    const tableBody = document.querySelector('#inventoryTable tbody');
    tableBody.innerHTML = '';
    data.forEach((product, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><img src="${product.image || 'https://i.ibb.co/GfjP2TN9/your-image.jpg'}" alt="Product Image" style="width: 150px; height: 150px;"></td>
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
        row.addEventListener('click', () => showProductDetails(index));
        tableBody.appendChild(row);
    });
}

function openEditProduct(index) {
    const product = inventory[index];
    document.getElementById('productName').value = product.name;
    document.getElementById('quantity').value = product.quantity;
    document.getElementById('price').value = product.price;
    document.getElementById('dateAdded').value = product.dateAdded.replace(" | ", "T");
    document.getElementById('productDetails').value = product.productDetails;
    document.getElementById('imagePreview').src = product.image || 'https://i.ibb.co/GfjP2TN9/your-image.jpg';
    currentImage = product.image;
    document.getElementById('modalTitle').innerText = "Edit Product";
    editingIndex = index;
    toggleModal(true);
    toggleDetailsModal(false);
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
    const dateAdded = document.getElementById('dateAdded').value.replace("T", " | ");
    const productDetails = document.getElementById('productDetails').value;
    
    const product = { name, quantity, price, dateAdded, productDetails, image: currentImage };

    if (editingIndex >= 0) {
        inventory[editingIndex] = product;
    } else {
        inventory.push(product);
    }
    
    saveToLocalStorage();
    filterTable();
    closeModal();
}

function clearForm() {
    document.getElementById('productName').value = '';
    document.getElementById('quantity').value = '';
    document.getElementById('price').value = '';
    document.getElementById('dateAdded').value = '';
    document.getElementById('productDetails').value = '';
    document.getElementById('imagePreview').src = 'https://i.ibb.co/GfjP2TN9/your-image.jpg';
    currentImage = "";
}

function previewImage(event) {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = function(e) {
        currentImage = e.target.result;
        document.getElementById('imagePreview').src = currentImage;
    }
    if (file) {
        reader.readAsDataURL(file);
    }
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

function generateSampleProducts() {
    const sampleProducts = [
        {
            name: "Sample Product 1",
            quantity: 100,
            price: 250.00,
            dateAdded: "2025-04-01 | 10:00",
            productDetails: "This is a sample product.",
            image: "https://i.ibb.co/GfjP2TN9/your-image.jpg"
        },
        {
            name: "Sample Product 2",
            quantity: 50,
            price: 150.00,
            dateAdded: "2025-04-02 | 12:30",
            productDetails: "This is another sample product.",
            image: "https://i.ibb.co/GfjP2TN9/your-image.jpg"
        },
        {
            name: "Sample Product 3",
            quantity: 200,
            price: 99.99,
            dateAdded: "2025-04-03 | 15:00",
            productDetails: "Yet another sample product.",
            image: "https://i.ibb.co/GfjP2TN9/your-image.jpg"
        }
    ];
    inventory = sampleProducts;
    saveToLocalStorage();
}

function loadInventory() {
    inventory = JSON.parse(localStorage.getItem('inventory')) || [];
    if (inventory.length === 0) {
        generateSampleProducts();
    }
    renderTable();
}

document.addEventListener('DOMContentLoaded', loadInventory);