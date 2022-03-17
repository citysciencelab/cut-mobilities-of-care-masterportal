<script>
import { mapGetters, mapActions, mapMutations } from "vuex";
import ScrollContainerWithShadows from "../ScrollContainerWithShadows.vue";
import * as toolConstants from "../../store/constantsMobilityDataDraw";
import * as sharedConstants from "../../../../../../shared/constants/mobilityData";
import actions from "../../store/actionsMobilityDataDraw";
import getters from "../../store/gettersMobilityDataDraw";
import mutations from "../../store/mutationsMobilityDataDraw";

export default {
    name: "PersonalDataView",
    components: {
        ScrollContainerWithShadows
    },
    data() {
        return {
            constants: { ...toolConstants, ...sharedConstants },
            ageOptions: [
                "< 10",
                "10 – 19",
                "20 – 29",
                "30 – 39",
                "40 – 49",
                "50 – 59",
                "60 – 69",
                "70 – 79",
                "> 80"
            ],
            genderOptions: ["male", "female", "diverse"],
            maritalStatusOptions: [
                "A",
                "A1",
                "B",
                "C",
                "D",
                "E",
                "F",
                "G",
                "H"
            ],
            employmentStatusOptions: [
                "A",
                "B",
                "C",
                "D",
                "E",
                "F",
                "G",
                "H",
                "I",
                "J",
                "K",
                "L"
            ],
            householdIncomeOptions: [
                "< 500 €",
                "500 € – 1500 €",
                "1500 € – 3000 €",
                "3000 € – 6000 €",
                "> 6000 €"
            ],
            personInNeedClassOptions: ["A", "B", "C", "D", "E"]
        };
    },
    computed: {
        ...mapGetters("Tools/MobilityDataDraw", Object.keys(getters)),

        /**
         * The gender options including value and translated text
         */
        genderOptionsTranslated() {
            return this.genderOptions.map(value => ({
                value,
                text: this.$t(
                    `additional:modules.tools.mobilityDataDraw.personalData.genders.${value}`
                )
            }));
        },

        /**
         * The marital status options including value and translated text
         */
        maritalStatusOptionsTranslated() {
            return this.maritalStatusOptions.map(value => ({
                value,
                text: this.$t(
                    `additional:modules.tools.mobilityDataDraw.personalData.maritalStatuses.${value}`
                )
            }));
        },

        /**
         * The employment options including value and translated text
         */
        employmentStatusOptionsTranslated() {
            return this.employmentStatusOptions.map(value => ({
                value,
                text: this.$t(
                    `additional:modules.tools.mobilityDataDraw.personalData.employments.${value}`
                )
            }));
        },

        /**
         * The class of the person in need options including value and translated text
         */
        personInNeedClassOptionsTranslated() {
            return this.personInNeedClassOptions.map(value => ({
                value,
                text: this.$t(
                    `additional:modules.tools.mobilityDataDraw.personalData.personInNeedClasses.${value}`
                )
            }));
        }
    },
    methods: {
        ...mapMutations("Tools/MobilityDataDraw", Object.keys(mutations)),
        ...mapActions("Tools/MobilityDataDraw", Object.keys(actions)),
        onDeletePersonInNeed: function(actionConfirmedCallback){
            const confirmActionSettings = {
                    actionConfirmedCallback,
                    confirmCaption: this.$t(
                        "additional:modules.tools.mobilityDataDraw.confirm.deletePerson.confirmButton"
                    ),
                    denyCaption: this.$t(
                        "additional:modules.tools.mobilityDataDraw.confirm.deletePerson.denyButton"
                    ),
                    textContent: this.$t(
                        "additional:modules.tools.mobilityDataDraw.confirm.deletePerson.description"
                    ),
                    headline: this.$t(
                        "additional:modules.tools.mobilityDataDraw.confirm.deletePerson.title"
                    ),
                    forceClickToClose: true
                };
                this.$store.dispatch(
                    "ConfirmAction/addSingleAction",
                    confirmActionSettings
                );
        }
    }
};
</script>

