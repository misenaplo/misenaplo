<template>
	<div>
		<v-card>
			<v-card-title>
				<span class="headline">Csoport kiválasztása</span>
			</v-card-title>
			<v-card-text>
				<v-container>
					<v-select v-if="groups.length >= 1" item-text="name" item-value="id" :items="groups"
						v-model="selectedId" label="Csoport" rounded outlined prepend-inner-icon="fa-users" />
				</v-container>
			</v-card-text>
			<v-card-actions>
				<v-spacer></v-spacer>
				<v-btn color="blue darken-1" v-if="selectedId" text @click="selectedId=null, select()">
					Kiválasztás törlése
				</v-btn>
				<v-btn color="blue darken-1" text @click="select" v-if="selectedId">
					Kiválasztás
				</v-btn>
			</v-card-actions>
		</v-card>

	</div>
</template>

<script>

export default {
	props: [],
	data: function () {
		return {
			groups: [],
			selectedId: null
		}
	},
	methods: {
		select: function () {
			this.axios({ url: "scan/task", method: "POST", data: { groupId: this.selectedId } }).then((response) => {
				if (response.data.success) {
					this.$store.commit('setSnack', 'Ok.')
				}
			})
		},
		getGroups: function () {
			this.axios({ url: "group/myList", method: "GET" }).then((response) => {
				if (response.data.success) {
					this.groups = response.data.data.groups
				}
			})
		},
		getSelected: function () {
			this.axios({ url: "scan/task", method: "GET" }).then((response) => {
				if (response.data.success) {
					this.selectedId = response.data.data.selectedGroup
				}
			})
		}
	},
	mounted() {
		this.getGroups()
		this.getSelected()
	}
}
</script>
