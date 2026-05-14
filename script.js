let products = JSON.parse(localStorage.getItem("products")) || [];
let cart = [];

/* =========================
   SAVE PRODUCTS
========================= */
function saveData(){
    localStorage.setItem("products", JSON.stringify(products));
}

/* =========================
   ADD ITEM (INVENTORY)
========================= */
function addItem(){

    let name = document.getElementById("itemName").value;
    let qty = parseInt(document.getElementById("itemQty").value);
    let price = parseInt(document.getElementById("itemPrice").value);
    let category = document.getElementById("itemCategory").value;

    if(!name || isNaN(qty) || isNaN(price)){
        alert("Fill all fields");
        return;
    }

    products.push({name, qty, price, category});
    saveData();
    renderList();
}

/* =========================
   RENDER INVENTORY LIST
========================= */
function renderList(){

    let table = document.getElementById("tableBody");
    if(!table) return;

    table.innerHTML = "";

    products.forEach((p,i)=>{

        table.innerHTML += `
        <tr class="${p.qty < 5 ? 'low-stock' : ''}">
            <td>${p.name}</td>
            <td>${p.category}</td>
            <td>${p.qty}</td>
            <td>${p.price}</td>
            <td>${p.qty * p.price}</td>
            <td>
                <button onclick="editItem(${i})">Edit</button>
                <button onclick="deleteItem(${i})">Delete</button>
            </td>
        </tr>
        `;
    });
}

/* =========================
   DELETE ITEM
========================= */
function deleteItem(i){
    products.splice(i,1);
    saveData();
    renderList();
}

/* =========================
   EDIT ITEM
========================= */
function editItem(i){

    let q = prompt("Enter Qty", products[i].qty);
    let p = prompt("Enter Price", products[i].price);

    if(q !== null) products[i].qty = parseInt(q);
    if(p !== null) products[i].price = parseInt(p);

    saveData();
    renderList();
}

/* =========================
   SEARCH (SELL PAGE)
========================= */
function searchItems(){

    let table = document.getElementById("sellBody");
    if(!table) return;

    let search = document.getElementById("search").value.toLowerCase();

    table.innerHTML = "";

    products.forEach((p,i)=>{

        if(p.name.toLowerCase().includes(search)){

            table.innerHTML += `
            <tr>
                <td>${p.name}</td>
                <td>${p.qty}</td>
                <td>${p.price}</td>
                <td><input id="qty-${i}" type="number" placeholder="Qty"></td>
                <td><button onclick="addToCart(${i})">Add</button></td>
            </tr>
            `;
        }
    });
}

/* =========================
   ADD TO CART
========================= */
function addToCart(i){

    let qty = parseInt(document.getElementById(`qty-${i}`).value);

    if(isNaN(qty) || qty <= 0){
        alert("Invalid quantity");
        return;
    }

    if(qty > products[i].qty){
        alert("Not enough stock");
        return;
    }

    cart.push({
        index:i,
        name:products[i].name,
        qty:qty,
        total:qty * products[i].price
    });

    renderCart();
}

/* =========================
   CART
========================= */
function renderCart(){

    let table = document.getElementById("cartBody");
    if(!table) return;

    table.innerHTML = "";

    let total = 0;

    cart.forEach(c=>{
        table.innerHTML += `
        <tr>
            <td>${c.name}</td>
            <td>${c.qty}</td>
            <td>${c.total}</td>
        </tr>
        `;
        total += c.total;
    });

    document.getElementById("grandTotal").innerText =
        "Total: Rs " + total;
}

/* =========================
   CHECKOUT + SALES SAVE
========================= */
function checkout(){

    if(cart.length === 0){
        alert("Cart empty");
        return;
    }

    let billNo = Date.now();
    let totalAmount = 0;

    cart.forEach(c=>{
        products[c.index].qty -= c.qty;
        totalAmount += c.total;
    });

    saveData();

    let sales = JSON.parse(localStorage.getItem("sales")) || [];

    sales.push({
        billNo: billNo,
        items: cart,
        total: totalAmount,
        date: new Date().toISOString().split("T")[0]
    });

    localStorage.setItem("sales", JSON.stringify(sales));

    cart = [];
    renderCart();
    searchItems();
    renderSales();
    renderDashboard();
}

