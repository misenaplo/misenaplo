<template>
	<div>
		<template>
			<v-data-table :headers="tables.groups.headers" :items="groups" hide-default-footer disable-pagination>
				<template v-slot:top>
					<v-row>
						<v-col cols="12" :sm="$store.getters.userRole >= roles.chaplain && !isOrganization ? 8 : 11">
							<!--  <v-text-field
			          v-model="options.search"
			          label="Keresés"
			          prepend-inner-icon="fa-search"
			          class="mx-4"
								rounded
								outlined
								@change=""
			        />-->
						</v-col>
						<v-col cols="12" v-if="$store.getters.userRole >= roles.chaplain && !isOrganization" sm="3">
							<v-checkbox v-model="options.onlyLedByMe" label="Csak a saját csoportjaim látszódjanak"
								@change="getGroups()" />
						</v-col>
						<v-col cols="12" sm="1">
							<v-tooltip top>
								Hozzáadás
								<template v-slot:activator="{ on, attrs }">
									<v-btn fab color="success" v-on="on" v-bind="attrs" @click="showDialog()">
										<v-icon>fa-plus</v-icon>
									</v-btn>
								</template>
							</v-tooltip>
						</v-col>
					</v-row>
				</template>
				<template v-slot:item.view="{ item }">
					<v-btn icon :href="$router.resolve({ name: 'group', params: { id: item.id } }).href"
						target="_blank">
						<v-icon>fa-eye</v-icon>
					</v-btn>
				</template>
				<template v-slot:footer>
					<v-row align="center" justify="end">
						<v-col cols="12" sm="3" align="center">
							<v-select align="center" label="Csoportok egy oldalon"
								:items="[{ text: 10, value: 10 }, { text: 15, value: 15 }, { text: 25, value: 25 }, { text: 50, value: 50 }, { text: 'Mind', value: 0 }]"
								v-model="options.itemsPerPage" prepend-inner-icon="fa-users" rounded outlined
								@change="options.page = options.page > Math.ceil(totalGroups / options.itemsPerPage) ? Math.ceil(totalGroups / options.itemsPerPage) : options.page, getGroups()" />
						</v-col>
						<v-col cols="12" sm="1" align="center" justify="center">
							{{ (options.page - 1) * options.itemsPerPage + 1 }}-{{ options.itemsPerPage != 0 ?
									(((options.page - 1) * options.itemsPerPage + options.itemsPerPage) > totalGroups ?
										totalGroups : ((options.page - 1) * options.itemsPerPage + options.itemsPerPage)) :
									totalGroups
							}}/{{ totalGroups }}
						</v-col>
						<v-col cols="12" sm="2" align="center">
							<v-btn icon :disabled="options.page < 2" @click="changePage(false)">
								<v-icon>fa-arrow-left</v-icon>
							</v-btn>{{ options.page }}. oldal<v-btn icon
								:disabled="options.page == Math.ceil(totalGroups / options.itemsPerPage)"
								@click="changePage(true)">
								<v-icon>fa-arrow-right</v-icon>
							</v-btn>
						</v-col>
					</v-row>
				</template>
			</v-data-table>
			<v-row justify="center">
				<v-dialog v-model="dialog.show" persistent max-width="600px">

					<v-card>
						<v-card-title>
							<span class="headline">Új csoport</span>
						</v-card-title>
						<v-card-text>
							<v-container>
								<v-text-field prepend-inner-icon="fa-users" label="Név" v-model="dialog.group.name"
									rounded outlined />
								<v-select v-if="parishes.length > 1" item-text="name" item-value="id" :items="parishes"
									v-model="dialog.group.parishId" label="Plébánia" rounded outlined
									prepend-inner-icon="fa-church" />
									<v-select v-if="groupLeaders.length > 1" item-text="fullname" item-value="id" :items="groupLeaders"
									v-model="dialog.group.leaderId" label="Csoportvezető" rounded outlined
									prepend-inner-icon="fa-user" />
							</v-container>
						</v-card-text>
						<v-card-actions>
							<v-spacer></v-spacer>
							<v-btn color="blue darken-1" text @click="dialog.show = false">
								Mégsem
							</v-btn>
							<v-btn color="blue darken-1" text @click="create()"
								v-if="dialog.group.name && dialog.group.parishId && dialog.group.leaderId">
								Hozzáadás
							</v-btn>
						</v-card-actions>
					</v-card>
				</v-dialog>
			</v-row>

		</template>
	</div>
