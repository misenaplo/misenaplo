<template>
    <Board ref="board" v-on:moving="start()" v-on:finish="finish()"></Board>
</template>

<script>

import Board from '../components/puzzle/Board'
export default {
    props: ['attendanceId', 'rewardImageId'],
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
            return `/api/rewardImage/${this.rewardImageId}`
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
                this.axios({
                    method: 'post',
                    url: `/api/attendances/${this.attendanceId}/reward`,
                    data: {
                        time: time
                    }
                }).then(() => {
                    this.$store.commit('setSnack', response.data.success? "Jutalom megszerezve." : "Már nem lehet megszerezni.")
                    $router.push({name: 'home'})
                })
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
