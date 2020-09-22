<script>
export default {
    name: "TrafficCountCompTable",
    props: {
        /**
         * the array as it comes from the api
         * e.g. [{bikes: {date: value}}]
         */
        apiData: {
            type: Array,
            required: true
        },

        /**
         * the title of the table - this is the top left field
         */
        tableTitle: {
            type: String,
            required: true
        },
        /**
         * a function to create the title of a column, the given values are only from the first line
         * if you need to differ between datasets, use a second and third table instead
         * @param {String} date the date of the first dataset for this column
         * @return {String}  the title of the column - use param date and e.g. moment to create your title
         */
        setColTitle: {
            type: Function,
            required: true
        },
        /**
         * a function to create the row title
         * @param {String} key the dataset key of this row (e.g. car)
         * @param {Object} dataset the dataset of this row as Object{date: value}
         * @return {String}  the row title - use the key and date from dataset to create your title
         */
        setRowTitle: {
            type: Function,
            required: true
        },
        /**
         * a function to manipulate the value of a table field
         * @param {String|null} value the value of the field - this may be null if no data was given
         * @return {String}  the new value of the field
         */
        setFieldValue: {
            type: Function,
            required: true
        }
    },
    methods: {
        /**
         * a very special function to grap the first dataset of the first dataObj from the given apiData
         * @param {Object[]} apiDataRef an array of data, e.g. [{bikes: {date: valueBike}, cars: {date: valueCar}}]
         * @returns {Object}  the first dataset of the first dataObj, e.g. {date: valueBike}
         */
        getFirstDataset (apiDataRef) {
            if (!Array.isArray(apiDataRef) || apiDataRef.length === 0) {
                return {};
            }

            const keys = Object.keys(apiDataRef[0]);

            if (keys.length === 0) {
                return {};
            }

            return apiDataRef[0][keys[0]];
        },
        /**
         * returns the first key in an object
         * @param {Object} obj the object
         * @returns {String|Boolean}  the first key or false if no key was found
         */
        getFirstKeyOfObject (obj) {
            if (typeof obj !== "object" || obj === null) {
                return false;
            }

            const keys = Object.keys(obj);

            if (keys.length === 0) {
                return false;
            }

            return keys[0];
        },
        /**
         * flattens the given apiData by pushing keys and datasets into a new Object{key, dataset}
         * @param {Object[]} apiDataRef an array of data, e.g. [{bikes: {date: valueBike1}}, {bikes: {date: valueBike2}}]
         * @returns {Object[]}  an array of Object{key, dataset}, e.g. [{key: "bikes", dataset: {date: valueBike1}}, {key: "bikes", dataset: {date: valueBike2}}]
         */
        getFlatApiData (apiDataRef) {
            if (!Array.isArray(apiDataRef) || apiDataRef.length === 0) {
                return [];
            }

            const result = [];
            let key = null;

            apiDataRef.forEach(dataObj => {
                for (key in dataObj) {
                    // dataObjFlat
                    result.push({
                        key,
                        dataset: dataObj[key]
                    });
                }
            });

            return result;
        }
    }
};
</script>

<template>
    <div class="table">
        <table>
            <thead>
                <th>{{ tableTitle }}</th>
                <th
                    v-for="(value, datetime) in getFirstDataset(apiData)"
                    :key="datetime"
                >
                    {{ setColTitle(datetime) }}
                </th>
            </thead>
            <tbody>
                <tr
                    v-for="(dataObjFlat, idx) in getFlatApiData(apiData)"
                    :key="idx"
                >
                    <td>{{ setRowTitle(dataObjFlat.key, getFirstKeyOfObject(dataObjFlat.dataset)) }}</td>
                    <td
                        v-for="(value, datetime) of dataObjFlat.dataset"
                        :key="datetime"
                    >
                        {{ setFieldValue(value) }}
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<style scoped>
    div.table {
        margin-top: 5px;
        margin-bottom: 5px;
    }
</style>

<docs>
    This component works on the data received by the api.
    The data should be without any gaps and should be in order.

    ```html
    <script>
    import TrafficCountCompTable from "./TrafficCountCompTable.vue";
    import moment from "moment";

    export default {
        name: "TableTest",
        components: {
            TrafficCountCompTable
        },
        data: () => {
            return {
                apiData: [
                    {
                        "fahrraeder": {"2020-09-17 18:00:00": 10, "2020-09-17 18:15:00": 15},
                        "fahrraeder2": {"2020-09-17 18:00:00": 20, "2020-09-17 18:15:00": 25}
                    },
                    {
                        "fahrraeder": {"2020-09-18 18:00:00": 30},
                        "fahrraeder2": {"2020-09-18 18:00:00": 40}
                    }
                ],
                tableTitle: "Test",
                setColTitle: datetime => {
                    return moment(datetime).format("hh:mm");
                },
                setRowTitle: (meansOfTransports, datetime) => {
                    return meansOfTransports + " " + moment(datetime).format("YYYY");
                },
                setFieldValue: value => {
                    return value !== null ? String(value) : "";
                }
            };
        }
    };
    </script>

    <!--<template>-->
        <div>
            <TrafficCountCompTable
                :apiData="apiData"
                :tableTitle="tableTitle"
                :setColTitle="setColTitle"
                :setRowTitle="setRowTitle"
                :setFieldValue="setFieldValue"
            ></TrafficCountCompTable>
        </div>
    <!--</template>-->
```
</docs>
