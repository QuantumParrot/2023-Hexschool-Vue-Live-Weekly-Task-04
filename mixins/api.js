export default {

    data() {

        return {

            apiUrl: 'https://ec-course-api.hexschool.io/v2',
            path: 'ataraxia',

        }

    },

    methods: {

    token() { return document.cookie.split('; ').find(row => row.startsWith('hexVueToken='))?.split('=')[1] }

    }

}