</template>

<script>
import roles from '../plugins/roles';

export default {
	props: ['parishId'],
	data: function () {
		return {
			parishes: [],
			groupLeaders: [],
			groups: [],
			options: {
				page: 1,
				itemsPerPage: 25,
				search: "",
				onlyLedByMe: false,
			},
			totalGroups: 1,
			tables: {
				groups: {
					headers: [
						/*{
							text: "Plébánia",
							align: "center",
							sortable: false,
							filterable: false,
							value: "parish"
						},*/
						{
							text: "Név",
							align: "center",
							sortable: false,
							filterable: false,
							value: "name"
						},
						/*{
							text: 'Létszám',
							align: "center",
							sortable: false,
							filterable: false,
							value: "candidateCount"
						},*/
						{
							text: "Megtekintés",
							align: "center",
							sortable: false,
							filterable: false,
							value: "view"
						}
					]
				}
			},
			dialog: {
				show: false,
				group: {
					name: '',
					leaderId: '',
					parishId: ''
				}
			},
			roles
		}
	},
	computed: {
		isOrganization() {
			return this.parishId !== null && this.parishId !== undefined
		}
	},
	watch: {
		'dialog.group.parishId': function (newVal, oldVal) {
			newVal != '' && newVal != undefined && newVal != null ? this.getLeaders() : this.groupLeaders = [], this.dialog.group.leaderId = '';
		}
	},
	methods: {
		create: function () {
			this.axios({ url: "group", method: "POST", data: { ...this.dialog.group } }).then((response) => {
				if (response.data.success) {
					this.groups.push({ ...this.dialog.group, id: response.data.data.id, MIRClub: response.data.data.MIRClub, kidAthleteCount: 0 });
					this.dialog.show = false;
					this.dialog.group = { name: '', description: '' }
					this.$store.commit('setSnack', 'A hozzáadás sikeresen megtörtént.')
				}
			})
		},
		search: function () {
			this.options.page = 1;
			this.getGroups()
		},
		changePage: function (plus) {
			this.options.page += (plus ? 1 : -1)
			this.getGroups()
		},
		getGroups: function () {
			this.axios({ url: "group", method: "GET", params:{ ...this.options, ...(this.parishId ? { parishId: this.parishId } : {})} }).then((response) => {
				if (response.data.success) {
					this.groups = response.data.data.groups
					this.totalGroups = response.data.data.totalGroups
				}
			})
		},
		showDialog: function () {
			if (this.parishes.length == 0) {
				if (this.parishId) this.parishes.push({ id: this.parishId, name: 'Megtekintett plébánia' })
				else {
					this.axios({ url: "parish", method: "GET", params: { search: '', itemsPerPage: 0, page: 0 } }).then((response) => {
						if (response.data.success) {
							this.parishes = response.data.data.parishes
							if (this.parishes.length == 1) this.dialog.group.parishId = this.parishes[0].id
						}
					})
				}
			}
			this.dialog.show = true;
		},
		getLeaders: function () {
			this.axios({ url: "user/list", method: "GET", params: { search: '', itemsPerPage: 0, page: 0, parishId: this.dialog.group.parishId, minRole: roles.catechist } }).then((response) => {
				if (response.data.success) {
					this.groupLeaders = response.data.data.users
					if (this.groupLeaders.length == 1) this.dialog.group.leaderId = this.groupLeaders[0].id
				}
			})
		}
	},
	mounted() {
		this.getGroups()
	}
}
</script>
