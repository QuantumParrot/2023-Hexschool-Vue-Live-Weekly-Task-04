export default {

    props: ['display'],

    template: /*html*/`
    <div class="card overflow-hidden rounded-2">
        <div class="row">
            <div class="col-5">
                <div class="text-center">
                    <img :src="display.imageUrl" :alt="display.title" class="card-img rounded-0 mb-3">
                    <div class="d-flex gap-3 overflow-hidden oveflow-x-scroll">
                    <img class="display-img" v-for="img in display.imagesUrl" :key="img" :src="img" :alt="display.title" @click="display.imageUrl = img">
                    </div>
                </div>
            </div>
            <div class="col-7 ps-0">
                <div class="p-4 h-100 d-flex flex-column justify-content-between">
                    <div>
                        <h3 class="fw-bold mb-3">
                        {{ display.title }}
                        <a href="#" class="float-end text-dark text-decoration-none" @click.prevent="$emit('remove-display')">
                        <span class="material-icons">clear</span></a>
                        </h3>
                        <p class="text-muted fs-6 fst-italic">{{ display.subtitle }}</p>
                        <p class="text-muted fs-6">
                        <span class="badge bg-secondary px-3 me-3">{{ display.category }}</span>
                        <span>{{ display.content }}</span>
                        </p>
                        <p>{{ display.description }}</p>
                        <div class="d-flex gap-2" v-if="display.tags">
                        <span class="badge bg-light px-3 py-2 text-muted" v-for="tag in display.tags" :key="tag">＃{{ tag }}</span>
                        </div>
                    </div>
                    <div>
                        <p class="mb-0">NT$ 
                        <span class="text-muted me-2" :class="{ 'text-decoration-line-through': display.origin_price !== display.price }">{{ display.origin_price }}</span>
                        <span>{{ display.price }} 元 ／ {{ display.unit }}</span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `

}