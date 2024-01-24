import { createApp } from 'https://cdnjs.cloudflare.com/ajax/libs/vue/3.4.13/vue.esm-browser.min.js';

// import components

import Pagination from './components/pagination.js';
import Loader from './components/Loader.js';

// import mixins

import api from './mixins/api.js';
import alert from './mixins/alert.js';

// declare modal

let productModal = null;
let confirmModal = null;

const app = createApp({

    data() {

        return {

            products: [],

            // 排序

            ascending: false,
            sortBy: 'origin_price',

            // 分頁

            pageLimit: 5,
            currentPage: 1,

            // 狀態控制

            isLoading: true,
            isButtonDisabled: false,

            // 除錯用開關

            isDevMode: false,

            // 商品詳細

            tempProduct: {},
            display: {},

        }

    },
    
    mixins: [ api, alert ],

    components: { Pagination },

    computed: {

        sortedProducts() {

        return [...this.products].filter((item, index) => Math.floor(index/this.pageLimit) === this.currentPage - 1)
               .sort((a, b) => this.ascending ? a[this.sortBy] - b[this.sortBy] : b[this.sortBy] - a[this.sortBy])

        },

        pages() { return Math.ceil(this.products.length/this.pageLimit) },

        productTags() {

            const tags = [];

            this.products.forEach(item => {

                if (Array.isArray(item.tags)) {

                item.tags.forEach(tag => tags.find(i => i === tag) ? null : tags.push(tag))

                }

            })
            
            return tags;
        
        }

    },

    watch: {

        isLoading(n) { this.isButtonDisabled = n ? true : false },

        pageLimit(n) { 
            
            if (n < 1) { this.pageLimit = 1 } 
            else if (n > 10) { this.pageLimit = 10 }
        
        }

    },

    methods: {

        // 驗證登入

        checkAdmin() {

            this.isLoading = true;

            const token = this.token();
            axios.defaults.headers.common['Authorization'] = token;

            axios.post(`${this.apiUrl}/api/user/check`, {})
            .then(res => {
                
                this.getProductData();

            }).catch(error => {

                this.isLoading = false;
                this.errorAlert(error, 'error');

                setTimeout(() => { window.location = './login.html' }, 1000)
                
            })

        },

        // 登出

        logout() {

            this.isLoading = true;

            axios.post(`${this.apiUrl}/logout`)
            .then(res => {

                this.isLoading = false;
                this.toastAlert(res.data.message, 'success');

                document.cookie = 'hexVueToken=; Max-Age=-1';
                setTimeout(() => { window.location = './login.html' }, 1000)

            })
            .catch(error => {

                this.isLoading = false;
                this.errorAlert(error, 'error');

            })

        },

        // 取得商品資料

        getProductData() {

            this.isLoading = true;

            axios.get(`${this.apiUrl}/api/${this.path}/admin/products/all`)
            .then(res => {
                this.isLoading = false;
                // console.log(res);
                this.products = Object.values(res.data.products);
            })
            .catch(error => {
                this.isLoading = false;
                this.errorAlert(error, 'error');
            })

        },

        // 排序商品

        sort(type) {

        this.sortBy = type;
        this.ascending = !this.ascending;

        },

        // 切換分頁

        switchPage(num) { this.currentPage = num },

        // 打開互動視窗

        openModal(type, item) {

            item ? this.tempProduct = { ...item } : this.tempProduct = {
                title: '',
                description: '',
                content: '',
                price: 0,
                origin_price: 0,
                unit: '',
                category: '',
                imageUrl: '',
                is_enabled: false,
                tags: [],
                imagesUrl: [],
            };

            if (type === 'remove') { confirmModal.show() } else { productModal.show() }

        },

        // 關閉互動視窗

        hideModal(type) { if (type === 'remove') { confirmModal.hide() } else { productModal.hide() } },

        // 儲存商品資料

        saveProduct(data) {

            // console.log(data);

            if (data.id) {

                this.isLoading = true;

                axios.put(`${this.apiUrl}/api/${this.path}/admin/product/${data.id}`, { data })
                .then(res => {

                    this.isLoading = false;

                    // console.log(res);
                    this.toastAlert(res.data.message, 'success');

                    this.getProductData();
                    this.hideModal();

                })
                .catch(error => {

                    this.isLoading = false;
                    this.errorAlert(error);
                    this.hideModal();
                
                })

            } else {

                this.isLoading = true;

                axios.post(`${this.apiUrl}/api/${this.path}/admin/product`, { data })
                .then(res => {

                    this.isLoading = false;

                    console.log(res);
                    this.toastAlert(res.data.message, 'success');

                    this.getProductData();
                    this.hideModal();

                })
                .catch(error => {

                    this.isLoading = false;
                    this.errorAlert(error);
                    this.hideModal();

                })

            }

        },

        // 刪除商品資料

        removeProduct() {

            this.isLoading = true;

            axios.delete(`${this.apiUrl}/api/${this.path}/admin/product/${this.tempProduct.id}`)
            .then(res => {

                // console.log(res);
                this.isLoading = false;
                this.toastAlert('我們懷念它 ｡ﾟ(ﾟ´ω`ﾟ)ﾟ｡', 'success');
                this.getProductData();
                
                this.hideModal('remove');

            })
            .catch(error => {

                this.isLoading = false;
                this.errorAlert(error);

                this.hideModal('remove');

            })

        },

        // 展示商品詳細

        displayContent(product) {

            this.display = { ...product };

            if (Array.isArray(product.imagesUrl)) {

            // 之前上傳商品資料時丟了很多空值在 imagesUrl 裡面，這裡暫時先這樣處理，之後再補上排除空值的函式

            this.display.imagesUrl = [ product.imageUrl, ...product.imagesUrl.filter(i => i) ];
                
            } else { this.display.imagesUrl = [ product.imageUrl ] }

        }

    },

    mounted() { this.checkAdmin() },

});

