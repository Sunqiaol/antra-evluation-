const API = (() => {
  const URL = "http://localhost:3000";
  const getCart = () => {
    return fetch(URL + "/cart").then((res) => res.json());
    // define your method to get cart data
  };

  const getCartById = (id) => {
    return fetch(`${URL + "/cart"}/${id}`).then((res) => res.json());
    // define your method to get cart data
  };

  const getInventory = () => {
    return fetch(URL + "/inventory").then((res) => res.json());

    // define your method to get inventory data
  };

  const getInventoryById = (id) => {
    return fetch(`${URL + "/inventory"}/${id}`).then((res) => res.json());
  }

  const updateInventory = async (id, content, updatedAmount) => {
   
    return fetch(`${URL + "/inventory"}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id, content, amount: updatedAmount })
    }).then((res) => res.json())
  }


  const addToCart = (inventoryItem) => {
    
    return fetch(URL + "/cart", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(inventoryItem),
    }).then((res) => res.json());
    // define your method to add an item to cart
  };

  const updateCart = (id, content, newAmount) => {
    return fetch(`${URL + "/cart"}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id, content, amount: newAmount })
    }).then((res) => res.json())
    // define your method to update an item in cart
  };

  const deleteFromCart = (id) => {
    return fetch(`${URL + "/cart"}/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    }).then((res) => res.json());
  };
  // define your method to delete an item in cart

  const checkout = () => {
    // you don't need to add anything here
    return getCart().then((data) =>
      Promise.all(data.map((item) => deleteFromCart(item.id)))
    );
  };

  return {
    getCart,
    updateCart,
    getInventory,
    addToCart,
    deleteFromCart,
    checkout,
    updateInventory,
    getInventoryById,
    getCartById
  };
})();

const Model = (() => {
  // implement your logic for Model
  class State {
    #onChange;
    #inventory;
    #cart;
    constructor() {
      this.#inventory = [];
      this.#cart = [];
    }
    get cart() {
      return this.#cart;
    }

    get inventory() {
      return this.#inventory;
    }

    set cart(newCart) {
      this.#cart = newCart;
      this.#onChange()
    }
    set inventory(newInventory) {
      this.#inventory = newInventory;
      this.#onChange();
    }


    subscribe(cb) {
      this.#onChange = cb;
    }
  }
  const {
    getCart,
    updateCart,
    getInventory,
    addToCart,
    deleteFromCart,
    checkout,
    updateInventory,
    getInventoryById,
    getCartById
  } = API;
  return {
    State,
    getCart,
    updateCart,
    getInventory,
    addToCart,
    deleteFromCart,
    checkout,
    updateInventory,
    getInventoryById,
    getCartById
  };
})();

const View = (() => {
  const inventoryEl = document.querySelector(".inventory-item");
  const cartEl = document.querySelector('.cart-item');
  const checkoutbtn = document.querySelector('.checkout-btn')
  const renderinventory = (inventory) => {
    let inventoryTemp = "";

    inventory.forEach((inventory) => {
      const inventoryItemTemp = `<li id=${inventory.id}>
      <span>${inventory.content}</span>
      <button class="inventory__item_minus-btn" "> - </button>
      <span>${inventory.amount}</span>
      <button class="inventory__item_add-btn" " > + </button>
      <button class="inventory__item_add_to_cart-btn">add to cart</button>
    </li>`;
      inventoryTemp += inventoryItemTemp;
    });

    inventoryEl.innerHTML = inventoryTemp;
  };

  const renderCart = (cart) => {
    let cartTemp = "";

    cart.forEach((cart) => {
      const cartItemTemp = `<li id=${cart.id}>
      <span>${cart.content}</span>
      <span> X ${cart.amount}</span>
      <button class="cart__item_delete-btn">Delete</button>
    </li>`;
      cartTemp += cartItemTemp;
    });

    cartEl.innerHTML = cartTemp;
  };
  // implement your logic for View
  return {
    renderinventory,
    renderCart,
    inventoryEl,
    cartEl,
    checkoutbtn
  };
})();

const Controller = ((model, view) => {
  // implement your logic for Controller
  const state = new model.State();


  view.inventoryEl.addEventListener("click", (event) => {
    const element = event.target;
    console.log(element.className)
    const id = element.parentElement.getAttribute("id");
    model.getInventoryById(id).then((item) => {
      if (element.className === "inventory__item_add-btn") {
        model
          .updateInventory(id, item.content, item.amount + 1)
          .then(() => {
            return model.getInventory();
          })
          .then((data) => {
            state.inventory = data;
          });
      }
      else if (element.className === "inventory__item_minus-btn") {
        let amount = 0
        if (item.amount < 1) {
          newamount = 0;
        }
        else {
          newamount = item.amount - 1;
        }
        model
          .updateInventory(id, item.content, newamount)
          .then(() => {
            return model.getInventory();
          })
          .then((data) => {
            state.inventory = data;
          });
      }
      else if (element.className === "inventory__item_add_to_cart-btn") {
        model.getInventoryById(id).then((item) => {
          model.getCartById(id).then((curCartItem) => {
            if (!curCartItem.id || !curCartItem) {
              if(item.amount !== 0){
                model
                .addToCart(item)
                .then(() => {
                  return model.getInventory();
                })
                .then((data) => {
                  state.inventory = data;
                });
              }
            } else {
              if (item.amount === 0) {
                console.log("it empty");
              } else {
                model
                  .updateCart(id, item.content, curCartItem.amount + item.amount)
                  .then(() => {
                    return model.getCart();
                  })
                  .then((data) => {
                    state.cart = data;
                  });
              }
            }
          })
        });
      }

    }
    );
  });

  view.cartEl.addEventListener("click", (event) => {
    const element = event.target;
    if (element.className === "cart__item_delete-btn") {
      const id = element.parentElement.getAttribute("id");
      model.deleteFromCart(id)
        .then(() => {
          return model.getCart();
        })
        .then((data) => {
          state.cart = data;
        });
    }
  });


  const handleUpdateAmount = () => { };

  const handleAddToCart = () => {

  };

  const handleDelete = () => {

  };

  const handleCheckout = () => {
    view.checkoutbtn.addEventListener("click", (event) => {
      model.checkout().then(() => {
        return model.getCart();
      })
        .then((data) => {
          state.cart = data;
        });
    })
  };

  const bootstrap = () => { };
  const init = () => {
    state.subscribe(() => {
      view.renderinventory(state.inventory);
      view.renderCart(state.cart);
    });
    model.getInventory().then((data) => {
      state.inventory = data;
    });
    model.getCart().then((data) => {
      state.cart = data;
    });
    handleCheckout();
  };


  return {
    bootstrap,
    init,
  };
})(Model, View);

Controller.bootstrap();
Controller.init();
