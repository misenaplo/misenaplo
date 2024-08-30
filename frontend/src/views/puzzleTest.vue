<template>
    <Board ref="board"></Board>
</template>

<script>

import Board from '../components/puzzle/Board'
export default {
    components: {
        Board
    },
    data: function () {
        return {
            startTime: null
        }
    },
    computed: {
        src() {
            const id = "27bbf5c0-27bc-4ba6-ac37-0acb9217c015"
            return `/api/rewardImage/${id}/.png`
        }
    },
    watch: {
        attendanceId() {
            this.startTime = null;
        },
        rewardImageId() {
            this.startTime = null;
        }
    },
    methods: {
        start() {
            if(this.startTime === null)
                this.startTime = new Date();
        },
        finish() {
            if(this.startTime !== null) {
                const endTime = new Date();
                const time = endTime - this.startTime;
                /*this.axios({
                    method: 'post',
                    url: `/api/attendances/${this.attendanceId}/reward`,
                    data: {
                        time: time
                    }
                }).then(() => {
                    this.$store.commit('setSnack', response.data.success? "Jutalom megszerezve." : "Már nem lehet megszerezni.")
                    this.$emit('finish')
                })*/
            }
        }
    },
    mounted() {
        this.$refs.board.start({
            image: this.src,
            size: {
                horizontal: 4,
                vertical: 4
            }
        })
    }
}
</script>
