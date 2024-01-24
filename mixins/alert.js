/* SweetAlert2 */

export default {

    methods: {

        toastAlert(text, icon, url) {

            Swal.fire({
                icon,
                text,
                position: 'center',
                toast: true,
                timer: 1500,
                showConfirmButton: false,
            })
    
        },

        errorAlert(error, icon) {

            console.log(error);

            if (error.code === 'ERR_NETWORK') { alert('網路連線異常，請重新確認連線狀態後再嘗試') }

            else if (error.response) {

            this.toastAlert(error.response.data.message, icon || 'warning');
            
            }

        }
        
    }

}