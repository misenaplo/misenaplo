<template>
	<section id="home">

		<v-container class="fill-height px-4 py-12">
			<v-responsive class="d-flex align-center" height="100%" width="100%">
				<v-row align="center" justify="center">
					<v-col cols="12" sm="6" class="white--text">


						<h1>MisEnapló</h1>
						<p align="left"><b>A MisEnapló szoftver a papír alapú miseigazolványok kiváltására szolgál.</b>
						</p>
						<!--<p align="right"></p>-->
						<div :class="$vuetify.breakpoint.smAndDown ? 'flex-column align-start' : 'align-center'"
							class="d-flex flex-wrap">
							<router-link v-if="$store.getters.userRole == -1" :to="{ name: 'login' }">
								<v-btn :ripple="false" color="primary" rounded>
									Bejelentkezés
								</v-btn>
							</router-link>
							<router-link v-else :to="{ name: 'profile' }">
								<v-btn :ripple="false" color="primary" rounded>
									Tovább a szoftverre
								</v-btn>
							</router-link>
						</div>
					</v-col>
					<v-col cols="12" sm="3">
						<tipsAndNews />
					</v-col>
					<v-col cols="12" sm="3">
						<v-img :src="require('@/assets/ikon.png')" />
					</v-col>
				</v-row>
			</v-responsive>
		</v-container>
	</section>
</template>

<script>
import tipsAndNews from '../components/tipsAndNews'
export default {
	name: 'home',
	components: {
		tipsAndNews
	},
	computed: {
		minHeight() {
			const height = this.$vuetify.breakpoint.mdAndUp ? '100vh' : '50vh'

			return `calc(${height} - ${this.$vuetify.application.top}px)`
		},
	},
	methods: {
		snack: function () {
			this.$store.commit('setSnack', 'teszt')
		}
	}
}
</script>
