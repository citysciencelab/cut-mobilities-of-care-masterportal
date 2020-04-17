<script>
export default {
    name: "Language",
    data () {
        return {
            showWindow: false
        };
    },
    mounted () {
        document.getElementsByTagName("body")[0].appendChild(this.$el);
    },
    methods: {
        translate (language) {
            i18next.changeLanguage(language);
        },
        languageWindow () {
            this.showWindow = !this.showWindow;
        }
    }
};
</script>

<template lang="html">
    <div
        id="language-bar"
    >
        <a
            class="current-language"
            @click="languageWindow"
        >
            {{ this.$i18n.i18next.language }}
        </a>
        <div
            v-if="showWindow"
            class="popup-language"
        >
            <div class="language-header">
                <label
                    for="language-header"
                >{{ $t("modules.language.languageTitle") }}</label>
                <a
                    class="buttons pull-right"
                    @click="languageWindow"
                >
                    <span
                        class="glyphicon glyphicon-remove"
                        :title="$t('button.close')"
                    />
                </a>
            </div>
            <div class="form-group form-group-sm">
                <div
                    v-for="(value, key) in $i18n.i18next.options.getLanguages()"
                    :key="key"
                    class="col-lg-6 col-md-6 col-sm-6 col-xs-12"
                >
                    <button
                        class="lng btn"
                        :disabled="key === $i18n.i18next.language"
                        @click="translate(key)"
                    >
                        {{ $t("modules.language." + key) }}
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<style lang="less">
    #language-bar {
        position: absolute;
        right: 10px;
        width: 25px;
        min-height: 22px;
        bottom: 0;
        padding-bottom: 2px;
        z-index: 2000;
        .current-language {
            width: 25px;
            height: 22px;
            cursor: pointer;
            display: block;
            text-align: center;
            padding-top: 5px;
            /* font-size: 12px; */
            text-transform: uppercase;
            color: #23527c;
            font-weight: 900;
        }
        .popup-language {
            display: block;
            position: absolute;
            right: 10px;
            padding: 10px 0 20px;
            min-width: 400px;
            background: rgba(255, 255, 255, 1);
            padding: 10px 0 20px;
            z-index: 10010;
            box-shadow: 0 6px 12px rgba(0, 0, 0, 0.176);
            bottom: 50px;
            .language-header {
                display: block;
                float: right;
                width: 100%;
                border-bottom: 1px solid #e5e5e5;
                padding: 0px 0px 3px 10px;
                span {
                    width: 30px;
                    cursor: pointer;
                }
            }
            .form-group {
                display: inline-block;
                width: 100%;
                text-align: center;
                padding: 20px 0 0;
                a {
                    font-size: 12px;
                    &:hover{
                        background-color: #08589e;
                        color: #ffffff;
                    }
                    &.disabled {
                        background-color: #e7e7e7;
                    }
                }
            }
        }
    }

    @media (max-width: 767px) {
        #language-bar {
            width: 100%;
            .current-language {
                float: right;
                text-align: right;
            }
            .popup-language {
                width: calc(100% - 20px);
                min-width: inherit;
                right: 0;
            }
        }
    }
</style>
