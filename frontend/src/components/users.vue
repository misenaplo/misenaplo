<template>
	<section>
		<v-data-table :items="users" :headers="tableHeaders" hide-default-footer disable-pagination sort-by="fullname">
			<template v-slot:top>
				<v-row>
					<v-col cols="12" sm="11">
						<v-text-field v-model="options.search" prepend-inner-icon="fa-search" rounded outlined
							label="Keresés" @input="search()" />
					</v-col>
					<v-col cols="12" sm="1">
						<v-tooltip top>
							Hozzáadás a rendszerbe{{isOrganisationUnit?' és felvétel a szervezeti egységbe':''}}
							<template v-slot:activator="{ on, attrs }">
								<v-btn fab color="success" v-on="on" v-bind="attrs"
									@click="dialogs.newUser.show = true">
									<v-icon>fa-plus</v-icon>
								</v-btn>
							</template>
						</v-tooltip>
						<v-tooltip top v-if="isOrganisationUnit">
							Felvétel a szervezeti egységbe
							<template v-slot:activator="{ on, attrs }">
								<v-btn fab color="primary" v-on="on" v-bind="attrs"
									@click="dialogs.addUserToThisUnit.show = true">
									<v-icon>fa-church</v-icon>
								</v-btn>
							</template>
						</v-tooltip>
					</v-col>
				</v-row>
			</template>

			<template v-slot:footer>
				<v-row align="center" justify="end">
					<v-col cols="12" sm="3" align="center">
						<v-select align="center" label="Felhasználók egy oldalon" :items="[10, 15, 25, 50]"
							v-model="options.itemsPerPage" prepend-inner-icon="fa-users" rounded outlined
							@change="options.page = options.page > Math.ceil(totalUsers / options.itemsPerPage) ? Math.ceil(totalUsers / options.itemsPerPage) : options.page, getUsers()" />
					</v-col>
					<v-col cols="12" sm="1" align="center" justify="center">
						{{ (options.page - 1) * options.itemsPerPage + 1 }}-{{ ((options.page - 1) *
								options.itemsPerPage + options.itemsPerPage) > totalUsers ? totalUsers : ((options.page - 1) *
									options.itemsPerPage + options.itemsPerPage)
						}}/{{ totalUsers }}
					</v-col>
					<v-col cols="12" sm="2" align="center">
						<v-btn icon :disabled="options.page < 2" @click="changePage(false)">
							<v-icon>fa-arrow-left</v-icon>
						</v-btn>{{ options.page }}. oldal<v-btn icon
							:disabled="options.page == Math.ceil(totalUsers / options.itemsPerPage)"
							@click="changePage(true)">
							<v-icon>fa-arrow-right</v-icon>
						</v-btn>
					</v-col>
				</v-row>
			</template>
			<template v-slot:item.role="{ item }">
				{{ roleNames[item.role] }}
			</template>
			<template v-slot:item.details="{ item }">
				<v-btn icon color="info" :href="$router.resolve({ name: 'user', params: { id: item.id } }).href"
					target="_blank">
					<v-icon>fa-info-circle</v-icon>
				</v-btn>
			</template>
		</v-data-table>
		<v-row justify="center">
			<v-dialog v-model="dialogs.newUser.show" persistent max-width="600px">

				<v-card>
					<v-card-title>
						<span class="headline">Új felhasználó</span>
					</v-card-title>
					<v-card-text>
						<v-container>
							<v-row>
								<v-col cols="12" sm="4">
									<v-text-field prepend-inner-icon="fa-user-graduate" label="Titulus"
										v-model="dialogs.newUser.user.title" rounded outlined />
								</v-col>
								<v-col cols="12" sm="8">
									<v-text-field prepend-inner-icon="fa-user" label="Vezetéknév"
										v-model="dialogs.newUser.user.lastname" rounded outlined />
								</v-col>
							</v-row>

							<v-text-field prepend-inner-icon="fa-user" label="Keresztnév"
								v-model="dialogs.newUser.user.firstname" rounded outlined/>


							<v-text-field prepend-inner-icon="fa-at" label="Email-cím"
								v-model="dialogs.newUser.user.email" rounded outlined />


							<v-select prepend-inner-icon="fa-user-tag" label="Jogkör"
								v-model="dialogs.newUser.user.role" rounded outlined :items="roleSelect"
								item-text="roleName" item-value="role" />

						</v-container>
					</v-card-text>
					<v-card-actions>
						<v-btn color="blue darken-1" text
							@click="dialogs.newUser.show = false, dialogs.newUser.user.firstname = '', dialogs.newUser.user.lastname = '', dialogs.newUser.user.email = '', dialogs.newUser.user.role = -1">
							Mégsem
						</v-btn>
						<v-btn color="blue darken-1" text @click="newUser()"
							v-if="dialogs.newUser.user.firstname != '' && dialogs.newUser.user.lastname != '' && dialogs.newUser.user.email != '' && dialogs.newUser.user.role >= 0">
							Hozzáadás
						</v-btn>

					</v-card-actions>
				</v-card>
			</v-dialog>
			<v-dialog v-model="dialogs.addUserToThisUnit.show" persistent max-width="600px">

				<v-card>
					<v-card-title>
						<span class="headline">Felhasználó hozzáadása szervezeti egységhez</span>
					</v-card-title>
					<v-card-text>
						<v-container>
							<v-text-field prepend-inner-icon="fa-user" label="Email-cím"
								v-model="dialogs.addUserToThisUnit.email" rounded outlined />

							<v-select prepend-inner-icon="fa-user-tag" label="Új jogkör"
								v-model="dialogs.addUserToThisUnit.newRole" rounded outlined :items="roleSelect"
								item-text="roleName" item-value="role" hint="Amennyiben az itt megadott jogkör magasabb, mint a felhasználó jelenlegi jogköre, be lesz állítva neki." />
						</v-container>
					</v-card-text>
					<v-card-actions>
						<v-btn color="blue darken-1" text
							@click="dialogs.addUserToThisUnit.show = false, dialogs.addUserToThisUnit.email = ''">
							Mégsem
						</v-btn>
						<v-btn color="blue darken-1" text @click="addUserToThisUnit()"
							v-if="dialogs.addUserToThisUnit.newRole>0&&dialogs.addUserToThisUnit.email!=''">
							Hozzáadás
						</v-btn>

					</v-card-actions>
				</v-card>
			</v-dialog>
		</v-row>

	</section>
