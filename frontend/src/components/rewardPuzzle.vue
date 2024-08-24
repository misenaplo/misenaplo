<template>
        <puzzle-board :src="src" cols="4" rows="4" autoResize="false" @start="start()" @finish="finish()"/>
</template>

<script>
import PuzzleBoard from 'vue-8-puzzle';

export default {
    props: ['attendanceId', 'rewardImageId'],
    components: {
        PuzzleBoard
    },
    data: function () {
        return {
            startTime: null
        }
    },
    computed: {
        src() {
            return `/api/rewardImage/${this.rewardImageId}/.png`
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
                    this.$emit('finish')
                })
            }
        }
    },
    mounted() {

    }
}
</script>
