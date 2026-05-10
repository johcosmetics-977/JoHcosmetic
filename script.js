/* ================= FIREBASE ================= */

const firebaseConfig = {
  apiKey: "AIzaSyB1zct7CzQ60_dTHZSDEbWok_OsYIneG0g",
  authDomain: "johbeauty.firebaseapp.com",
  projectId: "johbeauty",
  storageBucket: "johbeauty.firebasestorage.app",
  messagingSenderId: "1050478968505",
  appId: "1:1050478968505:web:34cd7a166a65771bc8e568"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

/* ================= STATE ================= */

let products = [];
let filteredProducts = [];
let cart = [];
let isAdmin = false;

const ADMIN_PASSWORD = "Mchukwa@123";

/* ================= LOAD PRODUCTS ================= */

function loadProducts(){

  db.collection("products").onSnapshot(snapshot=>{

    products = [];

    snapshot.forEach(doc=>{
      products.push({
        id: doc.id,
        ...doc.data()
      });
    });

    filteredProducts = products;

    renderProducts(filteredProducts);

  });

}

/* ================= SEARCH FUNCTION ================= */

function searchProducts(){

  let value = document
    .getElementById("searchInput")
    .value
    .toLowerCase();

  filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(value)
  );

  renderProducts(filteredProducts);

}

/* ================= RENDER PRODUCTS ================= */

function renderProducts(list){

  let box = document.getElementById("productList");

  if(!box) return;

  box.innerHTML = "";

  list.forEach(p=>{

    box.innerHTML += `

    <div class="card">

      <img src="${p.image}" alt="${p.name}">

      <h3>${p.name}</h3>

      <p>Tsh ${p.price}</p>

      <button onclick="addToCart('${p.id}')">
        🛒 Ongeza
      </button>

      ${isAdmin ? `

        <button onclick="editProduct('${p.id}')">
          ✏ Edit
        </button>

        <button onclick="deleteProduct('${p.id}')">
          🗑 Delete
        </button>

      ` : ""}

    </div>

    `;

  });

}

/* ================= ADD TO CART ================= */

function addToCart(id){

  let item = products.find(p=>p.id===id);

  if(!item) return;

  let exist = cart.find(c=>c.id===id);

  if(exist){
    exist.qty++;
  }else{
    cart.push({...item, qty:1});
  }

  updateCart();

  showToast("🛒 Bidhaa imeongezwa");

}

/* ================= REMOVE ITEM ================= */

function removeFromCart(id){

  cart = cart.filter(c=>c.id !== id);

  updateCart();

  renderCheckout();

}

/* ================= UPDATE CART ================= */

function updateCart(){

  let count = 0;

  cart.forEach(c=>{
    count += c.qty;
  });

  document.getElementById("cartCount").innerText = count;

}

/* ================= OPEN CHECKOUT ================= */

function openCheckout(){

  renderCheckout();

  document
    .getElementById("checkoutSheet")
    .classList.add("active");

}

/* ================= CLOSE CHECKOUT ================= */

function closeCheckout(){

  document
    .getElementById("checkoutSheet")
    .classList.remove("active");

}

/* ================= RENDER CHECKOUT ================= */

function renderCheckout(){

  let box = document.getElementById("checkoutList");

  box.innerHTML = "";

  let total = 0;

  if(cart.length === 0){

    box.innerHTML = `<p>Kikapu hakina bidhaa 🛒</p>`;

    document.getElementById("checkoutTotal").innerText = 0;

    return;

  }

  cart.forEach(c=>{

    let subtotal = Number(c.price) * c.qty;

    total += subtotal;

    box.innerHTML += `

    <div class="checkoutItem">

      <div>
        <h4>${c.name}</h4>
        <p>${c.qty} x Tsh ${c.price}</p>
      </div>

      <div style="display:flex;align-items:center;gap:10px;">
        <b>Tsh ${subtotal}</b>
        <button class="removeBtn" onclick="removeFromCart('${c.id}')">✖</button>
      </div>

    </div>

    `;

  });

  document.getElementById("checkoutTotal").innerText = total;

}

/* ================= WHATSAPP CHECKOUT ================= */

function checkout(){

  if(cart.length === 0){
    alert("Kikapu hakina bidhaa");
    return;
  }

  let name = document.getElementById("cName").value;
  let location = document.getElementById("cLocation").value;

  let total = 0;

  let msg = "";

msg += "CUSTOMER ORDER\n";
msg += "--------------------------\n\n";

cart.forEach(c=>{
  let subtotal = Number(c.price) * c.qty;
  total += subtotal;

  msg += c.name + " x" + c.qty + " = Tsh " + subtotal + "\n";
});

msg += "\n--------------------------\n";
msg += "TOTAL: Tsh " + total + "\n\n";

msg += "CUSTOMER DETAILS\n";
msg += "Name: " + name + "\n";
msg += "Location: " + location + "\n";

let url = "https://wa.me/255677544659?text=" + encodeURIComponent(msg);

window.open(url, "_blank");

}

/* ================= ADMIN LOGIN ================= */

function loginAdmin(){

  let pass = document.getElementById("adminPass").value.trim();

  if(pass === ADMIN_PASSWORD){

    isAdmin = true;

    showToast("✅ Admin umeingia");

    changeScreen("admin");

    renderProducts(filteredProducts);

  }else{
    alert("Password sio sahihi ❌");
  }

}

/* ================= SAVE PRODUCT ================= */

function saveProduct(){

  let id = document.getElementById("editId").value;

  let name = document.getElementById("name").value;
  let price = document.getElementById("price").value;
  let image = document.getElementById("image").value;

  if(name === "" || price === "" || image === ""){
    alert("Jaza taarifa zote");
    return;
  }

  let data = {name,price,image};

  if(id){

    db.collection("products").doc(id).update(data);
    showToast("✏ Product updated");

  }else{

    db.collection("products").add(data);
    showToast("➕ Product added");

  }

  document.getElementById("editId").value = "";
  document.getElementById("name").value = "";
  document.getElementById("price").value = "";
  document.getElementById("image").value = "";

}

/* ================= EDIT ================= */

function editProduct(id){

  let p = products.find(x=>x.id===id);
  if(!p) return;

  document.getElementById("editId").value = p.id;
  document.getElementById("name").value = p.name;
  document.getElementById("price").value = p.price;
  document.getElementById("image").value = p.image;

  changeScreen("admin");

}

/* ================= DELETE ================= */

function deleteProduct(id){

  if(!isAdmin) return;

  db.collection("products").doc(id).delete();

  showToast("🗑 Product imefutwa");

}

/* ================= NAV ================= */

function showHome(){changeScreen("home")}
function showProducts(){loadProducts();changeScreen("products")}
function goAdminLogin(){changeScreen("adminLogin")}

/* ================= SCREEN ================= */

function changeScreen(id){

  document.querySelectorAll(".screen").forEach(s=>{
    s.classList.remove("active");
  });

  document.getElementById(id).classList.add("active");

}

/* ================= TOAST ================= */

function showToast(text){

  let t = document.createElement("div");

  t.innerText = text;
  t.style.position="fixed";
  t.style.bottom="100px";
  t.style.left="50%";
  t.style.transform="translateX(-50%)";
  t.style.background="#ff5e99";
  t.style.color="white";
  t.style.padding="12px 18px";
  t.style.borderRadius="20px";
  t.style.zIndex="999999";

  document.body.appendChild(t);

  setTimeout(()=>t.remove(),2000);

}

/* ================= INIT ================= */

loadProducts();
