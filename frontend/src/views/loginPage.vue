<template>
	<section id="login">
		<!--gradient="to right, rgba(5, 11, 31, .8), rgba(5, 11, 31, .8)"-->
		<!--A v-img-ben-->
		<v-container class="fill-height px-4 py-12">
			<v-responsive class="d-flex align-center" height="100%" width="100%">
				<v-row align="center" justify="center">
					<v-col cols="12" sm="6">
						<v-card class="elevation-12">
							<v-tabs 
								v-model="activeTab" 
								color="primary" 
								icons-and-text
								center-active
							>
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
										<v-form 
    									ref="loginForm"
											v-model="loginValid" 
											lazy-validation
										>
											<v-text-field
												v-model="loginField.email" 
												label="Email" 
												type="email"
												prepend-inner-icon="fa-envelope"
												required
											></v-text-field>

											<v-text-field 
												v-model="loginField.password" 
												label="Jelszó" 
												type="password"
												prepend-inner-icon="fa-key"
												:rules="passwordRules"
												required
												v-on:keyup.enter="login"
											></v-text-field>
										</v-form>
									</v-card-text>
									<v-card-actions>
										<v-spacer></v-spacer>
										<v-btn 
											color="primary" 
											rounded 
											@click="login"
											:disabled="loginDisabled"
										>
											Bejelentkezés
											<v-icon class="ml-2">fa-sign-in-alt</v-icon>
										</v-btn>
									</v-card-actions>
								</v-tab-item>
								<v-tab-item>
									<v-card-text>
										<v-form
    									ref="registrationForm"
											v-model="registrationValid" 
											lazy-validation
										>
											<v-text-field 
												v-model="registrationField.email" 
												label="Email" 
												type="email"
												prepend-inner-icon="fa-envelope"
												:rules="emailRules"
												required
											></v-text-field>

											<v-text-field 
												v-model="registrationField.lastname" 
												label="Vezetéknév" 
												type="text"
												prepend-inner-icon="fa-user"
												:rules="nameRules"
												required
											></v-text-field>

											<v-text-field 
												v-model="registrationField.firstname" 
												label="Keresztnév" 
												type="text"
												prepend-inner-icon="fa-user"
												:rules="nameRules"
												required
												v-on:keyup.enter="signup"
											></v-text-field>
										</v-form>
									</v-card-text>
									<v-card-actions>
										<v-spacer></v-spacer>
										<v-btn 
											color="primary" 
											rounded 
											@click="signup"
											:disabled="registrationDisabled"
										>
											Regisztráció
											<v-icon class="ml-2">fa-user-plus</v-icon>
										</v-btn>
									</v-card-actions>
								</v-tab-item>
								<v-tab-item>
									<v-card-text>
										<p>Az email címedre egy véletlenszerűen generált új jelszót fogsz kapni</p>
										<v-form
    									ref="forgottenPasswordForm"
											v-model="forgottenPasswordValid" 
											lazy-validation
											@submit.prevent
										>
											<v-text-field 
												v-model="forgottenPasswordField.email" 
												label="Email"
												type="email" 
												prepend-inner-icon="fa-envelope"
												required
												v-on:keyup.enter="requireNewPassword"
											></v-text-field>
										</v-form>
									</v-card-text>
									<v-card-actions>
										<v-spacer></v-spacer>
										<v-btn 
											color="primary" 
											rounded
											@click="requireNewPassword"
											:disabled="forgottenPasswordDisabled"
										>
											Új jelszó igénylése
											<v-icon class="ml-2">fa-plus</v-icon>
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
      loginValid: true,
      registrationValid: true,
      forgottenPasswordValid: true,
			loginDisabled: false,
			registrationDisabled: false,
			forgottenPasswordDisabled: false,
			loginDisabled: false,
      emailRules: [
        v => !!v || 'E-mail szükséges',
        v => /.+@.+\..+/.test(v) || 'E-mail nem helyes',
      ],
      passwordRules: [
        v => !!v || 'Jelszó szükséges',
        v => (v && v.length >= 3) || 'Túl kevés karakter',
      ],
      nameRules: [
        v => !!v || 'Név szükséges',
        v => (v && v.length >= 3) || 'Túl kevés karakter',
      ],
			loginField: {
				email: "",
				password: ""
			},
			pressedButton: "",
			forgottenPasswordField: {
				email: ""
			},
			registrationField: {
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
			const valid = this.$refs.loginForm.validate();
			console.log('login valid: ', valid);

			if(valid) {
				this.loginDisabled = true;
				this.$store.dispatch('login', { ...this.loginField }).then(() => {
					this.$store.commit('setSnack', 'A bejelentkezés sikeresen megtörtént.')

					if (this.$store.getters.userRole > roles.unauthenticated && window.Tawk_API) {
						window.Tawk_API.setAttributes({
							id: this.$store.state.user.id,
							name: this.$store.state.user.fullname,
							email: this.$store.state.user.email
						}, console.error)
					}
					this.$router.push('/profile');
					this.loginDisabled = false;
				})
				.catch(error => {
					console.log(error);
					this.loginDisabled = false;
				})
			}
		},
		signup: function() {
			const valid = this.$refs.registrationForm.validate();
			console.log('registration valid: ', valid);

			if(valid) {
				this.registrationDisabled = true;

				this.axios({url: 'user/', method: "POST", data: {user: {...this.registrationField}}})
				.then((response) => {
					if (response.data.success) { 
						this.activeTab = 0; 
						this.loginField.email = this.registrationField.email;
					}
					this.$store.commit('setSnack', response.data.success ? "Jelentkezz be az email címedre kapott új jelszóval." : ("A regisztráció során hiba történt: " + response.data.error));
					this.registrationDisabled = false;
				})
				.catch(error => {
					console.log(error);
					this.registrationDisabled = false;
				})
			}
		},
		requireNewPassword: function () {
			const valid = this.$refs.forgottenPasswordForm.validate();
			console.log('forgottenPassword valid: ', valid);

			if(valid) {
				this.forgottenPasswordDisabled = true;
				this.axios({ url: 'user/forgottenpassword', method: 'POST', data: { email: this.forgottenPasswordField.email} })
					.then((response) => {
						if (response.data.success) { this.activeTab = 0; this.loginField.email = this.forgottenPasswordField.email; this.forgottenPasswordField.email = "" }
						this.$store.commit('setSnack', response.data.success ? "Jelentkezz be az email címedre kapott új jelszóval." : ("Az új jelszó igénylése során hiba történt: " + response.data.error))
						this.forgottenPasswordDisabled = false;
					})
					.catch(error => {
						console.log(error);
						this.forgottenPasswordDisabled = false;
					})
			}
		}
	},
	mounted() {
		if (this.$store.getters.userRole != -1) {
			router.push('/');
		}

	}
}
</script>