app.component('Loader', Loader);

app.component('ProductModal', {

    template: '#product-modal',

    props: ['devMode', 'buttonStatus', 'productTags', 'tempProduct'],

    data() {

        return { 
            
            product: {},
            displayUploadForm: false,

            imagesUrl: [],
            tags: [],

        }

    },

    mixins: [ api, alert ],

    watch: {

        tempProduct(current) { 
            
            // console.log(cur); // 除錯用，可以分別觀察傳值、傳參考時觸發監聽的時機

            this.product = { ...current };

            this.imagesUrl = Array.isArray(current.imagesUrl) ? [ ...current.imagesUrl ] : [];
            this.tags = Array.isArray(current.tags) ? [ ...current.tags ] : [];
        
        },

    },

    methods: {

        hideModal() { productModal.hide() },

        removeInput(key, index) { this[key].splice(index, 1) },

        saveProduct() {

            this.product.imagesUrl = this.imagesUrl;
            this.product.tags = this.tags;

            const isBlank = Object.keys(this.product)
                            .some(key => key !== 'is_enabled' && !Array.isArray(key) && !this.product[key]);

            if (isBlank) { this.toastAlert('請確實填寫所有欄位', 'warning') }
            else { 
                
                this.$emit('save-product', this.product);
            
            }
        
        },

        uploadImage() {

            const file = this.$refs.image.files[0];

            if (file) {

                const formData = new FormData();
                formData.append('file-to-upload', file);

                axios.post(`${this.apiUrl}/api/${this.path}/admin/upload`, formData)
                .then(res => {

                    console.log(res);
                    this.toastAlert('圖片上傳成功！', 'success');
                    this.imagesUrl.push(res.data.imageUrl);
                    file.length = 0;

                })
                .catch(error => { this.errorAlert(error, 'error') })

            }

        }

    },

    mounted() { productModal = new bootstrap.Modal(document.querySelector('#normal-modal'), { backdrop: 'static' }) },

});

app.component('ConfirmModal', {

    template: '#confirm-modal',

    props: ['tempProduct', 'buttonStatus'],

    methods: {

    hideModal() { confirmModal.hide() },

    removeProduct() { this.$emit('remove-product') },

    },

    mounted() { confirmModal = new bootstrap.Modal(document.querySelector('#remove-modal')) }

});

app.mount('#app');