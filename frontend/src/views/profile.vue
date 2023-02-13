<template>
	<div>
		<v-simple-table>
			<tbody>
				<tr>
					<th style="text-align: right">Név</th>
					<td colspan="2" style="text-align: center">{{ profile.fullname }}</td>

				</tr>
				<tr>
					<th style="text-align: right">Jogkör</th>
					<td colspan="2" style="text-align: center">{{ roleNames[profile.role] }}</td>
				</tr>
				<tr>
					<th style="text-align: right">Email</th>
					<td style="text-align: center">{{ profile.email }}</td>
					<td>
						<v-btn color="blue"
							@click="dialog.show = true, dialog.changedProperty = 'email', dialog.changedValue = profile.email">
							Módosítás<v-icon>fa-edit</v-icon>
						</v-btn>
					</td>
				</tr>
				<tr>
					<th style="text-align: right">Felhasználónév</th>
					<td colspan="2" style="text-align: center">{{ profile.username }}</td>
				</tr>
				<tr>
					<th style="text-align: right">Jelszó</th>
					<td style="text-align: center">TITOK</td>
					<td>
						<v-btn color="blue"
							@click="dialog.show = true, dialog.changedProperty = 'password', dialog.changedValue = ''">
							Módosítás<v-icon>fa-edit</v-icon>
						</v-btn>
					</td>
				</tr>
			</tbody>
		</v-simple-table>
		<template>
			<v-row justify="center">
				<v-dialog v-model="dialog.show" persistent max-width="600px">

					<v-card>
						<v-card-title>
							<span class="headline">{{ dialog.changedProperty == 'fullname' ? "Név" :
									(dialog.changedProperty == "email" ? "Email-cím" : "Jelszó")
							}} módosítása</span>
						</v-card-title>
						<v-card-text>
							<v-container>
								<span v-if="profile.passwordChangeRecommended">Kérem változtassa meg jelszavát!</span>
								<v-text-field v-model="dialog.changedValue"
									:label="dialog.changedProperty == 'fullname' ? 'Név' : (dialog.changedProperty == 'email' ? 'Email-cím' : 'Új jelszó')"
									:prepend-inner-icon="dialog.changedProperty == 'fullname' ? 'fa-user' : (dialog.changedProperty == 'email' ? 'fa-envelope' : 'fa-key')"
									:type="dialog.changedProperty == 'password' ? 'password' : 'text'">
								</v-text-field>
								<v-text-field v-if="!profile.passwordChangeRecommended" v-model="dialog.password"
									type="password" prepend-inner-icon="fa-key" label="Régi jelszó"></v-text-field>
							</v-container>
						</v-card-text>
						<v-card-actions>
							<v-spacer></v-spacer>
							<v-btn color="blue darken-1" text v-if="!profile.passwordChangeRecommended"
								@click="dialog.show = false">
								Mégsem
							</v-btn>
							<v-btn color="blue darken-1" text @click="change()"
								v-if="dialog.changedValue && (profile.passwordChangeRecommended ? true : dialog.password)">
								Módosítás
							</v-btn>
						</v-card-actions>
					</v-card>
				</v-dialog>
			</v-row>

		</template>
	</div>
</template>

<script>
import router from '../router';
import roleNames from '../plugins/roleNames';
export default {
	data: function () {
		return {
			profile: {},
			roleNames,
			dialog: {
				show: false,
				changedProperty: '',
				changedValue: "",
				password: ""
			},
		}
	},
	computed: {

	},
	watch: {

	},
	methods: {
		change: function () {
			const changeRequest = { changed: {}, password: this.dialog.password };
			changeRequest.changed[this.dialog.changedProperty] = this.dialog.changedValue;
			this.axios({ url: "user", method: "PUT", data: changeRequest }).then((response) => {
				if (response.data.success && this.dialog.changedProperty != 'password') {
					this.$store.commit('changeUser', { property: this.dialog.changedProperty, value: this.dialog.changedValue })
					this.profile[this.dialog.changedProperty] = this.dialog.changedValue;
				}
				else if (response.data.success) {
					this.dialog.show = false;
					this.$store.commit('setSnack', 'A módosítás sikeresen megtörtént.')
				}
			})
		}
	},
	mounted() {
		this.axios({ url: "user", method: "GET", params: { full: true } }).then((response) => {
			if (response.data.success) {
				this.profile = response.data.data
				if (this.profile.passwordChangeRecommended) {
					this.dialog.changedProperty = 'password'
					this.dialog.show = true
				}
			}
		})
	}
}
</script>
