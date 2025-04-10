let inventory = JSON.parse(localStorage.getItem('inventory')) || [];
let editing_index = -1; 
let current_image = "";
let debounce_timer = null;

function save_to_local_storage() {
    localStorage.setItem('inventory', JSON.stringify(inventory));
}

function format_price(price) {
    const formatted = price.toLocaleString('en-PH', {
        minimumFractionDigits: 0,
        maximumFractionDigits: price % 1 === 0 ? 0 : 2
    });
    return `₱${formatted}`;
}

function format_date(date_string) {
    if (!date_string) return '';
    const parts = date_string.split(' | ');
    if (parts.length !== 2) return date_string;
    const date_part = parts[0];
    const time_part = parts[1];
    const date_elements = date_part.split('-');
    if (date_elements.length !== 3) return date_string;
    
    const formatted_date = `${date_elements[2]}/${date_elements[1]}/${date_elements[0]}`;
    return `${formatted_date} at ${time_part}`;
}

function render_table(data = inventory) {
    const table_body = document.querySelector('#inventory_table tbody');
    
    table_body.innerHTML = '';
    
    if (data.length === 0) {
        const empty_row = document.createElement('tr');
        empty_row.innerHTML = '<td colspan="6" style="text-align: center;">No products found. Add some!</td>';
        table_body.appendChild(empty_row);
        return;
    }
    
    data.forEach((product, index) => {
        const row = document.createElement('tr');

        row.innerHTML = `
            <td><img src="${product.image || 'https://i.ibb.co/GfjP2TN9/your-image.jpg'}" alt="Product Image" style="width: 150px; height: 150px;"></td>
            <td>${product.name}</td>
            <td>${product.quantity.toLocaleString()}</td>
            <td>${format_price(product.price)}</td>
            <td>${format_date(product.date_added)}</td>
            <td>
                <div style="display: flex; gap: 8px;">
                    <button class="edit-button" onclick="event.stopPropagation(); open_edit_product(${index})">Edit</button>
                    <button class="delete-button" onclick="event.stopPropagation(); delete_product(${index})">Delete</button>
                </div>
            </td>
        `;
        
        row.addEventListener('click', () => show_product_details(index));
        
        table_body.appendChild(row);
    });
}

function delete_product(index) {
    if(confirm('Are you sure you want to delete this product?')) {
        inventory.splice(index, 1);
        save_to_local_storage();
        filter_table();
        toggle_details_modal(false);
    }
}

function show_product_details(index) {
    const product = inventory[index];
    const details_content = `
        <strong>Name:</strong> ${product.name}<br>
        <strong>Quantity:</strong> ${product.quantity}<br>
        <strong>Price:</strong> ${format_price(product.price)}<br>
        <strong>Date Added:</strong> ${format_date(product.date_added)}<br>
        <strong>Details:</strong> ${product.product_details || 'No additional details provided.'}<br>
        <img src="${product.image || 'https://i.ibb.co/GfjP2TN9/your-image.jpg'}" alt="Product Image" style="width: 150px; height: 150px;">
    `;
    
    document.getElementById('details_content').innerHTML = details_content;
    editing_index = index;
    toggle_details_modal(true);
}

function toggle_details_modal(show = true) {
    const details_modal = document.getElementById('details_modal');
    details_modal.style.display = show ? 'flex' : 'none';
}

function close_details_modal() {
    toggle_details_modal(false);
}

function open_edit_product(index) {
    const product = inventory[index];
    
    document.getElementById('product_name').value = product.name;
    document.getElementById('quantity').value = product.quantity;
    document.getElementById('price').value = product.price;
    document.getElementById('date_added').value = product.date_added.replace(" | ", "T");
    document.getElementById('product_details').value = product.product_details;
    document.getElementById('image_preview').src = product.image || 'https://i.ibb.co/GfjP2TN9/your-image.jpg';
    document.getElementById('image_preview').style.display = 'block';
    current_image = product.image;
    document.getElementById('modal_title').innerText = "Edit Product";
    editing_index = index;
    
    toggle_modal(true);
    toggle_details_modal(false);
}

function toggle_add_product() {
    clear_form();
    document.getElementById('modal_title').innerText = "Add Product";
    editing_index = -1;
    toggle_modal(true);
}

function toggle_modal(show = true) {
    const modal = document.getElementById('product_modal');
    modal.style.display = show ? 'flex' : 'none';
}

