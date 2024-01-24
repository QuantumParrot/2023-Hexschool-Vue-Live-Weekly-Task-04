export default {

    props: ['tempProduct', 'buttonStatus'],

    data() {

    return { confirmModal: '' }

    },

    methods: {

    hideModal() { this.confirmModal.hide() },

    removeProduct() { this.$emit('remove-product') },

    },

    mounted() { 
        
    this.confirmModal = new bootstrap.Modal(this.$refs.modal);
    this.$emit('init-confirm-modal', this.confirmModal);
    
    },

    template: /*html*/`
    <div class="modal fade" aria-hidden="true" tabindex="-1" ref="modal">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <div class="d-flex flex-column justify-content-between p-5">
                    <div class="mb-4">
                        <h3 class="mb-4">確定刪除商品？</h3>
                        <p>您要刪除的商品是：<span class="fw-bold">{{ tempProduct.title }}</span></p>
                        <img class="w-100 mb-3" :src="tempProduct.imageUrl" :alt="tempProduct.title">
                        <p class="text-muted">注意：<span class="text-danger fw-bold">此操作無法復原！</span>你要確定欸！</p>
                    </div>
                    <div>
                        <button type="button" class="btn btn-danger me-3" @click="removeProduct" :disabled="buttonStatus">確定</button>
                        <button type="button" class="btn btn-secondary" @click="hideModal" :disabled="buttonStatus">取消</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `

}