/* =========================
   SALES RENDER (ADVANCED)
========================= */
function renderSales(){

    let table = document.getElementById("salesBody");
    if(!table) return;

    let sales = JSON.parse(localStorage.getItem("sales")) || [];

    let billFilter = document.getElementById("billFilter")?.value.toLowerCase();
    let dateFilter = document.getElementById("dateFilter")?.value;
    let monthFilter = document.getElementById("monthFilter")?.value;

    table.innerHTML = "";

    let total = 0;
    let todayTotal = 0;
    let today = new Date().toISOString().split("T")[0];

    let count = 0;

    sales.forEach((s,i)=>{

        let itemsText = s.items.map(x => x.name).join(", ");

        if(billFilter && !String(s.billNo).includes(billFilter)) return;
        if(dateFilter && s.date !== dateFilter) return;
        if(monthFilter && !s.date.startsWith(monthFilter)) return;

        if(s.date === today){
            todayTotal += s.total;
        }

        total += s.total;
        count++;

        table.innerHTML += `
        <tr>
            <td>${s.date}</td>
            <td>#${s.billNo}</td>
            <td>${itemsText}</td>
            <td>Rs ${s.total}</td>
            <td>
                <button onclick="viewSale(${i})">View</button>
                <button onclick="deleteSale(${i})">Delete</button>
            </td>
        </tr>
        `;
    });

    document.getElementById("totalSales").innerText = "Rs " + total;

    if(document.getElementById("todaySales")){
        document.getElementById("todaySales").innerText = "Rs " + todayTotal;
    }

    if(document.getElementById("totalBills")){
        document.getElementById("totalBills").innerText = count;
    }
}

/* =========================
   VIEW RECEIPT
========================= */
function viewSale(i){

    let sales = JSON.parse(localStorage.getItem("sales")) || [];
    let s = sales[i];

    let win = window.open("", "", "width=400,height=600");

    win.document.write(`
        <h2>Receipt</h2>
        <p><b>Bill No:</b> #${s.billNo}</p>
        <p><b>Date:</b> ${s.date}</p>
        <hr>
        ${s.items.map(it =>
            `${it.name} x${it.qty} = Rs ${it.total}<br>`
        ).join("")}
        <hr>
        <h3>Total: Rs ${s.total}</h3>

        <button onclick="window.print()">Print</button>
    `);

    win.document.close();
}

/* =========================
   DELETE SALE
========================= */
function deleteSale(i){

    let sales = JSON.parse(localStorage.getItem("sales")) || [];

    if(confirm("Delete this sale?")){
        sales.splice(i,1);
        localStorage.setItem("sales", JSON.stringify(sales));
        renderSales();
    }
}

/* =========================
   CLEAR FILTERS
========================= */
function clearFilters(){

    let b = document.getElementById("billFilter");
    let d = document.getElementById("dateFilter");
    let m = document.getElementById("monthFilter");

    if(b) b.value = "";
    if(d) d.value = "";
    if(m) m.value = "";

    renderSales();
}

/* =========================
   DASHBOARD
========================= */
function renderDashboard(){

    if(!document.getElementById("totalProducts")) return;

    let stockValue = 0;
    let low = 0;

    products.forEach(p=>{
        stockValue += p.qty * p.price;
        if(p.qty < 5) low++;
    });

    let sales = JSON.parse(localStorage.getItem("sales")) || [];
    let today = new Date().toISOString().split("T")[0];

    let todayTotal = 0;

    sales.forEach(s=>{
        if(s.date === today) todayTotal += s.total;
    });

    document.getElementById("totalProducts").innerText = products.length;
    document.getElementById("stockValue").innerText = "Rs " + stockValue;
    document.getElementById("todaySales").innerText = "Rs " + todayTotal;
    document.getElementById("lowStock").innerText = low;
}

/* =========================
   AUTO LOAD
========================= */
window.onload = function(){
    renderList();
    renderSales();
    renderDashboard();
};