import { createApp } from 'https://cdnjs.cloudflare.com/ajax/libs/vue/3.4.13/vue.esm-browser.min.js';

// import components

import Pagination from './components/pagination.js';
import Loader from './components/loader.js';

import ProductModal from './components/productModal.js';
import ConfirmModal from './components/confirmModal.js';

import DisplayProductContent from './components/displayProductContent.js';

// import mixins

import api from './mixins/api.js';
import alert from './mixins/alert.js';

const app = createApp({

    data() {

        return {

            productModal: '',
            confirmModal: '',

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

    components: { Loader, Pagination, ProductModal, ConfirmModal, DisplayProductContent },

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
            this.display = {};

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

        // 初始化互動視窗

        initProductModal(modal) { this.productModal = modal },

        initConfirmModal(modal) { this.confirmModal = modal },

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

            if (type === 'remove') { this.confirmModal.show() } else { this.productModal.show() }

        },

        // 關閉互動視窗

        hideModal(type) { if (type === 'remove') { this.confirmModal.hide() } else { this.productModal.hide() } },

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

            this.display.imagesUrl = [ product.imageUrl, ...product.imagesUrl ];
                
            } else { this.display.imagesUrl = [ product.imageUrl ] }

        }

    },

    mounted() { this.checkAdmin() },

});

app.mount('#app');