</template>

<script>
const headerProps = {
	align: "center",
	sortable: false,
	filterable: false,
	groupable: false
}
import roleNames from '../plugins/roleNames';
import roles from '../plugins/roles';
export default {
	props: ['parishId'],
	data: function () {
		return {
			users: [],
			clubs: [],
			options: {
				page: 1,
				itemsPerPage: 25,
				search: ""
			},
			totalUsers: 1,
			tableHeaders: [
				{
					text: "NÉV",
					value: "fullname",
					...headerProps
				},
				{
					text: "EMAIL-CÍM",
					value: "email",
					...headerProps
				},

				{
					text: "JOGKÖR",
					value: "role",
					...headerProps
				},
				...(this.$store.getters.userRole>=roles.admin?[
					{
						text: "RÉSZLETEK",
						value: "details",
						...headerProps
					}
				]:[]) 
				
			],
			roleNames,
			dialogs: {
				newUser: {
					show: false,
					user: {
						title: '',
						firstname: '',
						lastname: '',
						email: '',
						role: -1,
					},

				},
				addUserToThisUnit: {
					show: false,
					email: '',
					newRole: 1
				}
			}
		}
	},
	computed: {
		roleSelect: function () {
			var roleList = []
			this.roleNames.forEach((val, index) => {
				if (index < this.$store.getters.userRole && index>roles.believer)
					roleList.push({ role: index, roleName: val })
			})
			return roleList;
		},
		isOrganisationUnit: function() {
			return false||this.parishId;
		},
		showAddUserToThisUnitDialog: function() {
			return this.dialogs.addUserToThisUnit.show&&this.isOrganisationUnit;
		}
	},
	watch: {

	},
	methods: {
		newUser: function () {
			this.axios({ url: "user/", method: "POST", data: { user: this.dialogs.newUser.user, ...(this.parishId?{parishId: this.parishId}:{}) } }).then((response) => {
				if (response.data.success) {
					this.users.push({ ...this.dialogs.newUser.user, fullname: this.dialogs.newUser.user.title + " " + this.dialogs.newUser.user.lastname + " " + this.dialogs.newUser.user.firstname, id: response.data.data.id })
					this.dialogs.newUser.user = {
						title: '',
						firstname: '',
						lastname: '',
						email: '',
						role: -1,
					};
					this.dialogs.newUser.show = false;
					this.dialogs.selectClub.show = false;
					this.$store.commit('setSnack', 'A hozzáadás sikeresen megtörtént.')

				}
			})
		},
		addUserToThisUnit: function() {
			this.axios({url: "user/addToOrganizationUnit", method: "POST", data: {email: this.dialogs.addUserToThisUnit.email, newRole: this.dialogs.addUserToThisUnit.newRole, ...(this.parishId?{parishId: this.parishId}:{})}}).then((response) => {
				if(response.data.success) {
					this.users.push(response.data.data.user);
					this.dialogs.addUserToThisUnit.email='';
					this.dialogs.addUserToThisUnit.show=false;
					this.$store.commit('setSnack', response.data.data.roleMessage);
				}
			})
		},
		changePage: function (plus) {
			this.options.page += (plus ? 1 : -1)
			this.getUsers()
		},
		search: function () {
			this.options.page = 1;
			this.getUsers()
		},
		getUsers: function () {
			this.axios({ url: "user/list", method: "GET", params: { ...this.options, ...(this.parishId?{parishId: this.parishId}:{})}}).then((response) => {
				if (response.data.success) {
					this.users = response.data.data.users
					this.totalUsers = response.data.data.totalUsers
				}
			})
		},
	},
	mounted() {
		this.getUsers();
	}
}
</script>
