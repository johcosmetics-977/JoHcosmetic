/* ================= FIREBASE CONFIG ================= */
/* WEWE PASTE CONFIG YAKO HAPA */

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
let cart = [];
let isAdmin = false;

/* ================= SCREEN HISTORY ================= */

let screenHistory = ["home"];

/* ================= LOAD PRODUCTS ================= */

function loadProducts() {

  db.collection("products").onSnapshot(snapshot => {

    products = [];

    snapshot.forEach(doc => {

      products.push({
        id: doc.id,
        ...doc.data()
      });

    });

    renderProducts();

  });

}

/* ================= RENDER PRODUCTS ================= */

function renderProducts() {

  let box = document.getElementById("productList");

  box.innerHTML = "";

  products.forEach(p => {

    box.innerHTML += `

    <div class="card">

    <img src="${p.image}" style="width:100%;border-radius:12px;">

    <h3>${p.name}</h3>

    <p>Tsh ${p.price}</p>

    ${
    isAdmin
    ?
    `
    <button onclick="editProduct('${p.id}','${p.name}','${p.price}','${p.image}')">
    Edit
    </button>

    <button onclick="deleteProduct('${p.id}')">
    Delete
    </button>
    `:
    `
    <button onclick="addToCart('${p.id}')">
    Ongeza Kikapuni 🛒
    </button>
    `
    }

    </div>

    `;

  });

}

/* ================= ADD TO CART ================= */

function addToCart(id) {

  let item = products.find(p => p.id === id);

  let exist = cart.find(c => c.id === id);

  if (exist) {

    exist.qty += 1;

  } else {

    cart.push({
      ...item,
      qty: 1
    });

  }

  updateCartSummary();

  renderCart();

  showToast("✔️ Bidhaa imeongezwa kwenye Kikapu 🛒");

}

/* ================= DECREASE QTY ================= */

function decreaseQty(id) {

  let item = cart.find(c => c.id === id);

  if (!item) return;

  item.qty -= 1;

  if (item.qty <= 0) {

    cart = cart.filter(c => c.id !== id);

  }

  updateCartSummary();

  renderCart();

}

/* ================= UPDATE SUMMARY ================= */

function updateCartSummary() {

  let count = 0;
  let total = 0;

  cart.forEach(i => {

    count += i.qty;

    total += Number(i.price) * i.qty;

  });

  document.getElementById("cartCount").innerText = count;

  document.getElementById("cartTotal").innerText = total;

}

/* ================= SHOW CART ================= */

function showCart() {

  renderCart();

  changeScreen("cart");

}

/* ================= RENDER CART ================= */

function renderCart() {

  let box = document.getElementById("cartList");

  box.innerHTML = "";

  if (cart.length === 0) {

    box.innerHTML = `
    <p>Kikapu hakina bidhaa 🛒</p>
    `;

    return;

  }

  cart.forEach(c => {

    box.innerHTML += `

    <div class="card">

    <h3>${c.name}</h3>

    <p>
    Tsh ${c.price}
    </p>

    <div style="display:flex;gap:10px;align-items:center;">

    <button onclick="decreaseQty('${c.id}')">
    ➖
    </button>

    <span>
    ${c.qty}
    </span>

    <button onclick="addToCart('${c.id}')">
    ➕
    </button>

    </div>

    </div>

    `;

  });

}

/* ================= CHECKOUT ================= */

function checkout() {

  if (cart.length === 0) {

    alert("Kikapu hakina bidhaa");

    return;

  }

  let name = document.getElementById("cName").value;

  let loc = document.getElementById("cLocation").value;

  let total = 0;

  let msg = "💄 ODA YA JoH Cosmetics %0A%0A";

  cart.forEach(c => {

    let subtotal = c.price * c.qty;

    total += subtotal;

    msg += `🛍 ${c.name} x${c.qty} = Tsh ${subtotal}%0A`;

  });

  msg += `%0A💰 Jumla: Tsh ${total}`;

  msg += `%0A%0A👤 Jina: ${name}`;

  msg += `%0A📍 Mahali: ${loc}`;

  window.open(
    `https://wa.me/255677544659?text=${msg}`,
    "_blank"
  );

}

