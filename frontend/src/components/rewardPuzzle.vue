<template>
    <Board ref="board" v-on:moving="start()" v-on:finish="finish()"></Board>
</template>

<script>
import loadImage from 'blueimp-load-image'

import Board from '../components/puzzle/Board'
export default {
    props: ['attendanceId', 'rewardImageId'],
    components: {
        Board
    },
    data: function () {
        return {
            startTime: null,
            window: {
                width: window.innerWidth,
                height: window.innerHeight
            }
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
                    window.close()
                })
            }
        }
    },
    mounted() {
        loadImage(this.src, canvas => {
        this.$refs.board.start({
            image: canvas.toDataURL(),
            size: {
                horizontal: 3,
                vertical: 3
            }
        })
      }, {
        maxWidth: this.window.width-70,
        maxHeight: this.window.height-120,
        minWidth: 200,
        minHeight: 200,
        canvas: true
      })
    }
}
</script>
