export default {

    props: [ 'pages', 'currentPage' ],

    methods: {

    switchPage(num) { this.$emit('switch-page', num) }

    },

    template: '#pagination',

}