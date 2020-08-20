import zh from './zh_TW.js';

// 自定義設定檔案，錯誤的 className
VeeValidate.configure({
  classes: {
    valid: 'is-valid',
    invalid: 'is-invalid',
  },
});

// 載入自訂規則包
VeeValidate.localize('tw', zh);

// input 驗證工具載入
Vue.component('ValidationProvider', VeeValidate.ValidationProvider);
// form 驗證工具載入
Vue.component('ValidationObserver', VeeValidate.ValidationObserver);
// 掛載 Vue-Loading 套件
Vue.use(VueLoading);
// 全域註冊 VueLoading 並標籤設定為 loading
Vue.component('loading', VueLoading);

new Vue({
  el: '#app',
  data: {
    products: [],
    tempProduct: {
      num: 0,
    },
    status: {
      loadingItem: '',
    },
    form: {
      name: '',
      email: '',
      tel: '',
      address: '',
      payment: '',
      message: '',
    },
    carts: [],
    cartTotal: 0,
    isLoading: false,
    uuid: '53e0672b-2090-45df-a2bf-db5af28f0fcb',
    apiPath: 'https://course-ec-api.hexschool.io',
  },
  methods: {
    //取得前台商品列表
    getProducts(page = 1) {
      this.isLoading = true;
      const url = `${this.apiPath}/api/${this.uuid}/ec/products?page=${page}`;
      axios.get(url).then(res => {
        //console.log(res);
        this.isLoading = false
        this.products = res.data.data;
      }).catch(error => {
        //console.log(error);
        this.isLoading = false;
      });
    },
    getProduct(id) {
      //GET api/{uuid}/ec/product/{id}
      this.status.loadingItem = id;
      const url = `${this.apiPath}/api/${this.uuid}/ec/product/${id}`;
      //console.log(id);
      axios.get(url).then(res => {
        //console.log(res);
        this.status.loadingItem = '';
        this.tempProduct = res.data.data;
        this.tempProduct.num = 1;
        // 進階寫法
        // this.tempProduct = {
        //     ...res.data.data,
        //     num: 1
        // };
        $('#productModal').modal('show');
      });
    },
    addToCart(item, quantity = 1) {
      //POST api/{uuid}/ec/shopping
      const url = `${this.apiPath}/api/${this.uuid}/ec/shopping`;
      this.status.loadingItem = item.id;
      const cart = {
        product: item.id,
        quantity, //<- es6寫法   quantity: quantity
      };
      axios.post(url, cart)
        .then(() => {
          this.status.loadingItem = '';
          $('#productModal').modal('hide');
          this.getCart();
        })
        .catch((error) => {
          this.status.loadingItem = '';
          console.log(error.response.data.errors);
          $('#productModal').modal('hide');
        });
    },
    getCart() {
      this.isLoading = true;
      //GET api/{uuid}/ec/shopping
      const url = `${this.apiPath}/api/${this.uuid}/ec/shopping`;
      axios.get(url)
        .then(res => {
          this.isLoading = false;
          //console.log('購物車', res);
          this.carts = res.data.data;
          this.updateTotal();
        })
        .catch(error => {
          this.isLoading = false;
          //console.log('購物車', error);
        })
    },
    updateTotal() {
      this.carts.forEach(item => {
        this.cartTotal += item.product.price * item.quantity;
      });
    },
    updateQuantity(id, quantity) {
      //PATCH api/{uuid}/ec/shopping
      const url = `${this.apiPath}/api/${this.uuid}/ec/shopping`;
      this.isLoading = true;
      const cart = {
        product: id,
        quantity,
      };
      console.log(cart);
      axios.patch(url, cart)
        .then(res => {
          this.isLoading = false;
          //console.log(res);
          this.getCart();
        })
        .catch(error => {
          this.isLoading = false;
          //console.log(error.response);
        })
    },
    removeAllCartItem() {
      this.isLoading = true;
      const url = `${this.apiPath}/api/${this.uuid}/ec/shopping/all/product`;

      axios.delete(url)
        .then(() => {
          this.isLoading = false;
          this.getCart();
        });
    },
    removeCartItem(id) {
      this.isLoading = true;
      const url = `${this.apiPath}/api/${this.uuid}/ec/shopping/${id}`;

      axios.delete(url).then(() => {
        this.isLoading = false;
        this.getCart();
      });
    },
    createOrder() {
      this.isLoading = true;
      const url = `${this.apiPath}/api/${this.uuid}/ec/orders`;

      axios.post(url, this.form).then((response) => {
        if (response.data.data.id) {
          this.isLoading = false;
          // 跳出提示訊息
          $('#orderModal').modal('show');

          // 重新渲染購物車
          this.getCart();
        }
      }).catch((error) => {
        this.isLoading = false;
        console.log(error.response.data.errors);
      });
    },
  },
  created() {
    this.getProducts();
    this.getCart();
  },
});
