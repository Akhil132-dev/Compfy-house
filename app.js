//variables
const cartBtn = document.querySelector(".cart-btn");
const closeCartbtn = document.querySelector(".close-cart");
const clearCartbtn = document.querySelector(".clear-cart");
const cartDom = document.querySelector(".cart");
const cartOverlay = document.querySelector(".cart-overlay");
const cartItems = document.querySelector(".cart-items");
const cartTotal = document.querySelector(".cart-total");
const cartContent = document.querySelector(".cart-content");
const productsDom = document.querySelector(".products-center");
//cart
let cart = [];
// buttons
let buttonsDOM = [];
//getting the products
class Products {

    //Method
    async getProducts() {
        try { //    await we will wait for the return promise and then we return till then we will wait
            let result = await fetch('products.json')
            const data = await result.json();

            let products = data.items;
            products = products.map(item => {
                const { title, price } = item.fields;
                const { id } = item.sys;
                const image = item.fields.image.fields.file.url;
                return { title, price, id, image }
            })
            return products;
        }
        catch (erro) {
            console.log(erro);
        }


    }


}
//display Products

class UI {
    displyProducts(products) {
        let result = '';
        products.forEach(product => {
            result += `
           <article class="product">
          <div class="img-container">
            <img src=${product.image}
             class="product-img" 
             alt="" />
            <button class="bag-btn" data-id=${product.id}>
              <i class="fa fa-shopping-cart" aria-hidden="true"></i>
              add to cart
            </button>
          </div>
          <h3>${product.title}</h3>
          <h4>$${product.price}</h4>
        </article>
           
           `
        })
        productsDom.innerHTML = result;
    }
    //Method
    getBagButton() {
        const buttons = [...document.querySelectorAll('.bag-btn')];

        buttonsDOM = buttons;

        buttons.forEach(button => {
            let id = button.dataset.id;
            let inCart = cart.find(item => item.id === id);
            if (inCart) {
                button.innerHTML = "In Cart";
                button.disabled = true;
            }

            button.addEventListener('click', (event) => {
                event.target.innerHTML = "In Cart";
                event.target.disabled = true;
                //get product form products
                let cartItem = { ...Storage.getProduct(id), amount: 1 };//this is an objcts


                //add product to cart
                cart = [...cart, cartItem];
                //save cart in local storage
                Storage.saveCart(cart);
                //set cart values
                this.setCartValues(cart);
                //display cart item
                this.addCartItem(cartItem)
                //show the cart
                this.showCart();
            })

        })
    }
    setCartValues(cart) {
        let tempTotal = 0;
        let itemsTotal = 0;
        cart.map(item => {
            tempTotal += item.price * item.amount;
            itemsTotal += item.amount;
        });
        cartTotal.innerHTML = parseFloat(tempTotal.toFixed(2));
        cartItems.innerHTML = itemsTotal;

    }
    addCartItem(item) {
        const div = document.createElement('div');
        div.classList.add('cart-item');
        div.innerHTML = `  <img src="${item.image}" alt="" />
        <div class="">
          <h4>${item.title}</h4>
          <h4>$${item.price}</h4>
          <span class="remove-item"  data-id = ${item.id}>remove</span>
        </div>
        <div>
          <i class="fa fa-chevron-up" data-id =  ${item.id}></i>
          <p class="item-amount">${item.amount}</p>
          <i class="fa fa-chevron-down" data-id =   ${item.id}></i>
        </div>`;
        cartContent.appendChild(div);

    }
    showCart() {
        cartOverlay.classList.add('transparentBcg');
        cartDom.classList.add('showCart');
    }
    setupAPP() {
        cart = Storage.getCart();
        this.setCartValues(cart);
        this.populateCart(cart);
        cartBtn.addEventListener('click', this.showCart);
    }
    populateCart(cart) {
        cart.forEach(item => this.addCartItem(item)
        );
        closeCartbtn.addEventListener('click', this.hideCart);
    }
    hideCart() {
        cartOverlay.classList.remove('transparentBcg');
        cartDom.classList.remove('showCart');
    }

    cartLogic() {
        //clear cart button
        clearCartbtn.addEventListener('click', () => {
            this.clearCart();
        })
        //cart functionality
        cartContent.addEventListener('click', event => {
            if (event.target.classList.contains('remove-item')) {
                let removeItem = event.target;
                let id = removeItem.dataset.id;
                cartContent.removeChild(removeItem.parentElement.parentElement);
                this.removeItem(id);
            }
            else if (event.target.classList.contains('fa-chevron-up')) {
                let addAmount = event.target;
                // console.log(addAmount)
                let id = addAmount.dataset.id;
                // console.log(id)
                let tempItem = cart.find(item => item.id === id);
                // console.log(tempItem)
                tempItem.amount += 1;
                Storage.saveCart(cart);
                this.setCartValues(cart);
                addAmount.nextElementSibling.innerHTML = tempItem.amount;
            }
            else if (event.target.classList.contains('fa-chevron-down')) {
                let lowerAmount = event.target;
                let id = lowerAmount.dataset.id;
                let tempItem = cart.find(item => item.id === id);

                tempItem.amount -= 1;
                if (tempItem.amount > 0) {
                    Storage.saveCart(cart);
                    this.setCartValues(cart);
                    lowerAmount.previousElementSibling.innerHTML = tempItem.amount;
                } else {
                    cartContent.removeChild(lowerAmount.parentElement.parentElement);
                    this.removeItem(id);
                }
            }
        })
    }
    clearCart() {
        let cartItems = cart.map(item => item.id);
        cartItems.forEach(id => this.removeItem(id));

        while (cartContent.children.length > 0) {
            cartContent.removeChild(cartContent.children[0]);
        }
        this.hideCart();
    }
    removeItem(id) {
        cart = cart.filter(item => item.id !== id);
        this.setCartValues(cart);
        Storage.saveCart(cart);
        let button = this.getSinglebutton(id);
        button.disabled = false;
        button.innerHTML = `  <i class="fa fa-shopping-cart"></i> add to cart`
    }
    getSinglebutton(id) {
        return buttonsDOM.find(button => button.dataset.id === id);
    }
}
//local Storage

class Storage {

    static saveProducts(products) {
        localStorage.setItem("products", JSON.stringify(products))
    }

    static getProduct(id) {
        let products = JSON.parse(localStorage.getItem('products'));
        return products.find(product => product.id === id);
    }
    static saveCart(cart) {
        localStorage.setItem('cart', JSON.stringify(cart))
    }
    static getCart() {
        return localStorage.getItem('cart') ? JSON.parse(localStorage.getItem('cart')) : [];
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const ui = new UI(); // object created for ui class
    const products = new Products(); // object created for Products class
    //    setup app
    ui.setupAPP()

    //get all products
    products.getProducts().then(products => {
        ui.displyProducts(products)
        Storage.saveProducts(products)
    }
    ).then(() => {
        ui.getBagButton()
        ui.cartLogic()
    });

});
