<template>
    <v-app class="az-template-default">
        <az-loading />

        <az-aside>
            <div class="az-aside">
                <div class="logo">
                    <az-logo />
                </div>
                <div v-if="showMainAction" class="action">
                    <slot name="main-action" />
                </div>
                <div class="menu">
                    <az-menu />
                </div>
            </div>
            <template v-slot:banner>
              <slot name="bannerAside"></slot>
            </template>
        </az-aside>

        <v-app-bar app height="60" class="toolbar">
            <v-icon class="mobile_menu" @click="showAside()">dehaze</v-icon>

            <az-title />

            <v-spacer />

            <div v-if="showMainHeader" class="action">
                <slot name="main-header" />
            </div>

            <az-auto-save v-if="$store.state.loki.autoSave.show" />

            <az-notification
                v-if="showNotification"
                class=""
                @open="$emit('openNotifications')"
                @close="$emit('closeNotifications')"
                @paginate="$emit('paginateNotifications')"
                @refresh="$emit('refreshNotifications')"
                @read="$emit('readNotifications')"
                @visit="visitNotification"
                @remove="removeNotification"
            />

            <az-avatar />
        </v-app-bar>

        <v-main>
            <v-container fluid class="container">
                <az-alert />

                <slot />

                <v-footer app inset>
                    <az-file-progress />

                    <az-about />
                </v-footer>
            </v-container>
        </v-main>
    </v-app>
</template>

<script>
import AzAlert from '../AzAlert'
import AzAutoSave from '../AzAutoSave'
import AzFileProgress from '../../file/AzFileProgress'
import AzLoading from '../AzLoading'
import AzNotification from '../AzNotification'
import mutationTypes from '../../../store/mutation-types'

export default {
    components: { AzAlert, AzAutoSave, AzFileProgress, AzLoading, AzNotification },
    props: {
        showMainAction: {
            type: Boolean,
            default: false
        },
        showMainHeader: {
            type: Boolean,
            default: false
        },
        showNotification: {
            type: Boolean,
            default: false
        }
    },
    methods: {
        showAside() {
            this.$store.commit(mutationTypes.SET_ASIDE_HIDE, true)
        },
        removeNotification(message) {
            this.$emit('removeNotification', message)
        },
        visitNotification(message) {
            this.$emit('visitNotification', message)
        }
    }
}
</script>

<style lang="stylus">
.az-template-default
    .az-aside
        .logo
            border-bottom 1px solid rgba(255, 255, 255, .1)
            height 120px

    .container
        background-color #eee
        height 100%
        padding 0

    .toolbar
        box-shadow 0 2px 4px -1px rgba(0, 0, 0, .2)
        background-color white !important

    .mobile_menu
        display none

    .v-footer
        padding 0

body
    background-color #eee

.application.theme--light
    background unset !important

.application--wrap
    min-height unset !important

html
    overflow-y auto

@media (max-width 720px)
    .az-template-default
        .mobile_menu
            margin-right 10px
            display unset !important
            top 1px
            position relative
            color var(--v-primary-base) !important

        .az-title__subtitle
            display none

        .no-mobile
            display none !important
</style>