<template lang="html">
    <div id="tool-mobilityDataDraw-view-personalData">
        <h4>
            {{
                $t(
                    "additional:modules.tools.mobilityDataDraw.label.personalData"
                )
            }}
        </h4>

        <ScrollContainerWithShadows>
            <div class="personal-data-form">
                <div class="form-group">
                    <label class="form-label">
                        {{
                            $t(
                                "additional:modules.tools.mobilityDataDraw.label.age"
                            )
                        }}
                    </label>

                    <v-select
                        :value="personalData.age"
                        :items="ageOptions"
                        @change="setAge"
                        attach
                        dense
                        solo
                    >
                    </v-select>
                </div>

                <div class="form-group">
                    <label class="form-label">
                        {{
                            $t(
                                "additional:modules.tools.mobilityDataDraw.label.gender"
                            )
                        }}
                    </label>

                    <v-select
                        :value="personalData.gender"
                        :items="genderOptionsTranslated"
                        @change="setGender"
                        attach
                        dense
                        solo
                    >
                    </v-select>
                </div>

                <div class="form-group">
                    <label class="form-label">
                        {{
                            $t(
                                "additional:modules.tools.mobilityDataDraw.label.maritalStatus"
                            )
                        }}
                        
                    </label>

                    <v-select
                        :value="personalData.maritalStatus"
                        :items="maritalStatusOptionsTranslated"
                        @change="setMaritalStatus"
                        attach
                        dense
                        solo
                    >
                    </v-select>
                </div>

                <div class="form-group">
                    <label class="form-label">
                        {{
                            $t(
                                "additional:modules.tools.mobilityDataDraw.label.employment"
                            )
                        }}
                        
                    </label>

                    <v-select
                        :value="personalData.employmentStatus"
                        :items="employmentStatusOptionsTranslated"
                        @change="setEmploymentStatus"
                        attach
                        dense
                        solo
                    >
                    </v-select>
                </div>

                <div class="form-group">
                    <label class="form-label">
                        {{
                            $t(
                                "additional:modules.tools.mobilityDataDraw.label.householdIncome"
                            )
                        }}
                    </label>

                    <v-select
                        :value="personalData.householdIncome"
                        :items="householdIncomeOptions"
                        @change="setHouseholdIncome"
                        attach
                        dense
                        solo
                    >
                    </v-select>
                </div>

                <div
                    v-for="(personInNeed,
                    personInNeedIndex) in personalData.personsInNeed"
                    :key="'person_' + personInNeedIndex"
                    class="persons-in-need-container"
                >
                    <div class="person-in-need-header">
                        <h5>
                            {{
                                (personInNeedIndex + 1) + ". " +
                                $t("additional:modules.tools.mobilityDataDraw.label.personInNeedTitle")
                            }}
                        </h5>
                        <div class="person-in-need-header-actions">
                            <v-btn
                                v-if="
                                    personInNeedIndex ===
                                        personalData.personsInNeed.length - 1
                                "
                                class="add-person-button"
                                icon
                                :title="
                                    $t(
                                        'additional:modules.tools.mobilityDataDraw.button.addPerson'
                                    )
                                "
                                @click="() => addPersonInNeed({})"
                            >
                                <v-icon>add_circle</v-icon>
                            </v-btn>
                            <v-btn
                                v-if="personInNeedIndex !== 0"
                                icon
                                :title="
                                    $t(
                                        'additional:modules.tools.mobilityDataDraw.button.removePerson'
                                    )
                                "
                                @click="() => onDeletePersonInNeed(() => removePersonInNeed(personInNeedIndex))"
                            >
                                <v-icon>delete</v-icon>
                            </v-btn>
                        </div>
                    </div>

                    <div class="form-group">
                        <label class="form-label">
                            {{
                                $t(
                                    "additional:modules.tools.mobilityDataDraw.label.personInNeed"
                                )
                            }}
                        </label>
                        <input
                            class="form-control"
                            type="text"
                            :value="personInNeed.name"
                            @change="
                                event =>
                                    setPersonInNeedName({
                                        event,
                                        personInNeedIndex
                                    })
                            "
                        />
                    </div>

                    <div class="form-group">
                        <label class="form-label">
                            {{
                                $t(
                                    "additional:modules.tools.mobilityDataDraw.label.personInNeedClass"
                                )
                            }}
                        </label>

                        <v-select
                            :value="personInNeed.personInNeedClass"
                            :items="personInNeedClassOptionsTranslated"
                            @change="
                                personInNeedClass =>
                                    setPersonInNeedClass({
                                        personInNeedClass,
                                        personInNeedIndex
                                    })
                            "
                            attach
                            dense
                            solo
                        >
                        </v-select>
                    </div>

                    <div class="form-group">
                        <label class="form-label">
                            {{
                                $t(
                                    "additional:modules.tools.mobilityDataDraw.label.personInNeedAge"
                                )
                            }}
                        </label>

                        <v-select
                            :value="personInNeed.age"
                            :items="ageOptions"
                            @change="
                                personInNeedAge =>
                                    setPersonInNeedAge({
                                        personInNeedAge,
                                        personInNeedIndex
                                    })
                            "
                            attach
                            dense
                            solo
                        >
                        </v-select>
                    </div>

                    <div class="form-group">
                        <label class="form-label">
                            {{
                                $t(
                                    "additional:modules.tools.mobilityDataDraw.label.sameHousehold"
                                )
                            }}
                        </label>

                        <input
                            class="checkbox"
                            type="checkbox"
                            :checked="personInNeed.isSameHousehold"
                            @change="
                                event =>
                                    setSameHousehold({
                                        event,
                                        personInNeedIndex
                                    })
                            "
                        />
                    </div>
                </div>

                <div class="form-group">
                    <label class="form-label">
                        {{
                            $t(
                                "additional:modules.tools.mobilityDataDraw.label.additional"
                            )
                        }}
                    </label>
                    <textarea
                        class="form-control"
                        :value="personalData.additional"
                        @change="setAdditional"
                    />
                </div>
            </div>
        </ScrollContainerWithShadows>
    </div>
</template>

<style lang="less" scoped>
#tool-mobilityDataDraw-view-personalData {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    min-height: 0;

    > div {
        max-height: calc(100% - 39px);
    }

    &::v-deep {
        .v-text-field.v-text-field--enclosed:not(.v-text-field--rounded)
            > .v-input__control
            > .v-input__slot {
            margin: 0;
            padding: 0 0 0 0.3125rem;
        }

        .v-text-field.v-text-field--solo:not(.v-text-field--solo-flat)
            > .v-input__control
            > .v-input__slot {
            height: 34px;
            height: 34px;
            font-size: 14px;
            border: 1px solid #ccc;
            border-radius: 0;
            box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075);
        }

        .v-text-field.v-text-field--solo.v-input--is-focused:not(.v-text-field--solo-flat)
            > .v-input__control
            > .v-input__slot {
            border-color: #66afe9;
            outline: 0;
            box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.08),
                0 0 8px rgba(102, 175, 233, 0.6);
        }

        .v-text-field__details {
            display: none;
        }
    }
}

.personal-data-form {
    width: calc(100% - 4px);
    margin: 0 2px;
}

.persons-in-need-container {
    padding-bottom: 15px;
}

.person-in-need-header {
    display: flex;
    justify-content: space-between;
    padding-bottom: 10px;

    .person-in-need-header-actions {
        display: flex;
    }
}
</style>
