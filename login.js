import { createApp } from 'https://cdnjs.cloudflare.com/ajax/libs/vue/3.4.13/vue.esm-browser.min.js';

// import components

import Loader from './components/Loader.js';

// import mixins

import api from './mixins/api.js';

const app = createApp({

    data() {

        return {
            user: {
                username: '',
                password: '',
            },
            isPwdVisible: false,
            isLoading: false,
            isLoginDisabled: false,
            messageConfig: {
                pending: { icon: 'pending', color: 'text-info' },
                success: { icon: 'check_circle', color: 'text-success' },
                warning: { icon: 'error', color: 'text-warning' },
                error: { icon: 'cancel', color: 'text-danger' },
            },
            message: { text: '' },
        }

    },

    mixins: [ api ],

    components: { Loader },

    watch: {

        user: {

            handler(cur) {

            if (cur.username || cur.password) { this.message = {} }

            },

            deep: true,

        }

    },

    methods: {

        login() {
        
            if (this.user.username && this.user.password) {

                this.isLoading = true;
                this.isLoginDisabled = true;
                this.setMessage('登入中，請稍候', 'pending');

                axios.post(`${this.apiUrl}/admin/signin`, this.user)
                .then(res => {

                    // console.log(res);
                    const { token, message, expired } = res.data;

                    this.isLoading = false;
                    this.isLoginDisabled = false;
                    this.setMessage(message, 'success');
                    this.user = {},

                    document.cookie = `hexVueToken=${token}; expires=${new Date(expired)}`;

                    window.location.href = './index.html';

                })
                .catch(error => {

                    console.log(error);

                    this.isLoading = false;
                    this.isLoginDisabled = false;

                    if (error.response.data.message) { this.setMessage(error.response.data.message, 'error') }

                });

            } else { this.setMessage('帳號及密碼的欄位不可空白', 'warning') }

        },

        checkAdmin() {

            this.isLoading = true;
            const token = this.token();

            // console.log(token);

            if (token) {

                axios.defaults.headers.common['Authorization'] = token;

                axios.post(`${this.apiUrl}/api/user/check`, {})
                .then(res => {

                    // console.log(res);
                    this.isLoading = false;

                    window.location.href = './index.html';
    
                }).catch(error => { this.isLoading = false })

            } else { this.isLoading = false }

        },

        setMessage(text, type) { this.message = { text, ...this.messageConfig[type] } },

    },

    mounted() { this.checkAdmin() },

});

app.mount('#app');