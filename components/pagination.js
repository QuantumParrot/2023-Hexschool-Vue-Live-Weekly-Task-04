export default {

    props: [ 'pages', 'currentPage' ],

    methods: {

    switchPage(num) { this.$emit('switch-page', num) }

    },

    template: /*html*/`
    <nav aria-label="page navigation">
        <ul class="pagination">
            <li class="page-item" :class="{ 'disabled': currentPage - 1 < 1 }">
                <a class="page-link" href="#" aria-label="Previous" @click.prevent="switchPage(currentPage - 1)">
                <span aria-hidden="true">&laquo;</span></a>
            </li>
            <template v-for="i in pages" :key="i">
                <li class="page-item" :class="{ 'active': currentPage === i }">
                    <a class="page-link" href="#" :aria-label="i" @click.prevent="switchPage(i)">
                    {{ i }}</a>
                </li>
            </template>
            <li class="page-item" :class="{ 'disabled': currentPage + 1 > pages }">
                <a class="page-link" href="#" aria-label="Next" @click.prevent="switchPage(currentPage + 1)">
                <span aria-hidden="true">&raquo;</span></a>
            </li>
        </ul>
    </nav>
    `

}