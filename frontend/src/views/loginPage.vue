<template>
	<section id="login">
		<!--gradient="to right, rgba(5, 11, 31, .8), rgba(5, 11, 31, .8)"-->
		<!--A v-img-ben-->
		<v-container class="fill-height px-4 py-12">
			<v-responsive class="d-flex align-center" height="100%" width="100%">
				<v-row align="center" justify="center">
					<v-col cols="12" sm="6">
						<v-card class="elevation-12">
							<v-tabs v-model="activeTab" color="primary" icons-and-text>
								<v-tab>
									Bejelentkezés
									<v-icon>fa-sign-in-alt</v-icon>
								</v-tab>
								<v-tab>
									Regisztráció
									<v-icon>fa-user-plus</v-icon>
								</v-tab>
								<v-tab>
									Elfelejtett jelszó
									<v-icon>fa-key</v-icon>
								</v-tab>
								<v-tab-item>
									<v-card-text>
										<v-form>
											<v-text-field v-model="loginField.username" label="Email" type="text"
												prepend-inner-icon="fa-envelope"></v-text-field>

											<v-text-field v-model="loginField.password" label="Jelszó" type="password"
												prepend-inner-icon="fa-key"></v-text-field>
										</v-form>
									</v-card-text>
									<v-card-actions>
										<v-spacer></v-spacer>
										<v-btn color="primary" rounded @click="login()">Bejelentkezés
											<v-icon>fa-sign-in-alt</v-icon>
										</v-btn>
									</v-card-actions>
								</v-tab-item>
								<v-tab-item>
									<v-card-text>
										<v-form>
											<v-text-field v-model="registrationField.email" label="Email" type="text"
												prepend-inner-icon="fa-envelope"></v-text-field>

											<v-text-field v-model="registrationField.username" label="Felhasználónév" type="text"
												prepend-inner-icon="fa-user"></v-text-field>

											<v-text-field v-model="registrationField.lastname" label="Vezetéknév" type="text"
												prepend-inner-icon="fa-user"></v-text-field>

											<v-text-field v-model="registrationField.firstname" label="Keresztnév" type="text"
												prepend-inner-icon="fa-user"></v-text-field>
										</v-form>
									</v-card-text>
									<v-card-actions>
										<v-spacer></v-spacer>
										<v-btn color="primary" rounded @click="signup()">Regisztráció
											<v-icon>fa-user-plus</v-icon>
										</v-btn>
									</v-card-actions>
								</v-tab-item>
								<v-tab-item>
									<v-card-text>
										<p>Az email címedre egy véletlenszerűen generált új jelszót fogsz kapni</p>
										<v-form>
											<v-text-field v-model="forgottenPasswordField.username" label="Email"
												type="text" prepend-inner-icon="fa-envelope"></v-text-field>
										</v-form>
									</v-card-text>
									<v-card-actions>
										<v-spacer></v-spacer>
										<v-btn color="primary" rounded v-if="forgottenPasswordField.username"
											@click="requireNewPassword()">Új jelszó igénylése<v-icon>fa-plus
											</v-icon>
										</v-btn>
									</v-card-actions>
								</v-tab-item>
							</v-tabs>

						</v-card>
					</v-col>
					<v-col cols="12" sm="3">
						<v-img :src="require('@/assets/ikon.png')" />
					</v-col>
					<v-col cols="12" sm="3">
						<tipsAndNews />
					</v-col>
				</v-row>
			</v-responsive>
		</v-container>
	</section>
</template>
<script>
import router from "../router"
import VueRecaptcha from 'vue-recaptcha';
import roles from '../plugins/roles.js';
import tipsAndNews from '../components/tipsAndNews.vue'

export default {
	components: {
		tipsAndNews,
		VueRecaptcha
	},
	data: function () {
		return {
			activeTab: 0,
			loginField: {
				username: "",
				password: ""
			},
			pressedButton: "",
			forgottenPasswordField: {
				username: ""
			},
			registrationField: {
				username: "",
				email: "",
				lastname: "",
				firstname: ""
			}
		}
	},
	methods: {
		callCaptcha: function (type) {
			this.pressedButton = type
			this.$refs.captcha.execute()
		},
		verify: function (response) {
			if (this.pressedButton == "login") {
				this.login(response)
			} else if (this.pressedButton == "forgottenPassword") {
				this.requireNewPassword(response)
			}
			this.pressedButton = ""
			this.$refs.captcha.reset()
		},
		login: function () {
			this.$store.dispatch('login', { ...this.loginField }).then(() => {
				this.$store.commit('setSnack', 'A bejelentkezés sikeresen megtörtént.')

				if (this.$store.getters.userRole > roles.unauthenticated && window.Tawk_API) {
					window.Tawk_API.setAttributes({
						id: this.$store.state.user.id,
						name: this.$store.state.user.fullname,
						email: this.$store.state.user.email
					}, console.error)
				}
				this.$router.push('/profile')
			})
				.catch(err => console.log(err))
		},
		signup: function() {
			this.axios({url: 'user/', method: "POST", data: {user: {...this.registrationField}}}).then((response) => {
				if (response.data.success) { this.activeTab = 0; this.loginField.username = this.registrationField.username}
				this.$store.commit('setSnack', response.data.success ? "Jelentkezz be az email címedre kapott új jelszóval." : ("A regisztráció során hiba történt: " + response.data.error))

			})
		},
		requireNewPassword: function () {
			this.axios({ url: 'user/forgottenpassword', method: 'POST', data: { email: this.forgottenPasswordField.username} })
				.then((response) => {
					if (response.data.success) { this.activeTab = 0; this.loginField.username = this.forgottenPasswordField.username; this.forgottenPasswordField.username = "" }
					this.$store.commit('setSnack', response.data.success ? "Jelentkezz be az email címedre kapott új jelszóval." : ("Az új jelszó igénylése során hiba történt: " + response.data.error))
				})
		}
	},
	mounted() {
		if (this.$store.getters.userRole != -1) {
			router.push('/');
		}

	}
}
</script>
