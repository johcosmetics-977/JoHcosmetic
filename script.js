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
let cart = [];
let isAdmin = false;

const ADMIN_PASSWORD = "Faridi@123";

/* ================= LOAD PRODUCTS ================= */

function loadProducts(){

  db.collection("products").onSnapshot(snapshot=>{

    products = [];

    snapshot.forEach(doc=>{
      products.push({id:doc.id,...doc.data()});
    });

    renderProducts();

  });

}

/* ================= RENDER PRODUCTS ================= */

function renderProducts(){

  let box = document.getElementById("productList");
  if(!box) return;

  box.innerHTML = "";

  products.forEach(p=>{

    box.innerHTML += `
      <div class="card">
        <img src="${p.image}">
        <h3>${p.name}</h3>
        <p>Tsh ${p.price}</p>

        <button onclick="addToCart('${p.id}')">🛒 Ongeza</button>

        ${isAdmin ? `
          <button onclick="editProduct('${p.id}')">✏ Edit</button>
          <button onclick="deleteProduct('${p.id}')">🗑 Delete</button>
        ` : ""}

      </div>
    `;
  });

}

/* ================= CART ================= */

function addToCart(id){

  let item = products.find(p=>p.id===id);

  let exist = cart.find(c=>c.id===id);

  if(exist){
    exist.qty++;
  }else{
    cart.push({...item,qty:1});
  }

  updateCart();

}

/* ================= UPDATE CART ================= */

function updateCart(){

  let count = 0;

  cart.forEach(c=>{
    count += c.qty;
  });

  document.getElementById("cartCount").innerText = count;

}

/* ================= ADMIN LOGIN ================= */

function loginAdmin(){

  let pass = document.getElementById("adminPass").value.trim();

  if(pass === ADMIN_PASSWORD){

    isAdmin = true;

    showToast("✅ Admin umeingia");

    changeScreen("admin");

    renderProducts();

  }else{

    alert("Password sio sahihi ❌");

  }

}

/* ================= ADD / UPDATE PRODUCT ================= */

function saveProduct(){

  let id = document.getElementById("editId").value;
  let name = document.getElementById("name").value;
  let price = document.getElementById("price").value;
  let image = document.getElementById("image").value;

  let data = {name,price,image};

  if(id){

    db.collection("products").doc(id).update(data);
    showToast("✏ Product updated");

  }else{

    db.collection("products").add(data);
    showToast("➕ Product added");

  }

}

/* ================= EDIT ================= */

function editProduct(id){

  let p = products.find(x=>x.id===id);

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

  showToast("🗑 Deleted");

}

/* ================= SCREEN ================= */

function changeScreen(id){

  document.querySelectorAll(".screen")
  .forEach(s=>s.classList.remove("active"));

  document.getElementById(id).classList.add("active");

}

/* ================= NAV ================= */

function showHome(){changeScreen("home")}
function showProducts(){loadProducts();changeScreen("products")}
function showCart(){changeScreen("cart")}
function goAdminLogin(){changeScreen("adminLogin")}

/* ================= TOAST ================= */

function showToast(text){

  let t = document.createElement("div");

  t.innerText = text;

  t.style.position="fixed";
  t.style.bottom="90px";
  t.style.left="50%";
  t.style.transform="translateX(-50%)";
  t.style.background="#ff5e99";
  t.style.color="white";
  t.style.padding="10px 15px";
  t.style.borderRadius="20px";
  t.style.zIndex="999999";

  document.body.appendChild(t);

  setTimeout(()=>t.remove(),2000);

}

/* ================= INIT ================= */

loadProducts();
