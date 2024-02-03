import api from '../mixins/api.js';
import alert from '../mixins/alert.js';

export default {

    props: ['devMode', 'buttonStatus', 'productTags', 'tempProduct'],

    data() {

        return { 

            productModal: '',
            
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

        hideModal() { this.productModal.hide() },

        removeInput(key, index) { this[key].splice(index, 1) },

        saveProduct() {

            this.product.imagesUrl = this.imagesUrl;
            this.product.tags = this.tags;

            const isBlank = Object.keys(this.product)
                            .some(key => key !== 'is_enabled' && !this.product[key]);

            if (isBlank) { this.toastAlert('請確實填寫所有欄位', 'warning') }
            else { this.$emit('save-product', this.product) }
        
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

    mounted() { 

        // 到了 mounted 階段才能讀取到 $refs 的 DOM 元素
        
        this.productModal = new bootstrap.Modal(this.$refs.modal, { backdrop: 'static' });

        // 下面這段程式碼是參考同學小夏在作業討論區分享的方法：在 mounted 階段就透過 $emit 將 modal 實例送到外層元件去 ( 原來可以這樣寫，同學太厲害了~~ )

        this.$emit('init-product-modal', this.productModal);
    
    },

    template: /*html*/`
    <div class="modal modal-lg fade" aria-hidden="true" tabindex="-1" ref="modal">
        <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="mb-0" v-if="tempProduct.title">{{ tempProduct.title }}</h5>
                    <button type="button" class="btn-close" aria-label="Close" @click="hideModal" :disabled="buttonStatus"></button>
                </div>
                <div class="modal-body">
                    <form>
                        <div class="row">
                            <div class="col-md-6">
                                <!-- 主圖網址 ( imageUrl ) -->
                                <div class="mb-3">
                                    <label for="imageUrl" class="form-label">主圖網址</label>
                                    <input type="text" id="imageUrl" class="form-control mb-3" v-model="product.imageUrl">
                                    <template v-if="product.imageUrl">
                                        <img class="w-100" :src="product.imageUrl" :alt="product.title">
                                    </template>
                                </div>
                                <!-- 副圖 ( imagesUrl ) -->
                                <div class="mb-3" v-if="imagesUrl.length">
                                    <p>副圖網址 ( 最多五張 )</p>
                                    <div class="d-flex flex-column gap-3">
                                        <template v-for="(img, idx) in imagesUrl">
                                            <div class="position-relative">
                                                <input type="text" class="form-control pe-5" :key="img" v-model.trim="imagesUrl[idx]">
                                                <button type="button" class="btn border-0 btn-remove" @click="removeInput('imagesUrl', idx)">
                                                    <span class="material-icons">clear</span>
                                                </button>
                                            </div>
                                            <img class="w-100" :src="img" alt="img" v-if="img">
                                        </template>
                                    </div>
                                </div>
                                <div class="alert bg-light" v-if="devMode">{{ imagesUrl }}</div>
                                <!-- 上傳圖片欄位 -->
                                <form enctype="multipart/form-data" method="post" v-if="displayUploadForm">
                                    <div class="border rounded-2 p-3 mb-3">
                                        <input type="file" class="form-control w-100 mb-3" name="file-to-upload" ref="image">
                                        <p class="fs-7 text-muted">僅限 jpg、jpeg、png 格式，檔案大小限制為 3MB 以下</p>
                                        <div class="text-end">
                                            <button type="button" class="btn btn-outline-secondary" @click="uploadImage" :disabled="imagesUrl.length > 4">確認上傳</button>
                                        </div>
                                    </div>
                                </form>
                                <div class="d-flex gap-2" v-if="imagesUrl.length < 5">
                                <button type="button" class="btn btn-primary w-100" @click="imagesUrl.push('')"
                                        :disabled="buttonStatus">新增圖片</button>
                                <button type="button" class="btn btn-secondary w-100" @click="displayUploadForm = !displayUploadForm"
                                        :disabled="buttonStatus">上傳圖片</button>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="title" class="form-label">產品名稱</label>
                                    <input type="text" id="title" class="form-control" v-model="product.title">
                                </div>
                                <div class="mb-3">
                                    <label for="title" class="form-label">產品資訊</label>
                                    <input type="text" id="title" class="form-control" v-model="product.subtitle">
                                </div>
                                <div class="mb-3">
                                    <label for="description" class="form-label">產品描述</label>
                                    <textarea id="description" class="form-control" cols="30" rows="5" v-model="product.description"></textarea>
                                </div>
                                <div class="mb-3">
                                    <label for="content" class="form-label">產品規格</label>
                                    <textarea id="content" class="form-control" cols="30" rows="5" v-model="product.content"></textarea>                             
                                </div>
                                <div class="row mb-3">
                                    <div class="col-md-6">
                                        <label for="category" class="form-label">產品分類</label>
                                        <input type="text" id="category" class="form-control" v-model="product.category">
                                    </div>
                                    <div class="col-md-6">
                                        <label for="unit" class="form-label">產品單位</label>
                                        <input type="text" id="unit" class="form-control" v-model="product.unit">
                                    </div>
                                </div>
                                <div class="row mb-3">
                                    <div class="col-md-6">
                                        <label for="origin_price" class="form-label">原價</label>
                                        <input type="number" id="origin_price" class="form-control" v-model.number="product.origin_price">
                                    </div>
                                    <div class="col-md-6">
                                        <label for="price" class="form-label">售價</label>
                                        <input type="number" id="price" class="form-control" v-model.number="product.price">
                                    </div>
                                </div>
                                <div class="d-flex justify-content-between align-items-center mb-3">
                                    <p class="mb-0">產品標籤</p>
                                    <button type="button" class="btn btn-sm btn-secondary" @click="tags.push('')" :disabled="buttonStatus">新增標籤</button>
                                </div>
                                <!-- 可重複利用的標籤 -->
                                <div class="d-flex flex-wrap gap-1 mb-3" v-if="productTags.length">
                                    <button type="button" class="btn badge bg-light px-3 py-2 text-muted"
                                            v-for="tag in productTags" :key="tag" @click="tags.push(tag)">{{ tag }}</button>
                                </div>
                                <div v-if="tags.length">
                                    <div class="row row-cols-2 gy-3">
                                        <div class="col" v-for="(tag, idx) in tags" :key="tag">
                                            <div class="position-relative">
                                                <input type="text" class="form-control" v-model.trim="tags[idx]">
                                                <button type="button" class="btn border-0 btn-remove" @click="removeInput('tags', idx)">
                                                    <span class="material-icons">clear</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="alert bg-light mt-3" v-if="devMode">{{ tags }}</div>
                            </div>
                        </div>
                    </form>
                </div>
                <div class="modal-footer justify-content-between">
                    <div>
                        <input type="checkbox" id="is_enabled" class="form-check-input me-2" v-model="product.is_enabled">
                        <label for="is_enabled" class="form-check-label">是否啟用</label>
                    </div>
                    <div>
                        <button type="button" class="btn btn-primary me-2" @click="saveProduct" :disabled="buttonStatus">儲存</button>
                        <button type="button" class="btn btn-secondary" @click="hideModal" :disabled="buttonStatus">取消</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `

}