function close_modal() {
    toggle_modal(false);
    clear_form();
}

function submit_product() {
    const name = document.getElementById('product_name').value;
    const quantity = parseInt(document.getElementById('quantity').value);
    const price = parseFloat(document.getElementById('price').value);
    const date_input = document.getElementById('date_added').value;
    const product_details = document.getElementById('product_details').value;
    
    if (!name || isNaN(quantity) || isNaN(price) || !date_input) {
        alert('Please fill in all required fields!');
        return;
    }
    
    const date_added = date_input.replace("T", " | ");
    
    const product = { 
        name, 
        quantity, 
        price, 
        date_added, 
        product_details, 
        image: current_image 
    };

    if (editing_index >= 0) {
        inventory[editing_index] = product;
    } else {
        inventory.push(product);
    }
    
    save_to_local_storage();
    filter_table();
    close_modal();
}

function clear_form() {
    document.getElementById('product_name').value = '';
    document.getElementById('quantity').value = '';
    document.getElementById('price').value = '';
    document.getElementById('date_added').value = '';
    document.getElementById('product_details').value = '';
    document.getElementById('image_preview').style.display = 'none';
    current_image = "";
}

function preview_image(event) {
    const file = event.target.files[0];
    const reader = new FileReader();
    
    reader.onload = function(e) {
        current_image = e.target.result;
        const preview = document.getElementById('image_preview');
        preview.src = current_image;
        preview.style.display = 'block';
    }
    
    if (file) {
        reader.readAsDataURL(file);
    }
}

function filter_by_quantity() {
    filter_table();
}

function sort_table() {
    filter_table();
}

function get_date_object(date_string) {
    if (!date_string) return new Date(0);
    return new Date(date_string.replace(' | ', 'T'));
}

function filter_table() {
    if (debounce_timer) {
        clearTimeout(debounce_timer);
    }
    
    debounce_timer = setTimeout(() => {
        let filtered = [...inventory];
        
        const search_query = document.getElementById('search').value.toLowerCase();
        const quantity_filter = document.getElementById('quantity_filter_type').value;
        const sort_order = document.getElementById('sort_order').value;

        if (search_query) {
            filtered = filtered.filter(product => 
                product.name.toLowerCase().includes(search_query)
            );
        }

        if (quantity_filter === 'least') {
            filtered.sort((a, b) => a.quantity - b.quantity);
        } else if (quantity_filter === 'most') {
            filtered.sort((a, b) => b.quantity - a.quantity);
        }

        if (sort_order === 'asc') {
            filtered.sort((a, b) => get_date_object(a.date_added) - get_date_object(b.date_added));
        } else if (sort_order === 'desc') {
            filtered.sort((a, b) => get_date_object(b.date_added) - get_date_object(a.date_added));
        }

        render_table(filtered);
    }, 200);
}

function generate_sample_products() {
    const sample_products = [
        {
            name: "Sample Product 1",
            quantity: 100,
            price: 250.00,
            date_added: "2025-04-01 | 10:00",
            product_details: "This is a sample product.",
            image: "https://i.ibb.co/GfjP2TN9/your-image.jpg"
        },
        {
            name: "Sample Product 2",
            quantity: 50,
            price: 150.00,
            date_added: "2025-04-02 | 12:30",
            product_details: "This is another sample product.",
            image: "https://i.ibb.co/GfjP2TN9/your-image.jpg"
        },
        {
            name: "Sample Product 3",
            quantity: 200,
            price: 99.99,
            date_added: "2025-04-03 | 15:00",
            product_details: "Yet another sample product.",
            image: "https://i.ibb.co/GfjP2TN9/your-image.jpg"
        }
    ];
    
    inventory = sample_products;
    save_to_local_storage();
}

function load_inventory() {
    inventory = JSON.parse(localStorage.getItem('inventory')) || [];
    
    if (inventory.length === 0) {
        generate_sample_products();
    }
    
    render_table();
}

document.addEventListener('DOMContentLoaded', () => {
    load_inventory();
    
    document.getElementById('search').addEventListener('input', filter_table);
    document.getElementById('quantity_filter_type').addEventListener('change', filter_table);
    document.getElementById('sort_order').addEventListener('change', filter_table);
    
    const now = new Date();
    const date_input = document.getElementById('date_added');
    date_input.value = now.toISOString().slice(0, 16);
});