/* ================= ADMIN LOGIN ================= */

function loginAdmin() {

  let pass = document.getElementById("adminPass").value;

  if (pass === "Faridi@123") {

    isAdmin = true;

    changeScreen("admin");

    showToast("✅ Admin umeingia");

  } else {

    alert("Password sio sahihi ❌");

  }

}

/* ================= SAVE PRODUCT ================= */

function saveProduct() {

  let id = document.getElementById("editId").value;

  let n = document.getElementById("name").value;

  let p = document.getElementById("price").value;

  let img = document.getElementById("image").value;

  if (id) {

    db.collection("products")
    .doc(id)
    .update({
      name: n,
      price: p,
      image: img
    });

  } else {

    db.collection("products")
    .add({
      name: n,
      price: p,
      image: img
    });

  }

  showToast("💄 Bidhaa imesaveka");

}

/* ================= EDIT PRODUCT ================= */

function editProduct(id, name, price, image) {

  document.getElementById("editId").value = id;

  document.getElementById("name").value = name;

  document.getElementById("price").value = price;

  document.getElementById("image").value = image;

  changeScreen("admin");

}

/* ================= DELETE PRODUCT ================= */

function deleteProduct(id) {

  db.collection("products")
  .doc(id)
  .delete();

  showToast("🗑 Bidhaa imefutwa");

}

/* ================= NAVIGATION ================= */

function showHome() {

  changeScreen("home");

}

function showProducts() {

  loadProducts();

  changeScreen("products");

}

function goAdminLogin() {

  changeScreen("adminLogin");

}

/* ================= CHANGE SCREEN ================= */

function changeScreen(id) {

  document.querySelectorAll(".screen")
  .forEach(s => s.classList.remove("active"));

  document.getElementById(id)
  .classList.add("active");

  /* save history */
  if (screenHistory[screenHistory.length - 1] !== id) {

    screenHistory.push(id);

  }

}

/* ================= TOAST ================= */

function showToast(text) {

  let msg = document.createElement("div");

  msg.innerText = text;

  msg.style.position = "fixed";
  msg.style.bottom = "90px";
  msg.style.left = "50%";
  msg.style.transform = "translateX(-50%)";
  msg.style.background = "#ff5e99";
  msg.style.color = "white";
  msg.style.padding = "12px 18px";
  msg.style.borderRadius = "20px";
  msg.style.zIndex = "999999";
  msg.style.fontSize = "14px";

  document.body.appendChild(msg);

  setTimeout(()=> {
    msg.remove();
  }, 2000);

}

/* ================= DOUBLE SWIPE BACK FIX ================= */

/* prevent normal browser back */
history.pushState(null, null, location.href);

let backCount = 0;

let backTimer;

window.addEventListener("popstate", function() {

  history.pushState(null, null, location.href);

  backCount++;

  clearTimeout(backTimer);

  backTimer = setTimeout(()=> {
    backCount = 0;
  }, 1000);

  /* first swipe */
  if (backCount === 1) {

    showToast("⬅️ Swipe tena haraka");

    return;

  }

  /* second swipe */
  if (backCount >= 2) {

    backCount = 0;

    /* if not home */
    if (screenHistory.length > 1) {

      screenHistory.pop();

      let previous =
      screenHistory[screenHistory.length - 1];

      document.querySelectorAll(".screen")
      .forEach(s => s.classList.remove("active"));

      document.getElementById(previous)
      .classList.add("active");

      showToast("🏠 Umerudi nyuma");

    }

    /* already home */
    else {

      showToast("👋 Umetoka JoH Cosmetics");

      window.history.go(-2);

    }

  }

});