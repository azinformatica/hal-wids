<template>
    <v-navigation-drawer
        app
        :mini-variant.sync="asideClosed"
        v-model="drawer"
        mobile-breakpoint="720"
        mini-variant-width="60"
        :width="width"
        class="az-aside primary"
        floating
    >
        <slot></slot>
        <slot name="banner"></slot>
        <div :class="{ 'arrow-opened': !asideClosed, 'arrow-closed': asideClosed }" class="no-mobile" @click="toogle()">
            <v-btn icon text>
                <v-icon color="rgba(255, 255, 255, .3)"
                    >fas {{ asideClosed ? 'fa-chevron-circle-right' : 'fa-chevron-circle-left' }}</v-icon
                >
            </v-btn>

            <a v-if="!asideClosed" class="text-hide-menu">Recolher menu</a>
        </div>
    </v-navigation-drawer>
</template>

<script>
import mutationTypes from '../../store/mutation-types'

export default {
    props: {
        width: {
            default: 200
        }
    },
    methods: {
        toogle() {
            this.$store.commit(mutationTypes.TOOGLE_ASIDE)
        },
        change(closed) {
            this.$store.commit(mutationTypes.SET_ASIDE, closed)
        }
    },
    computed: {
        asideClosed: {
            get() {
                return this.$store.state.loki.asideClosed
            },
            set() {}
        },
        drawer: {
            get() {
                return this.$store.state.loki.asideHide
            },
            set(hide) {
                this.$store.commit(mutationTypes.SET_ASIDE_HIDE, hide)
            }
        }
    }
}
</script>

<style lang="stylus">
.az-aside::-webkit-scrollbar
    width 6px

.az-aside::-webkit-scrollbar-thumb
    background rgba(255, 255, 255, .5)

.az-aside
    padding 0
    max-height unset !important

    .text-hide-menu
        color rgba(255, 255, 255, .3)
        font-size 13px

    &__menu
        height 100%
        padding-bottom 40px
        padding-top 120px

    .arrow-closed
        display flex
        align-items center

        .v-btn--icon
            border-radius unset

    .arrow-opened, .arrow-closed
        position absolute
        bottom 0
        width 100%
        border-top 1px solid rgba(255, 255, 255, .1)
        height 36px !important
        display -webkit-box
        display -ms-flexbox
        display flex
        -webkit-box-align center
        -ms-flex-align center
        align-items center
        justify-content center

        .v-btn
            margin 0 10px 0 0 !important
            color rgba(255, 255, 255, .8) !important

        .v-btn, .v-icon
            font-size 16px
            height 16px
            width 16px
</style>
